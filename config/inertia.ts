import { defineConfig } from '@adonisjs/inertia'

const inertiaConfig = defineConfig({
  /**
   * Server-side rendering options.
   */
  ssr: {
    /**
     * Toggle SSR mode for Inertia pages.
     */
    enabled: true,

    /**
     * Entry file used by the SSR server build.
     */
    entrypoint: 'inertia/ssr.tsx',

    /**
     * Only the pages search engines index are rendered on the server;
     * everything else sits behind a session or has nothing to rank.
     */
    pages: (_, page) => page === 'home' || page === 'legal/show',
  },
})

export default inertiaConfig
