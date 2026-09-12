import { client } from '~/client'
import { CopyButton } from '~/components/copy_button'

async function fetchMarkdown() {
  const response = await fetch(client.urlFor('inventory.markdown'), {
    headers: { accept: 'text/markdown' },
  })

  if (!response.ok) {
    throw new Error(`Inventory export failed with status ${response.status}`)
  }

  return response.text()
}

export function CopyPantryButton({ disabled }: { disabled: boolean }) {
  return (
    <CopyButton text={fetchMarkdown} label="Copier pour une IA" size="lg" disabled={disabled} />
  )
}
