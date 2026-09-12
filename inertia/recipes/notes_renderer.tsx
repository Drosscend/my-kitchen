import { type ReactNode } from 'react'

function withBold(line: string): ReactNode[] {
  const parts: ReactNode[] = []
  let lastIndex = 0

  for (const match of line.matchAll(/\*\*(.+?)\*\*/g)) {
    if (match.index > lastIndex) {
      parts.push(line.slice(lastIndex, match.index))
    }

    parts.push(<strong key={match.index}>{match[1]}</strong>)
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < line.length) {
    parts.push(line.slice(lastIndex))
  }

  return parts
}

/**
 * Notes are plain lines with **bold** markers, nothing more.
 */
export function NotesRenderer({ notes }: { notes: string }) {
  return (
    <>
      {notes.split('\n').map((line, index) => (
        <p key={`${index}-${line}`} className="my-1 first:mt-0 last:mb-0">
          {withBold(line)}
        </p>
      ))}
    </>
  )
}
