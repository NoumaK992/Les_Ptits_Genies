import { create } from 'zustand'
import {
  appliquerResultat, estTermine, lireCode, BONUS_BOSS,
  type EtatParcours, type EtapeParcours, type EvenementParcours,
} from '@/parcours/regles'
import { parcoursService } from '@/services/supabase/parcoursService'
import { userService } from '@/services/supabase/userService'
import { useAuthStore } from './authStore'

const ERREUR_ENREGISTREMENT = "Impossible d'enregistrer ta progression. Préviens ton professeur."
const ERREUR_CHARGEMENT = 'Impossible de charger ton parcours. Vérifie ta connexion.'
const ERREUR_CODE = "Le code, c'est une lettre suivie d'un chiffre de 1 à 8 (exemple : B5)"

interface ParcoursState {
  /** Élève dont l'état est chargé : un autre compte sur le même ordinateur force un rechargement. */
  userId: string | null
  etat: EtatParcours | null
  charge: boolean
  erreur: string | null
  dernierEvenement: EvenementParcours | null
  enCours: boolean
  charger: (userId: string) => Promise<void>
  rejoindre: (userId: string, code: string) => Promise<boolean>
  terminerPartie: (userId: string, etapeJouee: EtapeParcours, reussite: number) => Promise<void>
  oublierEvenement: () => void
}

export const useParcoursStore = create<ParcoursState>((set, get) => ({
  userId: null,
  etat: null,
  charge: false,
  erreur: null,
  dernierEvenement: null,
  enCours: false,

  charger: async (userId) => {
    if (get().userId !== userId) set({ userId, etat: null, charge: false, dernierEvenement: null, erreur: null })
    try {
      const etat = await parcoursService.lire(userId)
      set({ etat, charge: true, erreur: null })
    } catch {
      set({ charge: true, erreur: ERREUR_CHARGEMENT })
    }
  },

  rejoindre: async (userId, code) => {
    const lu = lireCode(code)
    if (!lu) {
      set({ erreur: ERREUR_CODE })
      return false
    }
    try {
      const etat = await parcoursService.creer(userId, lu.groupe, lu.place)
      set({ userId, etat, charge: true, erreur: null })
      return true
    } catch {
      set({ erreur: ERREUR_ENREGISTREMENT })
      return false
    }
  },

  terminerPartie: async (userId, etapeJouee, reussite) => {
    // Page rechargée en pleine partie, ou autre compte : on relit l'état avant d'appliquer le résultat.
    if (get().userId !== userId || !get().etat) await get().charger(userId)
    const { etat, enCours } = get()
    // Rien à faire : pas de parcours, parcours fini, partie lancée depuis un lien périmé, ou appel en double.
    if (!etat || estTermine(etat) || etat.etape !== etapeJouee || enCours) return

    set({ enCours: true })
    try {
      const r = appliquerResultat(etat, reussite)
      try {
        await parcoursService.enregistrer(userId, r.etat)
      } catch {
        set({ erreur: ERREUR_ENREGISTREMENT })
        return
      }
      if (r.evenement === 'boss-battu' || r.evenement === 'parcours-termine') {
        try {
          await userService.updatePoints(userId, BONUS_BOSS)
          await useAuthStore.getState().refreshPoints()
        } catch {
          // L'état est déjà enregistré : un bonus manqué ne doit pas bloquer l'élève.
        }
      }
      set({ etat: r.etat, dernierEvenement: r.evenement, erreur: null })
    } finally {
      set({ enCours: false })
    }
  },

  oublierEvenement: () => set({ dernierEvenement: null }),
}))
