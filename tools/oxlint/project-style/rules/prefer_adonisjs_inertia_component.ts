import { defineRule } from '@oxlint/plugins'

const TYPED_COMPONENTS = new Set(['Form', 'Link'])
const UNTYPED_PACKAGE = '@inertiajs/react'
const TYPED_PACKAGE = '@adonisjs/inertia/react'

/**
 * Link and Form come from the AdonisJS adapter, whose "route" prop is
 * typed from the generated route registry. The plain Inertia components
 * take a raw href, which no build step can check against the routes.
 */
export const preferAdonisjsInertiaComponentRule = defineRule({
  meta: {
    type: 'problem',
    docs: { description: 'Require the route-aware Link and Form of the AdonisJS Inertia adapter.' },
    messages: {
      untypedComponent: 'Import "{{name}}" from "' + TYPED_PACKAGE + '" to keep routes typed.',
    },
  },
  createOnce(context) {
    return {
      ImportDeclaration(node) {
        if (node.source.value !== UNTYPED_PACKAGE) {
          return
        }

        for (const specifier of node.specifiers) {
          if (specifier.type !== 'ImportSpecifier' || specifier.imported.type !== 'Identifier') {
            continue
          }

          if (TYPED_COMPONENTS.has(specifier.imported.name)) {
            context.report({
              node: specifier,
              messageId: 'untypedComponent',
              data: { name: specifier.imported.name },
            })
          }
        }
      },
    }
  },
})
