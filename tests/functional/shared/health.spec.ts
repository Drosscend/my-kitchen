import { test } from '@japa/runner'

test.group('Health', () => {
  test('reports the bare status', async ({ client }) => {
    const response = await client.get('/health')

    response.assertStatus(200)
    response.assertBodyContains({ isHealthy: true })
  })
})
