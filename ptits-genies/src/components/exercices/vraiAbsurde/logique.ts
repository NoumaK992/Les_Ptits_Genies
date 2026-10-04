// « Vrai ou Absurde ? » : règles du jeu (fonctions pures, sans React).

export interface PhraseVA {
  id: string
  phrase: string
  /** true : la phrase a du sens ; false : elle est absurde. */
  sens: boolean
  /** Phrase absurde : le mot qui la rend absurde (présent tel quel dans la phrase). */
  motPiege?: string
  /** Phrase absurde : la phrase corrigée. */
  correction?: string
}

export type NiveauVA = 1 | 2 | 3

/** Nombre de phrases par partie (environ 3 à 5 minutes : les phrases s'allongent avec le niveau). */
export const PHRASES_PAR_PARTIE: Record<NiveauVA, number> = { 1: 20, 2: 18, 3: 15 }

export const MULTIPLICATEUR: Record<NiveauVA, number> = { 1: 1, 2: 1.5, 3: 2 }

const POINTS_PAR_BONNE_REPONSE = 40 // aligné sur les autres jeux (≈ 800 à 1 400 points pour une partie parfaite)

export function melanger<T>(liste: readonly T[], alea: () => number = Math.random): T[] {
  const copie = [...liste]
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(alea() * (i + 1))
    ;[copie[i], copie[j]] = [copie[j], copie[i]]
  }
  return copie
}

/**
 * Compose une partie : moitié de phrases absurdes (à une près, au hasard), moitié sensées,
 * chacune choisie par `choisir` (anti-répétition), puis mélangées.
 */
export function composerPartie(
  pool: readonly PhraseVA[],
  n: number,
  choisir: (pool: readonly PhraseVA[], n: number) => PhraseVA[],
  alea: () => number = Math.random,
): PhraseVA[] {
  const nbAbsurdes = n % 2 === 0 ? n / 2 : Math.floor(n / 2) + (alea() < 0.5 ? 1 : 0)
  const absurdes = choisir(pool.filter((p) => !p.sens), nbAbsurdes)
  const sensees = choisir(pool.filter((p) => p.sens), n - absurdes.length)
  return melanger([...absurdes, ...sensees], alea)
}

export function calculerScore(bonnes: number, niveau: NiveauVA): number {
  return Math.round(bonnes * POINTS_PAR_BONNE_REPONSE * MULTIPLICATEUR[niveau])
}

export function calculerEtoiles(taux: number): 0 | 1 | 2 | 3 {
  if (taux >= 0.9) return 3
  if (taux >= 0.75) return 2
  if (taux >= 0.5) return 1
  return 0
}

/** Bonnes réponses par minute (indice d'efficience), arrondi au dixième. */
export function justesParMinute(bonnes: number, secondes: number): number {
  if (secondes <= 0) return 0
  return Math.round((bonnes / secondes) * 600) / 10
}

export interface Morceau {
  texte: string
  marque: boolean
}

const LETTRE = /[\p{L}\-]/u

function estMotEntier(texte: string, debut: number, longueur: number): boolean {
  const avant = debut > 0 ? texte[debut - 1] : ''
  const apres = texte[debut + longueur] ?? ''
  return !LETTRE.test(avant) && !LETTRE.test(apres)
}

/** Découpe la phrase pour mettre en valeur la première occurrence (mot entier) de `mot`. */
export function marquerMot(phrase: string, mot?: string): Morceau[] {
  if (!mot) return [{ texte: phrase, marque: false }]
  let i = phrase.indexOf(mot)
  while (i !== -1 && !estMotEntier(phrase, i, mot.length)) i = phrase.indexOf(mot, i + 1)
  if (i === -1) return [{ texte: phrase, marque: false }]
  return [
    { texte: phrase.slice(0, i), marque: false },
    { texte: mot, marque: true },
    { texte: phrase.slice(i + mot.length), marque: false },
  ].filter((m) => m.texte !== '')
}

const nettoyer = (mot: string) => mot.toLowerCase().replace(/^[^\p{L}\d]+|[^\p{L}\d]+$/gu, '')

/** Découpe la correction en mots, en marquant ceux qui n'existent pas dans la phrase absurde. */
export function marquerDifferences(phrase: string, correction: string): Morceau[] {
  const connus = new Set(phrase.split(/\s+/).map(nettoyer))
  return correction.split(/(\s+)/).flatMap((morceau): Morceau[] => {
    if (morceau.trim() === '' || connus.has(nettoyer(morceau))) return [{ texte: morceau, marque: false }]
    // La ponctuation collée au mot (virgule, point) reste hors du surlignage.
    const [, avant, mot, apres] = morceau.match(/^([^\p{L}\d]*)(.*?)([^\p{L}\d]*)$/u) ?? ['', '', morceau, '']
    return [
      { texte: avant, marque: false },
      { texte: mot, marque: true },
      { texte: apres, marque: false },
    ].filter((m) => m.texte !== '')
  })
}
