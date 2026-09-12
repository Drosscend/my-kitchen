import { test } from '@japa/runner'
import { assertRedirectedTo } from '#tests/helpers/http'
import { resetState } from '#tests/helpers/state'

const LOGIN_FORM = { email: 'ada@example.com', password: 'wrong-password' }

test.group('Throttling', (group) => {
  group.each.setup(() => resetState())

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
