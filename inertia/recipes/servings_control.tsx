import { MinusIcon, PlusIcon } from 'lucide-react'
import { InputGroup, InputGroupAddon, InputGroupButton } from '~/components/ui/input-group'

interface ServingsControlProps {
  scale: number
  baseServings: number
  onScaleChange: (scale: number) => void
}

const MAX_SCALE = 10

export function ServingsControl({ scale, baseServings, onScaleChange }: ServingsControlProps) {
  const step = 1 / baseServings
  const servings = Math.round(scale * baseServings * 10) / 10

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Portions</span>
      <InputGroup className="w-auto">
        <InputGroupAddon align="inline-start">
          <InputGroupButton
            onClick={() => onScaleChange(Math.max(step, scale - step))}
            disabled={scale <= step}
            aria-label="Diminuer les portions"
          >
            <MinusIcon />
          </InputGroupButton>
        </InputGroupAddon>
        <span
          className="flex min-w-6 items-center justify-center px-2 text-center text-xs"
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {servings}
        </span>
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            onClick={() => onScaleChange(Math.min(MAX_SCALE, scale + step))}
            disabled={scale >= MAX_SCALE}
            aria-label="Augmenter les portions"
          >
            <PlusIcon />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}
