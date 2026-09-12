import { Form } from '@adonisjs/inertia/react'
import { ClipboardIcon, CookingPotIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '~/components/ui/button'
import { Card, CardContent } from '~/components/ui/card'
import { formatIngredient, formatRecipeText, ingredientsByRef } from '~/recipes/format'
import { NotesRenderer } from '~/recipes/notes_renderer'
import { RecipeStepDisplay } from '~/recipes/recipe_step'
import { ServingsControl } from '~/recipes/servings_control'
import { type Recipe } from '~/recipes/types'

function SectionTitle({ children }: { children: string }) {
  return (
    <h3 className="mb-3 text-sm font-medium tracking-wider text-muted-foreground uppercase">
      {children}
    </h3>
  )
}

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  const [scale, setScale] = useState(1)
  const [completed, setCompleted] = useState<string[]>([])
  const ingredients = ingredientsByRef(recipe.ingredients)

  function toggleStep(ref: string) {
    setCompleted((current) =>
      current.includes(ref) ? current.filter((item) => item !== ref) : [...current, ref]
    )
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(formatRecipeText(recipe, scale))
      toast.success('Recette copiée')
    } catch {
      toast.error('Impossible de copier')
    }
  }

  return (
    <Card className="kraft-card">
      <CardContent className="pt-4">
        <div className="mb-5">
          <h2 className="kraft-title text-2xl font-bold">{recipe.title}</h2>
          {recipe.description && (
            <p className="mt-1 text-base text-muted-foreground">{recipe.description}</p>
          )}
        </div>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <ServingsControl
            scale={scale}
            baseServings={recipe.baseServings}
            onScaleChange={setScale}
          />
          <div className="hidden flex-1 sm:block" />
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="icon" onClick={copy} aria-label="Copier la recette">
              <ClipboardIcon />
            </Button>
            {recipe.steps.length > 0 && (
              <Form route="recipes.cook" routeParams={{ id: recipe.id }}>
                {({ processing }) => (
                  <>
                    <input type="hidden" name="scale" value={scale} />
                    <Button type="submit" disabled={processing} className="ml-1">
                      <CookingPotIcon data-icon="inline-start" />
                      Cuisiner !
                    </Button>
                  </>
                )}
              </Form>
            )}
          </div>
        </div>

        {recipe.ingredients.length > 0 && (
          <section className="mb-8">
            <SectionTitle>Ingrédients</SectionTitle>
            <ul className="space-y-2 text-base leading-relaxed">
              {recipe.ingredients.map((ingredient) => (
                <li key={ingredient.ref} className="flex items-baseline gap-2">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent/60" />
                  <span>{formatIngredient(ingredient, scale)}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {recipe.steps.length > 0 && (
          <section className="mb-8">
            <SectionTitle>Étapes</SectionTitle>
            <div className="flex flex-col gap-4">
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
          <section className="mt-8 rounded-lg bg-background/50 p-5">
            <SectionTitle>Notes</SectionTitle>
            <div className="text-base leading-relaxed text-foreground/80">
              <NotesRenderer notes={recipe.notes} />
            </div>
          </section>
        )}
      </CardContent>
    </Card>
  )
}
