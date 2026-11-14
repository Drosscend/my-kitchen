import { type ActiveTimers, type SyncedTimer } from '~/cooking/types'

type SyncedTimers = Record<string, SyncedTimer>

export function computeTimers(synced: SyncedTimers, now: number): ActiveTimers {
  const timers: ActiveTimers = {}

  for (const [id, timer] of Object.entries(synced)) {
    if (timer.pausedRemaining !== undefined) {
      timers[id] = { remaining: timer.pausedRemaining, total: timer.total, running: false }
    } else {
      const remaining = Math.max(0, timer.total - Math.floor((now - timer.startedAt) / 1000))
      timers[id] = { remaining, total: timer.total, running: remaining > 0 }
    }
  }

  return timers
}

/**
 * A paused timer starts again from what was left.
 */
export function startTimer(synced: SyncedTimers, id: string, duration: number, now: number) {
  return { ...synced, [id]: { total: synced[id]?.pausedRemaining ?? duration, startedAt: now } }
}

export function stopTimer(synced: SyncedTimers, id: string, now: number) {
  const timer = synced[id]

  if (!timer) {
    return synced
  }

  const remaining = Math.max(0, timer.total - Math.floor((now - timer.startedAt) / 1000))

  return { ...synced, [id]: { ...timer, pausedRemaining: remaining } }
}

export function resetTimer(synced: SyncedTimers, id: string): SyncedTimers {
  const { [id]: _removed, ...rest } = synced

  return rest
}

export function hasRunningTimer(synced: SyncedTimers) {
  return Object.values(synced).some((timer) => timer.pausedRemaining === undefined)
}
