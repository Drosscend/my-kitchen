import type { ReactNode } from "react";

interface NotesRendererProps {
  notes: string;
}

function parseBold(line: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const regex = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;

  for (const match of line.matchAll(regex)) {
    if (match.index > lastIndex) {
      parts.push(line.slice(lastIndex, match.index));
    }
    parts.push(<strong key={match.index}>{match[1]}</strong>);
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < line.length) {
    parts.push(line.slice(lastIndex));
  }
  return parts;
}

export function NotesRenderer({ notes }: NotesRendererProps) {
  return (
    <>
      {notes.split("\n").map((line, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: notes lines are static text, not reorderable
        <p key={i} className="my-1 first:mt-0 last:mb-0">
          {parseBold(line)}
        </p>
      ))}
    </>
  );
}
