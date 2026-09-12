import { Head } from '@inertiajs/react'
import { Page, PageHeader } from '~/components/page'
import { Badge } from '~/components/ui/badge'
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
          actions={
            recipes.length > 0 && (
              <Badge variant="outline" className="px-3 py-1 text-sm">
                {plural(recipes.length, 'recette')}
              </Badge>
            )
          }
        />

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_380px] xl:gap-10">
          <div className="min-w-0">
            <RecipeLibrary recipes={recipes} />
          </div>
          <aside className="xl:sticky xl:top-8 xl:self-start">
            <UnitConverter />
          </aside>
        </div>
      </Page>
    </>
  )
}
