import type { Badge } from '@/types'

export const BADGE_CATEGORIES = [
  { id: 'decouverte', label: '🗺️ Découverte' },
  { id: 'points',     label: '⭐ Points' },
  { id: 'assiduite',  label: '🔥 Assiduité' },
  { id: 'volume',     label: '📚 Progression' },
  { id: 'specialisation', label: '🎯 Spécialisation' },
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
    description: 'Essaie les 6 exercices',
    category: 'decouverte',
    condition: (ctx) => ctx.progress.length >= 6,
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
    description: 'Obtiens un score parfait (≥ 100 pts) dans une session',
    category: 'points',
    condition: (ctx) => ctx.sessions.some((s) => s.score >= 100),
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
]
