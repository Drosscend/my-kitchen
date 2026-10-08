import { test } from '@japa/runner'
import { db } from '#shared/services/db'
import { assertRedirectedTo } from '#tests/helpers/http'
import {
  authorize,
  CLAUDE_CALLBACK,
  CookieJar,
  locationPath,
  MCP_RESOURCE,
  pkcePair,
  registerClient,
  startAuthorization,
  type OAuthTokens,
} from '#tests/helpers/oauth'
import { resetState } from '#tests/helpers/state'
import { createUser } from '#tests/helpers/users'
import type { ApiClient } from '@japa/api-client'

const ISSUER = 'http://localhost:3333'

function listTools(client: ApiClient, token: string) {
  return client
    .post('/mcp')
    .header('accept', 'application/json, text/event-stream')
    .header('mcp-protocol-version', '2025-11-25')
    .bearerToken(token)
    .json({ jsonrpc: '2.0', id: 1, method: 'tools/list', params: {} })
}

function refresh(client: ApiClient, clientId: string, refreshToken: string) {
  return client.post('/oauth/token').form({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: clientId,
    resource: MCP_RESOURCE,
  })
}

test.group('OAuth discovery', (group) => {
  group.each.setup(() => resetState())

  test('publishes the protected resource metadata of the MCP endpoint', async ({
    client,
    assert,
  }) => {
    const scoped = await client.get('/.well-known/oauth-protected-resource/mcp')
    const root = await client.get('/.well-known/oauth-protected-resource')

    scoped.assertStatus(200)
    assert.containsSubset(scoped.body(), {
      resource: MCP_RESOURCE,
      authorization_servers: [ISSUER],
      scopes_supported: ['mcp'],
    })
    assert.deepEqual(root.body(), scoped.body())
  })

  test('publishes what Claude and ChatGPT expect from the authorization server', async ({
    client,
    assert,
  }) => {
    const response = await client.get('/.well-known/oauth-authorization-server')

    response.assertStatus(200)
    assert.containsSubset(response.body(), {
      issuer: ISSUER,
      authorization_endpoint: `${ISSUER}/oauth/authorize`,
      token_endpoint: `${ISSUER}/oauth/token`,
      registration_endpoint: `${ISSUER}/oauth/register`,
      code_challenge_methods_supported: ['S256'],
      client_id_metadata_document_supported: true,
      authorization_response_iss_parameter_supported: true,
    })
    assert.include(response.body().token_endpoint_auth_methods_supported, 'none')
    assert.sameMembers(response.body().grant_types_supported, [
      'authorization_code',
      'refresh_token',
    ])
    assert.deepEqual(response.body().response_types_supported, ['code'])
  })
})

