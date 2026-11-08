import { Link, useRouter } from '@adonisjs/inertia/react'
import { Head } from '@inertiajs/react'
import { ArrowLeftIcon, PencilIcon, Trash2Icon } from 'lucide-react'
import { ConfirmDeleteDialog } from '~/components/confirm_delete_dialog'
import { Page } from '~/components/page'
import { Button } from '~/components/ui/button'
import { RecipeDetail } from '~/recipes/recipe_detail'
import { type Recipe } from '~/recipes/types'
import { type InertiaProps } from '~/types'

type PageProps = InertiaProps<{ recipe: Recipe }>

function DeleteRecipeDialog({ id, title }: { id: string; title: string }) {
  const router = useRouter()

  return (
    <ConfirmDeleteDialog
      title="Supprimer la recette ?"
      description={`« ${title} » disparaît définitivement de la bibliothèque.`}
      onConfirm={() => router.visit({ route: 'recipes.destroy', routeParams: { id } })}
      trigger={
        <Button variant="ghost" size="icon" aria-label={`Supprimer ${title}`}>
          <Trash2Icon className="text-muted-foreground" />
        </Button>
      }
    />
  )
}

export default function ShowRecipe({ recipe }: PageProps) {
  return (
    <>
      <Head title={recipe.title} />
      <Page>
        <div className="-mt-2 mb-4 flex items-center justify-between sm:mb-6">
          <Button
            variant="ghost"
            nativeButton={false}
            className="-ml-2.5 text-muted-foreground"
            render={<Link route="recipes.index" />}
          >
            <ArrowLeftIcon data-icon="inline-start" />
            Recettes
          </Button>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link route="recipes.edit" routeParams={{ id: recipe.id }} />}
            >
              <PencilIcon data-icon="inline-start" />
              Modifier
            </Button>
            <DeleteRecipeDialog id={recipe.id} title={recipe.title} />
          </div>
        </div>
        <RecipeDetail recipe={recipe} />
      </Page>
    </>
  )
}
