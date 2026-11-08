import { cn } from 'cn'
import { type ComponentProps } from 'react'
import { DialogContent } from '~/components/ui/dialog'

/**
 * A dialog that docks to the bottom of the screen on phones, within thumb reach,
 * without raising the keyboard when opened by touch.
 */
export function DialogSheet({ className, ...props }: ComponentProps<typeof DialogContent>) {
  return (
    <DialogContent
      initialFocus={(openType) => openType !== 'touch'}
      className={cn(
        'max-h-[90dvh] overflow-y-auto max-sm:top-auto max-sm:bottom-0 max-sm:max-w-full max-sm:translate-y-0 max-sm:rounded-b-none max-sm:pb-[calc(1.5rem+env(safe-area-inset-bottom))]',
        className
      )}
      {...props}
    />
  )
}