test.group('OAuth authorization', (group) => {
  group.each.setup(() => resetState())

  test('shows the consent page with the client name and its redirect host', async ({ client }) => {
    const user = await createUser('ada@example.com')
    const clientId = await registerClient(client, 'Claude')
    const { jar, consentPath } = await startAuthorization(client, clientId, pkcePair().challenge)

    const response = await jar.apply(client.get(consentPath).loginAs(user).withInertia())

    response.assertStatus(200)
    response.assertInertiaComponent('oauth/authorize')
    response.assertInertiaPropsContains({
      clientName: 'Claude',
      redirectHost: 'claude.ai',
      local: false,
    })
  })

  test('accepts any port on a loopback redirect and warns about local clients', async ({
    client,
    assert,
  }) => {
    const user = await createUser('ada@example.com')
    const registered = await client.post('/oauth/register').json({
      client_name: 'Claude Code',
      redirect_uris: ['http://localhost/callback'],
      token_endpoint_auth_method: 'none',
    })
    const clientId: string = registered.body().client_id
    const query = (redirectUri: string) =>
      new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        code_challenge: pkcePair().challenge,
        code_challenge_method: 'S256',
        resource: MCP_RESOURCE,
      })

    const anyPort = await client
      .get(`/oauth/authorize?${query('http://localhost:51234/callback')}`)
      .redirects(0)
    const otherPath = await client
      .get(`/oauth/authorize?${query('http://localhost:51234/elsewhere')}`)
      .redirects(0)

    anyPort.assertStatus(303)
    otherPath.assertStatus(400)
    const jar = new CookieJar()
    jar.store(anyPort)
    const consent = await jar.apply(client.get(locationPath(anyPort)).loginAs(user).withInertia())
    consent.assertInertiaPropsContains({ clientName: 'Claude Code', local: true })
    assert.equal(consent.inertiaProps.redirectHost, 'localhost:51234')
  })

  test('sends a guest to the login, then back to the consent page', async ({ client }) => {
    const user = await createUser('ada@example.com')
    const clientId = await registerClient(client)
    const { jar, consentPath } = await startAuthorization(client, clientId, pkcePair().challenge)

    const guest = await jar.apply(client.get(consentPath).redirects(0))
    const login = await client
      .post('/login')
      .withSession({ intended_url: consentPath })
      .withCsrfToken()
      .form({ email: user.email, password: 'a-secure-password' })
      .redirects(0)

    assertRedirectedTo(guest, '/login')
    guest.assertSession('intended_url', consentPath)
    assertRedirectedTo(login, consentPath)
  })

  test('issues a code with the state and the issuer, then tokens for the MCP endpoint', async ({
    client,
    assert,
  }) => {
    const user = await createUser('ada@example.com')

    const { callback, tokens } = await authorize(client, user)

    assert.equal(`${callback.origin}${callback.pathname}`, CLAUDE_CALLBACK)
    assert.equal(callback.searchParams.get('state'), 'state-value')
    assert.equal(callback.searchParams.get('iss'), ISSUER)
    assert.equal(tokens.token_type, 'Bearer')
    assert.include(tokens.scope ?? '', 'mcp')
    assert.isString(tokens.refresh_token)
    ;(await listTools(client, tokens.access_token)).assertStatus(200)
  })

  test('stores tokens hashed', async ({ client, assert }) => {
    const user = await createUser('ada@example.com')
    const { tokens } = await authorize(client, user)

    const stored = await db.selectFrom('oauth_models').select(['id', 'payload']).execute()
    const secrets = [tokens.access_token, tokens.refresh_token ?? 'no refresh token']

    assert.isNotEmpty(stored)
    for (const row of stored) {
      for (const secret of secrets) {
        assert.notEqual(row.id, secret)
        assert.notInclude(JSON.stringify(row.payload), secret)
      }
    }
  })

  test('returns access_denied when the user refuses', async ({ client, assert }) => {
    const user = await createUser('ada@example.com')
    const clientId = await registerClient(client)
    const { jar, consentPath } = await startAuthorization(client, clientId, pkcePair().challenge)

    const denied = await jar.apply(
      client.post(`${consentPath}/deny`).loginAs(user).withCsrfToken().withInertia().redirects(0)
    )
    denied.assertStatus(409)
    const resumed = await jar.apply(client.get(locationPath(denied)).redirects(0))

    const callback = new URL(locationPath(resumed))
    assert.equal(callback.searchParams.get('error'), 'access_denied')
    assert.isNull(callback.searchParams.get('code'))
  })

  test('refuses a token for another resource', async ({ client, assert }) => {
    const clientId = await registerClient(client)
    const query = new URLSearchParams({
      client_id: clientId,
      redirect_uri: CLAUDE_CALLBACK,
      response_type: 'code',
      code_challenge: pkcePair().challenge,
      code_challenge_method: 'S256',
      resource: 'https://api.example.com/',
    })

    const response = await client.get(`/oauth/authorize?${query}`).redirects(0)

    assert.equal(new URL(locationPath(response)).searchParams.get('error'), 'invalid_target')
  })

  test('requires PKCE', async ({ client, assert }) => {
    const clientId = await registerClient(client)
    const query = new URLSearchParams({
      client_id: clientId,
      redirect_uri: CLAUDE_CALLBACK,
      response_type: 'code',
      resource: MCP_RESOURCE,
    })

    const response = await client.get(`/oauth/authorize?${query}`).redirects(0)

    assert.equal(new URL(locationPath(response)).searchParams.get('error'), 'invalid_request')
  })

  test('sends back to the account page when the request expired', async ({ client }) => {
    const user = await createUser('ada@example.com')

    const response = await client.get('/oauth/interaction/unknown').loginAs(user).redirects(0)

    assertRedirectedTo(response, '/account')
    response.assertFlashMessage(
      'error',
      "La demande de connexion a expiré : relance-la depuis l'assistant"
    )
  })
})

