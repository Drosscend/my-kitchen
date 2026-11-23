import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const UpdateNotificationSettingsController = () =>
  import('#app/notifications/controllers/update_notification_settings_controller')
const AddPushDeviceController = () =>
  import('#app/notifications/controllers/add_push_device_controller')
const RemovePushDeviceController = () =>
  import('#app/notifications/controllers/remove_push_device_controller')
const SendTestPushController = () =>
  import('#app/notifications/controllers/send_test_push_controller')
const UnsubscribeController = () => import('#app/notifications/controllers/unsubscribe_controller')

router
  .group(() => {
    router
      .put('account/notifications', [UpdateNotificationSettingsController, 'execute'])
      .as('account.notifications.update')
    router
      .post('account/push-devices', [AddPushDeviceController, 'execute'])
      .as('account.push_devices.store')
    router
      .delete('account/push-devices/:id', [RemovePushDeviceController, 'execute'])
      .as('account.push_devices.destroy')
    router
      .post('account/push-devices/:id/test', [SendTestPushController, 'execute'])
      .as('account.push_devices.test')
  })
  .use(middleware.auth())

router
  .post('notifications/unsubscribe/:token', [UnsubscribeController, 'execute'])
  .as('notifications.unsubscribe')

router.on('notifications/unsubscribe/:token').redirectToPath('/account#notifications')
