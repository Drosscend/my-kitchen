import type { SendTestPushError } from '#notifications/actions/send_test_push'

export const notificationErrorMessages = {
  push_device_not_found: 'Appareil introuvable',
  push_device_gone: "Cet appareil n'accepte plus les notifications, il a été retiré",
  push_failed: "La notification n'a pas pu partir, réessaie plus tard",
} satisfies Record<SendTestPushError['type'], string>
