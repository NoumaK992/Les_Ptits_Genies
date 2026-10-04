import * as React from 'react'
import { cn } from '@/lib/cn'

export const classesCarte = 'bg-papier border-2 border-encre rounded-2xl shadow-dur'

export const Carte = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn(classesCarte, className)} {...props} />,
)
Carte.displayName = 'Carte'
