import { client } from '~/client'
import { CopyButton } from '~/components/copy_button'

async function fetchMarkdown() {
  const response = await fetch(client.urlFor('inventory.markdown'), {
    headers: { accept: 'text/markdown' },
  })

  return response.text()
}

/**
 * The pantry as Markdown, ready to paste in a chat with an assistant.
 */
export function CopyPantryButton({ disabled }: { disabled: boolean }) {
  return (
    <CopyButton text={fetchMarkdown} label="Copier pour une IA" size="lg" disabled={disabled} />
  )
}
