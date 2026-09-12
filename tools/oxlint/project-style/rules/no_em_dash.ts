import { defineRule } from '@oxlint/plugins'

const EM_DASH = '\u2014'

/**
 * Reports every em dash of a file, in code and in content alike. The
 * replacement depends on the role the dash plays: a colon for an
 * explanation, commas for an aside, a full stop for two separate ideas.
 */
export const noEmDashRule = defineRule({
  meta: {
    type: 'problem',
    docs: { description: 'Disallow the em dash.' },
    messages: {
      emDash:
        'Replace this em dash: a colon for an explanation, commas for an aside, a full stop for two ideas.',
    },
  },
  createOnce(context) {
    return {
      Program() {
        const { text } = context.sourceCode
        let index = text.indexOf(EM_DASH)

        while (index !== -1) {
          context.report({
            loc: {
              start: context.sourceCode.getLocFromIndex(index),
              end: context.sourceCode.getLocFromIndex(index + EM_DASH.length),
            },
            messageId: 'emDash',
          })
          index = text.indexOf(EM_DASH, index + EM_DASH.length)
        }
      },
    }
  },
})
