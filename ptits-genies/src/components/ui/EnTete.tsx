import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { Bouton, classesBouton } from './Bouton'

interface EnTeteProps {
  titre: string
  retourVers?: string
  onRetour?: () => void
  droite?: ReactNode
}

export function EnTete({ titre, retourVers = '/exercices', onRetour, droite }: EnTeteProps) {
  return (
    <header className="mb-6 flex flex-wrap items-center gap-3">
      {onRetour ? (
        <Bouton variante="discret" onClick={onRetour} className="px-2">← Retour</Bouton>
      ) : (
        <Link to={retourVers} className={cn(classesBouton('discret'), 'px-2')}>← Retour</Link>
      )}
      <h1 className="flex-1 font-titre text-2xl leading-tight text-encre md:text-3xl">{titre}</h1>
      {droite && <div className="flex items-center gap-2">{droite}</div>}
    </header>
  )
}
