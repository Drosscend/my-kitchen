import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { toast } from 'sonner'
import { client } from '~/client'
import { computeTimers, hasRunningTimer, resetTimer, startTimer, stopTimer } from '~/cooking/timers'
import { type CookingSessionPayload } from '~/cooking/types'

type DemoState = Pick<CookingSessionPayload['state'], 'currentStepIndex' | 'activeTimers'> & {
  changedAt: number
}

type DemoMessage =
  | { type: 'hello' }
  | { type: 'state'; state: DemoState }
  | { type: 'shared'; code: string }

/**
 * The cooking session API without a server: every frame of the demo on a
 * page shares its state through a BroadcastChannel, the way devices share
 * a real session through the polling endpoint. Sharing turns it into a
 * real session: `onShared` hears its code in every frame.
 */
export function useCookingDemo(
  stepCount: number,
  firstStepIndex: number,
  onShared: (code: string, sharer: boolean) => void
) {
  const [state, setState] = useState<DemoState>({
    currentStepIndex: firstStepIndex,
    activeTimers: {},
    changedAt: 0,
  })
  const [now, setNow] = useState(Date.now)
  const latest = useRef(state)
  const channel = useRef<BroadcastChannel | null>(null)

  const receive = useEffectEvent((message: DemoMessage) => {
    if (message.type === 'shared') {
      onShared(message.code, false)
    } else if (message.type === 'hello') {
      if (latest.current.changedAt > 0) {
        channel.current?.postMessage({ type: 'state', state: latest.current })
      }
    } else if (message.state.changedAt > latest.current.changedAt) {
      latest.current = message.state
      setState(message.state)
      setNow(Date.now())
    }
  })

  useEffect(() => {
    const demo = new BroadcastChannel('cooking-demo')
    channel.current = demo
    demo.onmessage = (event: MessageEvent<DemoMessage>) => receive(event.data)
    demo.postMessage({ type: 'hello' })

    return () => demo.close()
  }, [])

  useEffect(() => {
    if (!hasRunningTimer(state.activeTimers)) {
      return
    }

    const interval = setInterval(() => setNow(Date.now()), 1000)

    return () => clearInterval(interval)
  }, [state.activeTimers])

  function update(change: Partial<Omit<DemoState, 'changedAt'>>) {
    const next = { ...latest.current, ...change, changedAt: Date.now() }
    latest.current = next
    setState(next)
    setNow(next.changedAt)
    channel.current?.postMessage({ type: 'state', state: next })
  }

  async function share() {
    const { currentStepIndex, activeTimers } = latest.current
    const response = await fetch(client.urlFor('cooking.demo.store'), {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'accept': 'application/json' },
      body: JSON.stringify({ currentStepIndex, activeTimers }),
    })

    if (!response.ok) {
      toast.error('Impossible de partager la démo, réessaie plus tard')
      return
    }

    const { code }: { code: string } = await response.json()
    channel.current?.postMessage({ type: 'shared', code })
    onShared(code, true)
  }

  function goToStep(index: number) {
    update({ currentStepIndex: Math.max(-1, Math.min(stepCount - 1, index)) })
  }

  return {
    currentStepIndex: state.currentStepIndex,
    activeTimers: computeTimers(state.activeTimers, now),
    prevStep: () => goToStep(state.currentStepIndex - 1),
    nextStep: () => goToStep(state.currentStepIndex + 1),
    goToStep,
    startTimer: (id: string, duration: number) =>
      update({ activeTimers: startTimer(latest.current.activeTimers, id, duration, Date.now()) }),
    stopTimer: (id: string) =>
      update({ activeTimers: stopTimer(latest.current.activeTimers, id, Date.now()) }),
    resetTimer: (id: string) =>
      update({ activeTimers: resetTimer(latest.current.activeTimers, id) }),
    restart: () => update({ currentStepIndex: -1, activeTimers: {} }),
    share,
  }
}
