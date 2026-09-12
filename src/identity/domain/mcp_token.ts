import { generateSecureToken, hashSecureToken } from '#identity/domain/secure_token'

const TOKEN_PREFIX = 'mk_'
const VISIBLE_LENGTH = 11

interface IssuedMcpToken {
  /**
   * Shown once, at creation; only its hash is kept.
   */
  value: string
  hash: string
  /**
   * The first characters, enough to tell tokens apart in a list.
   */
  prefix: string
}

export function generateMcpToken(): IssuedMcpToken {
  const value = `${TOKEN_PREFIX}${generateSecureToken().value}`
  return { value, hash: hashSecureToken(value), prefix: value.slice(0, VISIBLE_LENGTH) }
}

export function looksLikeMcpToken(value: string) {
  return value.startsWith(TOKEN_PREFIX) && value.length > VISIBLE_LENGTH
}
