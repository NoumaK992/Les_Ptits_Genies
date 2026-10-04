// Règles du parcours (sous-projet B) : fonctions pures, sans React ni Supabase.
// Testées par `npm test` (node --test). Voir docs/superpowers/specs/2026-10-04-parcours-design.md
// (la « Révision 1 » prime : entraînement en plusieurs parties, boss, lecture de fin de niveau).

export type JeuParcours =
  | 'lecture-rapide' | 'intrus' | 'coup-doeil' | 'word-search'
  | 'phrases-brouillees' | 'collection' | 'ami-ennemi'
  | 'vrai-absurde' | 'forgeron' | 'labyrinthe' | 'coupe-mots' | 'racines'
/** jeu = entraînement (plusieurs parties), boss, lecture = Lecture rapide de fin de niveau. */
export type EtapeParcours = 'jeu' | 'boss' | 'lecture'
export type EvenementParcours =
  | 'partie-terminee' | 'jeu-termine' | 'boss-battu' | 'boss-rate' | 'niveau-termine' | 'parcours-termine'

export interface EtatParcours {
  groupe: string
  place: number
  niveau: number
  etape: EtapeParcours
  echecsBoss: number
  /** Parties d'entraînement déjà faites dans le niveau en cours. */
  partiesFaites: number
  /** Date locale (AAAA-MM-JJ) du dernier niveau validé : un seul niveau par jour. */
  niveauValideLe: string | null
  /** Boss battus après au moins un échec (succès « Persévérant »). */
  bossApresEchec: number
  /** Une séance = deux jeux : manche 0 (1er jeu) puis manche 1 (2e jeu), avant la lecture. */
  manche: 0 | 1
}

export const NB_NIVEAUX = 20
export const NIVEAU_TERMINE = NB_NIVEAUX + 1
export const BONUS_BOSS = 500

// Jeux d'entraînement en rotation. Lecture rapide n'y est plus : elle clôt chaque niveau.
// 11 jeux : à chaque étape, les 8 élèves d'un groupe jouent 8 jeux différents.
// Les nouveaux jeux (issus de la recherche sur la fluence) sont intercalés pour varier les compétences.
export const JEUX_ROTATION: readonly JeuParcours[] = [
  'intrus', 'vrai-absurde', 'coup-doeil', 'forgeron', 'word-search',
  'labyrinthe', 'phrases-brouillees', 'coupe-mots', 'collection', 'racines', 'ami-ennemi',
]

// Nombre de parties de l'entraînement, calibré pour environ 5 minutes (deux jeux par séance).
export const PARTIES_PAR_JEU: Record<JeuParcours, number> = {
  intrus: 1,
  'coup-doeil': 1,
  'word-search': 1,
  'phrases-brouillees': 3,
  collection: 2,
  'ami-ennemi': 2,
  'lecture-rapide': 1,
  'vrai-absurde': 1,
  forgeron: 1,
  labyrinthe: 1,
  'coupe-mots': 1,
  racines: 1,
}

export const DIFFICULTE_MAX: Record<JeuParcours, number> = {
  'lecture-rapide': 4, intrus: 4, 'coup-doeil': 4, 'word-search': 1,
  'phrases-brouillees': 3, collection: 3, 'ami-ennemi': 3,
  'vrai-absurde': 3, forgeron: 3, labyrinthe: 3, 'coupe-mots': 3, racines: 3,
}

export const ROUTES_JEUX: Record<JeuParcours, string> = {
  'lecture-rapide': '/exercices/lecture-rapide',
  intrus: '/exercices/intrus',
  'coup-doeil': '/exercices/coup-doeil',
  'word-search': '/exercices/recherche-mots',
  'phrases-brouillees': '/exercices/phrases-brouillees',
  collection: '/exercices/collection-mots',
  'ami-ennemi': '/exercices/ami-et-ennemi',
  'vrai-absurde': '/exercices/vrai-ou-absurde',
  'forgeron': '/exercices/forgeron',
  'labyrinthe': '/exercices/labyrinthe',
  'coupe-mots': '/exercices/coupe-mots',
  racines: '/exercices/racines',
}

