import { supabase } from '@/lib/supabase'
import type { Session, Progress, ExerciseType } from '@/types'

export const scoreService = {
  async save(session: Session): Promise<void> {
    await supabase.from('sessions').insert({
      id: session.id,
      user_id: session.userId,
      exercise_type: session.exerciseType,
      score: session.score,
      duration: session.duration,
      played_at: session.playedAt,
      details: session.details,
    })
  },

  async getHistory(userId: string, limit = 20): Promise<Session[]> {
    const { data } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', userId)
      .order('played_at', { ascending: false })
      .limit(limit)

    if (!data) return []

    return data.map((row) => ({
      id: row.id,
      userId: row.user_id,
      exerciseType: row.exercise_type as ExerciseType,
      score: row.score,
      duration: row.duration,
      playedAt: row.played_at,
      details: row.details,
    }))
  },

  async getProgress(userId: string): Promise<Progress[]> {
    const { data } = await supabase
      .from('progress')
      .select('*')
      .eq('user_id', userId)

    if (!data) return []

    return data.map((row) => ({
      id: row.id,
      userId: row.user_id,
      exerciseType: row.exercise_type as ExerciseType,
      totalSessions: row.total_sessions,
      bestScore: row.best_score,
      avgScore: row.avg_score,
      lastPlayed: row.last_played,
    }))
  },

  async updateProgress(userId: string, exerciseType: ExerciseType, score: number): Promise<void> {
    const { data: existing } = await supabase
      .from('progress')
      .select('*')
      .eq('user_id', userId)
      .eq('exercise_type', exerciseType)
      .maybeSingle()

    if (!existing) {
      await supabase.from('progress').insert({
        user_id: userId,
        exercise_type: exerciseType,
        total_sessions: 1,
        best_score: score,
        avg_score: score,
        last_played: new Date().toISOString(),
      })
    } else {
      const newTotal = existing.total_sessions + 1
      const newAvg = Math.round(
        (existing.avg_score * existing.total_sessions + score) / newTotal
      )
      await supabase
        .from('progress')
        .update({
          total_sessions: newTotal,
          best_score: Math.max(existing.best_score, score),
          avg_score: newAvg,
          last_played: new Date().toISOString(),
        })
        .eq('id', existing.id)
    }
  },
}
