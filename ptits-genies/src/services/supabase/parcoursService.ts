import { supabase } from '@/lib/supabase'
import type { EtatParcours, EtapeParcours } from '@/parcours/regles'

interface LigneParcours {
  groupe: string
  place: number
  niveau: number
  etape: EtapeParcours
  echecs_boss: number
  parties_faites: number
  niveau_valide_le: string | null
  boss_apres_echec: number
}

const COLONNES = 'groupe, place, niveau, etape, echecs_boss, parties_faites, niveau_valide_le, boss_apres_echec'

const versEtat = (l: LigneParcours): EtatParcours => ({
  groupe: l.groupe,
  place: l.place,
  niveau: l.niveau,
  etape: l.etape,
  echecsBoss: l.echecs_boss,
  partiesFaites: l.parties_faites,
  niveauValideLe: l.niveau_valide_le,
  bossApresEchec: l.boss_apres_echec,
})

export const parcoursService = {
  async lire(userId: string): Promise<EtatParcours | null> {
    const { data, error } = await supabase.from('parcours').select(COLONNES).eq('user_id', userId).maybeSingle()
    if (error) throw error
    return data ? versEtat(data as LigneParcours) : null
  },

  async creer(userId: string, groupe: string, place: number): Promise<EtatParcours> {
    const { data, error } = await supabase.from('parcours').insert({ user_id: userId, groupe, place }).select(COLONNES).single()
    if (error) throw error
    return versEtat(data as LigneParcours)
  },

  /**
   * Écriture conditionnelle : n'avance que si la base est encore dans l'état `ancien`.
   * Renvoie false si la ligne a changé entre-temps (autre onglet, réponse réseau perdue).
   */
  async enregistrer(userId: string, ancien: EtatParcours, nouveau: EtatParcours): Promise<boolean> {
    const { data, error } = await supabase
      .from('parcours')
      .update({
        niveau: nouveau.niveau,
        etape: nouveau.etape,
        echecs_boss: nouveau.echecsBoss,
        parties_faites: nouveau.partiesFaites,
        niveau_valide_le: nouveau.niveauValideLe,
        boss_apres_echec: nouveau.bossApresEchec,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('niveau', ancien.niveau)
      .eq('etape', ancien.etape)
      .eq('echecs_boss', ancien.echecsBoss)
      .eq('parties_faites', ancien.partiesFaites)
      .select('user_id')
    if (error) throw error
    return (data?.length ?? 0) > 0
  },
}
