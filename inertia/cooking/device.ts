let audioContext: AudioContext | null = null
let wakeLock: WakeLockSentinel | null = null

/**
 * Mobile browsers create the audio context suspended and only resume
 * it from a user gesture, so every button that may lead to a timer
 * ending calls this first.
 */
export function ensureAudioContext() {
  audioContext ??= new AudioContext()

  if (audioContext.state === 'suspended') {
    void audioContext.resume()
  }

  return audioContext
}

export function playTimerSound() {
  const context = ensureAudioContext()
  const now = context.currentTime

  for (let beep = 0; beep < 5; beep++) {
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.frequency.value = 880
    oscillator.type = 'sine'
    const start = now + beep * 0.35
    gain.gain.setValueAtTime(0.3, start)
    gain.gain.exponentialRampToValueAtTime(0.01, start + 0.25)
    oscillator.start(start)
    oscillator.stop(start + 0.25)
  }

  navigator.vibrate?.([200, 100, 200, 100, 200])
}

/**
 * Keeps the screen on for the whole cooking mode: hands are busy and a
 * sleeping phone throttles timeouts and blocks the vibration.
 */
export async function acquireWakeLock() {
  if (!('wakeLock' in navigator) || wakeLock) {
    return
  }

  try {
    wakeLock = await navigator.wakeLock.request('screen')
    wakeLock.addEventListener('release', () => {
      wakeLock = null
    })
  } catch {
    // The page is hidden or the browser refused: nothing to keep on.
  }
}

export function releaseWakeLock() {
  void wakeLock?.release()
  wakeLock = null
}
