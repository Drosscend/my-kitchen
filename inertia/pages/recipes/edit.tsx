import { Head } from '@inertiajs/react'
import { Page } from '~/components/page'
import { RecipeEditor } from '~/recipes/recipe_editor'
import { type Recipe } from '~/recipes/types'
import { type InertiaProps } from '~/types'

type PageProps = InertiaProps<{ recipe: Recipe }>

export default function EditRecipe({ recipe }: PageProps) {
  return (
    <>
      <Head title={recipe.title} />
      <Page>
        <RecipeEditor recipe={recipe} />
      </Page>
    </>
  )
}
