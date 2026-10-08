import { createHash, randomBytes } from 'node:crypto'
import type { User } from '#identity/domain/user'
import type { ApiClient, ApiRequest, ApiResponse } from '@japa/api-client'

export const MCP_RESOURCE = 'http://localhost:3333/mcp'
export const CLAUDE_CALLBACK = 'https://claude.ai/api/mcp/auth_callback'

export interface OAuthTokens {
  access_token: string
  refresh_token?: string
  token_type: string
  scope?: string
  expires_in: number
}

/**
 * oidc-provider keeps its interaction state in its own cookies, which
 * the Japa client does not track. The jar carries them between requests
 * and writes them raw: the `cookie()` helper of the AdonisJS plugin
 * would sign them, and a bare cookie header would be overwritten by the
 * session cookie of `loginAs`.
 */
export class CookieJar {
  #cookies = new Map<string, string>()

  apply<T extends ApiRequest>(request: T) {
    for (const [name, value] of this.#cookies) {
      request.cookiesJar[name] = { name, value }
    }
    return request
  }

  store(response: ApiResponse) {
    const header: string | string[] | undefined = response.headers()['set-cookie']
    const lines = Array.isArray(header) ? header : header ? [header] : []

    for (const line of lines) {
      const [pair] = line.split(';')
      const separator = pair.indexOf('=')
      const name = pair.slice(0, separator).trim()
      const value = pair.slice(separator + 1).trim()

      if (!name.startsWith('_')) {
        continue
      }

      if (value && !/expires=Thu, 01 Jan 1970/i.test(line)) {
        this.#cookies.set(name, value)
      } else {
        this.#cookies.delete(name)
      }
    }
  }
}

export function pkcePair() {
  const verifier = randomBytes(32).toString('base64url')
  const challenge = createHash('sha256').update(verifier).digest('base64url')
  return { verifier, challenge }
}

/**
 * Registers a public client through dynamic client registration, the
 * way Claude does without a metadata document.
 */
export async function registerClient(client: ApiClient, name = 'Claude') {
  const response = await client.post('/oauth/register').json({
    client_name: name,
    redirect_uris: [CLAUDE_CALLBACK],
    grant_types: ['authorization_code', 'refresh_token'],
    response_types: ['code'],
    token_endpoint_auth_method: 'none',
  })
  response.assertStatus(201)

  const body: { client_id: string } = response.body()
  return body.client_id
}

export function authorizationUrl(clientId: string, challenge: string, state = 'state-value') {
  const query = new URLSearchParams({
    client_id: clientId,
    redirect_uri: CLAUDE_CALLBACK,
    response_type: 'code',
    code_challenge: challenge,
    code_challenge_method: 'S256',
    state,
    scope: 'mcp',
    resource: MCP_RESOURCE,
  })
  return `/oauth/authorize?${query}`
}

export function locationPath(response: ApiResponse) {
  const location = response.header('location') ?? response.header('x-inertia-location')

  if (!location) {
    throw new Error(`No redirect in a ${response.status()} response`)
  }

  const url = new URL(location, 'http://localhost:3333')
  return url.origin === 'http://localhost:3333' ? `${url.pathname}${url.search}` : url.href
}

/**
 * Sends the user to the consent page of a fresh authorization request.
 */
export async function startAuthorization(client: ApiClient, clientId: string, challenge: string) {
  const jar = new CookieJar()
  const started = await client.get(authorizationUrl(clientId, challenge)).redirects(0)
  started.assertStatus(303)
  jar.store(started)

  return { jar, consentPath: locationPath(started) }
}

/**
 * Plays the whole authorization code flow for the user, as Claude
 * would: registration, consent, code, then the token exchange.
 */
export async function authorize(client: ApiClient, user: User, clientId?: string) {
  const registeredClientId = clientId ?? (await registerClient(client))
  const { verifier, challenge } = pkcePair()
  const { jar, consentPath } = await startAuthorization(client, registeredClientId, challenge)

  const approved = await jar.apply(
    client.post(consentPath).loginAs(user).withCsrfToken().withInertia().redirects(0)
  )
  approved.assertStatus(409)
  const resumed = await jar.apply(client.get(locationPath(approved)).redirects(0))
  resumed.assertStatus(303)

  const callback = new URL(locationPath(resumed))
  const code = callback.searchParams.get('code')

  if (!code) {
    throw new Error(`No code in ${callback.href}`)
  }

  const exchanged = await client.post('/oauth/token').form({
    grant_type: 'authorization_code',
    code,
    redirect_uri: CLAUDE_CALLBACK,
    client_id: registeredClientId,
    code_verifier: verifier,
    resource: MCP_RESOURCE,
  })
  exchanged.assertStatus(200)

  const tokens: OAuthTokens = exchanged.body()
  return { clientId: registeredClientId, tokens, callback }
}
