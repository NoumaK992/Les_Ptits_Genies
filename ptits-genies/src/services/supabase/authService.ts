import { supabase } from '@/lib/supabase'

const DOMAIN = '@ptitsgenies.app'

function toEmail(username: string): string {
  return `${username.toLowerCase().trim()}${DOMAIN}`
}

export type RegisterResult =
  | { success: true; user: { id: string; username: string } }
  | { success: false; error: 'username_taken' | 'unknown' }

export type LoginResult =
  | { success: true; user: { id: string; username: string; totalPoints: number } }
  | { success: false; error: 'invalid_credentials' | 'unknown' }

export const authService = {
  async register(username: string, password: string): Promise<RegisterResult> {
    const cleanUsername = username.toLowerCase().trim()

    // Vérifier la disponibilité du pseudo via la fonction SQL
    const { data: available, error: rpcError } = await supabase
      .rpc('is_username_available', { username_to_check: cleanUsername })

    if (rpcError || !available) {
      return { success: false, error: 'username_taken' }
    }

    // Créer le compte Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: toEmail(cleanUsername),
      password,
    })

    if (error || !data.user) {
      return { success: false, error: 'unknown' }
    }

    // Le profil est créé automatiquement par le trigger SQL on_auth_user_created
    return { success: true, user: { id: data.user.id, username: cleanUsername } }
  },

  async login(username: string, password: string): Promise<LoginResult> {
    const cleanUsername = username.toLowerCase().trim()

    const { data, error } = await supabase.auth.signInWithPassword({
      email: toEmail(cleanUsername),
      password,
    })

    if (error || !data.user) {
      return { success: false, error: 'invalid_credentials' }
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('username, total_points')
      .eq('id', data.user.id)
      .single()

    if (profileError || !profile) {
      return { success: false, error: 'unknown' }
    }

    return {
      success: true,
      user: {
        id: data.user.id,
        username: profile.username,
        totalPoints: profile.total_points,
      },
    }
  },

  async logout(): Promise<void> {
    await supabase.auth.signOut()
  },

  async getSession(): Promise<{ id: string; username: string; totalPoints: number } | null> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: profile } = await supabase
      .from('profiles')
      .select('username, total_points')
      .eq('id', user.id)
      .single()

    if (!profile) return null

    return {
      id: user.id,
      username: profile.username,
      totalPoints: profile.total_points,
    }
  },
}