test.group('OAuth tokens', (group) => {
  group.each.setup(() => resetState())

  test('rotates the refresh token and revokes the grant when an old one comes back', async ({
    client,
    assert,
  }) => {
    const user = await createUser('ada@example.com')
    const { clientId, tokens } = await authorize(client, user)

    const refreshed = await refresh(client, clientId, tokens.refresh_token ?? '')
    refreshed.assertStatus(200)
    const rotated: OAuthTokens = refreshed.body()
    assert.notEqual(rotated.refresh_token, tokens.refresh_token)
    ;(await listTools(client, rotated.access_token)).assertStatus(200)

    const replayed = await refresh(client, clientId, tokens.refresh_token ?? '')
    replayed.assertStatus(400)
    replayed.assertBodyContains({ error: 'invalid_grant' })
    ;(await listTools(client, rotated.access_token)).assertStatus(401)
  })
})

test.group('OAuth connections', (group) => {
  group.each.setup(() => resetState())

  test('lists the connected assistants and revokes their access', async ({ client, assert }) => {
    const user = await createUser('ada@example.com')
    const { tokens } = await authorize(client, user)
    await listTools(client, tokens.access_token)

    const page = await client.get('/account').loginAs(user).withInertia()
    page.assertInertiaPropsContains({ mcpUrl: MCP_RESOURCE })
    const [connection] = page.inertiaProps.oauthConnections
    assert.equal(connection.clientName, 'Claude')
    assert.isNotNull(connection.lastUsedAt)

    const revoked = await client
      .delete(`/account/oauth-connections/${connection.id}`)
      .loginAs(user)
      .withCsrfToken()
      .redirects(0)

    revoked.assertFlashMessage('success', 'Accès révoqué')
    ;(await listTools(client, tokens.access_token)).assertStatus(401)
    ;(await client.get('/account').loginAs(user).withInertia()).assertInertiaPropsContains({
      oauthConnections: [],
    })
  })

  test('never revokes the access of another account', async ({ client }) => {
    const ada = await createUser('ada@example.com')
    const bob = await createUser('bob@example.com')
    const { tokens } = await authorize(client, ada)
    const page = await client.get('/account').loginAs(ada).withInertia()
    const [connection] = page.inertiaProps.oauthConnections

    const response = await client
      .delete(`/account/oauth-connections/${connection.id}`)
      .loginAs(bob)
      .withCsrfToken()
      .redirects(0)

    response.assertFlashMessage('error', 'Application introuvable')
    ;(await listTools(client, tokens.access_token)).assertStatus(200)
  })

  test('revokes every access with the account', async ({ client }) => {
    const user = await createUser('ada@example.com')
    const { tokens } = await authorize(client, user)

    await db.deleteFrom('users').execute()

    ;(await listTools(client, tokens.access_token)).assertStatus(401)
  })
})

test.group('OAuth registration', (group) => {
  group.each.setup(() => resetState())

  test('throttles dynamic client registration per address', async ({ client }) => {
    for (let attempt = 0; attempt < 30; attempt++) {
      await registerClient(client)
    }

    const response = await client.post('/oauth/register').json({
      client_name: 'Spam',
      redirect_uris: [CLAUDE_CALLBACK],
      token_endpoint_auth_method: 'none',
    })

    response.assertStatus(429)
  })
})
