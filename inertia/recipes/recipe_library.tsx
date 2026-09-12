import { Link, useRouter } from '@adonisjs/inertia/react'
import { BookOpenIcon, Trash2Icon } from 'lucide-react'
import { ConfirmDeleteDialog } from '~/components/confirm_delete_dialog'
import { EmptyState } from '~/components/empty_state'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent } from '~/components/ui/card'
import { plural } from '~/plural'
import { type RecipeSummary } from '~/recipes/types'

interface RecipeLibraryProps {
  recipes: RecipeSummary[]
}

export function DeleteRecipeDialog({ id, title }: { id: string; title: string }) {
  const router = useRouter()

  return (
    <ConfirmDeleteDialog
      title="Supprimer la recette ?"
      description={`« ${title} » disparaît définitivement de la bibliothèque.`}
      onConfirm={() => router.visit({ route: 'recipes.destroy', routeParams: { id } })}
      trigger={
        <Button variant="ghost" size="icon-sm" aria-label={`Supprimer ${title}`}>
          <Trash2Icon className="text-muted-foreground" />
        </Button>
      }
    />
  )
}

export function RecipeLibrary({ recipes }: RecipeLibraryProps) {
  if (recipes.length === 0) {
    return (
      <EmptyState icon={BookOpenIcon} className="rounded-lg border border-dashed border-border">
        Aucune recette. Ton assistant les ajoute depuis le serveur MCP.
      </EmptyState>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {recipes.map((recipe) => (
        <Card
          key={recipe.id}
          className="kraft-card relative gap-0 py-0 transition-shadow hover:shadow-md"
        >
          <CardContent className="flex h-full flex-col p-5">
            <Link
              route="recipes.show"
              routeParams={{ id: recipe.id }}
              className="kraft-title block pr-8 text-xl leading-tight font-bold after:absolute after:inset-0"
            >
              {recipe.title}
            </Link>
            {recipe.description && (
              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                {recipe.description}
              </p>
            )}
            <div className="mt-auto flex gap-2 pt-4">
              {recipe.ingredientCount > 0 && (
                <Badge variant="secondary">{plural(recipe.ingredientCount, 'ingrédient')}</Badge>
              )}
              {recipe.stepCount > 0 && (
                <Badge variant="secondary">{plural(recipe.stepCount, 'étape')}</Badge>
              )}
            </div>
          </CardContent>
          <span className="absolute top-3 right-3 z-10">
            <DeleteRecipeDialog id={recipe.id} title={recipe.title} />
          </span>
        </Card>
      ))}
    </div>
  )
}
