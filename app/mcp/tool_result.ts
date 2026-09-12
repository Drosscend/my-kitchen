import type { CallToolResult } from '@modelcontextprotocol/server'

/**
 * A tool answers with the structured payload the schema declares, plus
 * the same payload as text for clients that read nothing else.
 */
export function toolResult<TOutput extends NonNullable<CallToolResult['structuredContent']>>(
  output: TOutput
): CallToolResult & { structuredContent: TOutput } {
  return {
    content: [{ type: 'text', text: JSON.stringify(output) }],
    structuredContent: output,
  }
}

export function toolError(message: string): CallToolResult {
  return { content: [{ type: 'text', text: message }], isError: true }
}
