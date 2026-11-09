import { Link, useRouter } from '@adonisjs/inertia/react'
import { router as inertiaRouter } from '@inertiajs/react'
import { ArrowLeftIcon, CheckIcon, PlusIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '~/components/ui/button'
import { EditorGuide } from '~/recipes/editor_guide'
import { IngredientEditor } from '~/recipes/ingredient_editor'
import { NotesEditor } from '~/recipes/notes_editor'
import {
  draftFrom,
  forgetIngredient,
  move,
  newStep,
  toPayload,
  type RecipeDraft,
} from '~/recipes/recipe_document'
import { RecipeIngredientsContext, StepEditor } from '~/recipes/step_editor'
import { type Recipe, type RecipeIngredient, type RecipeStep } from '~/recipes/types'

/**
 * Asks before leaving a recipe with unsaved changes, whether through a
 * link of the app or by closing the tab.
 */
function useLeaveGuard(dirty: boolean) {
  useEffect(() => {
    if (!dirty) {
      return
    }

    const warnOnUnload = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener('beforeunload', warnOnUnload)
    const removeVisitGuard = inertiaRouter.on('before', (event) => {
      if (
        event.detail.visit.method === 'get' &&
        !window.confirm('Quitter sans enregistrer les modifications ?')
      ) {
        event.preventDefault()
      }
    })

    return () => {
      window.removeEventListener('beforeunload', warnOnUnload)
      removeVisitGuard()
    }
  }, [dirty])
}

export function RecipeEditor({ recipe }: { recipe?: Recipe }) {
  const router = useRouter()
  const [draft, setDraft] = useState(() => draftFrom(recipe))
  const [saved] = useState(() => JSON.stringify(toPayload(draftFrom(recipe))))
  const [revision, setRevision] = useState(0)
  const [addedStep, setAddedStep] = useState<string | null>(null)
  const [titleMissing, setTitleMissing] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [refusals, setRefusals] = useState<Record<string, string>>({})
  const payload = toPayload(draft)
  const dirty = JSON.stringify(payload) !== saved
  const empty = payload.ingredients.length === 0 && payload.steps.length === 0

  useLeaveGuard(dirty && !processing)

  function change(changes: Partial<RecipeDraft>) {
    setDraft((current) => ({ ...current, ...changes }))
  }

  function updateIngredient(ref: string, changes: Partial<RecipeIngredient>) {
    setDraft((current) => ({
      ...current,
      ingredients: current.ingredients.map((ingredient) =>
        ingredient.ref === ref ? { ...ingredient, ...changes } : ingredient
      ),
    }))
  }

  function moveIngredient(ref: string, offset: number) {
    setDraft((current) => ({
      ...current,
      ingredients: move(
        current.ingredients,
        current.ingredients.findIndex((ingredient) => ingredient.ref === ref),
        offset
      ),
    }))
  }

  function removeIngredient(removed: RecipeIngredient) {
    setDraft((current) => ({
      ...current,
      ingredients: current.ingredients.filter((ingredient) => ingredient.ref !== removed.ref),
      steps: forgetIngredient(current.steps, removed),
    }))
    setRevision((current) => current + 1)
  }

  function updateStep(ref: string, changes: Partial<RecipeStep>) {
    setDraft((current) => ({
      ...current,
      steps: current.steps.map((step) => (step.ref === ref ? { ...step, ...changes } : step)),
    }))
  }

  function addStep() {
    const step = newStep()
    setAddedStep(step.ref)
    setDraft((current) => ({ ...current, steps: [...current.steps, step] }))
  }

  function save() {
    if (!payload.title) {
      setTitleMissing(true)
      document.getElementById('recipe-title')?.focus()
      return
    }

    router.visit(
      recipe
        ? { route: 'recipes.update', routeParams: { id: recipe.id } }
        : { route: 'recipes.store' },
      {
        data: payload,
        preserveState: true,
        onStart: () => {
          setProcessing(true)
          setRefusals({})
        },
        onError: (errors) =>
          setRefusals(
            Object.fromEntries(
              Object.entries(errors).map(([field, message]) => [refusedPart(field), message])
            )
          ),
        onFinish: () => setProcessing(false),
      }
    )
  }

  /**
   * Names the part of the recipe a refused field such as
   * `steps.1.content` belongs to. Blank steps are not sent, so a step
   * is found back by its ref.
   */
  function refusedPart(field: string) {
    const [section, index] = field.split('.')

    if (section === 'steps') {
      const ref = payload.steps[Number(index)]?.ref
      return `Étape ${draft.steps.findIndex((step) => step.ref === ref) + 1}`
    }

    if (section === 'ingredients') {
      return draft.ingredients[Number(index)]?.name || 'Ingrédient'
    }

    return { title: 'Titre', description: 'Description', notes: 'Notes' }[section] ?? 'Portions'
  }

  const backLink = recipe ? (
    <Link route="recipes.show" routeParams={{ id: recipe.id }} />
  ) : (
    <Link route="recipes.index" />
  )

  const actions = (
    <>
      <Button variant="outline" size="lg" nativeButton={false} render={backLink}>
        Annuler
      </Button>
      <Button size="lg" className="flex-1" disabled={empty || processing} onClick={save}>
        <CheckIcon data-icon="inline-start" />
        Enregistrer
      </Button>
    </>
  )

  return (
    <RecipeIngredientsContext value={draft.ingredients}>
      <div className="max-md:pb-16">
        <div className="-mt-2 mb-4 sm:mb-6">
          <Button
            variant="ghost"
            nativeButton={false}
            className="-ml-2.5 text-muted-foreground"
            render={backLink}
          >
            <ArrowLeftIcon data-icon="inline-start" />
            {recipe ? recipe.title : 'Recettes'}
          </Button>
        </div>

        <header className="mb-8 flex flex-col gap-5 sm:mb-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex w-full max-w-3xl flex-col gap-1">
            <input
              id="recipe-title"
              aria-label="Titre de la recette"
              aria-invalid={titleMissing}
              placeholder="Titre de la recette"
              maxLength={200}
              autoFocus={!recipe}
              value={draft.title}
              onChange={(event) => {
                setTitleMissing(false)
                change({ title: event.target.value })
              }}
              className="w-full border-b-2 border-dashed border-input bg-transparent pb-1 text-4xl leading-tight font-extrabold tracking-tight font-stretch-80% outline-none placeholder:text-muted-foreground/70 focus:border-solid focus:border-primary aria-invalid:border-destructive sm:text-5xl"
            />
            {titleMissing && (
              <p role="alert" className="text-sm text-destructive">
                Donne un titre à la recette
              </p>
            )}
            <input
              aria-label="Description"
              placeholder="Description"
              maxLength={1000}
              value={draft.description}
              onChange={(event) => change({ description: event.target.value })}
              className="mt-2 w-full border-b border-dashed border-input bg-transparent pb-1 text-lg text-muted-foreground outline-none placeholder:text-muted-foreground/70 focus:border-solid focus:border-primary"
            />
          </div>
          <div className="hidden shrink-0 gap-2 md:flex">{actions}</div>
        </header>

        {Object.keys(refusals).length > 0 && (
          <ul
            role="alert"
            className="mb-8 flex flex-col gap-1 rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          >
            {Object.entries(refusals).map(([part, message]) => (
              <li key={part} className="wrap-anywhere">
                <strong>{part}</strong> : {message}
              </li>
            ))}
          </ul>
        )}

        <EditorGuide open={!recipe} />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[22rem_minmax(0,1fr)] lg:gap-12">
          <aside className="lg:sticky lg:top-8 lg:self-start">
            <IngredientEditor
              ingredients={draft.ingredients}
              baseServings={draft.baseServings}
              onServingsChange={(baseServings) => change({ baseServings })}
              onAdd={(ingredient) =>
                setDraft((current) => ({
                  ...current,
                  ingredients: [...current.ingredients, ingredient],
                }))
              }
              onUpdate={updateIngredient}
              onMove={moveIngredient}
              onRemove={removeIngredient}
            />
          </aside>

          <div className="flex min-w-0 flex-col gap-10">
            <section>
              <h2 className="mb-5 text-xl">Étapes</h2>
              <ol className="flex flex-col gap-4">
                {draft.steps.map((step, index) => (
                  <StepEditor
                    key={`${step.ref}-${revision}`}
                    step={step}
                    index={index}
                    count={draft.steps.length}
                    autoFocus={step.ref === addedStep}
                    onChange={(changes) => updateStep(step.ref, changes)}
                    onMove={(offset) =>
                      setDraft((current) => ({
                        ...current,
                        steps: move(current.steps, index, offset),
                      }))
                    }
                    onRemove={() =>
                      setDraft((current) => ({
                        ...current,
                        steps: current.steps.filter((candidate) => candidate.ref !== step.ref),
                      }))
                    }
                  />
                ))}
              </ol>
              <Button
                variant="outline"
                size="lg"
                className="mt-4 w-full border-dashed text-primary"
                onClick={addStep}
              >
                <PlusIcon data-icon="inline-start" />
                Ajouter une étape
              </Button>
            </section>

            <NotesEditor notes={draft.notes} onChange={(notes) => change({ notes })} />
          </div>
        </div>

        <div className="fixed inset-x-0 bottom-[calc(4rem+1px+env(safe-area-inset-bottom))] z-30 flex gap-2 border-t bg-card px-4 py-3 md:hidden">
          {actions}
        </div>
      </div>
    </RecipeIngredientsContext>
  )
}
