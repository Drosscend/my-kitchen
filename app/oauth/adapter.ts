import app from '@adonisjs/core/services/app'
import { OAuthModelRepository } from '#identity/repositories/oauth_model_repository'
import type { Adapter, AdapterPayload } from 'oidc-provider'

async function repository() {
  return app.container.make(OAuthModelRepository)
}

/**
 * Bridges the storage contract of oidc-provider to the Postgres
 * repository. The provider builds one instance per model kind.
 */
export class OAuthAdapter implements Adapter {
  constructor(private readonly kind: string) {}

  async upsert(id: string, payload: AdapterPayload, expiresIn: number) {
    await (await repository()).upsert(this.kind, id, payload, expiresIn)
  }

  async find(id: string) {
    return (await repository()).find(this.kind, id)
  }

  async findByUid(uid: string) {
    return (await repository()).findByUid(this.kind, uid)
  }

  /**
   * The device flow, the only user of user codes, is disabled.
   */
  async findByUserCode() {
    return undefined
  }

  async consume(id: string) {
    await (await repository()).consume(this.kind, id)
  }

  async destroy(id: string) {
    await (await repository()).destroy(this.kind, id)
  }

  async revokeByGrantId(grantId: string) {
    await (await repository()).revokeByGrantId(grantId)
  }
}
