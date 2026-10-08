import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const AuthorizeClientController = () => import('#app/oauth/controllers/authorize_client_controller')
const DenyClientController = () => import('#app/oauth/controllers/deny_client_controller')

/**
 * The consent page of the authorization server. oidc-provider serves
 * every other OAuth endpoint itself, see OAuthProviderMiddleware.
 */
router
  .group(() => {
    router
      .get('oauth/interaction/:uid', [AuthorizeClientController, 'render'])
      .as('oauth.authorization.show')
    router
      .post('oauth/interaction/:uid', [AuthorizeClientController, 'execute'])
      .as('oauth.authorization.approve')
    router
      .post('oauth/interaction/:uid/deny', [DenyClientController, 'execute'])
      .as('oauth.authorization.deny')
  })
  .use([middleware.auth(), middleware.verified()])
