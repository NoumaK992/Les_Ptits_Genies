import type { Session } from '@/types'

export function calcStreak(sessions: Session[]): number {
  if (!sessions.length) return 0
  const dates = [...new Set(sessions.map((s) => s.playedAt.slice(0, 10)))].sort().reverse()
  const today = new Date().toISOString().slice(0, 10)
  if (dates[0] !== today && dates[0] !== new Date(Date.now() - 86400000).toISOString().slice(0, 10)) return 0
  let streak = 1
  for (let i = 0; i < dates.length - 1; i++) {
    const d0 = new Date(dates[i]), d1 = new Date(dates[i + 1])
    if ((d0.getTime() - d1.getTime()) / 86400000 === 1) streak++
    else break
  }
  return streak
}
