import { Form } from '@adonisjs/inertia/react'
import { FileUpIcon } from 'lucide-react'
import { useRef, useState } from 'react'
import { Button } from '~/components/ui/button'
import { Card, CardContent } from '~/components/ui/card'
import { Textarea } from '~/components/ui/textarea'

/**
 * A JSON file, or the text pasted straight from an assistant's answer.
 */
export function RecipeImport() {
  const fileInput = useRef<HTMLInputElement>(null)
  const [json, setJson] = useState('')

  return (
    <Card className="kraft-card">
      <CardContent className="pt-4">
        <Form route="recipes.import" onSuccess={() => setJson('')}>
          {({ submit, processing }) => (
            <>
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                className="flex w-full cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border px-4 py-6 transition-colors hover:border-accent hover:bg-accent/5"
              >
                <FileUpIcon className="size-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Charger un fichier JSON</span>
              </button>
              <input
                ref={fileInput}
                type="file"
                name="file"
                accept=".json"
                className="hidden"
                onChange={() => submit()}
              />

              <div className="my-4 flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">ou</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <Textarea
                name="json"
                value={json}
                onChange={(event) => setJson(event.target.value)}
                placeholder="Coller le JSON ici..."
                rows={6}
                className="font-mono text-xs"
                aria-label="Recette au format JSON"
              />

              <div className="mt-3">
                <Button type="submit" disabled={processing || !json.trim()}>
                  Importer
                </Button>
              </div>
            </>
          )}
        </Form>
      </CardContent>
    </Card>
  )
}
