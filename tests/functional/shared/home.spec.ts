import { test } from '@japa/runner'
import { assertRedirectedTo } from '#tests/helpers/http'
import { resetState } from '#tests/helpers/state'
import { createUser } from '#tests/helpers/users'

test.group('Home page', (group) => {
  group.each.setup(() => resetState())

  test('presents the application to a visitor', async ({ client }) => {
    const response = await client.get('/').withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('home')
    response.assertInertiaPropsContains({ mcpUrl: 'http://localhost:3333/mcp' })
  })

  test('sends a signed-in user to the pantry', async ({ client }) => {
    const user = await createUser('ada@example.com')

    const response = await client.get('/').loginAs(user).redirects(0)

    assertRedirectedTo(response, '/inventory')
  })

  test('serves the cooking demo it frames, from the same origin only', async ({ client }) => {
    const response = await client.get('/cook/demo').withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('cook/demo')
    response.assertInertiaPropsContains({ recipe: { title: 'Ratatouille au four' } })
    response.assertHeader('x-frame-options', 'SAMEORIGIN')
  })
})
