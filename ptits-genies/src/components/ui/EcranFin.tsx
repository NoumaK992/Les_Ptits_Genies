import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bouton, classesBouton } from './Bouton'
import { Carte } from './Carte'
import { Etiquette } from './Etiquette'
import { useProgressStore } from '@/store/progressStore'

interface EcranFinProps {
  titre: string
  score?: ReactNode
  detail?: ReactNode
  etoiles?: 0 | 1 | 2 | 3
  onRejouer?: () => void
  retourVers?: string
  /** Partie lancée depuis « Mon parcours » : un seul bouton pour y revenir. */
  parcours?: boolean
  children?: ReactNode
}

// Points réellement ajoutés au total : complets en parcours, réduits en entraînement libre.
function PointsGagnes({ parcours, pointsGagnes }: { parcours: boolean; pointsGagnes: number; score: number }) {
  if (parcours) {
    return <p className="mt-4 inline-block rounded-full border-2 border-encre bg-jaune px-4 py-1 font-bold text-encre">+{pointsGagnes} points</p>
  }
  return (
    <p className="mt-4 rounded-2xl border-2 border-encre bg-sable p-3 text-encre">
      {pointsGagnes > 0
        ? <>Entraînement libre : <strong>+{pointsGagnes} points</strong>. Le parcours en rapporte bien plus !</>
        : <>Plus de points pour ce jeu aujourd'hui en entraînement libre. Va voir ton parcours, ou essaie un autre jeu !</>}
    </p>
  )
}

export function EcranFin({ titre, score, detail, etoiles, onRejouer, retourVers = '/exercices', parcours, children }: EcranFinProps) {
  const dernierePartie = useProgressStore((s) => s.dernierePartie)
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
        {dernierePartie && <PointsGagnes {...dernierePartie} />}
        {children && <div className="mt-6 text-left">{children}</div>}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {parcours ? (
            <Link to="/parcours" className={classesBouton('principal', 'grand')}>Continuer mon parcours →</Link>
          ) : (
            <>
              {onRejouer && <Bouton onClick={onRejouer}>Rejouer</Bouton>}
              <Link to={retourVers} className={classesBouton('secondaire')}>Retour</Link>
            </>
          )}
        </div>
      </Carte>
    </motion.div>
  )
}
