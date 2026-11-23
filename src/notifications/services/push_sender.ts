import webPush, { WebPushError } from 'web-push'
import { webPushConfig } from '#config/web_push'
import type { PushMessage } from '#notifications/domain/push_message'

export interface PushTarget {
  endpoint: string
  p256dh: string
  auth: string
}

/**
 * Delivers a message to one device through its push service. A device
 * that unsubscribed or uninstalled the app answers 404 or 410: it is gone
 * for good.
 */
export class PushSender {
  get enabled() {
    return webPushConfig !== null
  }

  async send(target: PushTarget, message: PushMessage): Promise<'sent' | 'gone'> {
    if (!webPushConfig) {
      throw new Error('Web push is not configured')
    }

    try {
      await webPush.sendNotification(
        { endpoint: target.endpoint, keys: { p256dh: target.p256dh, auth: target.auth } },
        JSON.stringify(message),
        { vapidDetails: webPushConfig, TTL: 86_400 }
      )
      return 'sent'
    } catch (error) {
      if (error instanceof WebPushError && (error.statusCode === 404 || error.statusCode === 410)) {
        return 'gone'
      }

      throw error
    }
  }
}
