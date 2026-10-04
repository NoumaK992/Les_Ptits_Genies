import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/cn'

export type EtatMot = 'normal' | 'selectionne' | 'juste' | 'faux'

const FONDS: Record<EtatMot, string> = {
  normal: 'bg-papier hover:bg-jaune/40',
  selectionne: 'bg-jaune -translate-y-0.5 shadow-dur',
  juste: 'bg-juste',
  faux: 'bg-faux',
}

const ANIMATIONS = {
  normal: { scale: 1, x: 0 },
  selectionne: { scale: 1, x: 0 },
  juste: { scale: [1, 1.12, 1], x: 0 },
  faux: { scale: 1, x: [0, -6, 6, -4, 4, 0] },
}

const ICONES: Partial<Record<EtatMot, { signe: string; lu: string }>> = {
  juste: { signe: '✓', lu: 'bonne réponse' },
  faux: { signe: '✗', lu: 'mauvaise réponse' },
}

interface BoutonMotProps {
  children: ReactNode
  etat?: EtatMot
  onClick?: () => void
  disabled?: boolean
  className?: string
  'aria-label'?: string
}

export function BoutonMot({ children, etat = 'normal', onClick, disabled, className, ...aria }: BoutonMotProps) {
  const icone = ICONES[etat]
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={etat === 'selectionne'}
      animate={ANIMATIONS[etat]}
      transition={{ duration: 0.4 }}
      className={cn(
        'inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-encre px-4 py-2',
        'font-texte text-lg font-semibold text-encre shadow-dur-sm transition-colors',
        'focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-bleu',
        'disabled:cursor-default',
        FONDS[etat],
        className,
      )}
      {...aria}
    >
      {children}
      {icone && (
        <>
          <span aria-hidden="true" className="font-titre">{icone.signe}</span>
          <span className="sr-only">({icone.lu})</span>
        </>
      )}
    </motion.button>
  )
}
