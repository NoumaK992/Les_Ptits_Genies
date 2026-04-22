import { supabase } from '@/lib/supabase'

export const badgeService = {
  async getEarnedIds(userId: string): Promise<string[]> {
    const { data } = await supabase
      .from('user_badges')
      .select('badge_id')
      .eq('user_id', userId)

    if (!data) return []
    return data.map((row) => row.badge_id as string)
  },

  // Insert only badges not already persisted. Returns the newly inserted badge IDs.
  async syncBadges(userId: string, earnedIds: string[]): Promise<string[]> {
    if (!earnedIds.length) return []

    const rows = earnedIds.map((badge_id) => ({ user_id: userId, badge_id }))

    const { data, error } = await supabase
      .from('user_badges')
      .upsert(rows, { onConflict: 'user_id,badge_id', ignoreDuplicates: true })
      .select('badge_id')

    if (error || !data) return []
    return data.map((row) => row.badge_id as string)
  },
}
