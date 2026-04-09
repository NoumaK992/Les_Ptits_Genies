import { create } from 'zustand'
import type { Session, Progress } from '@/types'
import { scoreService } from '@/services/supabase/scoreService'
import { userService } from '@/services/supabase/userService'

interface ProgressState {
  sessions: Session[]
  progress: Progress[]
  loadProgress: (userId: string) => Promise<void>
  saveSession: (session: Session) => Promise<void>
}

export const useProgressStore = create<ProgressState>((set) => ({
  sessions: [],
  progress: [],

  loadProgress: async (userId) => {
    const [sessions, progress] = await Promise.all([
      scoreService.getHistory(userId),
      scoreService.getProgress(userId),
    ])
    set({ sessions, progress })
  },

  saveSession: async (session) => {
    await scoreService.save(session)
    await scoreService.updateProgress(session.userId, session.exerciseType, session.score)
    await userService.updatePoints(session.userId, session.score)
    set((state) => ({
      sessions: [session, ...state.sessions].slice(0, 20),
    }))
  },
}))
