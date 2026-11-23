import app from '@adonisjs/core/services/app'
import logger from '@adonisjs/core/services/logger'
import { Cron } from 'croner'
import { SendExpiryDigests } from '#notifications/actions/send_expiry_digests'

const expiryDigests = new Cron(
  '0 8 * * *',
  { timezone: 'Europe/Paris', protect: true, name: 'expiry-digests' },
  async () => {
    try {
      const sendExpiryDigests = await app.container.make(SendExpiryDigests)
      const { sent, failed } = await sendExpiryDigests.execute()
      logger.info({ sent, failed }, 'expiry digests sent')
    } catch (error) {
      logger.error({ err: error }, 'expiry digests failed')
    }
  }
)

app.terminating(() => {
  expiryDigests.stop()
})
