import { supabase } from '@/lib/supabase'

export const userService = {
  async getProfile(userId: string): Promise<{ username: string; totalPoints: number } | null> {
    const { data } = await supabase
      .from('profiles')
      .select('username, total_points')
      .eq('id', userId)
      .single()

    if (!data) return null
    return { username: data.username, totalPoints: data.total_points }
  },

  async updatePoints(userId: string, delta: number): Promise<void> {
    const { data: profile } = await supabase
      .from('profiles')
      .select('total_points')
      .eq('id', userId)
      .single()

    if (!profile) return

    const newPoints = Math.max(0, profile.total_points + delta)
    await supabase
      .from('profiles')
      .update({ total_points: newPoints })
      .eq('id', userId)
  },
}
