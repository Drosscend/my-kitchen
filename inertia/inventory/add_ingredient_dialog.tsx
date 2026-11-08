import { PlusIcon } from 'lucide-react'
import { DialogSheet } from '~/components/dialog_sheet'
import { Button } from '~/components/ui/button'
import { Dialog, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog'
import { type Catalog } from '~/inventory/catalog'
import { IngredientForm } from '~/inventory/ingredient_form'

export function AddIngredientDialog({ catalog }: { catalog: Catalog }) {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button size="lg">
            <PlusIcon data-icon="inline-start" />
            Ajouter
          </Button>
        }
      />
      <DialogSheet className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold">Ajouter un ingrédient</DialogTitle>
        </DialogHeader>
        <IngredientForm catalog={catalog} />
      </DialogSheet>
    </Dialog>
  )
}
