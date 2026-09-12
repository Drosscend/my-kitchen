import { defineRule } from '@oxlint/plugins'

const ICON_PACKAGE = 'lucide-react'
const ICON_SUFFIX = 'Icon'

/**
 * lucide-react exports every icon under two names, bare and suffixed.
 * The suffixed one is the only one that reads as an icon at the call
 * site, where "Menu", "Download" or "Star" are also names the app gives
 * its own components and domain values.
 */
export const requireLucideIconSuffixRule = defineRule({
  meta: {
    type: 'problem',
    docs: { description: 'Require the Icon-suffixed export when importing a lucide-react icon.' },
    messages: {
      missingSuffix: 'Import the icon as "{{name}}{{suffix}}" and rename its uses.',
    },
  },
  createOnce(context) {
    return {
      ImportDeclaration(node) {
        if (node.source.value !== ICON_PACKAGE || node.importKind === 'type') {
          return
        }

        for (const specifier of node.specifiers) {
          if (specifier.type !== 'ImportSpecifier' || specifier.importKind === 'type') {
            continue
          }

          if (specifier.imported.type !== 'Identifier') {
            continue
          }

          const { name } = specifier.imported

          if (!/^[A-Z]/.test(name) || name.endsWith(ICON_SUFFIX)) {
            continue
          }

          context.report({
            node: specifier,
            messageId: 'missingSuffix',
            data: { name, suffix: ICON_SUFFIX },
          })
        }
      },
    }
  },
})
