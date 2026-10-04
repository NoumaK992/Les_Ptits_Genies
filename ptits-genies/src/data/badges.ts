import type { Badge, BadgeContext } from '@/types'
import { NIVEAU_TERMINE } from '@/parcours/regles'

export const BADGE_CATEGORIES = [
  { id: 'decouverte', label: '🧭 Découverte' },
  { id: 'points',     label: '⭐ Points' },
  { id: 'assiduite',  label: '🔥 Assiduité' },
  { id: 'volume',     label: '📚 Progression' },
  { id: 'specialisation', label: '🎯 Spécialisation' },
  { id: 'parcours',   label: '🗺️ Parcours' },
] as const

export type BadgeCategory = (typeof BADGE_CATEGORIES)[number]['id']

export interface BadgeWithCategory extends Badge {
  category: BadgeCategory
}

export const BADGES: BadgeWithCategory[] = [
  // ─── Découverte ───────────────────────────────────────────────────
  {
    id: 'first',
    label: 'Premier pas',
    emoji: '👣',
    description: 'Joue ta 1ère session',
    category: 'decouverte',
    condition: (ctx) => ctx.progress.length >= 1,
  },
  {
    id: 'explorer',
    label: 'Explorateur',
    emoji: '🗺️',
    description: 'Essaie 3 exercices différents',
    category: 'decouverte',
    condition: (ctx) => ctx.progress.length >= 3,
  },
  {
    id: 'allExercises',
    label: 'Globe-trotteur',
    emoji: '🌍',
    description: 'Essaie les 12 exercices',
    category: 'decouverte',
    condition: (ctx) => ctx.progress.length >= 12,
  },

  // ─── Points ───────────────────────────────────────────────────────
  {
    id: 'pts100',
    label: 'Débutant',
    emoji: '💯',
    description: 'Atteins 100 pts au total',
    category: 'points',
    condition: (ctx) => ctx.totalPoints >= 100,
  },
  {
    id: 'pts500',
    label: 'Apprenti',
    emoji: '⭐',
    description: 'Atteins 500 pts au total',
    category: 'points',
    condition: (ctx) => ctx.totalPoints >= 500,
  },
  {
    id: 'pts1000',
    label: 'Champion',
    emoji: '🌟',
    description: 'Atteins 1 000 pts au total',
    category: 'points',
    condition: (ctx) => ctx.totalPoints >= 1000,
  },
  {
    id: 'pts5000',
    label: 'Légende',
    emoji: '🏆',
    description: 'Atteins 5 000 pts au total',
    category: 'points',
    condition: (ctx) => ctx.totalPoints >= 5000,
  },
  {
    id: 'pts10000',
    label: 'Génie absolu',
    emoji: '👑',
    description: 'Atteins 10 000 pts au total',
    category: 'points',
    condition: (ctx) => ctx.totalPoints >= 10000,
  },
  {
    id: 'perfect',
    label: 'Sans faute !',
    emoji: '💎',
    description: 'Réussis une partie à 100 %',
    category: 'points',
    // Les parties anciennes n'ont pas de taux de réussite : elles ne comptent pas.
    condition: (ctx) => ctx.sessions.some((s) => (s.details?.reussite ?? 0) >= 0.999),
  },

  // ─── Assiduité ────────────────────────────────────────────────────
  {
    id: 'streak3',
    label: '3 jours de suite',
    emoji: '🔥',
    description: 'Joue 3 jours consécutifs',
    category: 'assiduite',
    condition: (ctx) => ctx.streak >= 3,
  },
  {
    id: 'streak7',
    label: 'Semaine parfaite',
    emoji: '🔥🔥',
    description: 'Joue 7 jours consécutifs',
    category: 'assiduite',
    condition: (ctx) => ctx.streak >= 7,
  },
  {
    id: 'streak30',
    label: 'Mois de feu',
    emoji: '🌋',
    description: 'Joue 30 jours consécutifs',
    category: 'assiduite',
    condition: (ctx) => ctx.streak >= 30,
  },

  // ─── Volume ───────────────────────────────────────────────────────
  {
    id: 'vol10',
    label: '10 sessions',
    emoji: '🔟',
    description: 'Joue 10 sessions au total',
    category: 'volume',
    condition: (ctx) => ctx.progress.reduce((sum, p) => sum + p.totalSessions, 0) >= 10,
  },
  {
    id: 'vol25',
    label: '25 sessions',
    emoji: '🥉',
    description: 'Joue 25 sessions au total',
    category: 'volume',
    condition: (ctx) => ctx.progress.reduce((sum, p) => sum + p.totalSessions, 0) >= 25,
  },
  {
    id: 'vol50',
    label: '50 sessions',
    emoji: '🥈',
    description: 'Joue 50 sessions au total',
    category: 'volume',
    condition: (ctx) => ctx.progress.reduce((sum, p) => sum + p.totalSessions, 0) >= 50,
  },
  {
    id: 'vol100',
    label: '100 sessions',
    emoji: '🥇',
    description: 'Joue 100 sessions au total',
    category: 'volume',
    condition: (ctx) => ctx.progress.reduce((sum, p) => sum + p.totalSessions, 0) >= 100,
  },

  // ─── Spécialisation ───────────────────────────────────────────────
  {
    id: 'spec-word-search',
    label: 'Chercheur de mots',
    emoji: '🔍',
    description: '10 sessions de Recherche de mots',
    category: 'specialisation',
    condition: (ctx) => (ctx.progress.find((p) => p.exerciseType === 'word-search')?.totalSessions ?? 0) >= 10,
  },
  {
    id: 'spec-intrus',
    label: 'Détective',
    emoji: '🕵️',
    description: "10 sessions de L'Intrus",
    category: 'specialisation',
    condition: (ctx) => (ctx.progress.find((p) => p.exerciseType === 'intrus')?.totalSessions ?? 0) >= 10,
  },
  {
    id: 'spec-lecture',
    label: 'Lecteur rapide',
    emoji: '⚡',
    description: '10 sessions de Lecture rapide',
    category: 'specialisation',
    condition: (ctx) => (ctx.progress.find((p) => p.exerciseType === 'lecture-rapide')?.totalSessions ?? 0) >= 10,
  },
  {
    id: 'spec-coup-doeil',
    label: "Œil de lynx",
    emoji: '👁️',
    description: "10 sessions de Coup d'œil",
    category: 'specialisation',
    condition: (ctx) => (ctx.progress.find((p) => p.exerciseType === 'coup-doeil')?.totalSessions ?? 0) >= 10,
  },
  {
    id: 'spec-phrases',
    label: 'Linguiste',
    emoji: '🧩',
    description: 'Joue 10 sessions de Phrases brouillées',
    category: 'specialisation',
    condition: (ctx) => (ctx.progress.find((p) => p.exerciseType === 'phrases-brouillees')?.totalSessions ?? 0) >= 10,
  },
  {
    id: 'spec-collection',
    label: 'Collectionneur',
    emoji: '🗂️',
    description: '10 sessions de Collection',
    category: 'specialisation',
    condition: (ctx) => (ctx.progress.find((p) => p.exerciseType === 'collection')?.totalSessions ?? 0) >= 10,
  },
  {
    id: 'spec-ami-ennemi',
    label: 'Stratège',
    emoji: '🎯',
    description: "10 sessions d'Ami et Ennemi",
    category: 'specialisation',
    condition: (ctx) => (ctx.progress.find((p) => p.exerciseType === 'ami-ennemi')?.totalSessions ?? 0) >= 10,
  },
  {
    id: 'spec-vrai-absurde',
    label: "Juge de paix",
    emoji: '⚖️',
    description: "10 parties de Vrai ou Absurde ?",
    category: 'specialisation',
    condition: (ctx) => (ctx.progress.find((p) => p.exerciseType === 'vrai-absurde')?.totalSessions ?? 0) >= 10,
  },
  {
    id: 'spec-forgeron',
    label: "Maître forgeron",
    emoji: '🔨',
    description: "10 parties du Forgeron de mots",
    category: 'specialisation',
    condition: (ctx) => (ctx.progress.find((p) => p.exerciseType === 'forgeron')?.totalSessions ?? 0) >= 10,
  },
  {
    id: 'spec-labyrinthe',
    label: "Explorateur du labyrinthe",
    emoji: '🧭',
    description: "10 parties du Labyrinthe",
    category: 'specialisation',
    condition: (ctx) => (ctx.progress.find((p) => p.exerciseType === 'labyrinthe')?.totalSessions ?? 0) >= 10,
  },
  {
    id: 'spec-coupe-mots',
    label: "As des ciseaux",
    emoji: '✂️',
    description: "10 parties de Coupe-Mots",
    category: 'specialisation',
    condition: (ctx) => (ctx.progress.find((p) => p.exerciseType === 'coupe-mots')?.totalSessions ?? 0) >= 10,
  },
  {
    id: 'spec-racines',
    label: "Jardinier des mots",
    emoji: '🌳',
    description: "10 parties des Racines",
    category: 'specialisation',
    condition: (ctx) => (ctx.progress.find((p) => p.exerciseType === 'racines')?.totalSessions ?? 0) >= 10,
  },

  // ─── Parcours ─────────────────────────────────────────────────────
  {
    id: 'parcours-chasseur-de-boss',
    label: 'Chasseur de boss',
    emoji: '👾',
    description: 'Bats ton premier boss',
    category: 'parcours',
    // Boss du niveau 1 battu : l'élève est passé à la lecture, ou au niveau suivant.
    condition: (ctx) => {
      const p = parcoursDe(ctx)
      return !!p && (p.niveau >= 2 || (p.niveau === 1 && p.etape === 'lecture'))
    },
  },
  {
    id: 'parcours-premier-tour',
    label: 'Premier tour',
    emoji: '🥉',
    description: 'Valide le niveau 8',
    category: 'parcours',
    condition: (ctx) => (parcoursDe(ctx)?.niveau ?? 0) >= 9,
  },
  {
    id: 'parcours-deuxieme-tour',
    label: 'Deuxième tour',
    emoji: '🥈',
    description: 'Valide le niveau 16',
    category: 'parcours',
    condition: (ctx) => (parcoursDe(ctx)?.niveau ?? 0) >= 17,
  },
  {
    id: 'parcours-legende',
    label: 'Maître du parcours',
    emoji: '🏆',
    description: 'Termine tout le parcours',
    category: 'parcours',
    condition: (ctx) => (parcoursDe(ctx)?.niveau ?? 0) >= NIVEAU_TERMINE,
  },
  {
    id: 'parcours-perseverant',
    label: 'Persévérant',
    emoji: '💪',
    description: 'Bats un boss après avoir échoué',
    category: 'parcours',
    condition: (ctx) => (parcoursDe(ctx)?.bossApresEchec ?? 0) >= 1,
  },
  {
    id: 'parcours-increvable',
    label: 'Increvable',
    emoji: '🔥',
    description: 'Bats 3 boss après avoir échoué',
    category: 'parcours',
    condition: (ctx) => (parcoursDe(ctx)?.bossApresEchec ?? 0) >= 3,
  },
]

/** État du parcours, ou null si l'élève n'en a pas (ou s'il n'est pas encore chargé). */
function parcoursDe(ctx: BadgeContext) {
  return ctx.parcours ?? null
}
