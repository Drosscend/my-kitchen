import app from '@adonisjs/core/services/app'
import { defineConfig, transports } from '@adonisjs/mail'
import env from '#start/env'

/**
 * Outgoing mail goes through an SMTP relay reachable on a private
 * Docker network. The relay speaks STARTTLS with a self-signed
 * certificate there, hence the relaxed certificate check paired with a
 * mandatory upgrade. Locally, Mailpit (compose.yaml) takes plain SMTP
 * without credentials.
 */
const username = env.get('SMTP_USERNAME')

const mailConfig = defineConfig({
  default: 'smtp',

  from: {
    address: env.get('MAIL_FROM_ADDRESS'),
    name: env.get('MAIL_FROM_NAME'),
  },

  mailers: {
    smtp: transports.smtp({
      host: env.get('SMTP_HOST'),
      port: env.get('SMTP_PORT'),
      secure: false,
      requireTLS: app.inProduction,
      tls: { rejectUnauthorized: false },
      auth: username
        ? { type: 'login', user: username, pass: env.get('SMTP_PASSWORD') ?? '' }
        : undefined,
    }),
  },
})

export default mailConfig

declare module '@adonisjs/mail/types' {
  export interface MailersList extends InferMailers<typeof mailConfig> {}
}
