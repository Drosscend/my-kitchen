import { randomInt } from 'node:crypto'
import type { RecipeView } from '#recipes/queries/recipe_query'

export const COOKING_SESSION_TTL_MS = 6 * 60 * 60 * 1000
export const SESSION_CODE_PATTERN = /^\d{6}$/

/**
 * A running timer only stores when it started, in server time: every
 * device derives the remaining time from the same clock. A paused timer
 * stores what is left instead.
 */
export interface SyncedTimer {
  total: number
  startedAt: number
  pausedRemaining?: number
}

export interface CookingSessionState {
  currentStepIndex: number
  completedSteps: string[]
  activeTimers: Record<string, SyncedTimer>
  closed: boolean
}

export type CookingSessionUpdate = Partial<CookingSessionState>

export interface CookingSession {
  code: string
  recipe: RecipeView
  scale: number
  state: CookingSessionState
  updatedAt: Date
}

export const INITIAL_STATE: CookingSessionState = {
  currentStepIndex: -1,
  completedSteps: [],
  activeTimers: {},
  closed: false,
}

/**
 * Steps live between the ingredient screen (-1) and the last step, a
 * closed session stays closed.
 */
export function applyUpdate(
  state: CookingSessionState,
  update: CookingSessionUpdate,
  stepCount: number
): CookingSessionState {
  const next = { ...state, ...update }

  return {
    ...next,
    currentStepIndex: Math.max(-1, Math.min(stepCount - 1, next.currentStepIndex)),
    closed: state.closed || next.closed,
  }
}

export function generateSessionCode() {
  return randomInt(0, 1_000_000).toString().padStart(6, '0')
}
