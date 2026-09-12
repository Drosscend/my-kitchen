import { defineRule } from '@oxlint/plugins'
import { isImportPath } from '../import_source.ts'

const SHARED_PREFIX = '#types/'

/**
 * Guards the server/client boundary. The subpath imports of package.json
 * resolve to server code that must never reach the browser bundle. The
 * exception is app/types, whose values carry no runtime dependency and
 * which Vite maps through the matching alias.
 */
export const noBackendImportInFrontendRule = defineRule({
  meta: {
    type: 'problem',
    docs: { description: 'Disallow importing server modules from the Inertia client.' },
    messages: {
      backendImport:
        'The client cannot import "{{source}}"; only #types/* crosses the server boundary.',
    },
  },
  createOnce(context) {
    return {
      ImportDeclaration(node) {
        const source = node.source.value

        if (!isImportPath(source) || !source.startsWith('#')) {
          return
        }

        if (source.startsWith(SHARED_PREFIX)) {
          return
        }

        context.report({ node: node.source, messageId: 'backendImport', data: { source } })
      },
    }
  },
})
