import { test } from '@japa/runner'

test.group('Legal notice', () => {
  test('is readable without an account', async ({ client }) => {
    const response = await client.get('/legal').withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('legal/show')
  })
})
