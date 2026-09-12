import { type Data } from '@generated/data'

export type CookingSessionPayload = Data.Cooking.CookingSession
export type SyncedTimer = CookingSessionPayload['state']['activeTimers'][string]
export type CookingSessionUpdate = Partial<Omit<CookingSessionPayload['state'], 'updatedAt'>>

export interface TimerState {
  remaining: number
  total: number
  running: boolean
}

export type ActiveTimers = Record<string, TimerState>
