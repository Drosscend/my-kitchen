import { createHash, randomBytes } from 'node:crypto'

interface SecureToken {
  value: string
  hash: string
}

export interface InvalidTokenError {
  type: 'invalid_token'
}

/**
 * The clear value is handed to the caller once, only its hash is stored:
 * a database leak does not hand out usable tokens.
 */
export function generateSecureToken(): SecureToken {
  const value = randomBytes(32).toString('base64url')
  return { value, hash: hashSecureToken(value) }
}

export function hashSecureToken(value: string) {
  return createHash('sha256').update(value).digest('hex')
}
