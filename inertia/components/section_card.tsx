import { type ReactNode } from 'react'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '~/components/ui/card'

interface SectionCardProps {
  title: string
  action?: ReactNode
  children: ReactNode
}

export function SectionCard({ title, action, children }: SectionCardProps) {
  return (
    <Card className="kraft-card gap-5 py-5">
      <CardHeader className="px-5">
        <CardTitle className="kraft-title text-lg font-bold">{title}</CardTitle>
        {action && <CardAction>{action}</CardAction>}
      </CardHeader>
      <CardContent className="space-y-4 px-5">{children}</CardContent>
    </Card>
  )
}
