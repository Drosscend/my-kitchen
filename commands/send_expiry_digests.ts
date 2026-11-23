import { BaseCommand } from '@adonisjs/core/ace'
import { SendExpiryDigests } from '#notifications/actions/send_expiry_digests'
import type { CommandOptions } from '@adonisjs/core/types/ace'

export default class SendExpiryDigestsCommand extends BaseCommand {
  static commandName = 'notifications:send-expiry'
  static description = 'Mail every account the batches whose expiry status changed'
  static options: CommandOptions = { startApp: true }

  async run() {
    const sendExpiryDigests = await this.app.container.make(SendExpiryDigests)
    const { sent, failed } = await sendExpiryDigests.execute()

    this.logger.info(`${sent} digest(s) sent, ${failed} failed`)

    if (failed > 0) {
      this.exitCode = 1
    }
  }
}
