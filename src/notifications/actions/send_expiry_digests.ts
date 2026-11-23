import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'
import mail from '@adonisjs/mail/services/main'
import { InventoryQuery, type IngredientView } from '#inventory/queries/inventory_query'
import { NotifyDevices } from '#notifications/actions/notify_devices'
import {
  expiryDigestHeadline,
  expiryDigestSummary,
  isExpiryAlertStatus,
  noticeKey,
  type ExpiryAlert,
} from '#notifications/domain/expiry_alert'
import { signUnsubscribeToken } from '#notifications/domain/unsubscribe_token'
import ExpiryDigestMail from '#notifications/mails/expiry_digest_mail'
import { ExpiryDigestRecipientsQuery } from '#notifications/queries/expiry_digest_recipients_query'
import { ExpiryNoticeRepository } from '#notifications/repositories/expiry_notice_repository'

function expiryAlerts(item: IngredientView): ExpiryAlert[] {
  return item.batches.flatMap((batch) =>
    batch.expiresOn !== null &&
    batch.expiryKind !== null &&
    batch.daysLeft !== null &&
    isExpiryAlertStatus(batch.expiryStatus)
      ? [
          {
            batchId: batch.id,
            ingredientName: item.name,
            quantity: batch.quantity,
            unit: item.unit,
            status: batch.expiryStatus,
            expiresOn: batch.expiresOn,
            expiryKind: batch.expiryKind,
            daysLeft: batch.daysLeft,
          },
        ]
      : []
  )
}

/**
 * Mails and pushes each recipient the batches that entered their warning window or
 * passed their date since the previous digest, then remembers them.
 */
@inject()
export class SendExpiryDigests {
  constructor(
    private readonly recipients: ExpiryDigestRecipientsQuery,
    private readonly inventory: InventoryQuery,
    private readonly notices: ExpiryNoticeRepository,
    private readonly devices: NotifyDevices
  ) {}

  async execute() {
    await this.notices.deleteOrphans()
    let sent = 0
    let failed = 0

    for (const recipient of await this.recipients.execute()) {
      const notified = await this.notices.findForUser(recipient.userId)
      const pantry = await this.inventory.execute(recipient.userId)
      const alerts = pantry
        .flatMap(expiryAlerts)
        .filter((alert) => notified.get(alert.batchId) !== noticeKey(alert))

      if (alerts.length === 0) {
        continue
      }

      const pushed = await this.devices.execute({
        userId: recipient.userId,
        alert: 'expiry',
        message: {
          title: expiryDigestHeadline(alerts),
          body: expiryDigestSummary(alerts),
          url: '/inventory',
        },
      })

      if (recipient.expiryMail) {
        try {
          await mail.send(
            new ExpiryDigestMail(recipient.email, signUnsubscribeToken(recipient.userId), alerts)
          )
        } catch (error) {
          logger.error({ err: error, userId: recipient.userId.toString() }, 'expiry digest failed')
          failed += 1
          continue
        }
      } else if (pushed === 0) {
        continue
      }

      await this.notices.record(recipient.userId, alerts, new Date())
      sent += 1
    }

    return { sent, failed }
  }
}
