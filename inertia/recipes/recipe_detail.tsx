import { Form } from '@adonisjs/inertia/react'
import { CookingPotIcon } from 'lucide-react'
import { useState } from 'react'
import { CopyButton } from '~/components/copy_button'
import { Button } from '~/components/ui/button'
import { formatAmount, formatRecipeText, ingredientsByRef } from '~/recipes/format'
import { NotesRenderer } from '~/recipes/notes_renderer'
import { RecipeStepDisplay } from '~/recipes/recipe_step'
import { ServingsControl } from '~/recipes/servings_control'
import { type Recipe } from '~/recipes/types'

export function RecipeDetail({ recipe }: { recipe: Recipe }) {
  const [scale, setScale] = useState(1)
  const [completed, setCompleted] = useState<string[]>([])
  const ingredients = ingredientsByRef(recipe.ingredients)

  function toggleStep(ref: string) {
    setCompleted((current) =>
      current.includes(ref) ? current.filter((item) => item !== ref) : [...current, ref]
    )
  }

  return (
    <>
      <header className="mb-8 flex flex-col gap-5 sm:mb-10 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <h1 className="text-4xl leading-none sm:text-5xl">{recipe.title}</h1>
          {recipe.description && (
            <p className="mt-3 text-lg text-pretty text-muted-foreground">{recipe.description}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {recipe.steps.length > 0 && (
            <Form route="cooking.start" routeParams={{ id: recipe.id }}>
              {({ processing }) => (
                <>
                  <input type="hidden" name="scale" value={scale} />
                  <Button type="submit" size="lg" disabled={processing}>
                    <CookingPotIcon data-icon="inline-start" />
                    Cuisiner
                  </Button>
                </>
              )}
            </Form>
          )}
          <CopyButton
            text={() => formatRecipeText(recipe, scale)}
            label="Copier la recette"
            size="lg"
          />
        </div>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[22rem_minmax(0,1fr)] lg:gap-12">
        <aside className="lg:sticky lg:top-8 lg:self-start">
          <section className="rounded-xl bg-card px-5 pt-5 pb-2 mb-2.5 paper-stack">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-xl">Ingrédients</h2>
              <ServingsControl
                scale={scale}
                baseServings={recipe.baseServings}
                onScaleChange={setScale}
              />
            </div>
            {recipe.ingredients.length > 0 && (
              <ul className="divide-y divide-ruling">
                {recipe.ingredients.map((ingredient) => (
                  <li
                    key={ingredient.ref}
                    className="flex items-baseline justify-between gap-4 py-2.5"
                  >
                    <span>{ingredient.name}</span>
                    {ingredient.amount !== null && (
                      <span className="shrink-0 text-muted-foreground tabular-nums">
                        {formatAmount(ingredient.amount * scale)} {ingredient.unit}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>

        <div className="flex min-w-0 flex-col gap-10">
          {recipe.steps.length > 0 && (
            <section>
              <h2 className="mb-5 text-xl">Étapes</h2>
              <ol className="flex flex-col gap-6">
                {recipe.steps.map((step, index) => (
                  <RecipeStepDisplay
                    key={step.ref}
                    step={step}
                    index={index}
                    completed={completed.includes(step.ref)}
                    onToggle={toggleStep}
                    ingredients={ingredients}
                    scale={scale}
                  />
                ))}
              </ol>
            </section>
          )}

          {recipe.notes && (
            <section className="rounded-xl bg-accent/60 p-5 sm:p-6">
              <h2 className="mb-3 text-xl">Notes</h2>
              <div className="leading-relaxed">
                <NotesRenderer notes={recipe.notes} />
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  )
}
