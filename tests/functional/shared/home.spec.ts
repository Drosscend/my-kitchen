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

  test('renders the landing page on the server with its search tags', async ({
    client,
    assert,
  }) => {
    const response = await client.get('/')

    response.assertStatus(200)
    const html = response.text()
    assert.include(
      html,
      '<title data-inertia>Inventaire de cuisine, recettes et mode cuisine · Mon Garde-Manger</title>'
    )
    assert.include(html, '<link rel="canonical" href="http://localhost:3333/"')
    assert.include(html, '<meta property="og:image" content="http://localhost:3333/og.png"')
    assert.include(html, '"@type":"FAQPage"')
    assert.include(html, 'Ce que tu as en cuisine, et quoi en faire avant que ça se perde.')
    assert.notInclude(html, 'noindex')
  })

  test('keeps the pages with nothing to rank out of search engines', async ({ client, assert }) => {
    const response = await client.get('/login')

    response.assertStatus(200)
    assert.include(response.text(), '<meta name="robots" content="noindex" />')
  })

  test('points crawlers to the sitemap of the indexed pages', async ({ client, assert }) => {
    const robots = await client.get('/robots.txt')

    robots.assertStatus(200)
    robots.assertHeader('content-type', 'text/plain; charset=utf-8')
    assert.include(robots.text(), 'Sitemap: http://localhost:3333/sitemap.xml')

    const sitemap = await client.get('/sitemap.xml')

    sitemap.assertStatus(200)
    sitemap.assertHeader('content-type', 'application/xml; charset=utf-8')
    assert.include(sitemap.text(), '<loc>http://localhost:3333/</loc>')
    assert.include(sitemap.text(), '<loc>http://localhost:3333/legal</loc>')
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
