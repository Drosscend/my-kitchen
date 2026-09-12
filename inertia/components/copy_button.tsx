import { CheckIcon, CopyIcon } from 'lucide-react'
import { type ComponentProps, type ReactNode, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '~/components/ui/button'

interface CopyButtonProps extends Omit<ComponentProps<typeof Button>, 'onClick' | 'children'> {
  text: () => string | Promise<string>
  label: string
  copiedLabel?: string
  children?: ReactNode
}

/**
 * Puts a text in the clipboard and confirms it on the button itself for
 * two seconds. Pass children to show something else than the label.
 */
export function CopyButton({
  text,
  label,
  copiedLabel = 'Copié !',
  children,
  variant = 'outline',
  ...props
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(await text())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Impossible de copier')
    }
  }

  return (
    <Button variant={variant} onClick={copy} aria-label={copied ? copiedLabel : label} {...props}>
      {copied ? (
        <CheckIcon data-icon="inline-start" className="text-accent" />
      ) : (
        <CopyIcon data-icon="inline-start" />
      )}
      {children ?? (copied ? copiedLabel : label)}
    </Button>
  )
}
