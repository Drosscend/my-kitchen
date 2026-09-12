import { CheckIcon, CopyIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { client } from '~/client'
import { Button } from '~/components/ui/button'

/**
 * Fetches the Markdown export and puts it in the clipboard, for a chat
 * with an assistant.
 */
export function CopyButton({ disabled }: { disabled: boolean }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      const response = await fetch(client.urlFor('inventory.markdown'), {
        headers: { accept: 'text/markdown' },
      })
      await navigator.clipboard.writeText(await response.text())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Impossible de copier le garde-manger')
    }
  }

  return (
    <Button
      variant="outline"
      onClick={copy}
      disabled={disabled}
      className="w-full justify-start gap-2"
    >
      {copied ? <CheckIcon className="size-4 text-accent" /> : <CopyIcon className="size-4" />}
      {copied ? 'Copié !' : 'Copier pour une IA'}
    </Button>
  )
}
