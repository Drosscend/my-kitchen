import { Link, useRouter } from '@adonisjs/inertia/react'
import { BookOpenIcon, Trash2Icon } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '~/components/ui/alert-dialog'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent } from '~/components/ui/card'
import { type RecipeSummary } from '~/recipes/types'

interface RecipeLibraryProps {
  recipes: RecipeSummary[]
}

function plural(count: number, singular: string) {
  return `${count} ${singular}${count > 1 ? 's' : ''}`
}

export function DeleteRecipeDialog({
  recipe,
  trigger,
}: {
  recipe: RecipeSummary
  trigger: React.ReactElement
}) {
  const router = useRouter()

  return (
    <AlertDialog>
      <AlertDialogTrigger render={trigger} />
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer la recette ?</AlertDialogTitle>
          <AlertDialogDescription>
            « {recipe.title} » disparaît définitivement de la bibliothèque.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() =>
              router.visit({ route: 'recipes.destroy', routeParams: { id: recipe.id } })
            }
          >
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function RecipeLibrary({ recipes }: RecipeLibraryProps) {
  if (recipes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border px-6 py-24 text-center">
        <BookOpenIcon className="size-10 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Aucune recette. Ton assistant les ajoute depuis le serveur MCP.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3">
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
            <DeleteRecipeDialog
              recipe={recipe}
              trigger={
                <Button variant="ghost" size="icon-sm" aria-label={`Supprimer ${recipe.title}`}>
                  <Trash2Icon className="text-muted-foreground" />
                </Button>
              }
            />
          </span>
        </Card>
      ))}
    </div>
  )
}
