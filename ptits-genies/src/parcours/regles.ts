// Règles du parcours (sous-projet B) : fonctions pures, sans React ni Supabase.
// Testées par `npm test` (node --test). Voir docs/superpowers/specs/2026-10-04-parcours-design.md.

export type JeuParcours =
  | 'lecture-rapide' | 'intrus' | 'coup-doeil' | 'word-search'
  | 'phrases-brouillees' | 'collection' | 'ami-ennemi'
export type EtapeParcours = 'jeu' | 'boss'
export type EvenementParcours = 'jeu-termine' | 'boss-battu' | 'boss-rate' | 'parcours-termine'

export interface EtatParcours {
  groupe: string
  place: number
  niveau: number
  etape: EtapeParcours
  echecsBoss: number
}

export const NB_NIVEAUX = 20
export const NIVEAU_TERMINE = NB_NIVEAUX + 1
export const BONUS_BOSS = 100

// L'emplacement 8 reprend Lecture rapide en attendant le 8e jeu (sous-projet C).
export const JEUX_ROTATION: readonly JeuParcours[] = [
  'lecture-rapide', 'intrus', 'coup-doeil', 'word-search',
  'phrases-brouillees', 'collection', 'ami-ennemi', 'lecture-rapide',
]

export const DIFFICULTE_MAX: Record<JeuParcours, number> = {
  'lecture-rapide': 4, intrus: 4, 'coup-doeil': 4, 'word-search': 1,
  'phrases-brouillees': 3, collection: 3, 'ami-ennemi': 3,
}

export const ROUTES_JEUX: Record<JeuParcours, string> = {
  'lecture-rapide': '/exercices/lecture-rapide',
  intrus: '/exercices/intrus',
  'coup-doeil': '/exercices/coup-doeil',
  'word-search': '/exercices/recherche-mots',
  'phrases-brouillees': '/exercices/phrases-brouillees',
  collection: '/exercices/collection-mots',
  'ami-ennemi': '/exercices/ami-et-ennemi',
}

export const NOMS_JEUX: Record<JeuParcours, string> = {
  'lecture-rapide': '⚡ Lecture rapide',
  intrus: "🕵️ L'Intrus",
  'coup-doeil': "👁️ Coup d'œil",
  'word-search': '🔍 Mots cachés',
  'phrases-brouillees': '🧩 Phrases brouillées',
  collection: '🗂️ Collection',
  'ami-ennemi': '🎯 Ami et Ennemi',
}

export function jeuDuNiveau(place: number, niveau: number): JeuParcours {
  return JEUX_ROTATION[((place - 1) + (niveau - 1)) % JEUX_ROTATION.length]
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

export function appliquerResultat(
  etat: EtatParcours,
  reussite: number,
): { etat: EtatParcours; evenement: EvenementParcours } {
  if (estTermine(etat)) throw new Error('Parcours déjà terminé')
  if (etat.etape === 'jeu') {
    return { etat: { ...etat, etape: 'boss', echecsBoss: 0 }, evenement: 'jeu-termine' }
  }
  // Petite tolérance : 3/5 doit valoir 60 % malgré les arrondis des flottants.
  if (reussite + 1e-9 >= seuilBoss(etat.echecsBoss)) {
    const niveau = etat.niveau + 1
    return {
      etat: { ...etat, niveau, etape: 'jeu', echecsBoss: 0 },
      evenement: niveau >= NIVEAU_TERMINE ? 'parcours-termine' : 'boss-battu',
    }
  }
  return { etat: { ...etat, echecsBoss: etat.echecsBoss + 1 }, evenement: 'boss-rate' }
}

export function tauxReussite(bons: number, total: number): number {
  if (total <= 0) return 1
  return Math.max(0, Math.min(1, bons / total))
}

// Le niveau voyage dans l'adresse : une page de jeu retrouvée avec « Précédent »
// ou l'historique ne doit pas pouvoir valider l'étape d'un autre niveau.
export function lienPartie(etat: EtatParcours): string {
  const jeu = jeuDuNiveau(etat.place, etat.niveau)
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
    && jeuDuNiveau(etat.place, etat.niveau) === partie.jeu
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
