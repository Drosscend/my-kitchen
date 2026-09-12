import { inject } from '@adonisjs/core'
import { err, ok, type Result } from '#core/result'
import { generateMcpToken } from '#identity/domain/mcp_token'
import { TokenIdentifier } from '#identity/domain/token_identifier'
import { MAX_NAME_LENGTH } from '#identity/domain/user'
import { McpTokenRepository } from '#identity/repositories/mcp_token_repository'
import type { UserIdentifier } from '#identity/domain/user_identifier'

export interface CreateMcpTokenParams {
  userId: UserIdentifier
  name: string
}

export interface InvalidTokenNameError {
  type: 'invalid_token_name'
}
export type CreateMcpTokenResult = Result<string, InvalidTokenNameError>

@inject()
export class CreateMcpToken {
  constructor(private readonly tokens: McpTokenRepository) {}

  async execute(params: CreateMcpTokenParams): Promise<CreateMcpTokenResult> {
    const name = params.name.trim()

    if (!name || name.length > MAX_NAME_LENGTH) {
      return err({ type: 'invalid_token_name' })
    }

    const token = generateMcpToken()
    await this.tokens.insert({
      id: TokenIdentifier.generate(),
      userId: params.userId,
      name,
      prefix: token.prefix,
      tokenHash: token.hash,
    })

    return ok(token.value)
  }
}
