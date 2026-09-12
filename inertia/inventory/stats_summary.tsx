import { AlertTriangleIcon, ClipboardListIcon, LeafIcon, SnowflakeIcon } from 'lucide-react'
import { type ReactNode } from 'react'
import { type Ingredient } from '~/inventory/catalog'

function Stat({ icon, value, label }: { icon: ReactNode; value: number; label: string }) {
  return (
    <div className="kraft-card flex items-center gap-4 rounded-lg px-5 py-4">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-paper-light">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="kraft-title text-3xl leading-none font-bold">{value}</p>
        <p className="mt-1 text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

export function StatsSummary({ ingredients }: { ingredients: Ingredient[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
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