export const NOMS_JEUX: Record<JeuParcours, string> = {
  'lecture-rapide': '⚡ Lecture rapide',
  intrus: "🕵️ L'Intrus",
  'coup-doeil': "👁️ Coup d'œil",
  'word-search': '🔍 Mots cachés',
  'phrases-brouillees': '🧩 Phrases brouillées',
  collection: '🗂️ Collection',
  'ami-ennemi': '🎯 Ami et Ennemi',
  'vrai-absurde': '⚖️ Vrai ou Absurde ?',
  'forgeron': '🔨 Le Forgeron de mots',
  'labyrinthe': '🧭 Le Labyrinthe',
  'coupe-mots': '✂️ Coupe-Mots',
  racines: '🌳 Les Racines',
}

// Étape globale k = (niveau − 1) × 2 + manche : chaque élève parcourt tous les jeux avant d'en refaire un,
// et à une étape donnée les places jouent des jeux différents.
export function jeuDuNiveau(place: number, niveau: number, manche: 0 | 1 = 0): JeuParcours {
  const k = (niveau - 1) * 2 + manche
  return JEUX_ROTATION[((place - 1) + k) % JEUX_ROTATION.length]
}

/** Jeu à lancer pour l'étape en cours : celui de la manche, ou Lecture rapide pour la lecture de fin de niveau. */
export function jeuDeLEtape(etat: EtatParcours): JeuParcours {
  return etat.etape === 'lecture' ? 'lecture-rapide' : jeuDuNiveau(etat.place, etat.niveau, etat.manche)
}

export function tourDuNiveau(niveau: number): 1 | 2 | 3 {
  return niveau <= 8 ? 1 : niveau <= 16 ? 2 : 3
}

export function difficulte(jeu: JeuParcours, niveau: number, etape: EtapeParcours): number {
  return Math.min(tourDuNiveau(niveau) + (etape === 'boss' ? 1 : 0), DIFFICULTE_MAX[jeu])
}

export function seuilBoss(echecs: number): number {
  return echecs <= 0 ? 0.6 : echecs === 1 ? 0.5 : 0.4
}

export function lireCode(code: string): { groupe: string; place: number } | null {
  const m = /^\s*([A-Za-z])([1-8])\s*$/.exec(code)
  return m ? { groupe: m[1].toUpperCase(), place: Number(m[2]) } : null
}

export function estTermine(etat: EtatParcours): boolean {
  return etat.niveau >= NIVEAU_TERMINE
}

/**
 * Un niveau par jour : le niveau validé aujourd'hui ferme le suivant jusqu'au lendemain.
 * On ne verrouille qu'un niveau pas encore commencé (pas de blocage en plein milieu).
 */
export function estVerrouille(etat: EtatParcours, aujourdhui: string): boolean {
  return !estTermine(etat)
    && etat.etape === 'jeu'
    && etat.manche === 0
    && etat.partiesFaites === 0
    && etat.niveauValideLe === aujourdhui
}

export function appliquerResultat(
  etat: EtatParcours,
  reussite: number,
  aujourdhui: string,
): { etat: EtatParcours; evenement: EvenementParcours } {
  if (estTermine(etat)) throw new Error('Parcours déjà terminé')

  if (etat.etape === 'jeu') {
    const parties = etat.partiesFaites + 1
    if (parties < PARTIES_PAR_JEU[jeuDuNiveau(etat.place, etat.niveau, etat.manche)]) {
      return { etat: { ...etat, partiesFaites: parties }, evenement: 'partie-terminee' }
    }
    return { etat: { ...etat, etape: 'boss', partiesFaites: 0, echecsBoss: 0 }, evenement: 'jeu-termine' }
  }

  if (etat.etape === 'boss') {
    // Petite tolérance : 3/5 doit valoir 60 % malgré les arrondis des flottants.
    if (reussite + 1e-9 >= seuilBoss(etat.echecsBoss)) {
      const commun = { ...etat, echecsBoss: 0, bossApresEchec: etat.bossApresEchec + (etat.echecsBoss > 0 ? 1 : 0) }
      // 1re manche : on passe au 2e jeu de la séance ; 2e manche : lecture de fin de niveau.
      return {
        etat: etat.manche === 0
          ? { ...commun, manche: 1, etape: 'jeu', partiesFaites: 0 }
          : { ...commun, etape: 'lecture' },
        evenement: 'boss-battu',
      }
    }
    return { etat: { ...etat, echecsBoss: etat.echecsBoss + 1 }, evenement: 'boss-rate' }
  }

  // Lecture de fin de niveau : elle ne bloque pas, le niveau est validé.
  const niveau = etat.niveau + 1
  return {
    etat: { ...etat, niveau, manche: 0, etape: 'jeu', partiesFaites: 0, echecsBoss: 0, niveauValideLe: aujourdhui },
    evenement: niveau >= NIVEAU_TERMINE ? 'parcours-termine' : 'niveau-termine',
  }
}

