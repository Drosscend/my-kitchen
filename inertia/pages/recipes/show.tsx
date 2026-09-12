import { Link } from '@adonisjs/inertia/react'
import { Head } from '@inertiajs/react'
import { ArrowLeftIcon, Trash2Icon } from 'lucide-react'
import { Page } from '~/components/page'
import { Button } from '~/components/ui/button'
import { RecipeDetail } from '~/recipes/recipe_detail'
import { DeleteRecipeDialog } from '~/recipes/recipe_library'
import { type Recipe } from '~/recipes/types'
import { type InertiaProps } from '~/types'

type PageProps = InertiaProps<{ recipe: Recipe }>

export default function ShowRecipe({ recipe }: PageProps) {
  const summary = {
    id: recipe.id,
    title: recipe.title,
    description: recipe.description,
    ingredientCount: recipe.ingredients.length,
    stepCount: recipe.steps.length,
  }

  return (
    <>
      <Head title={recipe.title} />
      <Page>
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" nativeButton={false} render={<Link route="recipes.index" />}>
            <ArrowLeftIcon data-icon="inline-start" />
            Toutes les recettes
          </Button>
          <DeleteRecipeDialog
            recipe={summary}
            trigger={
              <Button variant="ghost" size="icon" aria-label="Supprimer la recette">
                <Trash2Icon className="text-muted-foreground" />
              </Button>
            }
          />
        </div>
        <RecipeDetail recipe={recipe} />
      </Page>
    </>
  )
}
