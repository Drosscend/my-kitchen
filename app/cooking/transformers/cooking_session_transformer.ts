import { BaseTransformer } from '@adonisjs/core/transformers'
import type { CookingSession } from '#cooking/domain/cooking_session'

/**
 * What both the page and the polling endpoint hand to the browser. The
 * server clock travels with it so a device can measure its own drift.
 */
export default class CookingSessionTransformer extends BaseTransformer<CookingSession> {
  toObject() {
    return {
      code: this.resource.code,
      recipe: this.resource.recipe,
      scale: this.resource.scale,
      state: { ...this.resource.state, updatedAt: this.resource.updatedAt.getTime() },
      serverNow: Date.now(),
    }
  }
}
