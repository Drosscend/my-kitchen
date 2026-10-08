import { inject } from '@adonisjs/core'
import { err, ok, type Result } from '#core/result'
import { OAuthModelRepository } from '#identity/repositories/oauth_model_repository'
import type { UserIdentifier } from '#identity/domain/user_identifier'

export interface RevokeOAuthConnectionParams {
  userId: UserIdentifier
  id: string
}

export interface OAuthConnectionNotFoundError {
  type: 'oauth_connection_not_found'
}
export type RevokeOAuthConnectionResult = Result<void, OAuthConnectionNotFoundError>

/**
 * Deletes the grant with its codes and tokens: the assistant has to go
 * through the authorization again.
 */
@inject()
export class RevokeOAuthConnection {
  constructor(private readonly models: OAuthModelRepository) {}

  async execute(params: RevokeOAuthConnectionParams): Promise<RevokeOAuthConnectionResult> {
    const deleted = await this.models.deleteGrant(params.userId, params.id)
    return deleted ? ok(undefined) : err({ type: 'oauth_connection_not_found' })
  }
}
