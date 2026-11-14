import { SignalIcon, WifiIcon } from 'lucide-react'
import { useState } from 'react'
import { client } from '~/client'

/**
 * The demo page at its real size, scaled down to the frame: the cooking
 * mode lays itself out for a laptop or a phone screen, as it would on one.
 */
function Screen({ width, height, title }: { width: number; height: number; title: string }) {
  const [scale, setScale] = useState(0)

  function measure(element: HTMLDivElement | null) {
    if (!element) {
      return
    }

    const observer = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / width))
    observer.observe(element)

    return () => observer.disconnect()
  }

  return (
    <div
      ref={measure}
      className="relative w-full overflow-hidden bg-background"
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      {scale > 0 && (
        <iframe
          src={client.urlFor('cooking.demo')}
          title={title}
          loading="lazy"
          width={width}
          height={height}
          className="absolute top-0 left-0 origin-top-left border-0"
          style={{ transform: `scale(${scale})` }}
        />
      )}
    </div>
  )
}

/**
 * An Android phone: the page sits between the status bar and the gesture
 * bar, both in the app's theme colour, sized from the frame's width.
 */
function Phone({ title }: { title: string }) {
  return (
    <figure className="@container">
      <div className="rounded-[11cqw] bg-[#2b2520] p-[2.2cqw] shadow-[inset_0_0_0_2px_#4a4038,0_30px_50px_-24px_rgb(41_35_30/0.55)]">
        <div className="overflow-hidden rounded-[9cqw] bg-card">
          <div className="relative flex h-[10cqw] items-center justify-between px-[7cqw] text-[3.9cqw] font-medium text-foreground">
            <span className="tabular-nums">13:21</span>
            <span
              aria-hidden
              className="absolute top-1/2 left-1/2 size-[3.6cqw] -translate-1/2 rounded-full bg-[#1b1714]"
            />
            <span className="flex items-center gap-[1.4cqw]">
              <WifiIcon className="size-[4cqw]" strokeWidth={2.5} />
              <SignalIcon className="size-[4cqw]" strokeWidth={2.5} />
              <span className="rounded-full bg-foreground/80 px-[1.6cqw] text-[3cqw] leading-[1.5] font-semibold text-card tabular-nums">
                62
              </span>
            </span>
          </div>
          <Screen width={360} height={724} title={title} />
          <div className="grid h-[5.5cqw] place-items-center">
            <span className="h-[1cqw] w-[34cqw] rounded-full bg-foreground/35" />
          </div>
        </div>
      </div>
      <figcaption className="mt-3 text-center text-sm text-muted-foreground">{title}</figcaption>
    </figure>
  )
}

export function CookingDevices() {
  return (
    <div className="grid grid-cols-2 items-end gap-x-4 gap-y-8 sm:gap-x-8 lg:grid-cols-[minmax(0,1fr)_13rem_13rem]">
      <figure className="col-span-2 lg:col-span-1 lg:mr-8">
        <div className="rounded-t-2xl bg-[#2b2520] p-2.5 pb-3 shadow-[inset_0_0_0_2px_#4a4038] sm:p-3.5 sm:pb-4">
          <div className="overflow-hidden rounded-md">
            <Screen width={1280} height={800} title="Le PC de la cuisine" />
          </div>
        </div>
        <div className="mx-[-4%] h-3 rounded-b-xl bg-linear-180 from-[#cfc5b1] to-[#a89c86] shadow-[0_24px_30px_-18px_rgb(41_35_30/0.6)] sm:h-4" />
        <figcaption className="mt-3 text-center text-sm text-muted-foreground">
          Le PC de la cuisine
        </figcaption>
      </figure>
      <Phone title="Ton téléphone" />
      <Phone title="Le téléphone de Sam" />
    </div>
  )
}
