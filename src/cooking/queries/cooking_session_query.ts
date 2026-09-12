import { inject } from '@adonisjs/core'
import { CookingSessionRepository } from '#cooking/repositories/cooking_session_repository'
import type { CookingSession } from '#cooking/domain/cooking_session'

@inject()
export class CookingSessionQuery {
  constructor(private readonly sessions: CookingSessionRepository) {}

  execute(code: string): Promise<CookingSession | null> {
    return this.sessions.findLive(code, new Date())
  }
}
