import { BaseTransformer } from '@adonisjs/core/transformers'
import { sessionPayload } from '#app/cooking/session_payload'
import type { CookingSession } from '#cooking/domain/cooking_session'

export default class CookingSessionTransformer extends BaseTransformer<CookingSession> {
  toObject() {
    return sessionPayload(this.resource)
  }
}
