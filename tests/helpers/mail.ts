import type { FakeMailer } from '@adonisjs/mail'

/**
 * The fake mailer captures class based mails before they are built, so
 * the message has to be assembled here before its content can be read.
 */
export async function queuedMessage(mailer: FakeMailer) {
  const [queued] = mailer.mails.queued()

  if (!queued) {
    throw new Error('No mail was queued')
  }

  await queued.build()
  return queued.message
}

export async function queuedLink(mailer: FakeMailer, pattern: RegExp) {
  const message = await queuedMessage(mailer)
  const match = String(message.nodeMailerMessage.text).match(pattern)

  if (!match) {
    throw new Error(`No link matching ${pattern} in the queued mail`)
  }

  return match[1]
}
