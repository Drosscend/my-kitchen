import { type JSONContent } from '@tiptap/core'
import Bold from '@tiptap/extension-bold'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { Placeholder, UndoRedo } from '@tiptap/extensions'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import { BoldIcon } from 'lucide-react'
import { Toggle } from '~/components/ui/toggle'

const NOTES_EXTENSIONS = [
  Document,
  Paragraph,
  Text,
  Bold,
  UndoRedo,
  Placeholder.configure({ placeholder: 'Notes' }),
]

/**
 * Notes are stored as lines with **bold** markers.
 */
function toDocument(notes: string): JSONContent {
  return {
    type: 'doc',
    content: notes.split('\n').map((line) => {
      const content: JSONContent[] = []
      let lastIndex = 0

      for (const match of line.matchAll(/\*\*(.+?)\*\*/g)) {
        if (match.index > lastIndex) {
          content.push({ type: 'text', text: line.slice(lastIndex, match.index) })
        }

        content.push({ type: 'text', text: match[1], marks: [{ type: 'bold' }] })
        lastIndex = match.index + match[0].length
      }

      if (lastIndex < line.length) {
        content.push({ type: 'text', text: line.slice(lastIndex) })
      }

      return { type: 'paragraph', content }
    }),
  }
}

function toNotes(document: JSONContent) {
  return (document.content ?? [])
    .map((paragraph) =>
      (paragraph.content ?? [])
        .map((node) =>
          node.marks?.some((mark) => mark.type === 'bold') ? `**${node.text}**` : node.text
        )
        .join('')
    )
    .join('\n')
    .trim()
}

export function NotesEditor({
  notes,
  onChange,
}: {
  notes: string
  onChange: (notes: string) => void
}) {
  const editor = useEditor({
    extensions: NOTES_EXTENSIONS,
    content: toDocument(notes),
    editorProps: { attributes: { 'aria-label': 'Notes' } },
    onUpdate: ({ editor: current }) => onChange(toNotes(current.getJSON())),
  })
  const bold = useEditorState({
    editor,
    selector: ({ editor: current }) => current?.isActive('bold') ?? false,
  })

  return (
    <section className="rounded-xl bg-accent/60 p-5 sm:p-6">
      <div className="mb-3 flex items-center justify-between gap-4">
        <h2 className="text-xl">Notes</h2>
        <Toggle
          variant="outline"
          size="sm"
          aria-label="Gras"
          pressed={bold}
          onMouseDown={(event) => event.preventDefault()}
          onPressedChange={() => editor?.chain().focus().toggleBold().run()}
        >
          <BoldIcon />
        </Toggle>
      </div>
      <EditorContent
        editor={editor}
        className="rounded-lg border bg-card px-4 py-3 leading-relaxed focus-within:border-primary/60 focus-within:ring-3 focus-within:ring-primary/15 [&_.tiptap]:min-h-12 [&_.tiptap]:outline-none [&_p]:my-1 [&_p]:first:mt-0 [&_p]:last:mb-0"
      />
    </section>
  )
}
