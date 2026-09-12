import { Form } from '@adonisjs/inertia/react'
import { CookingPotIcon } from 'lucide-react'
import { useState } from 'react'
import { CopyButton } from '~/components/copy_button'
import { SectionCard } from '~/components/section_card'
import { Button } from '~/components/ui/button'
import { formatIngredient, formatRecipeText, ingredientsByRef } from '~/recipes/format'
import { NotesRenderer } from '~/recipes/notes_renderer'
import { RecipeStepDisplay } from '~/recipes/recipe_step'
import { ServingsControl } from '~/recipes/servings_control'
import { type Recipe } from '~/recipes/types'

function SectionTitle({ children }: { children: string }) {
  return <h2 className="kraft-title mb-5 text-2xl font-bold">{children}</h2>
}

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
      <header className="mb-10 max-w-3xl">
        <h1 className="kraft-title text-4xl font-bold text-primary">{recipe.title}</h1>
        {recipe.description && (
          <p className="mt-3 text-lg leading-relaxed text-muted-foreground">{recipe.description}</p>
        )}
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-12">
        <aside className="space-y-6 lg:sticky lg:top-8 lg:self-start">
          <SectionCard title="Ingrédients">
            <ServingsControl
              scale={scale}
              baseServings={recipe.baseServings}
              onScaleChange={setScale}
            />
            {recipe.ingredients.length > 0 && (
              <ul className="space-y-2.5 text-base leading-relaxed">
                {recipe.ingredients.map((ingredient) => (
                  <li key={ingredient.ref} className="flex items-baseline gap-2.5">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent/60" />
                    <span>{formatIngredient(ingredient, scale)}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex flex-wrap gap-2 pt-2">
              {recipe.steps.length > 0 && (
                <Form route="cooking.start" routeParams={{ id: recipe.id }}>
                  {({ processing }) => (
                    <>
                      <input type="hidden" name="scale" value={scale} />
                      <Button type="submit" size="lg" disabled={processing}>
                        <CookingPotIcon data-icon="inline-start" />
                        Cuisiner !
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
          </SectionCard>
        </aside>

        <div className="min-w-0 space-y-12">
          {recipe.steps.length > 0 && (
            <section>
              <SectionTitle>Étapes</SectionTitle>
              <div className="flex flex-col gap-5">
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
              </div>
            </section>
          )}

          {recipe.notes && (
            <section className="kraft-card rounded-lg p-6">
              <SectionTitle>Notes</SectionTitle>
              <div className="text-base leading-relaxed text-foreground/80">
                <NotesRenderer notes={recipe.notes} />
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  )
}
