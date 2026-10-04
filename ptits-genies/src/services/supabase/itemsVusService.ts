import { supabase } from '@/lib/supabase'

/** Exercices déjà vus par l'élève, par jeu : { jeu: { itemId: dateIso } }. */
export type ItemsVus = Record<string, Record<string, string>>

export const itemsVusService = {
  // Supabase renvoie au plus 1000 lignes par requête : on lit l'historique page par page,
  // sinon un élève assidu verrait revenir des exercices déjà faits.
  async lister(userId: string): Promise<ItemsVus> {
    const PAGE = 1000
    const vus: ItemsVus = {}
    for (let debut = 0; ; debut += PAGE) {
      const { data, error } = await supabase
        .from('items_vus')
        .select('jeu, item_id, vu_le')
        .eq('user_id', userId)
        .order('vu_le', { ascending: false })
        .order('item_id', { ascending: true })
        .range(debut, debut + PAGE - 1)
      if (error) throw error
      for (const ligne of data ?? []) {
        ;(vus[ligne.jeu] ??= {})[ligne.item_id] = ligne.vu_le
      }
      if (!data || data.length < PAGE) return vus
    }
  },

  async marquer(userId: string, jeu: string, itemIds: string[], quand: string): Promise<void> {
    if (itemIds.length === 0) return
    const { error } = await supabase
      .from('items_vus')
      .upsert(itemIds.map((item_id) => ({ user_id: userId, jeu, item_id, vu_le: quand })), { onConflict: 'user_id,jeu,item_id' })
    if (error) throw error
  },
}
