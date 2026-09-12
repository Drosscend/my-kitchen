import { test } from '@japa/runner'

test.group('Icons', () => {
  test('serves the favicon and the logo', async ({ client }) => {
    const favicon = await client.get('/favicon.ico')
    const logo = await client.get('/logo.svg')

    favicon.assertStatus(200)
    logo.assertStatus(200)
    logo.assertHeader('content-type', 'image/svg+xml')
  })
})
