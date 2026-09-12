import { Head } from '@inertiajs/react'
import { ErrorPage } from '~/components/error_page'

export default function ServerError() {
  return (
    <>
      <Head title="Erreur" />
      <ErrorPage status="500" title="Une erreur est survenue, réessaie dans un instant." />
    </>
  )
}
