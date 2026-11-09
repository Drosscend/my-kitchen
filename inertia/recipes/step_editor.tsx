import { mergeAttributes, Node, type JSONContent } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Mention from '@tiptap/extension-mention'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { Placeholder, UndoRedo } from '@tiptap/extensions'
import {
  EditorContent,
  NodeViewWrapper,
  ReactNodeViewRenderer,
  ReactRenderer,
  useEditor,
  type Editor,
  type NodeViewProps,
} from '@tiptap/react'
import { type SuggestionKeyDownProps, type SuggestionProps } from '@tiptap/suggestion'
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  HeadingIcon,
  PlusIcon,
  TimerIcon,
  Trash2Icon,
  XIcon,
} from 'lucide-react'
import { createContext, use, useImperativeHandle, useState, type Ref } from 'react'
import { Button } from '~/components/ui/button'
import { formatIngredient } from '~/recipes/format'
import { type RecipeIngredient, type RecipeStep } from '~/recipes/types'

/**
 * Mentions and the suggestion menu read the ingredients from here, so a
 * renamed or re-weighed ingredient shows up in every step at once.
 */
export const RecipeIngredientsContext = createContext<RecipeIngredient[]>([])

function IngredientMention({ node }: NodeViewProps) {
  const ingredient = use(RecipeIngredientsContext).find(
    (candidate) => candidate.ref === node.attrs.id
  )

  return (
    <NodeViewWrapper as="span" className="highlight px-0.5 font-semibold">
      {ingredient ? formatIngredient(ingredient) : node.attrs.id}
    </NodeViewWrapper>
  )
}

interface MentionMenuHandle {
  onKeyDown: (props: SuggestionKeyDownProps) => boolean
}

function matching(ingredients: RecipeIngredient[], query: string) {
  const needle = query.toLowerCase()
  return ingredients.filter((ingredient) => ingredient.name.toLowerCase().includes(needle))
}

function MentionMenu({
  query,
  command,
  ref,
}: SuggestionProps<RecipeIngredient, { id: string }> & { ref?: Ref<MentionMenuHandle> }) {
  const items = matching(use(RecipeIngredientsContext), query)
  const [selected, setSelected] = useState(0)
  const active = Math.min(selected, items.length - 1)

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (items.length > 0 && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
        const offset = event.key === 'ArrowDown' ? 1 : -1
        setSelected((active + offset + items.length) % items.length)
        return true
      }

      if (event.key === 'Enter' && items[active]) {
        command({ id: items[active].ref })
        return true
      }

      return false
    },
  }))

  if (items.length === 0) {
    return null
  }

  return (
    <ul
      role="listbox"
      aria-label="Ingrédients"
      className="z-50 flex max-h-64 min-w-48 flex-col overflow-y-auto rounded-lg border bg-popover p-1 text-sm shadow-md"
    >
      {items.map((ingredient, index) => (
        <li key={ingredient.ref} role="option" aria-selected={index === active}>
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => command({ id: ingredient.ref })}
            className="w-full cursor-pointer rounded-md px-2.5 py-1.5 text-left in-aria-selected:bg-accent"
          >
            {formatIngredient(ingredient)}
          </button>
        </li>
      ))}
    </ul>
  )
}

const StepTimer = Node.create({
  name: 'stepTimer',
  group: 'inline',
  inline: true,
  atom: true,
  parseHTML: () => [{ tag: 'span[data-step-timer]' }],
  renderHTML: ({ HTMLAttributes }) => [
    'span',
    mergeAttributes(HTMLAttributes, { 'data-step-timer': '' }),
    'minuteur',
  ],
  renderText: () => '{timer}',
})

const STEP_EXTENSIONS = [
  Document.extend({ content: 'paragraph' }),
  Paragraph,
  Text,
  UndoRedo,
  StepTimer,
  Placeholder.configure({ placeholder: 'Décris l’étape' }),
  Mention.extend({
    addNodeView: () => ReactNodeViewRenderer(IngredientMention),
  }).configure({
    renderText: ({ node }) => `{${node.attrs.id}}`,
    suggestion: {
      char: '@',
      items: () => [],
      render: () => {
        let menu: ReactRenderer<MentionMenuHandle> | null = null
        let unmount: (() => void) | null = null

        return {
          onStart: (props) => {
            menu = new ReactRenderer(MentionMenu, { props, editor: props.editor })
            unmount = props.mount(menu.element)
          },
          onUpdate: (props) => menu?.updateProps(props),
          onKeyDown: (props) => menu?.ref?.onKeyDown(props) ?? false,
          onExit: () => {
            unmount?.()
            menu?.destroy()
          },
        }
      },
    },
  }),
]

/**
 * Steps are stored as text where "{ref}" mentions an ingredient and
 * "{timer}" places the step's timer.
 */
function toDocument(content: string, ingredients: RecipeIngredient[]): JSONContent {
  const nodes: JSONContent[] = []
  let lastIndex = 0

  for (const match of content.matchAll(/\{([^}]+)\}/g)) {
    if (match.index > lastIndex) {
      nodes.push({ type: 'text', text: content.slice(lastIndex, match.index) })
    }

    const ref = match[1]

    if (ref === 'timer') {
      nodes.push({ type: 'stepTimer' })
    } else if (ingredients.some((ingredient) => ingredient.ref === ref)) {
      nodes.push({ type: 'mention', attrs: { id: ref } })
    } else {
      nodes.push({ type: 'text', text: match[0] })
    }

    lastIndex = match.index + match[0].length
  }

  if (lastIndex < content.length) {
    nodes.push({ type: 'text', text: content.slice(lastIndex) })
  }

  return { type: 'doc', content: [{ type: 'paragraph', content: nodes }] }
}

