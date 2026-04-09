import { create } from 'zustand'
import type { AuthUser } from '@/types'
import { authService } from '@/services/supabase/authService'
import { userService } from '@/services/supabase/userService'

interface AuthState {
  currentUser: AuthUser | null
  isLoading: boolean
  error: string | null
  register: (username: string, password: string) => Promise<boolean>
  login: (username: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  hydrate: () => Promise<void>
  refreshPoints: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: null,
  isLoading: false,
  error: null,

  register: async (username, password) => {
    set({ isLoading: true, error: null })
    const result = await authService.register(username, password)
    if (!result.success) {
      const message =
        result.error === 'username_taken'
          ? "Ce nom d'utilisateur est déjà pris."
          : "Une erreur est survenue."
      set({ error: message, isLoading: false })
      return false
    }
    const authUser: AuthUser = {
      id: result.user.id,
      username: result.user.username,
      totalPoints: 0,
    }
    set({ currentUser: authUser, isLoading: false })
    return true
  },

  login: async (username, password) => {
    set({ isLoading: true, error: null })
    const result = await authService.login(username, password)
    if (!result.success) {
      const message =
        result.error === 'invalid_credentials'
          ? "Nom d'utilisateur ou mot de passe incorrect."
          : "Une erreur est survenue."
      set({ error: message, isLoading: false })
      return false
    }
    const authUser: AuthUser = {
      id: result.user.id,
      username: result.user.username,
      totalPoints: result.user.totalPoints,
    }
    set({ currentUser: authUser, isLoading: false })
    return true
  },

  logout: async () => {
    await authService.logout()
    set({ currentUser: null })
  },

  hydrate: async () => {
    const user = await authService.getSession()
    if (user) {
      set({
        currentUser: {
          id: user.id,
          username: user.username,
          totalPoints: user.totalPoints,
        },
      })
    }
  },

  refreshPoints: async () => {
    const { currentUser } = get()
    if (!currentUser) return
    const profile = await userService.getProfile(currentUser.id)
    if (!profile) return
    set({ currentUser: { ...currentUser, totalPoints: profile.totalPoints } })
  },

  clearError: () => set({ error: null }),
}))
