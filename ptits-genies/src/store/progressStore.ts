import { create } from 'zustand'
import type { Session, Progress } from '@/types'
import { scoreService } from '@/services/supabase/scoreService'
import { userService } from '@/services/supabase/userService'
import { badgeService } from '@/services/supabase/badgeService'
import { dateDuJour, pleinTarif, pointsLibres } from '@/parcours/regles'
import type { ModeParcours } from '@/parcours/useModeParcours'
import { useParcoursStore } from './parcoursStore'

// Une adresse de parcours ne suffit pas (bouton « Précédent ») : la partie doit être l'étape
// attendue par l'état du parcours en base, et ne pas avoir déjà été comptée.
async function meriteLePleinTarif(userId: string, partie: ModeParcours | null): Promise<boolean> {
  if (!partie) return false
  const store = useParcoursStore.getState()
  if (store.userId !== userId || !store.etat) await store.charger(userId)
  const { etat, partiesTraitees } = useParcoursStore.getState()
  return !partiesTraitees.includes(partie.idPartie) && pleinTarif(etat, partie, dateDuJour())
}

interface ProgressState {
  sessions: Session[]
  progress: Progress[]
  earnedBadgeIds: string[]
  /** Dernière partie enregistrée : l'écran de fin affiche les points réellement gagnés. */
  dernierePartie: { parcours: boolean; pointsGagnes: number; score: number } | null
  loadProgress: (userId: string) => Promise<void>
  /**
   * Enregistre la partie et renvoie les points réellement gagnés. Passer `parcours: modeParcours`
   * pour une partie lancée depuis le parcours : le plein tarif n'est accordé que si c'est l'étape attendue.
   */
  saveSession: (session: Session, options?: { parcours?: ModeParcours | null }) => Promise<number>
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
    // Effacé d'abord : si l'enregistrement échoue, l'écran de fin n'affiche pas les points d'une autre partie.
    set({ dernierePartie: null })
    const parcours = await meriteLePleinTarif(session.userId, options?.parcours ?? null)
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
