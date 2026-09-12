import { Head } from '@inertiajs/react'
import { ErrorPage } from '~/components/error_page'

export default function NotFound() {
  return (
    <>
      <Head title="Page introuvable" />
      <ErrorPage status="404" title="Cette page n'existe pas." />
    </>
  )
}