function insertMention(editor: Editor, ref: string) {
  const { from } = editor.state.selection
  const before = editor.state.doc.textBetween(Math.max(0, from - 1), from, ' ', ' ')

  editor
    .chain()
    .focus()
    .insertContent([
      ...(before && !/\s/.test(before) ? [{ type: 'text', text: ' ' }] : []),
      { type: 'mention', attrs: { id: ref } },
      { type: 'text', text: ' ' },
    ])
    .run()
}

interface StepEditorProps {
  step: RecipeStep
  index: number
  count: number
  autoFocus: boolean
  onChange: (changes: Partial<RecipeStep>) => void
  onMove: (offset: number) => void
  onRemove: () => void
}

export function StepEditor({
  step,
  index,
  count,
  autoFocus,
  onChange,
  onMove,
  onRemove,
}: StepEditorProps) {
  const ingredients = use(RecipeIngredientsContext)
  const [focused, setFocused] = useState(autoFocus)
  const editor = useEditor({
    extensions: STEP_EXTENSIONS,
    content: toDocument(step.content, ingredients),
    autofocus: autoFocus ? 'end' : false,
    editorProps: { attributes: { 'aria-label': `Étape ${index + 1}` } },
    onUpdate: ({ editor: current }) => onChange({ content: current.getText() }),
  })

  return (
    <li className="flex items-start gap-3 sm:gap-4">
      <span
        aria-hidden
        className="mt-1.5 flex size-10 shrink-0 -rotate-4 items-center justify-center rounded-[52%_46%_50%_48%/48%_52%_46%_50%] border-2 border-primary text-[19px] font-extrabold text-primary tabular-nums font-stretch-80%"
      >
        {index + 1}
      </span>
      <div
        data-focused={focused}
        onFocus={() => setFocused(true)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setFocused(false)
          }
        }}
        className="min-w-0 flex-1 rounded-xl border bg-card shadow-xs transition-shadow data-[focused=true]:border-primary/60 data-[focused=true]:ring-3 data-[focused=true]:ring-primary/15"
      >
        {step.title !== null && (
          <input
            aria-label={`Titre de l’étape ${index + 1}`}
            placeholder="Titre"
            maxLength={200}
            autoFocus={focused}
            value={step.title}
            onChange={(event) => onChange({ title: event.target.value })}
            className="w-full bg-transparent px-4 pt-3 font-semibold outline-none placeholder:text-muted-foreground"
          />
        )}
        <EditorContent
          editor={editor}
          className="px-4 py-3 text-base leading-relaxed sm:text-lg sm:leading-relaxed [&_.tiptap]:outline-none [&_[data-step-timer]]:rounded-full [&_[data-step-timer]]:bg-muted [&_[data-step-timer]]:px-2 [&_[data-step-timer]]:text-sm [&_[data-step-timer]]:font-semibold"
        />
        {step.timerSeconds !== null && (
          <div className="flex items-center gap-1.5 px-4 pb-3 text-sm font-semibold">
            <TimerIcon aria-hidden className="size-4 text-primary" />
            <input
              type="number"
              min={1}
              max={1440}
              inputMode="numeric"
              aria-label={`Minuteur de l’étape ${index + 1}, en minutes`}
              autoFocus={focused}
              defaultValue={Math.round(step.timerSeconds / 60)}
              onFocus={(event) => event.target.select()}
              onChange={(event) => {
                const minutes = Number(event.target.value)

                if (Number.isInteger(minutes) && minutes > 0) {
                  onChange({ timerSeconds: minutes * 60 })
                }
              }}
              className="w-14 rounded-md bg-muted px-2 py-0.5 text-center tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            />
            min
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label="Retirer le minuteur"
              onClick={() => onChange({ timerSeconds: null })}
            >
              <XIcon />
            </Button>
          </div>
        )}
        {focused && editor && (
          <div className="flex flex-col gap-2 border-t bg-muted/50 px-3 py-2.5">
            {ingredients.length > 0 && (
              <ul
                aria-label="Mentionner un ingrédient"
                className="-mx-3 flex gap-2 overflow-x-auto px-3 pb-0.5 sm:mx-0 sm:flex-wrap sm:px-0"
              >
                {ingredients.map((ingredient) => {
                  const used = step.content.includes(`{${ingredient.ref}}`)

                  return (
                    <li key={ingredient.ref} className="shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        data-used={used}
                        className="rounded-full data-[used=true]:border-mustard data-[used=true]:bg-mustard/30"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => insertMention(editor, ingredient.ref)}
                      >
                        {used ? (
                          <CheckIcon data-icon="inline-start" />
                        ) : (
                          <PlusIcon data-icon="inline-start" />
                        )}
                        {ingredient.name}
                      </Button>
                    </li>
                  )
                })}
              </ul>
            )}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                aria-pressed={step.timerSeconds !== null}
                onClick={() => onChange({ timerSeconds: step.timerSeconds === null ? 600 : null })}
              >
                <TimerIcon data-icon="inline-start" />
                Minuteur
              </Button>
              <Button
                variant="ghost"
                size="sm"
                aria-pressed={step.title !== null}
                onClick={() => onChange({ title: step.title === null ? '' : null })}
              >
                <HeadingIcon data-icon="inline-start" />
                Titre
              </Button>
              <span className="flex-1" />
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Monter l’étape"
                disabled={index === 0}
                onClick={() => onMove(-1)}
              >
                <ChevronUpIcon />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Descendre l’étape"
                disabled={index === count - 1}
                onClick={() => onMove(1)}
              >
                <ChevronDownIcon />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Supprimer l’étape"
                onClick={onRemove}
              >
                <Trash2Icon className="text-muted-foreground" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </li>
  )
}
