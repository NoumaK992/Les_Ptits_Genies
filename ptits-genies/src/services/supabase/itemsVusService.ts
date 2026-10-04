import { supabase } from '@/lib/supabase'

/** Exercices déjà vus par l'élève, par jeu : { jeu: { itemId: dateIso } }. */
export type ItemsVus = Record<string, Record<string, string>>

export const itemsVusService = {
  async lister(userId: string): Promise<ItemsVus> {
    const { data, error } = await supabase
      .from('items_vus')
      .select('jeu, item_id, vu_le')
      .eq('user_id', userId)
      .limit(20000)
    if (error) throw error
    const vus: ItemsVus = {}
    for (const ligne of data ?? []) {
      ;(vus[ligne.jeu] ??= {})[ligne.item_id] = ligne.vu_le
    }
    return vus
  },

  async marquer(userId: string, jeu: string, itemIds: string[], quand: string): Promise<void> {
    if (itemIds.length === 0) return
    const { error } = await supabase
      .from('items_vus')
      .upsert(itemIds.map((item_id) => ({ user_id: userId, jeu, item_id, vu_le: quand })), { onConflict: 'user_id,jeu,item_id' })
    if (error) throw error
  },
}
