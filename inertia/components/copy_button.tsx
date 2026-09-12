import { CheckIcon, CopyIcon } from 'lucide-react'
import { type ComponentProps, type ReactNode, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '~/components/ui/button'

interface CopyButtonProps extends Omit<ComponentProps<typeof Button>, 'onClick' | 'children'> {
  text: () => string | Promise<string>
  label: string
  iconOnly?: boolean
  children?: ReactNode
}

const COPIED_LABEL = 'Copié !'

export function CopyButton({
  text,
  label,
  iconOnly = false,
  children,
  variant = 'outline',
  ...props
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false)
  const iconSlot = iconOnly ? undefined : 'inline-start'

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
    <Button variant={variant} onClick={copy} aria-label={copied ? COPIED_LABEL : label} {...props}>
      {copied ? (
        <CheckIcon data-icon={iconSlot} className="text-accent" />
      ) : (
        <CopyIcon data-icon={iconSlot} />
      )}
      {!iconOnly && (children ?? (copied ? COPIED_LABEL : label))}
    </Button>
  )
}
