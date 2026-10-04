import { useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { ROUTES_JEUX, type JeuParcours, type PartieParcours } from './regles'

export interface ModeParcours extends PartieParcours {
  difficulte: number
  /** Identifiant propre à cette partie : le store ne la comptera qu'une fois (double clic, double appel). */
  idPartie: string
}

// Lit `?parcours=jeu|boss&d=N&n=NIVEAU` : présent quand le jeu est lancé depuis « Mon parcours ».
// Absent (null) en jeu libre : le jeu garde alors son fonctionnement habituel.
export function useModeParcours(): ModeParcours | null {
  const [params] = useSearchParams()
  const { pathname } = useLocation()
  const [idPartie] = useState(() => `${Date.now()}-${Math.random().toString(36).slice(2)}`)
  const etape = params.get('parcours')
  const difficulte = Number(params.get('d'))
  const niveau = Number(params.get('n'))
  const jeu = (Object.keys(ROUTES_JEUX) as JeuParcours[]).find((j) => ROUTES_JEUX[j] === pathname)
  if ((etape !== 'jeu' && etape !== 'boss') || !jeu) return null
  if (!Number.isInteger(difficulte) || difficulte < 1 || !Number.isInteger(niveau) || niveau < 1) return null
  return { etape, difficulte, niveau, jeu, idPartie }
}
