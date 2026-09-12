import { inject } from '@adonisjs/core'
import mail from '@adonisjs/mail/services/main'
import { generateSecureToken } from '#identity/domain/secure_token'
import { TokenIdentifier } from '#identity/domain/token_identifier'
import EmailVerificationMail from '#identity/mails/email_verification_mail'
import { EmailVerificationTokenRepository } from '#identity/repositories/email_verification_token_repository'
import { TransactionManager } from '#shared/services/transaction_manager'
import env from '#start/env'
import type { EmailAddress } from '#identity/domain/email_address'
import type { User } from '#identity/domain/user'

export const EMAIL_VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000

export interface SendEmailVerificationParams {
  user: User
  /**
   * The address to confirm when it differs from the current one.
   */
  email?: EmailAddress
}

@inject()
export class SendEmailVerification {
  constructor(
    private readonly tokens: EmailVerificationTokenRepository,
    private readonly transactions: TransactionManager
  ) {}

  async execute(params: SendEmailVerificationParams): Promise<void> {
    const email = params.email ?? params.user.emailAddress
    const token = generateSecureToken()

    await this.transactions.run(() =>
      this.tokens.replaceForUser({
        id: TokenIdentifier.generate(),
        userId: params.user.getIdentifier(),
        email,
        tokenHash: token.hash,
        expiresAt: new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS),
      })
    )

    const url = `${env.get('APP_URL')}/verify-email/${token.value}`
    await mail.sendLater(new EmailVerificationMail(email.toString(), params.user.name, url))
  }
}
