import { create } from 'zustand'
import { itemsVusService, type ItemsVus } from '@/services/supabase/itemsVusService'
import { choisirItems } from '@/parcours/selection'

const AUCUN: Record<string, string> = {}

interface ItemsVusState {
  userId: string | null
  vus: ItemsVus
  charger: (userId: string) => Promise<void>
  /** Exercices déjà vus pour un jeu (identifiant → date). Vide si pas encore chargé. */
  vusDe: (jeu: string) => Record<string, string>
  /** Choisit `n` éléments en évitant ceux déjà vus (voir choisirItems). */
  choisir: <T extends { id: string }>(jeu: string, pool: readonly T[], n: number) => T[]
  /** À appeler en fin de partie avec les identifiants joués. Mise à jour locale immédiate, puis en base. */
  marquer: (userId: string, jeu: string, itemIds: string[]) => Promise<void>
}

export const useItemsVusStore = create<ItemsVusState>((set, get) => ({
  userId: null,
  vus: {},

  charger: async (userId) => {
    if (get().userId !== userId) set({ userId, vus: {} })
    try {
      const vus = await itemsVusService.lister(userId)
      if (get().userId === userId) set({ vus })
    } catch {
      // Hors ligne : on joue quand même, au hasard ; l'historique sera relu à la prochaine connexion.
    }
  },

  vusDe: (jeu) => get().vus[jeu] ?? AUCUN,

  choisir: (jeu, pool, n) => choisirItems(pool, get().vusDe(jeu), n),

  marquer: async (userId, jeu, itemIds) => {
    if (itemIds.length === 0) return
    const quand = new Date().toISOString()
    set((s) => ({ vus: { ...s.vus, [jeu]: { ...(s.vus[jeu] ?? {}), ...Object.fromEntries(itemIds.map((id) => [id, quand])) } } }))
    try {
      await itemsVusService.marquer(userId, jeu, itemIds, quand)
    } catch {
      // Un échec d'enregistrement n'empêche pas de jouer ; au pire un exercice pourra revenir plus tard.
    }
  },
}))
