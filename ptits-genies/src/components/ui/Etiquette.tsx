import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

const FONDS = { jaune: 'bg-jaune', 'rose-pale': 'bg-rose-pale', bleu: 'bg-bleu' } as const

interface EtiquetteProps {
  children: ReactNode
  couleur?: keyof typeof FONDS
  className?: string
}

export function Etiquette({ children, couleur = 'jaune', className }: EtiquetteProps) {
  return (
    <span
      className={cn(
        'inline-block -rotate-2 border-[3px] border-encre px-3 py-1 font-titre text-sm uppercase tracking-wide text-encre shadow-dur-sm',
        FONDS[couleur],
        className,
      )}
    >
      {children}
    </span>
  )
}
