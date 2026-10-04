// Le Labyrinthe (format CBM-Maze) : types et fonctions pures, sans React.

/** Un carrefour : le bon mot et deux leurres [grammaticalement impossible, absurde pour le sens]. */
export interface Carrefour {
  bonne: string
  leurres: [string, string]
}

export type Segment = string | Carrefour

export interface TexteLabyrinthe {
  id: string
  titre: string
  genre: string
  segments: Segment[]
  question: { enonce: string; choix: string[]; bonne: number }
}

export type NiveauLabyrinthe = 1 | 2 | 3

/** Un choix proposé à un carrefour. `type` dit quel genre d'erreur ce choix représente. */
export interface ChoixCarrefour {
  mot: string
  type: 'bonne' | 'grammaire' | 'sens'
}

/** Réponse donnée à un carrefour. */
export interface ReponseCarrefour {
  choisi: ChoixCarrefour
  bonne: string
}

export function estCarrefour(s: Segment): s is Carrefour {
  return typeof s !== 'string'
}

export function melanger<T>(tableau: readonly T[]): T[] {
  const a = [...tableau]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Les 3 choix de chaque carrefour, dans un ordre mélangé (une fois pour toute la partie). */
export function preparerChoix(texte: TexteLabyrinthe): ChoixCarrefour[][] {
  return texte.segments.filter(estCarrefour).map((c) =>
    melanger<ChoixCarrefour>([
      { mot: c.bonne, type: 'bonne' },
      { mot: c.leurres[0], type: 'grammaire' },
      { mot: c.leurres[1], type: 'sens' },
    ]),
  )
}

export function nombreCarrefours(texte: TexteLabyrinthe): number {
  return texte.segments.filter(estCarrefour).length
}

// Durées de référence d'une partie (lecture + clics + question), en secondes.
const DUREE_IDEALE: Record<NiveauLabyrinthe, number> = { 1: 150, 2: 210, 3: 300 }
const MULTIPLICATEUR: Record<NiveauLabyrinthe, number> = { 1: 1, 2: 1.5, 3: 2.2 }

/**
 * Score du même ordre que les autres jeux (quelques centaines à ~1 800 points) :
 * 600 points × taux de réussite, + bonus de temps (200 max) seulement si au moins la moitié est juste,
 * le tout multiplié selon le niveau.
 */
export function calcLabyrintheScore(params: { bonnes: number; total: number; secondes: number; niveau: NiveauLabyrinthe }): number {
  const { bonnes, total, secondes, niveau } = params
  if (total <= 0) return 0
  const taux = Math.max(0, Math.min(1, bonnes / total))
  const ideale = DUREE_IDEALE[niveau]
  const facteurTemps = secondes <= ideale ? 1 : Math.max(0, (2 * ideale - secondes) / ideale)
  const bonusTemps = taux >= 0.5 ? Math.round(200 * facteurTemps * taux) : 0
  return Math.round((600 * taux + bonusTemps) * MULTIPLICATEUR[niveau])
}

export function calcLabyrintheEtoiles(taux: number): 0 | 1 | 2 | 3 {
  if (taux >= 0.9) return 3
  if (taux >= 0.75) return 2
  if (taux >= 0.5) return 1
  return 0
}
