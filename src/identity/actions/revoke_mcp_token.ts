import { inject } from '@adonisjs/core'
import { err, ok, type Result } from '#core/result'
import { McpTokenRepository } from '#identity/repositories/mcp_token_repository'
import type { UserIdentifier } from '#identity/domain/user_identifier'

export interface RevokeMcpTokenParams {
  userId: UserIdentifier
  id: string
}

export interface McpTokenNotFoundError {
  type: 'mcp_token_not_found'
}
export type RevokeMcpTokenResult = Result<void, McpTokenNotFoundError>

@inject()
export class RevokeMcpToken {
  constructor(private readonly tokens: McpTokenRepository) {}

  async execute(params: RevokeMcpTokenParams): Promise<RevokeMcpTokenResult> {
    const deleted = await this.tokens.deleteForUser(params.userId, params.id)
    return deleted ? ok(undefined) : err({ type: 'mcp_token_not_found' })
  }
}
