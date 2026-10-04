import { useSearchParams } from 'react-router-dom'
import type { EtapeParcours } from './regles'

// Lit `?parcours=jeu|boss&d=N` : présent quand le jeu est lancé depuis « Mon parcours ».
// Absent (null) en jeu libre : le jeu garde alors son fonctionnement habituel.
export function useModeParcours(): { etape: EtapeParcours; difficulte: number } | null {
  const [params] = useSearchParams()
  const etape = params.get('parcours')
  const d = Number(params.get('d'))
  if ((etape !== 'jeu' && etape !== 'boss') || !Number.isInteger(d) || d < 1) return null
  return { etape, difficulte: d }
}
