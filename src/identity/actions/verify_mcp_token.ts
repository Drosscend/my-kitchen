import { inject } from '@adonisjs/core'
import { err, ok, type Result } from '#core/result'
import { looksLikeMcpToken } from '#identity/domain/mcp_token'
import { hashSecureToken, type InvalidTokenError } from '#identity/domain/secure_token'
import { UserIdentifier } from '#identity/domain/user_identifier'
import { McpTokenRepository } from '#identity/repositories/mcp_token_repository'

export interface VerifyMcpTokenParams {
  token: string
}

export type VerifyMcpTokenResult = Result<UserIdentifier, InvalidTokenError>

@inject()
export class VerifyMcpToken {
  constructor(private readonly tokens: McpTokenRepository) {}

  async execute(params: VerifyMcpTokenParams): Promise<VerifyMcpTokenResult> {
    if (!looksLikeMcpToken(params.token)) {
      return err({ type: 'invalid_token' })
    }

    const token = await this.tokens.findByHash(hashSecureToken(params.token))

    if (!token) {
      return err({ type: 'invalid_token' })
    }

    await this.tokens.touchLastUsed(token.id, new Date())
    return ok(UserIdentifier.fromString(token.userId))
  }
}
