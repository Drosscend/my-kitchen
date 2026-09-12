import mail from '@adonisjs/mail/services/main'
import { test } from '@japa/runner'
import {
  EMAIL_VERIFICATION_TTL_MS,
  SendEmailVerification,
} from '#identity/actions/send_email_verification'
import { EmailAddress } from '#identity/domain/email_address'
import EmailVerificationMail from '#identity/mails/email_verification_mail'
import { queuedMessage } from '#tests/helpers/mail'
import { makeUser } from '#tests/helpers/users'
import type { EmailVerificationTokenRepository } from '#identity/repositories/email_verification_token_repository'
import type { TransactionManager } from '#shared/services/transaction_manager'

// SAFETY: The actions only call `run` on their transaction dependency.
const transactions = {
  run<T>(callback: () => Promise<T>) {
    return callback()
  },
} as TransactionManager

interface IssuedToken {
  email: EmailAddress
  tokenHash: string
  expiresAt: Date
}

test.group('SendEmailVerification', (group) => {
  group.each.teardown(() => mail.restore())

  test('issues a 24 hour token for the account address', async ({ assert }) => {
    const mailer = mail.fake()
    const user = makeUser()
    let issued: IssuedToken | undefined
    // SAFETY: The action only calls `replaceForUser`.
    const tokens = {
      replaceForUser(payload: IssuedToken) {
        issued = payload
        return Promise.resolve()
      },
    } as EmailVerificationTokenRepository

    const before = Date.now()
    await new SendEmailVerification(tokens, transactions).execute({ user })

    assert.equal(issued?.email.toString(), 'ada@example.com')
    assert.isAtLeast(issued!.expiresAt.getTime(), before + EMAIL_VERIFICATION_TTL_MS)
    mailer.mails.assertQueuedCount(EmailVerificationMail, 1)
    const message = await queuedMessage(mailer)
    message.assertTo('ada@example.com')
    message.assertTextIncludes('/verify-email/')
  })

  test('confirms another address when one is given', async ({ assert }) => {
    const mailer = mail.fake()
    const user = makeUser()
    const email = EmailAddress.create('new@example.com')

    if (!email.ok) {
      throw new Error('The test email address must be valid')
    }

    let issued: IssuedToken | undefined
    // SAFETY: The action only calls `replaceForUser`.
    const tokens = {
      replaceForUser(payload: IssuedToken) {
        issued = payload
        return Promise.resolve()
      },
    } as EmailVerificationTokenRepository

    await new SendEmailVerification(tokens, transactions).execute({ user, email: email.value })

    assert.equal(issued?.email.toString(), 'new@example.com')
    const message = await queuedMessage(mailer)
    message.assertTo('new@example.com')
    assert.isFalse(message.hasTo('ada@example.com'))
  })
})
