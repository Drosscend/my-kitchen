import hash from '@adonisjs/core/services/hash'
import { test } from '@japa/runner'
import { RequestEmailChange } from '#identity/actions/request_email_change'
import { EmailAddress } from '#identity/domain/email_address'
import { User } from '#identity/domain/user'
import { UserIdentifier } from '#identity/domain/user_identifier'
import type { SendEmailVerification } from '#identity/actions/send_email_verification'
import type { UserRepository } from '#identity/repositories/user_repository'

async function makeUserWithPassword(password: string) {
  const email = EmailAddress.create('ada@example.com')

  if (!email.ok) {
    throw new Error('The test email address must be valid')
  }

  return User.create({
    id: UserIdentifier.generate(),
    name: 'Ada',
    email: email.value,
    passwordHash: await hash.make(password),
    emailVerifiedAt: new Date('2026-01-01T00:00:00Z'),
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: null,
  })
}

interface SentVerification {
  user: User
  email?: EmailAddress
}

function makeAction(takenEmail: string | null, sent: SentVerification[]) {
  // SAFETY: The action only calls `findUserByEmail`.
  const users = {
    findUserByEmail(email: EmailAddress): Promise<User | null> {
      return Promise.resolve(email.toString() === takenEmail ? makeUserWithPassword('x') : null)
    },
  } as UserRepository
  // SAFETY: The action only calls `execute` on the verification sender.
  const sendEmailVerification = {
    execute(params: SentVerification) {
      sent.push(params)
      return Promise.resolve()
    },
  } as SendEmailVerification

  return new RequestEmailChange(users, sendEmailVerification)
}

test.group('RequestEmailChange', () => {
  test('requires the current password', async ({ assert }) => {
    const sent: SentVerification[] = []
    const user = await makeUserWithPassword('a-secure-password')

    const result = await makeAction(null, sent).execute({
      user,
      email: 'new@example.com',
      password: 'wrong-password',
    })

    assert.deepEqual(result, { ok: false, error: { type: 'invalid_credentials' } })
    assert.lengthOf(sent, 0)
  })

  test('refuses the current address and a taken one', async ({ assert }) => {
    const sent: SentVerification[] = []
    const user = await makeUserWithPassword('a-secure-password')
    const action = makeAction('taken@example.com', sent)

    const same = await action.execute({
      user,
      email: 'ADA@example.com',
      password: 'a-secure-password',
    })
    const taken = await action.execute({
      user,
      email: 'taken@example.com',
      password: 'a-secure-password',
    })

    assert.deepEqual(same, { ok: false, error: { type: 'same_email' } })
    assert.deepEqual(taken, { ok: false, error: { type: 'email_already_taken' } })
    assert.lengthOf(sent, 0)
  })

  test('sends the confirmation link to the new address', async ({ assert }) => {
    const sent: SentVerification[] = []
    const user = await makeUserWithPassword('a-secure-password')

    const result = await makeAction(null, sent).execute({
      user,
      email: ' New@Example.com ',
      password: 'a-secure-password',
    })

    assert.isTrue(result.ok)
    assert.equal(sent[0]?.email?.toString(), 'new@example.com')
    assert.equal(sent[0]?.user, user)
  })
})
