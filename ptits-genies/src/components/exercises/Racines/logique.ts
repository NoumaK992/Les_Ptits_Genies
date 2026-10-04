// Logique pure des Racines (sans React).
import { melanger, positionsAttendues } from '@/components/exercises/Forgeron/logique'

export type NiveauRacines = 1 | 2 | 3

export interface FamilleRacine {
  id: string
  racine: string
  sens?: string
  membres: string[]
  intrus: string[]
  explications: Record<string, string>
}

export interface DecoupeRacine {
  id: string
  mot: string
  morceaux: string[]
  sens: string[]
  leurres: string[]
}

export const FAMILLES_PAR_PARTIE = 4
export const DECOUPES_PAR_PARTIE = 4

/** Grille d'une famille : membres et intrus mélangés. */
export function grilleDe(famille: FamilleRacine, alea: () => number = Math.random): string[] {
  return melanger([...famille.membres, ...famille.intrus], alea)
}

export interface CorrectionFamille {
  trouves: string[]
  oublies: string[]
  intrusCliques: string[]
  intrusEvites: string[]
}

/** Deux mesures séparées : membres trouvés et intrus évités (cliquer tout ne rapporte pas tout). */
export function corrigerFamille(famille: FamilleRacine, selection: readonly string[]): CorrectionFamille {
  const choisis = new Set(selection)
  return {
    trouves: famille.membres.filter((m) => choisis.has(m)),
    oublies: famille.membres.filter((m) => !choisis.has(m)),
    intrusCliques: famille.intrus.filter((m) => choisis.has(m)),
    intrusEvites: famille.intrus.filter((m) => !choisis.has(m)),
  }
}

/** Positions des coupures attendues : « in|cass|able » → [2, 6]. */
export function coupuresAttendues(morceaux: readonly string[]): number[] {
  return positionsAttendues(morceaux)
}

/**
 * Nombre de morceaux « justement coupés » : un morceau compte s'il est délimité par
 * les bonnes coupures (ou le bord du mot) et qu'aucune coupure en trop ne le traverse.
 */
export function morceauxBienCoupes(coupures: readonly number[], morceaux: readonly string[]): number {
  const posees = new Set(coupures)
  let debut = 0
  let justes = 0
  const longueur = morceaux.reduce((n, m) => n + [...m].length, 0)
  for (const m of morceaux) {
    const fin = debut + [...m].length
    const bordGauche = debut === 0 || posees.has(debut)
    const bordDroit = fin === longueur || posees.has(fin)
    let traverse = false
    for (let p = debut + 1; p < fin; p++) if (posees.has(p)) traverse = true
    if (bordGauche && bordDroit && !traverse) justes++
    debut = fin
  }
  return justes
}

/** Étiquettes de sens proposées : bons sens + leurres, mélangés. */
export function etiquettesDe(decoupe: DecoupeRacine, alea: () => number = Math.random): string[] {
  return melanger([...decoupe.sens, ...decoupe.leurres], alea)
}

/** Nombre de morceaux associés à leur bon sens. `choix[k]` = étiquette choisie pour le morceau k. */
export function sensJustes(decoupe: DecoupeRacine, choix: readonly (string | null)[]): number {
  return decoupe.sens.filter((s, k) => choix[k] === s).length
}

const POINTS_PAR_BONNE = 18
const MULTIPLICATEUR: Record<NiveauRacines, number> = { 1: 1, 2: 1.2, 3: 1.35 }

/** Score : 18 points par bonne réponse (membre, intrus évité, morceau coupé, sens), selon le niveau. */
export function scoreRacines(bonnes: number, niveau: NiveauRacines): number {
  return Math.round(bonnes * POINTS_PAR_BONNE * MULTIPLICATEUR[niveau])
}

export function etoilesRacines(taux: number): 0 | 1 | 2 | 3 {
  if (taux >= 0.9) return 3
  if (taux >= 0.7) return 2
  if (taux >= 0.4) return 1
  return 0
}
