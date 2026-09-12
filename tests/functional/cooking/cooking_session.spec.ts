import { test } from '@japa/runner'
import { db } from '#shared/services/db'
import { assertRedirectedTo } from '#tests/helpers/http'
import { BREAD, importRecipe, storedRecipes } from '#tests/helpers/recipes'
import { resetState } from '#tests/helpers/state'
import { createUser } from '#tests/helpers/users'
import type { User } from '#identity/domain/user'
import type { ApiClient } from '@japa/api-client'

async function startSession(client: ApiClient, user: User) {
  await importRecipe(client, user, BREAD)
  const [recipe] = await storedRecipes(user)
  const response = await client
    .post(`/recipes/${recipe.id}/cook`)
    .loginAs(user)
    .withCsrfToken()
    .form({ scale: 2 })
    .redirects(0)
  const code = String(response.header('location')).replace('/cook/', '')

  return { recipe, response, code }
}

test.group('Cooking sessions', (group) => {
  group.each.setup(() => resetState())

  test('starts a session under a six digit code that anyone can open', async ({
    client,
    assert,
  }) => {
    const user = await createUser('ada@example.com')

    const { response, code } = await startSession(client, user)
    const page = await client.get(`/cook/${code}`).withInertia()
    const state = await client.get(`/cook/${code}/state`)

    assert.match(code, /^\d{6}$/)
    assertRedirectedTo(response, `/cook/${code}`)
    page.assertInertiaComponent('cook/show')
    page.assertInertiaPropsContains({
      session: {
        code,
        scale: 2,
        recipe: { title: 'Pain maison' },
        state: { currentStepIndex: -1 },
      },
    })
    state.assertStatus(200)
    state.assertBodyContains({ code, scale: 2, state: { closed: false } })
  })

  test('stamps updates on the server and keeps the step in range', async ({ client, assert }) => {
    const user = await createUser('ada@example.com')
    const { code } = await startSession(client, user)
    const before = await client.get(`/cook/${code}/state`)

    const forward = await client
      .patch(`/cook/${code}/state`)
      .json({ currentStepIndex: 9, activeTimers: { rest: { total: 3600, startedAt: 1 } } })
    const timerKept = await client.patch(`/cook/${code}/state`).json({ currentStepIndex: 0 })
    const invalid = await client
      .patch(`/cook/${code}/state`)
      .accept('json')
      .json({ currentStepIndex: 'deux' })

    forward.assertStatus(200)
    forward.assertBodyContains({ state: { currentStepIndex: 1 } })
    assert.isAbove(forward.body().state.updatedAt, before.body().state.updatedAt)
    timerKept.assertBodyContains({
      state: { currentStepIndex: 0, activeTimers: { rest: { total: 3600 } } },
    })
    invalid.assertStatus(422)
  })

  test('joins by code and rejects unknown or expired ones', async ({ client }) => {
    const user = await createUser('ada@example.com')
    const { code } = await startSession(client, user)

    const joined = await client.post('/cook/join').withCsrfToken().form({ code }).redirects(0)
    const unknown = await client
      .post('/cook/join')
      .withCsrfToken()
      .form({ code: '000000' })
      .redirects(0)
    await db
      .updateTable('cooking_sessions')
      .set({ expires_at: new Date(Date.now() - 1000) })
      .where('code', '=', code)
      .execute()
    const expired = await client.get(`/cook/${code}`).withInertia()

    assertRedirectedTo(joined, `/cook/${code}`)
    assertRedirectedTo(unknown, '/cook/join')
    unknown.assertFlashMessage('error', 'Session introuvable ou expirée')
    expired.assertStatus(404)
  })
})
