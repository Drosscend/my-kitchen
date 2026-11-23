import app from '@adonisjs/core/services/app'
import { PushSender, type PushTarget } from '#notifications/services/push_sender'
import type { PushMessage } from '#notifications/domain/push_message'

/**
 * Records the messages instead of calling push services. An endpoint
 * listed in `gone` answers like a device that unsubscribed.
 */
export class FakePushSender extends PushSender {
  readonly sent: { endpoint: string; message: PushMessage }[] = []
  readonly gone = new Set<string>()

  override get enabled() {
    return true
  }

  override async send(target: PushTarget, message: PushMessage) {
    this.sent.push({ endpoint: target.endpoint, message })
    return this.gone.has(target.endpoint) ? ('gone' as const) : ('sent' as const)
  }
}

export function fakePushSender() {
  const sender = new FakePushSender()
  app.container.swap(PushSender, () => sender)
  return sender
}

export function restorePushSender() {
  app.container.restore(PushSender)
}