export function tauxReussite(bons: number, total: number): number {
  if (total <= 0) return 1
  return Math.max(0, Math.min(1, bons / total))
}

// Le niveau voyage dans l'adresse : une page de jeu retrouvée avec « Précédent »
// ou l'historique ne doit pas pouvoir valider l'étape d'un autre niveau.
export function lienPartie(etat: EtatParcours): string {
  const jeu = jeuDeLEtape(etat)
  return `${ROUTES_JEUX[jeu]}?parcours=${etat.etape}&d=${difficulte(jeu, etat.niveau, etat.etape)}&n=${etat.niveau}`
}

/** Partie lancée depuis le parcours, telle que décrite par son adresse. */
export interface PartieParcours {
  etape: EtapeParcours
  niveau: number
  jeu: JeuParcours
}

// Une partie ne fait avancer le parcours que si elle correspond exactement à l'étape en cours.
export function partieValide(etat: EtatParcours, partie: PartieParcours): boolean {
  return !estTermine(etat)
    && etat.etape === partie.etape
    && etat.niveau === partie.niveau
    && jeuDeLEtape(etat) === partie.jeu
}

/** Date locale du jour au format AAAA-MM-JJ (le verrou « un niveau par jour » suit l'heure de l'ordinateur). */
export function dateDuJour(maintenant: Date = new Date()): string {
  const deux = (n: number) => String(n).padStart(2, '0')
  return `${maintenant.getFullYear()}-${deux(maintenant.getMonth() + 1)}-${deux(maintenant.getDate())}`
}

// Lecture rapide : difficulté → longueur du texte et index de vitesse (SpeedPicker : 45, 70, 100, 140, 200 mpm).
export function parametresLecture(d: number): { niveau: 1 | 2; vitesse: number } {
  const table = [
    { niveau: 1, vitesse: 1 },
    { niveau: 2, vitesse: 1 },
    { niveau: 2, vitesse: 2 },
    { niveau: 2, vitesse: 3 },
  ] as const
  return table[Math.min(Math.max(d, 1), 4) - 1]
}

export function niveauAmiEnnemi(d: number): 'debutant' | 'intermediaire' | 'professionnel' {
  return (['debutant', 'intermediaire', 'professionnel'] as const)[Math.min(Math.max(d, 1), 3) - 1]
}

/**
 * Points d'une partie d'entraînement libre : bien moins qu'en parcours, et dégressifs
 * pour qu'on ne puisse pas « farmer » le même jeu (1re partie libre du jour 20 %, 2e 10 %, ensuite 0).
 */
export const TAUX_LIBRE = [0.2, 0.1] as const

export function pointsLibres(score: number, partiesLibresDejaFaitesAujourdhui: number): number {
  const taux = TAUX_LIBRE[partiesLibresDejaFaitesAujourdhui] ?? 0
  return Math.max(0, Math.round(score * taux))
}

/**
 * Une partie lancée depuis une adresse de parcours ne rapporte le plein tarif que si elle est
 * exactement l'étape attendue (même niveau, même étape, même jeu) et que le niveau n'est pas
 * verrouillé : une page retrouvée avec « Précédent » est payée au tarif du jeu libre.
 */
export function pleinTarif(etat: EtatParcours | null, partie: PartieParcours, aujourdhui: string): boolean {
  return !!etat && partieValide(etat, partie) && !estVerrouille(etat, aujourdhui)
}
