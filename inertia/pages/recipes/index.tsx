import { Head } from '@inertiajs/react'
import { RecipeLibrary } from '~/recipes/recipe_library'
import { type RecipeSummary } from '~/recipes/types'
import { UnitConverter } from '~/recipes/unit_converter'
import { type InertiaProps } from '~/types'

type PageProps = InertiaProps<{ recipes: RecipeSummary[] }>

export default function Recipes({ recipes }: PageProps) {
  return (
    <>
      <Head title="Recettes" />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          <div className="lg:hidden">
            <UnitConverter />
          </div>
          <div className="order-2 space-y-6 lg:order-1">
            <RecipeLibrary recipes={recipes} />
          </div>
          <div className="order-1 hidden lg:order-2 lg:block">
            <UnitConverter />
          </div>
        </div>
      </main>
    </>
  )
}
