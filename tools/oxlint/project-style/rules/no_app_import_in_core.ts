import { defineRule } from '@oxlint/plugins'
import { isImportPath } from '../import_source.ts'

/**
 * Guards the direction of the dependency. Business capabilities are
 * consumed by the delivery layer, never the other way round: a query
 * that reaches for a controller, a validator or a transformer has an
 * HTTP concern in it that belongs on the other side.
 */
export const noAppImportInCoreRule = defineRule({
  meta: {
    type: 'problem',
    docs: { description: 'Disallow importing the delivery layer from a business capability.' },
    messages: {
      appImport:
        'src/ cannot import "{{source}}"; the delivery layer depends on src/, not the reverse.',
    },
  },
  createOnce(context) {
    return {
      ImportDeclaration(node) {
        const source = node.source.value

        if (!isImportPath(source)) {
          return
        }

        if (source.startsWith('#app/') || source.startsWith('#controllers/')) {
          context.report({ node: node.source, messageId: 'appImport', data: { source } })
        }
      },
    }
  },
})
