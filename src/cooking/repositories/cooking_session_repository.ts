import { inject } from '@adonisjs/core'
import { sql } from 'kysely'
import postgres from 'postgres'
import { TransactionManager } from '#shared/services/transaction_manager'
import type { CookingSession, CookingSessionState } from '#cooking/domain/cooking_session'
import type { UserIdentifier } from '#identity/domain/user_identifier'
import type { RecipeView } from '#recipes/queries/recipe_query'

interface CreateSessionPayload {
  code: string
  userId: UserIdentifier
  recipe: RecipeView
  scale: number
  state: CookingSessionState
  expiresAt: Date
}

interface UpdateSessionPayload {
  code: string
  state: CookingSessionState
  updatedAt: Date
  expiresAt: Date
}

@inject()
export class CookingSessionRepository {
  constructor(private readonly transactions: TransactionManager) {}

  /**
   * False when the code is already taken, so the caller draws another.
   * Objects go to postgres.js as they are: a pre-serialized string would
   * be stored as a JSON string, not as the document.
   */
  async create(payload: CreateSessionPayload) {
    try {
      await this.transactions
        .currentDatabase()
        .insertInto('cooking_sessions')
        .values({
          code: payload.code,
          user_id: payload.userId.toString(),
          recipe: sql`${payload.recipe}::jsonb`,
          scale: payload.scale,
          state: sql`${payload.state}::jsonb`,
          expires_at: payload.expiresAt,
        })
        .execute()

      return true
    } catch (error) {
      if (error instanceof postgres.PostgresError && error.code === '23505') {
        return false
      }
      throw error
    }
  }

  findLive(code: string, now: Date) {
    return this.#findLive(code, now, false)
  }

  /**
   * Locks the row until the caller's transaction ends, so two updates
   * of the same session are applied one after the other.
   */
  findLiveForUpdate(code: string, now: Date) {
    return this.#findLive(code, now, true)
  }

  async update(payload: UpdateSessionPayload) {
    await this.transactions
      .currentDatabase()
      .updateTable('cooking_sessions')
      .set({
        state: sql`${payload.state}::jsonb`,
        updated_at: payload.updatedAt,
        expires_at: payload.expiresAt,
      })
      .where('code', '=', payload.code)
      .execute()
  }

  async deleteExpired(now: Date) {
    await this.transactions
      .currentDatabase()
      .deleteFrom('cooking_sessions')
      .where('expires_at', '<=', now)
      .execute()
  }

  async #findLive(code: string, now: Date, lock: boolean): Promise<CookingSession | null> {
    const record = await this.transactions
      .currentDatabase()
      .selectFrom('cooking_sessions')
      .select((eb) => [
        'code',
        'scale',
        'updated_at',
        // Both columns are written by this repository from the typed values.
        eb.ref('recipe').$castTo<RecipeView>().as('recipe'),
        eb.ref('state').$castTo<CookingSessionState>().as('state'),
      ])
      .where('code', '=', code)
      .where('expires_at', '>', now)
      .$if(lock, (query) => query.forUpdate())
      .executeTakeFirst()

    if (!record) {
      return null
    }

    return {
      code: record.code,
      recipe: record.recipe,
      scale: record.scale,
      state: record.state,
      updatedAt: record.updated_at,
    }
  }
}
