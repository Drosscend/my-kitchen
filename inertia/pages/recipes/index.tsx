import { Head } from '@inertiajs/react'
import { Page, PageHeader } from '~/components/page'
import { plural } from '~/plural'
import { RecipeLibrary } from '~/recipes/recipe_library'
import { type RecipeSummary } from '~/recipes/types'
import { UnitConverter } from '~/recipes/unit_converter'
import { type InertiaProps } from '~/types'

type PageProps = InertiaProps<{ recipes: RecipeSummary[] }>

export default function Recipes({ recipes }: PageProps) {
  return (
    <>
      <Head title="Recettes" />
      <Page>
        <PageHeader
          title="Recettes"
          meta={recipes.length > 0 && plural(recipes.length, 'recette')}
          actions={<UnitConverter />}
        />
        <RecipeLibrary recipes={recipes} />
      </Page>
    </>
  )
}
