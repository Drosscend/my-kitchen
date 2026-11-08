import { Link, useRouter } from '@adonisjs/inertia/react'
import { BookOpenIcon, Trash2Icon } from 'lucide-react'
import { ConfirmDeleteDialog } from '~/components/confirm_delete_dialog'
import { Button } from '~/components/ui/button'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '~/components/ui/empty'
import { plural } from '~/plural'
import { type RecipeSummary } from '~/recipes/types'

export function DeleteRecipeDialog({ id, title }: { id: string; title: string }) {
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

export function RecipeLibrary({ recipes }: { recipes: RecipeSummary[] }) {
  if (recipes.length === 0) {
    return (
      <Empty className="rounded-xl border bg-card">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <BookOpenIcon />
          </EmptyMedia>
          <EmptyTitle>Aucune recette</EmptyTitle>
          <EmptyDescription>Ton assistant les ajoute depuis le serveur MCP.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <ul className="mb-2.5 grid grid-cols-1 overflow-hidden rounded-xl bg-card paper-stack lg:grid-cols-2">
      {recipes.map((recipe) => (
        <li
          key={recipe.id}
          className="relative flex flex-col gap-1.5 border-b border-dashed px-4 py-4 transition-colors last:border-b-0 hover:bg-muted/40 sm:px-5 lg:odd:border-r lg:odd:border-solid lg:[&:nth-last-child(2):nth-child(odd)]:border-b-0"
        >
          <Link
            route="recipes.show"
            routeParams={{ id: recipe.id }}
            className="text-xl leading-tight font-extrabold tracking-tight font-stretch-80% after:absolute after:inset-0"
          >
            {recipe.title}
          </Link>
          {recipe.description && (
            <p className="line-clamp-2 text-sm text-muted-foreground">{recipe.description}</p>
          )}
          <p className="mt-1 flex gap-4 text-xs text-muted-foreground tabular-nums">
            {recipe.ingredientCount > 0 && (
              <span>{plural(recipe.ingredientCount, 'ingrédient')}</span>
            )}
            {recipe.stepCount > 0 && <span>{plural(recipe.stepCount, 'étape')}</span>}
          </p>
        </li>
      ))}
    </ul>
  )
}
