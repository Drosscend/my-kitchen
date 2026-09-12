import { inject } from '@adonisjs/core'
import {
  applyUpdate,
  COOKING_SESSION_TTL_MS,
  type CookingSession,
  type CookingSessionUpdate,
} from '#cooking/domain/cooking_session'
import { CookingSessionRepository } from '#cooking/repositories/cooking_session_repository'
import { err, ok, type Result } from '#core/result'
import { TransactionManager } from '#shared/services/transaction_manager'

export interface UpdateCookingSessionParams {
  code: string
  update: CookingSessionUpdate
}

export interface SessionNotFoundError {
  type: 'session_not_found'
}
export type UpdateCookingSessionResult = Result<CookingSession, SessionNotFoundError>

/**
 * The server stamps every change: two devices have no clock in common,
 * only this one decides which state is the latest. Each change also
 * pushes the expiry back.
 */
@inject()
export class UpdateCookingSession {
  constructor(
    private readonly sessions: CookingSessionRepository,
    private readonly transactions: TransactionManager
  ) {}

  async execute(params: UpdateCookingSessionParams): Promise<UpdateCookingSessionResult> {
    return this.transactions.run(async () => {
      const now = new Date()
      const session = await this.sessions.findLive(params.code, now)

      if (!session) {
        return err({ type: 'session_not_found' })
      }

      const state = applyUpdate(session.state, params.update, session.recipe.steps.length)
      await this.sessions.update(
        params.code,
        state,
        now,
        new Date(now.getTime() + COOKING_SESSION_TTL_MS)
      )

      return ok({ ...session, state, updatedAt: now })
    })
  }
}
