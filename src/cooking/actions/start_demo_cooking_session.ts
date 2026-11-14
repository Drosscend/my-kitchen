import { inject } from '@adonisjs/core'
import {
  applyUpdate,
  type CookingSessionUpdate,
  COOKING_SESSION_TTL_MS,
  INITIAL_STATE,
} from '#cooking/domain/cooking_session'
import { DEMO_RECIPE } from '#cooking/domain/demo_recipe'
import { CookingSessionRepository } from '#cooking/repositories/cooking_session_repository'
import { err, ok, type Result } from '#core/result'
import type { CodeExhaustedError } from '#cooking/actions/start_cooking_session'

export interface StartDemoCookingSessionParams {
  state: Pick<CookingSessionUpdate, 'currentStepIndex' | 'activeTimers'>
}

/**
 * Turns the demo a visitor is playing with into a real session, at the
 * step and with the timers it had, so a phone can join it by its code.
 */
@inject()
export class StartDemoCookingSession {
  constructor(private readonly sessions: CookingSessionRepository) {}

  async execute(
    params: StartDemoCookingSessionParams
  ): Promise<Result<string, CodeExhaustedError>> {
    const now = new Date()
    await this.sessions.deleteExpired(now)

    const code = await this.sessions.create({
      userId: null,
      recipe: DEMO_RECIPE,
      state: applyUpdate(INITIAL_STATE, params.state, DEMO_RECIPE.steps),
      expiresAt: new Date(now.getTime() + COOKING_SESSION_TTL_MS),
    })

    return code ? ok(code) : err({ type: 'code_exhausted' })
  }
}
