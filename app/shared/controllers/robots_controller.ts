import { appUrl } from '#config/app'
import type { HttpContext } from '@adonisjs/core/http'

/**
 * Nothing is disallowed: a crawler has to fetch a page to read its
 * noindex tag.
 */
export default class RobotsController {
  execute({ response }: HttpContext) {
    response.header('content-type', 'text/plain; charset=utf-8')

    return `User-agent: *\nDisallow:\n\nSitemap: ${new URL('/sitemap.xml', appUrl).href}\n`
  }
}
