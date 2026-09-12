import { useEffect, useEffectEvent, useRef, type TouchEvent } from 'react'

interface CookingNavigationOptions {
  onPrev: () => void
  onNext: () => void
  onExit: () => void
  canGoPrev: boolean
  canGoNext: boolean
}

const SWIPE_THRESHOLD = 50

/**
 * Arrow keys and horizontal swipes move between steps, Escape leaves.
 */
export function useCookingNavigation({
  onPrev,
  onNext,
  onExit,
  canGoPrev,
  canGoNext,
}: CookingNavigationOptions) {
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const onKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      onPrev()
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      onNext()
    } else if (event.key === 'Escape') {
      event.preventDefault()
      onExit()
    }
  })

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  function handleTouchStart(event: TouchEvent) {
    touchStart.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }
  }

  function handleTouchEnd(event: TouchEvent) {
    if (!touchStart.current) {
      return
    }

    const dx = event.changedTouches[0].clientX - touchStart.current.x
    const dy = event.changedTouches[0].clientY - touchStart.current.y
    touchStart.current = null

    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dy) > Math.abs(dx)) {
      return
    }

    if (dx < 0 && canGoNext) {
      onNext()
    } else if (dx > 0 && canGoPrev) {
      onPrev()
    }
  }

  return { handleTouchStart, handleTouchEnd }
}
