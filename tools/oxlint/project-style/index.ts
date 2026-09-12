import { eslintCompatPlugin } from '@oxlint/plugins'
import { blankLineAfterImportsRule } from './rules/blank_line_after_imports.ts'
import { blankLineBeforeIfRule } from './rules/blank_line_before_if.ts'
import { noAppImportInCoreRule } from './rules/no_app_import_in_core.ts'
import { noBackendImportInFrontendRule } from './rules/no_backend_import_in_frontend.ts'
import { noEmDashRule } from './rules/no_em_dash.ts'
import { noReactCompilerHooksRule } from './rules/no_react_compiler_hooks.ts'
import { noTypescriptPrivateRule } from './rules/no_typescript_private.ts'
import { noUiArrowRule } from './rules/no_ui_arrow.ts'
import { preferAdonisjsInertiaComponentRule } from './rules/prefer_adonisjs_inertia_component.ts'
import { requireLucideIconSuffixRule } from './rules/require_lucide_icon_suffix.ts'

/**
 * Project invariants that CLAUDE.md states in prose and that no shared
 * config can know about. Every rule here guards a boundary a reviewer
 * would otherwise have to catch by eye.
 */
const projectStylePlugin = eslintCompatPlugin({
  meta: { name: 'project-style' },
  rules: {
    'blank-line-after-imports': blankLineAfterImportsRule,
    'blank-line-before-if': blankLineBeforeIfRule,
    'no-app-import-in-core': noAppImportInCoreRule,
    'no-backend-import-in-frontend': noBackendImportInFrontendRule,
    'no-em-dash': noEmDashRule,
    'no-react-compiler-hooks': noReactCompilerHooksRule,
    'no-typescript-private': noTypescriptPrivateRule,
    'no-ui-arrow': noUiArrowRule,
    'prefer-adonisjs-inertia-component': preferAdonisjsInertiaComponentRule,
    'require-lucide-icon-suffix': requireLucideIconSuffixRule,
  },
})

export default projectStylePlugin
