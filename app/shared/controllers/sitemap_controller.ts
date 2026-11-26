import { appUrl } from '#config/app'
import type { HttpContext } from '@adonisjs/core/http'

/**
 * The indexed pages, the same ones `config/inertia.ts` renders on the server.
 */
export default class SitemapController {
  execute({ response }: HttpContext) {
    response.header('content-type', 'application/xml; charset=utf-8')

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<url><loc>${new URL('/', appUrl).href}</loc></url>
<url><loc>${new URL('/legal', appUrl).href}</loc></url>
</urlset>
`
  }
}
