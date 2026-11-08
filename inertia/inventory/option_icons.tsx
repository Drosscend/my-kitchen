import { SnowflakeIcon } from 'lucide-react'
import { isCategory } from '~/inventory/catalog'
import { CategoryMark } from '~/inventory/category_mark'

export function categoryIcon(value: string) {
  return isCategory(value) ? <CategoryMark category={value} size="xs" /> : null
}

export function stateIcon(value: string) {
  return value === 'frozen' ? <SnowflakeIcon className="size-4 text-primary" /> : null
}
