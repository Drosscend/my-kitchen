import { test } from '@japa/runner'
import { resetDatabase } from '#tests/helpers/database'
import { assertRedirectedTo } from '#tests/helpers/http'

const LOGIN_FORM = { email: 'ada@example.com', password: 'wrong-password' }

test.group('Throttling', (group) => {
  group.each.setup(() => resetDatabase())

  test('sends the eleventh login attempt in a minute back to the form', async ({ client }) => {
    for (let attempt = 0; attempt < 10; attempt++) {
      await client.post('/login').withCsrfToken().form(LOGIN_FORM).redirects(0)
    }

    const response = await client
      .post('/login')
      .header('referer', '/login')
      .header('accept', 'text/html')
      .withCsrfToken()
      .form(LOGIN_FORM)
      .redirects(0)

    assertRedirectedTo(response, '/login')
    response.assertFlashMessage('error', 'Trop de tentatives, réessaie dans quelques minutes')
  })
})
