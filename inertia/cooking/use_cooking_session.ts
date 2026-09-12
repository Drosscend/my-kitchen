import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { toast } from 'sonner'
import { client } from '~/client'
import {
  acquireWakeLock,
  ensureAudioContext,
  playTimerSound,
  releaseWakeLock,
} from '~/cooking/device'
import {
  type ActiveTimers,
  type CookingSessionPayload,
  type CookingSessionUpdate,
  type SyncedTimer,
} from '~/cooking/types'

const POLL_INTERVAL_MS = 500

function computeTimers(synced: Record<string, SyncedTimer>, now: number): ActiveTimers {
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
 * Every date of a session (updatedAt, a timer's startedAt) is in server
 * time: devices sharing a session have no other common clock, and a
 * phone easily drifts by several seconds. The server clock travels with
 * every response, the offset is refreshed each time.
 */
export function useCookingSession(initial: CookingSessionPayload) {
  const [session, setSession] = useState(initial)
  const clockOffset = useRef(0)
  const [activeTimers, setActiveTimers] = useState(() =>
    computeTimers(initial.state.activeTimers, initial.serverNow)
  )
  const latest = useRef(session)
  const lastUpdate = useRef(initial.state.updatedAt)
  const polling = useRef(false)
  // In-flight PATCH count. A poll answer that left before them describes
  // an earlier state, and applying it would undo the change just made.
  const pending = useRef(0)

  useEffect(() => {
    latest.current = session
  }, [session])

  useEffect(() => {
    clockOffset.current = initial.serverNow - Date.now()
  }, [initial.serverNow])

  const stateUrl = client.urlFor('cooking.state', { code: initial.code })

  function serverNow() {
    return Date.now() + clockOffset.current
  }

  const applyRemote = useEffectEvent((payload: CookingSessionPayload) => {
    clockOffset.current = payload.serverNow - Date.now()
    setSession(payload)
    lastUpdate.current = payload.state.updatedAt
    setActiveTimers(computeTimers(payload.state.activeTimers, Date.now() + clockOffset.current))
  })

  useEffect(() => {
    const interval = setInterval(async () => {
      if (polling.current || pending.current > 0) {
        return
      }

      polling.current = true

      try {
        const response = await fetch(stateUrl, { headers: { accept: 'application/json' } })

        if (!response.ok) {
          return
        }

        const payload: CookingSessionPayload = await response.json()

        if (pending.current === 0 && payload.state.updatedAt > lastUpdate.current) {
          applyRemote(payload)
        }
      } catch {
        // A missed poll is caught up by the next one.
      } finally {
        polling.current = false
      }
    }, POLL_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [stateUrl])

  const syncedTimers = session.state.activeTimers

  useEffect(() => {
    const running = Object.values(syncedTimers).some((timer) => timer.pausedRemaining === undefined)

    if (!running) {
      return
    }

    const interval = setInterval(() => {
      setActiveTimers(computeTimers(latest.current.state.activeTimers, serverNow()))
    }, 1000)

    return () => clearInterval(interval)
  }, [syncedTimers])

  useEffect(() => {
    const now = serverNow()
    const timeouts = Object.values(syncedTimers)
      .filter((timer) => timer.pausedRemaining === undefined)
      .map((timer) => timer.startedAt + timer.total * 1000 - now)
      .filter((delay) => delay > 0)
      .map((delay) => setTimeout(playTimerSound, delay))

    if (timeouts.length === 0) {
      return
    }

    void acquireWakeLock()

    function onVisibility() {
      if (document.visibilityState === 'visible') {
        void acquireWakeLock()
      }
    }

    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      timeouts.forEach(clearTimeout)
      document.removeEventListener('visibilitychange', onVisibility)
      releaseWakeLock()
    }
  }, [syncedTimers])

  function update(change: CookingSessionUpdate) {
    const current = latest.current
    const optimistic = { ...current, state: { ...current.state, ...change } }
    setSession(optimistic)
    latest.current = optimistic

    if (change.activeTimers) {
      setActiveTimers(computeTimers(change.activeTimers, serverNow()))
    }

    pending.current += 1
    fetch(stateUrl, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json', 'accept': 'application/json' },
      body: JSON.stringify(change),
    })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error())))
      .then((payload: CookingSessionPayload) => {
        clockOffset.current = payload.serverNow - Date.now()
      })
      .catch(() => {
        toast.error('Erreur de synchronisation')
        // The local state was refused, the next poll reapplies the server one.
        lastUpdate.current = 0
      })
      .finally(() => {
        pending.current -= 1
      })
  }

  const stepCount = session.recipe.steps.length

  function goToStep(index: number) {
    ensureAudioContext()
    update({ currentStepIndex: Math.max(-1, Math.min(stepCount - 1, index)) })
  }

  function startTimer(id: string, duration: number) {
    ensureAudioContext()
    const existing = latest.current.state.activeTimers[id]
    update({
      activeTimers: {
        ...latest.current.state.activeTimers,
        [id]: { total: existing?.pausedRemaining ?? duration, startedAt: serverNow() },
      },
    })
  }

  function stopTimer(id: string) {
    const timer = latest.current.state.activeTimers[id]

    if (!timer) {
      return
    }

    const remaining = Math.max(0, timer.total - Math.floor((serverNow() - timer.startedAt) / 1000))
    update({
      activeTimers: {
        ...latest.current.state.activeTimers,
        [id]: { ...timer, pausedRemaining: remaining },
      },
    })
  }

  function resetTimer(id: string) {
    const { [id]: _removed, ...rest } = latest.current.state.activeTimers
    update({ activeTimers: rest })
  }

  return {
    recipe: session.recipe,
    scale: session.scale,
    closed: session.state.closed,
    currentStepIndex: session.state.currentStepIndex,
    activeTimers,
    prevStep: () => goToStep(session.state.currentStepIndex - 1),
    nextStep: () => goToStep(session.state.currentStepIndex + 1),
    goToStep,
    startTimer,
    stopTimer,
    resetTimer,
    close: () => update({ closed: true }),
  }
}
