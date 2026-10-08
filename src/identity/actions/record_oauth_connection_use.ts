import { inject } from '@adonisjs/core'
import { OAuthModelRepository } from '#identity/repositories/oauth_model_repository'

export interface RecordOAuthConnectionUseParams {
  grantId: string
}

/**
 * Dates the last call of a connected assistant, shown on the account page.
 */
@inject()
export class RecordOAuthConnectionUse {
  constructor(private readonly models: OAuthModelRepository) {}

  async execute(params: RecordOAuthConnectionUseParams) {
    await this.models.touchGrant(params.grantId, new Date())
  }
}
