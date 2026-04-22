import { create } from 'zustand'
import type { Session, Progress } from '@/types'
import { scoreService } from '@/services/supabase/scoreService'
import { userService } from '@/services/supabase/userService'
import { badgeService } from '@/services/supabase/badgeService'

interface ProgressState {
  sessions: Session[]
  progress: Progress[]
  earnedBadgeIds: string[]
  loadProgress: (userId: string) => Promise<void>
  saveSession: (session: Session) => Promise<void>
  syncBadges: (userId: string, earnedIds: string[]) => Promise<string[]>
}

export const useProgressStore = create<ProgressState>((set) => ({
  sessions: [],
  progress: [],
  earnedBadgeIds: [],

  loadProgress: async (userId) => {
    const [sessions, progress, earnedBadgeIds] = await Promise.all([
      scoreService.getHistory(userId),
      scoreService.getProgress(userId),
      badgeService.getEarnedIds(userId),
    ])
    set({ sessions, progress, earnedBadgeIds })
  },

  saveSession: async (session) => {
    await scoreService.save(session)
    await scoreService.updateProgress(session.userId, session.exerciseType, session.score)
    await userService.updatePoints(session.userId, session.score)
    set((state) => ({
      sessions: [session, ...state.sessions].slice(0, 200),
    }))
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
