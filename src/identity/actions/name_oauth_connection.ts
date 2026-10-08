import { inject } from '@adonisjs/core'
import { OAuthModelRepository } from '#identity/repositories/oauth_model_repository'

export interface NameOAuthConnectionParams {
  grantId: string
  clientName: string
}

/**
 * Keeps the name the assistant gave at authorization time: a client
 * identified by a metadata document is not stored, so the account page
 * could not name it later.
 */
@inject()
export class NameOAuthConnection {
  constructor(private readonly models: OAuthModelRepository) {}

  async execute(params: NameOAuthConnectionParams) {
    await this.models.nameGrant(params.grantId, params.clientName)
  }
}
