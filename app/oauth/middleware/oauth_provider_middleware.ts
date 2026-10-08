import limiter from '@adonisjs/limiter/services/main'
import { OAUTH_DISCOVERY_PATHS, OAUTH_PREFIX, oauthProvider } from '#app/oauth/provider'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

const handleOAuthRequest = oauthProvider.callback()

/**
 * The consent page is the only route under the prefix the application
 * serves itself, with its session and CSRF protection.
 */
const INTERACTION_PREFIX = `${OAUTH_PREFIX}/interaction/`

/**
 * Registration is open to anyone and stores a client each time: cap it
 * per address. The router throttles do not run this early.
 */
const REGISTRATION_PATH = `${OAUTH_PREFIX}/register`
const registrationLimiter = limiter.use({ requests: 30, duration: '1 hour' })

function servedByProvider(path: string) {
  return (
    OAUTH_DISCOVERY_PATHS.includes(path) ||
    (path.startsWith(`${OAUTH_PREFIX}/`) && !path.startsWith(INTERACTION_PREFIX))
  )
}

/**
 * Hands the OAuth endpoints to oidc-provider before the router runs:
 * it reads the raw request body itself, and answers on the Node objects,
 * so the server writes nothing more.
 */
export default class OAuthProviderMiddleware {
  async handle({ request, response }: HttpContext, next: NextFn) {
    if (!servedByProvider(request.url())) {
      return next()
    }

    if (request.method() === 'POST' && request.url() === REGISTRATION_PATH) {
      await registrationLimiter.consume(`oauth_register_${request.ip()}`)
    }

    await handleOAuthRequest(request.request, response.response)
  }
}
