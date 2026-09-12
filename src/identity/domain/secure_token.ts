import { createHash, randomBytes } from 'node:crypto'

export interface SecureToken {
  value: string
  hash: string
}

/**
 * The clear value travels in the e-mail link, only its hash is stored:
 * a database leak does not hand out usable links.
 */
export function generateSecureToken(): SecureToken {
  const value = randomBytes(32).toString('base64url')
  return { value, hash: hashSecureToken(value) }
}

export function hashSecureToken(value: string) {
  return createHash('sha256').update(value).digest('hex')
}
