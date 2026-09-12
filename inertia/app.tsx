import './css/app.css'
import { resolvePageComponent } from '@adonisjs/inertia/helpers'
import { TuyauProvider } from '@adonisjs/inertia/react'
import { createInertiaApp, type ResolvedComponent } from '@inertiajs/react'
import { type ReactElement } from 'react'
import { createRoot } from 'react-dom/client'
import { client } from '~/client'
import Layout from '~/layouts/default'

const appName = 'Mon Garde-Manger'

createInertiaApp({
  title: (title) => (title ? `${title} · ${appName}` : appName),
  resolve: (name) => {
    return resolvePageComponent<ResolvedComponent>(
      `./pages/${name}.tsx`,
      import.meta.glob<ResolvedComponent>('./pages/**/*.tsx'),
      (page: ReactElement) => <Layout>{page}</Layout>
    )
  },
  setup({ el, App, props }) {
    createRoot(el).render(
      <TuyauProvider client={client}>
        <App {...props} />
      </TuyauProvider>
    )
  },
  progress: {
    color: 'oklch(0.55 0.15 35)',
  },
})

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch((error) => {
    console.error('service worker registration failed:', error)
  })
}
