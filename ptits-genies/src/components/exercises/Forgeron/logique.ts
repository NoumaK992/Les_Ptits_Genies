// Logique pure du Forgeron de mots (sans React).

export interface MotForgeron {
  id: string
  mot: string
  syllabes: string[]
  leurres: string[]
}

export type NiveauForgeron = 1 | 2 | 3

export interface Tuile {
  cle: string
  texte: string
  leurre: boolean
}

/** Positions des coupures attendues : « ta-ble » → [2]. */
export function positionsAttendues(syllabes: readonly string[]): number[] {
  const positions: number[] = []
  let p = 0
  for (const s of syllabes.slice(0, -1)) {
    p += [...s].length
    positions.push(p)
  }
  return positions
}

/** La découpe est juste si l'élève a posé exactement les coupures attendues. */
export function decoupeJuste(coupures: readonly number[], syllabes: readonly string[]): boolean {
  const attendues = positionsAttendues(syllabes)
  return coupures.length === attendues.length && attendues.every((p) => coupures.includes(p))
}

/** Syllabes découpées selon les coupures de l'élève (pour lui montrer ce qu'il a fait). */
export function decouper(mot: string, coupures: readonly number[]): string[] {
  const lettres = [...mot]
  const bornes = [0, ...[...coupures].sort((a, b) => a - b), lettres.length]
  return bornes.slice(0, -1).map((debut, k) => lettres.slice(debut, bornes[k + 1]).join(''))
}

export function melanger<T>(liste: readonly T[], alea: () => number = Math.random): T[] {
  const a = [...liste]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(alea() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Tuiles de la forge : bonnes syllabes + leurres, mélangées. */
export function tuilesDe(item: MotForgeron, alea: () => number = Math.random): Tuile[] {
  return melanger(
    [
      ...item.syllabes.map((texte, k) => ({ cle: `s${k}`, texte, leurre: false })),
      ...item.leurres.map((texte, k) => ({ cle: `l${k}`, texte, leurre: true })),
    ],
    alea,
  )
}

/** Le mot est reconstruit si les tuiles choisies, dans l'ordre, redonnent les syllabes. */
export function forgeJuste(textes: readonly string[], syllabes: readonly string[]): boolean {
  return textes.length === syllabes.length && textes.every((t, k) => t === syllabes[k])
}

export const MOTS_PAR_PARTIE: Record<NiveauForgeron, number> = { 1: 10, 2: 10, 3: 8 }
const POINTS_PAR_REUSSITE = 50
const MULTIPLICATEUR: Record<NiveauForgeron, number> = { 1: 1, 2: 1.5, 3: 2.5 }

/** Score : 50 points par réussite (découpe ou forge), multiplié selon le niveau. */
export function scoreForgeron(reussites: number, niveau: NiveauForgeron): number {
  return Math.round(reussites * POINTS_PAR_REUSSITE * MULTIPLICATEUR[niveau])
}

export function etoilesForgeron(taux: number): 0 | 1 | 2 | 3 {
  if (taux >= 0.9) return 3
  if (taux >= 0.7) return 2
  if (taux >= 0.4) return 1
  return 0
}
