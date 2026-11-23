import { ExternalLinkIcon } from 'lucide-react'
import { type ReactNode, useState } from 'react'
import { CopyButton } from '~/components/copy_button'
import { Button } from '~/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '~/components/ui/toggle-group'

function Label({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-md bg-card px-1.5 py-0.5 font-semibold whitespace-nowrap shadow-[inset_0_0_0_1px_var(--color-border),0_1px_0_var(--color-border)]">
      {children}
    </span>
  )
}

function Steps({ children }: { children: ReactNode }) {
  return (
    <ol className="grid gap-4 [counter-reset:step] *:relative *:pl-11 *:leading-relaxed *:[counter-increment:step] *:before:absolute *:before:top-0 *:before:left-0 *:before:grid *:before:size-8 *:before:place-items-center *:before:rounded-full *:before:border-2 *:before:border-primary *:before:text-sm *:before:font-extrabold *:before:text-primary *:before:content-[counter(step)]">
      {children}
    </ol>
  )
}

/**
 * How to add the MCP server to an assistant, with the labels each app
 * shows today. Embedded in a card, it stacks and drops its own paper.
 */
export function ConnectorGuide({ mcpUrl, embedded }: { mcpUrl: string; embedded?: boolean }) {
  const [assistant, setAssistant] = useState<'claude' | 'chatgpt'>('claude')
  const claudeLink = `https://claude.ai/customize/connectors?${new URLSearchParams({
    modal: 'add-custom-connector',
    connectorName: 'Mon Garde-Manger',
    connectorUrl: mcpUrl,
  })}`

  return (
    <div
      data-embedded={embedded}
      className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-14 data-embedded:gap-6 data-embedded:lg:grid-cols-1"
    >
      <div className="flex flex-col gap-5">
        <ToggleGroup
          variant="outline"
          aria-label="Assistant"
          value={[assistant]}
          onValueChange={(pressed) => {
            if (pressed[0] === 'claude' || pressed[0] === 'chatgpt') {
              setAssistant(pressed[0])
            }
          }}
        >
          <ToggleGroupItem
            value="claude"
            className="bg-card px-5 font-semibold aria-pressed:border-foreground aria-pressed:bg-foreground aria-pressed:text-background"
          >
            Claude
          </ToggleGroupItem>
          <ToggleGroupItem
            value="chatgpt"
            className="bg-card px-5 font-semibold aria-pressed:border-foreground aria-pressed:bg-foreground aria-pressed:text-background"
          >
            ChatGPT
          </ToggleGroupItem>
        </ToggleGroup>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Adresse du serveur</p>
          <div className="flex items-center gap-2">
            <code className="min-w-0 flex-1 truncate rounded-md bg-card px-3 py-2.5 font-mono text-sm shadow-[inset_0_0_0_1px_var(--color-input)]">
              {mcpUrl}
            </code>
            <CopyButton text={() => mcpUrl} label="Copier l'adresse" size="lg" className="bg-card">
              Copier
            </CopyButton>
          </div>
        </div>

        {assistant === 'claude' ? (
          <Button
            size="lg"
            className="h-12 w-fit px-5 text-base"
            nativeButton={false}
            render={<a href={claudeLink} target="_blank" rel="noreferrer" />}
          >
            Ajouter à Claude <ExternalLinkIcon data-icon="inline-end" />
          </Button>
        ) : (
          <Button
            size="lg"
            className="h-12 w-fit px-5 text-base"
            nativeButton={false}
            render={<a href="https://chatgpt.com/plugins" target="_blank" rel="noreferrer" />}
          >
            Ouvrir les plugins ChatGPT <ExternalLinkIcon data-icon="inline-end" />
          </Button>
        )}
      </div>

      <div
        data-embedded={embedded}
        className="rounded-2xl bg-card p-6 paper-stack sm:p-8 data-embedded:rounded-none data-embedded:border-t data-embedded:px-0 data-embedded:pt-6 data-embedded:pb-0 data-embedded:shadow-none"
      >
        {assistant === 'claude' ? (
          <>
            <Steps>
              <li>
                « Ajouter à Claude » ouvre <Label>Add custom connector</Label> dans les{' '}
                <Label>Plugins</Label> de Claude, avec le nom et l'adresse déjà remplis.
              </li>
              <li>
                Vérifie-les et clique sur <Label>Continue</Label>.
              </li>
              <li>
                Garde les options proposées et valide avec <Label>Continue</Label>.
              </li>
              <li>
                Clique sur <Label>Connect</Label> : Mon Garde-Manger s'ouvre. Connecte-toi et
                choisis <Label>Autoriser</Label>.
              </li>
              <li>
                Dans une conversation, active Mon Garde-Manger depuis le menu <Label>+</Label>, et
                pose ta question.
              </li>
            </Steps>
            <p className="mt-6 border-t pt-4 text-sm text-muted-foreground">
              L'offre gratuite de Claude accepte un connecteur personnalisé.
            </p>
          </>
        ) : (
          <>
            <Steps>
              <li>
                Sur la page des plugins, clique sur <Label>+</Label> puis{' '}
                <Label>Add custom MCP server</Label>.
              </li>
              <li>
                Nomme-le « Mon Garde-Manger » et colle l'adresse dans <Label>Server URL</Label>,
                sous <Label>Connection</Label>.
              </li>
              <li>
                Choisis <Label>OAuth</Label>, coche <Label>I understand and want to continue</Label>{' '}
                puis <Label>Create as a plugin</Label>.
              </li>
              <li>
                Installe le plugin et autorise l'accès sur la page de Mon Garde-Manger qui s'ouvre.
              </li>
              <li>
                Dans une nouvelle conversation, tape <Label>@</Label> et choisis Mon Garde-Manger.
              </li>
            </Steps>
            <p className="mt-6 border-t pt-4 text-sm text-muted-foreground">
              Disponible sur ChatGPT web, selon ton offre.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
