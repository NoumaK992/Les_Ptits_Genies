import { create } from 'zustand'
import {
  appliquerResultat, dateDuJour, lireCode, pleinTarif, BONUS_BOSS,
  type EtatParcours, type EvenementParcours,
} from '@/parcours/regles'
import type { ModeParcours } from '@/parcours/useModeParcours'
import { parcoursService } from '@/services/supabase/parcoursService'
import { userService } from '@/services/supabase/userService'
import { useAuthStore } from './authStore'

const ERREUR_ENREGISTREMENT = "Impossible d'enregistrer ta progression. Préviens ton professeur."
const ERREUR_CHARGEMENT = 'Impossible de charger ton parcours. Vérifie ta connexion.'
const ERREUR_CODE = "Le code, c'est une lettre suivie d'un chiffre de 1 à 8 (exemple : B5)"
const ERREUR_AUTRE_ECRAN = 'Ton parcours a avancé sur un autre écran. Voici où tu en es.'

interface ParcoursState {
  /** Élève dont l'état est chargé : un autre compte sur le même ordinateur force un rechargement. */
  userId: string | null
  etat: EtatParcours | null
  charge: boolean
  /** Le chargement a échoué : on propose « Réessayer » plutôt que la saisie du code. */
  echecChargement: boolean
  erreur: string | null
  dernierEvenement: EvenementParcours | null
  enCours: boolean
  /** Parties déjà comptées : une même partie ne fait jamais avancer deux fois (double clic, double appel). */
  partiesTraitees: string[]
  charger: (userId: string) => Promise<void>
  rejoindre: (userId: string, code: string) => Promise<boolean>
  terminerPartie: (userId: string, partie: ModeParcours, reussite: number) => Promise<void>
  oublierEvenement: () => void
}

export const useParcoursStore = create<ParcoursState>((set, get) => ({
  userId: null,
  etat: null,
  charge: false,
  echecChargement: false,
  erreur: null,
  dernierEvenement: null,
  enCours: false,
  partiesTraitees: [],

  charger: async (userId) => {
    if (get().userId !== userId) set({ userId, etat: null, charge: false, dernierEvenement: null, erreur: null })
    try {
      const etat = await parcoursService.lire(userId)
      set({ etat, charge: true, echecChargement: false, erreur: null })
    } catch {
      set({ charge: true, echecChargement: true, erreur: ERREUR_CHARGEMENT })
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
      set({ userId, etat, charge: true, echecChargement: false, erreur: null })
      return true
    } catch (e) {
      // Ligne déjà existante (élève déjà inscrit, chargement raté juste avant) : on la relit.
      if ((e as { code?: string } | null)?.code === '23505') {
        await get().charger(userId)
        return !!get().etat
      }
      set({ erreur: ERREUR_ENREGISTREMENT })
      return false
    }
  },

  terminerPartie: async (userId, partie, reussite) => {
    if (get().partiesTraitees.includes(partie.idPartie)) return
    // Page rechargée en pleine partie, ou autre compte : on relit l'état avant d'appliquer le résultat.
    if (get().userId !== userId || !get().etat) await get().charger(userId)
    const { etat, enCours } = get()
    // Rien à faire : pas de parcours, parcours fini, partie d'un autre niveau / jeu / étape, ou appel en cours.
    if (!etat || !pleinTarif(etat, partie, dateDuJour()) || enCours) return

    set({ enCours: true, partiesTraitees: [...get().partiesTraitees, partie.idPartie] })
    try {
      const r = appliquerResultat(etat, reussite, dateDuJour())
      let ecrit: boolean
      try {
        ecrit = await parcoursService.enregistrer(userId, etat, r.etat)
      } catch {
        set({ erreur: ERREUR_ENREGISTREMENT })
        return
      }
      if (!ecrit) {
        // La base a bougé ailleurs : on affiche son état réel, sans rien appliquer.
        await get().charger(userId)
        set({ erreur: ERREUR_AUTRE_ECRAN })
        return
      }
      if (r.evenement === 'boss-battu') {
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
