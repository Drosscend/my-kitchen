import { inject } from '@adonisjs/core'
import mail from '@adonisjs/mail/services/main'
import { EmailAddress } from '#identity/domain/email_address'
import { generateSecureToken } from '#identity/domain/secure_token'
import { TokenIdentifier } from '#identity/domain/token_identifier'
import PasswordResetMail from '#identity/mails/password_reset_mail'
import { PasswordResetTokenRepository } from '#identity/repositories/password_reset_token_repository'
import { UserRepository } from '#identity/repositories/user_repository'
import { TransactionManager } from '#shared/services/transaction_manager'
import env from '#start/env'

export const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000

export interface RequestPasswordResetParams {
  email: string
}

/**
 * Never reports whether the address exists: the caller gets the same
 * answer either way, only the mailbox learns the outcome.
 */
@inject()
export class RequestPasswordReset {
  constructor(
    private readonly users: UserRepository,
    private readonly tokens: PasswordResetTokenRepository,
    private readonly transactions: TransactionManager
  ) {}

  async execute(params: RequestPasswordResetParams): Promise<void> {
    const email = EmailAddress.create(params.email)
    const user = email.ok ? await this.users.findUserByEmail(email.value) : null

    if (!user) {
      return
    }

    const token = generateSecureToken()

    await this.transactions.run(() =>
      this.tokens.replaceForUser({
        id: TokenIdentifier.generate(),
        userId: user.getIdentifier(),
        tokenHash: token.hash,
        expiresAt: new Date(Date.now() + PASSWORD_RESET_TTL_MS),
      })
    )

    const url = `${env.get('APP_URL')}/reset-password/${token.value}`
    await mail.sendLater(new PasswordResetMail(user.email, user.name, url))
  }
}
