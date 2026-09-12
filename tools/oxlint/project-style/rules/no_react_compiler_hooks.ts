import { defineRule } from '@oxlint/plugins'

const MEMOIZATION_APIS = new Set(['memo', 'useCallback', 'useMemo'])

/**
 * The React compiler memoizes the client build, so hand-written
 * memoization is dead weight. The exception is an identity an external
 * API requires, which turns the rule off on that line with the reason.
 */
export const noReactCompilerHooksRule = defineRule({
  meta: {
    type: 'problem',
    docs: { description: 'Disallow manual memoization, which the React compiler already does.' },
    messages: {
      memoization:
        'The React compiler memoizes this build; drop "{{name}}" unless an API requires a stable identity.',
    },
  },
  createOnce(context) {
    return {
      ImportDeclaration(node) {
        if (node.source.value !== 'react') {
          return
        }

        for (const specifier of node.specifiers) {
          if (specifier.type !== 'ImportSpecifier' || specifier.imported.type !== 'Identifier') {
            continue
          }

          if (MEMOIZATION_APIS.has(specifier.imported.name)) {
            context.report({
              node: specifier,
              messageId: 'memoization',
              data: { name: specifier.imported.name },
            })
          }
        }
      },
    }
  },
})
