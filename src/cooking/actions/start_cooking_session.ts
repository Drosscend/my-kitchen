import { inject } from '@adonisjs/core'
import {
  COOKING_SESSION_TTL_MS,
  generateSessionCode,
  INITIAL_STATE,
} from '#cooking/domain/cooking_session'
import { CookingSessionRepository } from '#cooking/repositories/cooking_session_repository'
import { err, ok, type Result } from '#core/result'
import { RecipeQuery } from '#recipes/queries/recipe_query'
import type { UserIdentifier } from '#identity/domain/user_identifier'
import type { RecipeNotFoundError } from '#recipes/actions/delete_recipe'

export interface StartCookingSessionParams {
  userId: UserIdentifier
  recipeId: string
  scale: number
}

export interface CodeExhaustedError {
  type: 'code_exhausted'
}
export type StartCookingSessionResult = Result<string, RecipeNotFoundError | CodeExhaustedError>

const CODE_ATTEMPTS = 10

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

    for (let attempt = 0; attempt < CODE_ATTEMPTS; attempt++) {
      const code = generateSessionCode()
      const created = await this.sessions.create({
        code,
        userId: params.userId,
        recipe,
        scale: params.scale,
        state: INITIAL_STATE,
        expiresAt: new Date(now.getTime() + COOKING_SESSION_TTL_MS),
      })

      if (created) {
        return ok(code)
      }
    }

    return err({ type: 'code_exhausted' })
  }
}
