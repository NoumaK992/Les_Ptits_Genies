import { create } from 'zustand'
import type { Session, Progress } from '@/types'
import { scoreService } from '@/services/supabase/scoreService'
import { userService } from '@/services/supabase/userService'
import { badgeService } from '@/services/supabase/badgeService'
import { pointsLibres } from '@/parcours/regles'

interface ProgressState {
  sessions: Session[]
  progress: Progress[]
  earnedBadgeIds: string[]
  /** Dernière partie enregistrée : l'écran de fin affiche les points réellement gagnés. */
  dernierePartie: { parcours: boolean; pointsGagnes: number; score: number } | null
  loadProgress: (userId: string) => Promise<void>
  /** Enregistre la partie et renvoie les points réellement gagnés. `parcours: true` pour une partie lancée depuis le parcours. */
  saveSession: (session: Session, options?: { parcours?: boolean }) => Promise<number>
  syncBadges: (userId: string, earnedIds: string[]) => Promise<string[]>
}

export const useProgressStore = create<ProgressState>((set) => ({
  sessions: [],
  progress: [],
  earnedBadgeIds: [],
  dernierePartie: null,

  loadProgress: async (userId) => {
    const [sessions, progress, earnedBadgeIds] = await Promise.all([
      scoreService.getHistory(userId),
      scoreService.getProgress(userId),
      badgeService.getEarnedIds(userId),
    ])
    set({ sessions, progress, earnedBadgeIds })
  },

  // Une partie de parcours rapporte tout son score ; une partie libre en rapporte beaucoup moins
  // (dégressif par jeu et par jour, voir pointsLibres). Le score brut reste enregistré pour les statistiques.
  saveSession: async (session, options) => {
    const parcours = options?.parcours === true
    let pointsGagnes = session.score
    if (!parcours) {
      const dejaFaites = await scoreService.compterPartiesLibresDuJour(session.userId, session.exerciseType)
      pointsGagnes = pointsLibres(session.score, dejaFaites)
    }
    const enregistree: Session = {
      ...session,
      details: { ...session.details, mode: parcours ? ('parcours' as const) : ('libre' as const), pointsGagnes },
    }
    await scoreService.save(enregistree)
    await scoreService.updateProgress(session.userId, session.exerciseType, session.score)
    await userService.updatePoints(session.userId, pointsGagnes)
    set((state) => ({
      sessions: [enregistree, ...state.sessions].slice(0, 200),
      dernierePartie: { parcours, pointsGagnes, score: session.score },
    }))
    return pointsGagnes
  },

  syncBadges: async (userId, earnedIds) => {
    const newlyEarned = await badgeService.syncBadges(userId, earnedIds)
    if (newlyEarned.length > 0) {
      set((state) => ({
        earnedBadgeIds: [...new Set([...state.earnedBadgeIds, ...newlyEarned])],
      }))
    }
    return newlyEarned
  },
}))
