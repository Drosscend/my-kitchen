import { BaseTransformer } from '@adonisjs/core/transformers'
import type { OAuthConnectionView } from '#identity/queries/oauth_connections_query'

export default class OAuthConnectionTransformer extends BaseTransformer<OAuthConnectionView> {
  toObject() {
    return this.pick(this.resource, ['id', 'clientName', 'createdAt', 'lastUsedAt'])
  }
}
