import { inject } from '@adonisjs/core'
import mail from '@adonisjs/mail/services/main'
import ConnectedApplicationMail from '#identity/mails/connected_application_mail'
import { OAuthModelRepository } from '#identity/repositories/oauth_model_repository'
import type { User } from '#identity/domain/user'

export interface RecordOAuthConnectionParams {
  user: User
  grantId: string
  clientName: string
}

/**
 * Keeps the name the assistant gave at authorization time: a client
 * identified by a metadata document is not stored, so the account page
 * could not name it later.
 */
@inject()
export class RecordOAuthConnection {
  constructor(private readonly models: OAuthModelRepository) {}

  async execute(params: RecordOAuthConnectionParams) {
    await this.models.nameGrant(params.grantId, params.clientName)
    await mail.sendLater(
      new ConnectedApplicationMail(params.user.email, params.clientName, new Date())
    )
  }
}
