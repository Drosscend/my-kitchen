import { Link } from '@adonisjs/inertia/react'
import { Head } from '@inertiajs/react'
import { ArrowLeftIcon } from 'lucide-react'
import { Page } from '~/components/page'
import { Button } from '~/components/ui/button'
import { RecipeDetail } from '~/recipes/recipe_detail'
import { DeleteRecipeDialog } from '~/recipes/recipe_library'
import { type Recipe } from '~/recipes/types'
import { type InertiaProps } from '~/types'

type PageProps = InertiaProps<{ recipe: Recipe }>

export default function ShowRecipe({ recipe }: PageProps) {
  return (
    <>
      <Head title={recipe.title} />
      <Page>
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" nativeButton={false} render={<Link route="recipes.index" />}>
            <ArrowLeftIcon data-icon="inline-start" />
            Toutes les recettes
          </Button>
          <DeleteRecipeDialog id={recipe.id} title={recipe.title} />
        </div>
        <RecipeDetail recipe={recipe} />
      </Page>
    </>
  )
}
