import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bouton, classesBouton } from './Bouton'
import { Carte } from './Carte'
import { Etiquette } from './Etiquette'

interface EcranFinProps {
  titre: string
  score?: ReactNode
  detail?: ReactNode
  etoiles?: 0 | 1 | 2 | 3
  onRejouer?: () => void
  retourVers?: string
  children?: ReactNode
}

export function EcranFin({ titre, score, detail, etoiles, onRejouer, retourVers = '/exercices', children }: EcranFinProps) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mx-auto w-full max-w-xl">
      <Carte className="p-6 text-center md:p-8">
        <Etiquette>Terminé</Etiquette>
        <h2 className="mt-4 font-titre text-3xl leading-tight text-encre md:text-4xl">{titre}</h2>
        {etoiles !== undefined && (
          <p className="mt-4 text-5xl tracking-widest" aria-label={`${etoiles} étoile${etoiles > 1 ? 's' : ''} sur 3`}>
            {[1, 2, 3].map((n) => (
              <span key={n} aria-hidden="true" className={n <= etoiles ? 'etoile text-jaune' : 'etoile text-sable'}>★</span>
            ))}
          </p>
        )}
        {score !== undefined && <p className="mt-4 font-titre text-5xl text-encre">{score}</p>}
        {detail && <p className="mt-2 text-encre-doux">{detail}</p>}
        {children && <div className="mt-6 text-left">{children}</div>}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {onRejouer && <Bouton onClick={onRejouer}>Rejouer</Bouton>}
          <Link to={retourVers} className={classesBouton('secondaire')}>Retour</Link>
        </div>
      </Carte>
    </motion.div>
  )
}
