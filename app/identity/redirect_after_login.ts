import { INTENDED_URL_KEY } from '#app/middleware/auth_middleware'
import type { HttpContext } from '@adonisjs/core/http'

/**
 * Sends a user who just logged in back to the page they asked for, such
 * as the consent page of an assistant, or to the inventory. The query
 * string of the login request is not carried over: after Google, it
 * holds the authorization code.
 */
export function redirectAfterLogin({ response, session }: HttpContext) {
  const intendedUrl = String(session.pull(INTENDED_URL_KEY, ''))

  if (intendedUrl.startsWith('/') && !intendedUrl.startsWith('//')) {
    return response.redirect().withQs(false).toPath(intendedUrl)
  }

  return response.redirect().withQs(false).toRoute('inventory.index')
}
