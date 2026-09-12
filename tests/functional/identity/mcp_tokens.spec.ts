import { test } from '@japa/runner'
import { db } from '#shared/services/db'
import { assertRedirectedTo } from '#tests/helpers/http'
import { resetState } from '#tests/helpers/state'
import { createUser } from '#tests/helpers/users'

test.group('MCP tokens', (group) => {
  group.each.setup(() => resetState())

  test('creates a token shown once, lists and revokes it', async ({ client, assert }) => {
    const user = await createUser('ada@example.com')

    const created = await client
      .post('/account/mcp-tokens')
      .loginAs(user)
      .withCsrfToken()
      .form({ name: 'Claude' })
      .redirects(0)
    const shown = await client.get('/account').loginAs(user).withInertia()
    const again = await client.get('/account').loginAs(user).withInertia()

    assertRedirectedTo(created, '/account')
    const flashed = String(created.flashMessages().newMcpToken)
    assert.match(flashed, /^mk_[A-Za-z0-9_-]{40,}$/)
    const [token] = await db
      .selectFrom('mcp_tokens')
      .select(['id', 'prefix', 'token_hash'])
      .execute()
    assert.isTrue(flashed.startsWith(token.prefix))
    assert.notEqual(token.token_hash, flashed)
    shown.assertInertiaPropsContains({
      mcpTokens: [{ name: 'Claude', prefix: token.prefix, lastUsedAt: null }],
    })
    again.assertInertiaPropsContains({ newMcpToken: null })

    const revoked = await client
      .delete(`/account/mcp-tokens/${token.id}`)
      .loginAs(user)
      .withCsrfToken()
      .redirects(0)
    revoked.assertFlashMessage('success', 'Token révoqué')
    assert.lengthOf(await db.selectFrom('mcp_tokens').select('id').execute(), 0)
  })

  test('refuses a blank token name', async ({ client, assert }) => {
    const user = await createUser('ada@example.com')

    const response = await client
      .post('/account/mcp-tokens')
      .loginAs(user)
      .withCsrfToken()
      .form({ name: '   ' })
      .redirects(0)

    response.assertFlashMessage('inputErrorsBag', { name: ['Ce champ est obligatoire'] })
    assert.lengthOf(await db.selectFrom('mcp_tokens').select('id').execute(), 0)
  })

  test('never revokes a token of another account', async ({ client, assert }) => {
    const ada = await createUser('ada@example.com')
    const bob = await createUser('bob@example.com')
    await client
      .post('/account/mcp-tokens')
      .loginAs(ada)
      .withCsrfToken()
      .form({ name: 'Claude' })
      .redirects(0)
    const [token] = await db.selectFrom('mcp_tokens').select('id').execute()

    const response = await client
      .delete(`/account/mcp-tokens/${token.id}`)
      .loginAs(bob)
      .withCsrfToken()
      .redirects(0)

    response.assertFlashMessage('error', 'Token introuvable')
    assert.lengthOf(await db.selectFrom('mcp_tokens').select('id').execute(), 1)
  })
})
