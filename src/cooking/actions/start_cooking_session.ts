import { inject } from '@adonisjs/core'
import { COOKING_SESSION_TTL_MS, INITIAL_STATE } from '#cooking/domain/cooking_session'
import { CookingSessionRepository } from '#cooking/repositories/cooking_session_repository'
import { err, ok, type Result } from '#core/result'
import { RecipeQuery } from '#recipes/queries/recipe_query'
import type { UserIdentifier } from '#identity/domain/user_identifier'
import type { RecipeNotFoundError } from '#recipes/domain/recipe'

export interface StartCookingSessionParams {
  userId: UserIdentifier
  recipeId: string
}

export interface CodeExhaustedError {
  type: 'code_exhausted'
}
export type StartCookingSessionResult = Result<string, RecipeNotFoundError | CodeExhaustedError>

/**
 * Freezes the recipe under a fresh six digit code. Expired sessions are
 * swept on the way, the table never needs a separate cleanup.
 */
@inject()
export class StartCookingSession {
  constructor(
    private readonly recipes: RecipeQuery,
    private readonly sessions: CookingSessionRepository
  ) {}

  async execute(params: StartCookingSessionParams): Promise<StartCookingSessionResult> {
    const recipe = await this.recipes.execute(params.userId, params.recipeId)

    if (!recipe) {
      return err({ type: 'recipe_not_found' })
    }

    const now = new Date()
    await this.sessions.deleteExpired(now)

    const code = await this.sessions.create({
      userId: params.userId,
      recipe,
      state: INITIAL_STATE,
      expiresAt: new Date(now.getTime() + COOKING_SESSION_TTL_MS),
    })

    return code ? ok(code) : err({ type: 'code_exhausted' })
  }
}
