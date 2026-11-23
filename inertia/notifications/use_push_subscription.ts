import { useEffect, useState } from 'react'

/**
 * - `install_app`: iPhone and iPad only offer push to the app installed
 *   on the home screen, not to Safari.
 * - `blocked`: the user refused notifications for the site.
 */
type PushSupport = 'checking' | 'unsupported' | 'install_app' | 'blocked' | 'available'

function initialSupport(): PushSupport {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    return 'checking'
  }

  const appleMobile =
    /iPhone|iPad|iPod/.test(navigator.userAgent) ||
    (navigator.userAgent.includes('Mac') && navigator.maxTouchPoints > 1)
  return appleMobile ? 'install_app' : 'unsupported'
}

function permissionSupport(): PushSupport {
  return Notification.permission === 'denied' ? 'blocked' : 'available'
}

/**
 * The push subscription of this browser, read from its service worker.
 */
export function usePushSubscription() {
  const [support, setSupport] = useState(initialSupport)
  const [endpoint, setEndpoint] = useState<string | null>(null)

  useEffect(() => {
    if (support !== 'checking') {
      return
    }

    void navigator.serviceWorker.ready
      .then((registration) => registration.pushManager.getSubscription())
      .then((subscription) => {
        setEndpoint(subscription?.endpoint ?? null)
        setSupport(permissionSupport())
      })
  }, [support])

  async function subscribe(vapidPublicKey: string) {
    await Notification.requestPermission()
    setSupport(permissionSupport())

    if (Notification.permission !== 'granted') {
      return null
    }

    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: vapidPublicKey,
    })
    const { keys } = subscription.toJSON()
    setEndpoint(subscription.endpoint)
    return {
      endpoint: subscription.endpoint,
      keys: { p256dh: keys?.p256dh ?? '', auth: keys?.auth ?? '' },
    }
  }

  async function unsubscribe() {
    const registration = await navigator.serviceWorker.ready
    await (await registration.pushManager.getSubscription())?.unsubscribe()
    setEndpoint(null)
  }

  return { support, endpoint, subscribe, unsubscribe }
}
