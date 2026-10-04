import { supabase } from '@/lib/supabase'
import type { EtatParcours, EtapeParcours } from '@/parcours/regles'

interface LigneParcours {
  groupe: string
  place: number
  niveau: number
  etape: EtapeParcours
  echecs_boss: number
}

const COLONNES = 'groupe, place, niveau, etape, echecs_boss'

const versEtat = (l: LigneParcours): EtatParcours =>
  ({ groupe: l.groupe, place: l.place, niveau: l.niveau, etape: l.etape, echecsBoss: l.echecs_boss })

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

  async enregistrer(userId: string, etat: EtatParcours): Promise<void> {
    const { error } = await supabase
      .from('parcours')
      .update({ niveau: etat.niveau, etape: etat.etape, echecs_boss: etat.echecsBoss, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
    if (error) throw error
  },
}
