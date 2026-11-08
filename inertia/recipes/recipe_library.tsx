import { Link, useRouter } from '@adonisjs/inertia/react'
import {
  BookOpenIcon,
  CarrotIcon,
  SearchIcon,
  SearchXIcon,
  TimerIcon,
  Trash2Icon,
  UsersIcon,
} from 'lucide-react'
import { ConfirmDeleteDialog } from '~/components/confirm_delete_dialog'
import { Button } from '~/components/ui/button'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '~/components/ui/empty'
import { InputGroup, InputGroupAddon, InputGroupInput } from '~/components/ui/input-group'
import { type CatalogOption } from '~/inventory/catalog'
import { CatalogSelect } from '~/inventory/catalog_select'
import { plural } from '~/plural'
import { formatDuration, formatSince } from '~/recipes/format'
import { type RecipeSummary } from '~/recipes/types'
import { type RecipeSort, useRecipeFilter } from '~/recipes/use_recipe_filter'
import { type Swatch } from '~/swatch'

const SORT_OPTIONS: (CatalogOption & { value: RecipeSort })[] = [
  { value: 'createdAt', label: 'Plus récentes' },
  { value: 'updatedAt', label: 'Modifiées récemment' },
  { value: 'title', label: 'De A à Z' },
  { value: 'duration', label: 'Plus rapides' },
]

const MAGNETS: Swatch[] = ['tomato', 'sage', 'cornflower', 'mustard', 'cinnamon']

function magnetFor(id: string) {
  return MAGNETS[[...id].reduce((sum, char) => sum + char.charCodeAt(0), 0) % MAGNETS.length]
}

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

function RecipeCard({ recipe, magnet }: { recipe: RecipeSummary; magnet: Swatch }) {
  return (
    <li
      data-swatch={magnet}
      className="relative flex flex-col rounded-[4px_4px_12px_4px] bg-card shadow-[0_1px_0_rgb(41_35_30/0.07),0_12px_20px_-14px_rgb(74_55_40/0.6)] transition-transform hover:-translate-y-0.5"
    >
      <span aria-hidden className="magnet absolute -top-2.25 left-1/2 size-5 -translate-x-1/2" />
      <div className="flex flex-col gap-1.5 px-4 pt-5 pb-3">
        <Link
          route="recipes.show"
          routeParams={{ id: recipe.id }}
          className="text-xl leading-tight font-extrabold tracking-tight text-balance font-stretch-80% after:absolute after:inset-0 after:rounded-[inherit]"
        >
          {recipe.title}
        </Link>
        {recipe.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">{recipe.description}</p>
        )}
      </div>
      <div className="mt-auto flex flex-col border-t-2 border-tomato/50 px-4 pb-1 text-sm leading-7 ruled">
        <p className="flex flex-wrap gap-x-4 tabular-nums">
          {recipe.timerSeconds > 0 && (
            <span className="flex items-center gap-1.5">
              <TimerIcon aria-hidden className="size-4 text-primary" />
              {formatDuration(recipe.timerSeconds)}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <UsersIcon aria-hidden className="size-4 text-primary" />
            {plural(recipe.baseServings, 'portion')}
          </span>
          {recipe.ingredientNames.length > 0 && (
            <span className="flex items-center gap-1.5">
              <CarrotIcon aria-hidden className="size-4 text-primary" />
              {plural(recipe.ingredientNames.length, 'ingrédient')}
            </span>
          )}
        </p>
        <p className="text-muted-foreground">Ajoutée {formatSince(recipe.createdAt)}</p>
      </div>
    </li>
  )
}

export function RecipeLibrary({ recipes }: { recipes: RecipeSummary[] }) {
  const { search, setSearch, sort, setSort, filtered } = useRecipeFilter(recipes)

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
    <div className="flex flex-col gap-6">
      <div className="flex gap-2 sm:grid sm:grid-cols-[minmax(0,1fr)_13rem] lg:max-w-2xl">
        <InputGroup className="flex-1 bg-card">
          <InputGroupAddon align="inline-start">
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            type="search"
            aria-label="Rechercher une recette ou un ingrédient"
            placeholder="Rechercher"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </InputGroup>
        <CatalogSelect
          options={SORT_OPTIONS}
          value={sort}
          ariaLabel="Tri"
          triggerClassName="w-44 shrink-0 bg-card sm:w-full"
          onValueChange={(value) => {
            const option = SORT_OPTIONS.find((candidate) => candidate.value === value)

            if (option) {
              setSort(option.value)
            }
          }}
        />
      </div>

      {filtered.length === 0 ? (
        <Empty className="rounded-xl border bg-card">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SearchXIcon />
            </EmptyMedia>
            <EmptyTitle>Aucune recette ne correspond à la recherche</EmptyTitle>
          </EmptyHeader>
        </Empty>
      ) : (
        <ul className="grid grid-cols-1 gap-x-5 gap-y-7 pt-2 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {filtered.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} magnet={magnetFor(recipe.id)} />
          ))}
        </ul>
      )}
    </div>
  )
}
