import { defineConfig } from 'oxlint'

export default defineConfig({
  ignorePatterns: [
    '**/.adonisjs/**',
    '**/build/**',
    '**/public/assets/**',
    'types/db.ts',
    // Vendored from dmmulroy/anti-slop, kept diffable with upstream.
    'tools/oxlint/anti-slop/**',
    // shadcn components, kept diffable with the registry.
    'inertia/components/ui/**',
  ],
  plugins: ['typescript', 'unicorn', 'react', 'import'],
  jsPlugins: [
    { name: 'project-style', specifier: './tools/oxlint/project-style/index.ts' },
    { name: 'anti-slop', specifier: './tools/oxlint/anti-slop/index.ts' },
  ],
  settings: {
    react: { version: '19.2.8' },
  },
  rules: {
    'anti-slop/no-chained-type-assertions': 'error',
    'anti-slop/no-conditional-empty-object-spread': 'error',
    'anti-slop/no-known-value-widening': 'error',
    'anti-slop/no-module-mocking': 'error',
    'anti-slop/no-object-parameters': 'error',
    'anti-slop/no-reflect-apply': 'error',
    'anti-slop/no-reflect-get': 'error',
    'anti-slop/no-runtime-typeof': ['error', { allowInTypeGuards: true }],
    'anti-slop/no-shape-in-symbol-names': 'error',
    'anti-slop/no-unknown-parameters': 'error',
    'anti-slop/no-unknown-returns': 'error',
    'anti-slop/no-unknown-type-aliases': 'error',
    'anti-slop/no-unsafe-dictionary-type': 'error',
    'anti-slop/no-widen-then-assert': 'error',
    'anti-slop/require-safety-comment-for-type-assertion': 'error',
    'eqeqeq': ['error', 'always'],
    'project-style/blank-line-after-imports': 'error',
    'project-style/blank-line-before-if': 'error',
    'project-style/no-em-dash': 'error',
    'project-style/no-typescript-private': 'error',
    'project-style/no-ui-arrow': 'error',
    'project-style/require-lucide-icon-suffix': 'error',
    // createInertiaApp takes its page component through a children prop.
    'react/no-children-prop': 'off',
    'react/exhaustive-deps': 'warn',
    'react/rules-of-hooks': 'error',
    'react/self-closing-comp': 'error',
    'unicorn/filename-case': ['error', { case: 'snakeCase' }],
    'unicorn/prefer-node-protocol': 'error',
  },
  overrides: [
    {
      files: ['src/**/*.ts'],
      rules: { 'project-style/no-app-import-in-core': 'error' },
    },
    {
      files: ['inertia/**/*.{ts,tsx}'],
      rules: {
        // Only on the client: a constructor-injected type is also a runtime
        // value, so the rule would break the container everywhere else.
        'typescript/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
        'project-style/no-backend-import-in-frontend': 'error',
        'project-style/no-react-compiler-hooks': 'error',
        'project-style/prefer-adonisjs-inertia-component': 'error',
      },
    },
    {
      // Starter kit files, kept diffable with upstream.
      files: ['bin/**', 'ace.js'],
      rules: { 'unicorn/no-useless-spread': 'off' },
    },
    {
      // The status page table is keyed by the range type AdonisJS
      // declares. handle() and report() take the raw throw value, as
      // declared by the ExceptionHandler they override.
      files: ['app/exceptions/handler.ts'],
      rules: {
        'anti-slop/no-known-value-widening': 'off',
        'anti-slop/no-unknown-parameters': 'off',
      },
    },
  ],
})
