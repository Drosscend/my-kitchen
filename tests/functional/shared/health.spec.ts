import { test } from '@japa/runner'

test.group('Health', () => {
  test('answers the liveness probe', async ({ client }) => {
    const response = await client.get('/up')

    response.assertStatus(200)
    response.assertTextIncludes('ok')
  })

  test('reports the detailed report when no secret is configured', async ({ client }) => {
    const response = await client.get('/health')

    response.assertStatus(200)
    response.assertBodyContains({ isHealthy: true })
  })
})
