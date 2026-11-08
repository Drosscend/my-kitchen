import { Head } from '@inertiajs/react'
import { Page } from '~/components/page'
import { RecipeEditor } from '~/recipes/recipe_editor'

export default function CreateRecipe() {
  return (
    <>
      <Head title="Nouvelle recette" />
      <Page>
        <RecipeEditor />
      </Page>
    </>
  )
}
