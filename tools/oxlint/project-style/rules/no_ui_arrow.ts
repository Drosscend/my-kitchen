import { defineRule } from '@oxlint/plugins'

const ARROWS = ['\u2190', '\u2192', '\u21d0', '\u21d2']

/**
 * Keeps navigation arrows inside the component that owns them. A raw
 * arrow in a page duplicates LinkArrow and drifts from its hover
 * animation and its aria-hidden attribute. The files that legitimately
 * print one turn the rule off in oxlint.config.ts.
 */
export const noUiArrowRule = defineRule({
  meta: {
    type: 'problem',
    docs: { description: 'Disallow arrow characters outside the components that own them.' },
    messages: {
      arrow: 'Render this arrow with LinkArrow instead of writing the character.',
    },
  },
  createOnce(context) {
    return {
      Program() {
        const { text } = context.sourceCode

        for (const arrow of ARROWS) {
          let index = text.indexOf(arrow)

          while (index !== -1) {
            context.report({
              loc: {
                start: context.sourceCode.getLocFromIndex(index),
                end: context.sourceCode.getLocFromIndex(index + arrow.length),
              },
              messageId: 'arrow',
            })
            index = text.indexOf(arrow, index + arrow.length)
          }
        }
      },
    }
  },
})
