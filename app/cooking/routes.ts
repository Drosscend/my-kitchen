import router from '@adonisjs/core/services/router'
import { SESSION_CODE_PATTERN } from '#cooking/domain/cooking_session'
import { middleware } from '#start/kernel'
import { joinThrottle } from '#start/limiter'

const StartCookingSessionController = () =>
  import('#app/cooking/controllers/start_cooking_session_controller')
const JoinCookingSessionController = () =>
  import('#app/cooking/controllers/join_cooking_session_controller')
const CookingSessionController = () => import('#app/cooking/controllers/cooking_session_controller')
const CookingSessionStateController = () =>
  import('#app/cooking/controllers/cooking_session_state_controller')
const UpdateCookingSessionStateController = () =>
  import('#app/cooking/controllers/update_cooking_session_state_controller')

router
  .group(() => {
    router.post('recipes/:id/cook', [StartCookingSessionController, 'execute']).as('cooking.start')
  })
  .use([middleware.auth(), middleware.verified()])

/**
 * Open to anyone holding a session code: the phone scanning the QR
 * code has no account.
 */
router.get('cook/join', [JoinCookingSessionController, 'render']).as('cooking.join')
router
  .post('cook/join', [JoinCookingSessionController, 'execute'])
  .as('cooking.join.store')
  .use(joinThrottle)

router
  .group(() => {
    router.get('cook/:code', [CookingSessionController, 'render']).as('cooking.show')
    router.get('cook/:code/state', [CookingSessionStateController, 'execute']).as('cooking.state')
    router
      .patch('cook/:code/state', [UpdateCookingSessionStateController, 'execute'])
      .as('cooking.state.update')
  })
  .where('code', SESSION_CODE_PATTERN)
