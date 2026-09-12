import { AlertTriangleIcon, ClipboardListIcon, LeafIcon, SnowflakeIcon } from 'lucide-react'
import { type ReactNode } from 'react'
import { type Ingredient } from '~/inventory/catalog'

function Stat({ icon, value, label }: { icon: ReactNode; value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-lg bg-paper-light p-3">
      {icon}
      <span className="kraft-title text-lg font-bold">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}

export function StatsSummary({ ingredients }: { ingredients: Ingredient[] }) {
  return (
    <div className="grid grid-cols-4 gap-3">
      <Stat
        icon={<ClipboardListIcon className="size-5 text-primary" />}
        value={ingredients.length}
        label="Ingrédients"
      />
      <Stat
        icon={<LeafIcon className="size-5 text-secondary" />}
        value={ingredients.filter((ingredient) => ingredient.perishable).length}
        label="Périssables"
      />
      <Stat
        icon={<AlertTriangleIcon className="size-5 text-destructive" />}
        value={ingredients.filter((ingredient) => ingredient.lowStock).length}
        label="Stock bas"
      />
      <Stat
        icon={<SnowflakeIcon className="size-5 text-accent" />}
        value={ingredients.filter((ingredient) => ingredient.state === 'frozen').length}
        label="Congelés"
      />
    </div>
  )
}
