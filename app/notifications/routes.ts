import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const UpdateNotificationSettingsController = () =>
  import('#app/notifications/controllers/update_notification_settings_controller')
const UnsubscribeController = () => import('#app/notifications/controllers/unsubscribe_controller')

router
  .put('account/notifications', [UpdateNotificationSettingsController, 'execute'])
  .as('account.notifications.update')
  .use(middleware.auth())

router
  .post('notifications/unsubscribe/:token', [UnsubscribeController, 'execute'])
  .as('notifications.unsubscribe')

router.on('notifications/unsubscribe/:token').redirectToPath('/account#notifications')
