import mail from '@adonisjs/mail/services/main'
import { test } from '@japa/runner'
import {
  PASSWORD_RESET_TTL_MS,
  RequestPasswordReset,
} from '#identity/actions/request_password_reset'
import PasswordResetMail from '#identity/mails/password_reset_mail'
import { queuedMessage } from '#tests/helpers/mail'
import { makeUser } from '#tests/helpers/users'
import type { EmailAddress } from '#identity/domain/email_address'
import type { User } from '#identity/domain/user'
import type { PasswordResetTokenRepository } from '#identity/repositories/password_reset_token_repository'
import type { UserRepository } from '#identity/repositories/user_repository'
import type { TransactionManager } from '#shared/services/transaction_manager'

// SAFETY: The actions only call `run` on their transaction dependency.
const transactions = {
  run<T>(callback: () => Promise<T>) {
    return callback()
  },
} as TransactionManager

test.group('RequestPasswordReset', (group) => {
  group.each.teardown(() => mail.restore())

  test('stays silent for an unknown address', async ({ assert }) => {
    const mailer = mail.fake()
    let tokenIssued = false
    // SAFETY: The action only calls `findUserByEmail`.
    const users = {
      findUserByEmail(_email: EmailAddress): Promise<User | null> {
        return Promise.resolve(null)
      },
    } as UserRepository
    // SAFETY: The double records any call, which the test asserts never happens.
    const tokens = {
      replaceForUser(_payload: { expiresAt: Date }) {
        tokenIssued = true
        return Promise.resolve()
      },
    } as PasswordResetTokenRepository

    await new RequestPasswordReset(users, tokens, transactions).execute({
      email: 'nobody@example.com',
    })

    assert.isFalse(tokenIssued)
    mailer.mails.assertNoneQueued()
  })

  test('issues a one hour token and queues the link to the account address', async ({ assert }) => {
    const mailer = mail.fake()
    const user = makeUser()
    let expiresAt: Date | undefined
    // SAFETY: The action only calls `findUserByEmail`.
    const users = {
      findUserByEmail(_email: EmailAddress): Promise<User | null> {
        return Promise.resolve(user)
      },
    } as UserRepository
    // SAFETY: The action only calls `replaceForUser`.
    const tokens = {
      replaceForUser(payload: { expiresAt: Date }) {
        expiresAt = payload.expiresAt
        return Promise.resolve()
      },
    } as PasswordResetTokenRepository

    const before = Date.now()
    await new RequestPasswordReset(users, tokens, transactions).execute({
      email: '  ADA@EXAMPLE.COM ',
    })

    assert.isAtLeast(expiresAt!.getTime(), before + PASSWORD_RESET_TTL_MS)
    mailer.mails.assertQueuedCount(PasswordResetMail, 1)
    const message = await queuedMessage(mailer)
    message.assertTo('ada@example.com')
    message.assertTextIncludes('/reset-password/')
  })
})
