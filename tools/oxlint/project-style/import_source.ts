import type { ESTree } from '@oxlint/plugins'

type LiteralValue = ESTree.ImportDeclaration['source']['value']

/**
 * An import source is always a string, but the AST types a literal
 * value as the whole union a literal can hold.
 */
export function isImportPath(value: LiteralValue): value is string {
  return typeof value === 'string'
}
