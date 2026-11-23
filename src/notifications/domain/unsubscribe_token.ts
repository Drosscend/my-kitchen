import encryption from '@adonisjs/core/services/encryption'
import { UserIdentifier } from '#identity/domain/user_identifier'

const PURPOSE = 'expiry-mail-unsubscribe'

export function signUnsubscribeToken(userId: UserIdentifier) {
  return encryption.getMessageVerifier().sign(userId.toString(), undefined, PURPOSE)
}

export function readUnsubscribeToken(token: string) {
  const userId = encryption.getMessageVerifier().unsign<string>(token, PURPOSE)
  return userId === null ? null : UserIdentifier.fromString(userId)
}
