import type { CookingSession } from '#cooking/domain/cooking_session'

/**
 * What both the page and the polling endpoint hand to the browser. The
 * server clock travels with it so a device can measure its own drift.
 */
export function sessionPayload(session: CookingSession) {
  return {
    code: session.code,
    recipe: session.recipe,
    scale: session.scale,
    state: { ...session.state, updatedAt: session.updatedAt.getTime() },
    serverNow: Date.now(),
  }
}

export type CookingSessionPayload = ReturnType<typeof sessionPayload>
