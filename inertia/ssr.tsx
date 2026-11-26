import { resolvePageComponent } from '@adonisjs/inertia/helpers'
import { TuyauProvider } from '@adonisjs/inertia/react'
import { createInertiaApp, type ResolvedComponent } from '@inertiajs/react'
import { type ReactElement } from 'react'
import ReactDOMServer from 'react-dom/server'
import { client } from '~/client'
import Layout from '~/layouts/default'

export default function render(page: any) {
  return createInertiaApp({
    page,
    render: ReactDOMServer.renderToString,
    title: (title) => (title ? `${title} · Mon Garde-Manger` : 'Mon Garde-Manger'),
    resolve: (name) => {
      return resolvePageComponent<ResolvedComponent>(
        `./pages/${name}.tsx`,
        import.meta.glob<ResolvedComponent>('./pages/**/*.tsx', { eager: true }),
        (resolved: ReactElement) => <Layout>{resolved}</Layout>
      )
    },
    setup: ({ App, props }) => {
      return (
        <TuyauProvider client={client}>
          <App {...props} />
        </TuyauProvider>
      )
    },
  })
}
