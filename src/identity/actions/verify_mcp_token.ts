import { inject } from '@adonisjs/core'
import { err, ok, type Result } from '#core/result'
import { hashMcpToken, looksLikeMcpToken } from '#identity/domain/mcp_token'
import { UserIdentifier } from '#identity/domain/user_identifier'
import { McpTokenRepository } from '#identity/repositories/mcp_token_repository'
import type { InvalidTokenError } from '#identity/actions/verify_email'

export type VerifyMcpTokenResult = Result<UserIdentifier, InvalidTokenError>

@inject()
export class VerifyMcpToken {
  constructor(private readonly tokens: McpTokenRepository) {}

  async execute(value: string): Promise<VerifyMcpTokenResult> {
    if (!looksLikeMcpToken(value)) {
      return err({ type: 'invalid_token' })
    }

    const token = await this.tokens.findByHash(hashMcpToken(value))

    if (!token) {
      return err({ type: 'invalid_token' })
    }

    await this.tokens.touchLastUsed(token.id, new Date())
    return ok(UserIdentifier.fromString(token.userId))
  }
}
