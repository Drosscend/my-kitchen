import { Link } from '@adonisjs/inertia/react'
import { Head } from '@inertiajs/react'
import { ArrowLeftIcon, Trash2Icon } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { RecipeCard } from '~/recipes/recipe_card'
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
      <main className="mx-auto w-full max-w-4xl flex-1 space-y-4 px-4 py-6 sm:px-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={<Link route="recipes.index" />}
          >
            <ArrowLeftIcon data-icon="inline-start" />
            Retour
          </Button>
          <DeleteRecipeDialog
            recipe={summary}
            trigger={
              <Button variant="ghost" size="icon-sm" aria-label="Supprimer la recette">
                <Trash2Icon className="text-muted-foreground" />
              </Button>
            }
          />
        </div>
        <RecipeCard recipe={recipe} />
      </main>
    </>
  )
}
