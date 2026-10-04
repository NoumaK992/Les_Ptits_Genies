// Logique pure de Coupe-Mots (sans React), réutilisée par le script de vérification du contenu.
//
// Règle des apostrophes : l'apostrophe reste collée au petit mot qui la précède
// (l', d', j', qu'…) et on coupe JUSTE APRÈS elle : « l'école » se coupe en « l' | école ».
// La phrase corrigée s'affiche ensuite normalement : « l'école ».

export interface PhraseCoupeMots {
  id: string
  mots: string[]
}

/** Découpe chaque mot après ses apostrophes : ["l'école"] → ["l'", "école"]. */
export function morceaux(mots: readonly string[]): string[] {
  return mots.flatMap((mot) => mot.split(/(?<=['’])/).filter((m) => m.length > 0))
}

/** Les lettres de la phrase collée, apostrophes comprises. */
export function lettresCollees(mots: readonly string[]): string[] {
  return Array.from(morceaux(mots).join(''))
}

/**
 * Positions des coupures attendues. Une coupure d'indice i se place entre la lettre i
 * et la lettre i + 1 ; les indices vont donc de 0 à (nombre de lettres − 2).
 */
export function coupuresAttendues(mots: readonly string[]): number[] {
  const positions: number[] = []
  let fin = 0
  const parties = morceaux(mots)
  parties.forEach((partie, i) => {
    fin += Array.from(partie).length
    if (i < parties.length - 1) positions.push(fin - 1)
  })
  return positions
}

export interface Correction {
  /** Coupures bien placées. */
  justes: number[]
  /** Coupures posées à un endroit où il n'en fallait pas. */
  enTrop: number[]
  /** Coupures attendues que l'élève n'a pas posées. */
  oubliees: number[]
  /** Toutes les coupures sont exactes, sans aucune en trop. */
  parfaite: boolean
}

export function corriger(mots: readonly string[], posees: Iterable<number>): Correction {
  const attendues = new Set(coupuresAttendues(mots))
  const eleve = new Set(posees)
  const justes = [...eleve].filter((p) => attendues.has(p)).sort((a, b) => a - b)
  const enTrop = [...eleve].filter((p) => !attendues.has(p)).sort((a, b) => a - b)
  const oubliees = [...attendues].filter((p) => !eleve.has(p)).sort((a, b) => a - b)
  return { justes, enTrop, oubliees, parfaite: enTrop.length === 0 && oubliees.length === 0 }
}

/** Points de la partie : précision sur les coupures + bonus par phrase parfaite, multiplié par le niveau. */
export function calculerScore(taux: number, phrasesParfaites: number, niveau: 1 | 2 | 3): number {
  const multiplicateur = { 1: 1, 2: 1.4, 3: 1.8 }[niveau]
  return Math.round((500 * taux + 30 * phrasesParfaites) * multiplicateur)
}

export function calculerEtoiles(taux: number): 0 | 1 | 2 | 3 {
  if (taux >= 0.9) return 3
  if (taux >= 0.75) return 2
  if (taux >= 0.5) return 1
  return 0
}
