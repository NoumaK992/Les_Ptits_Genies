import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from 'recharts'
import { useAuthStore } from '@/store/authStore'
import { useProgressStore } from '@/store/progressStore'
import type { Session, Badge } from '@/types'

const EXERCISE_LABELS: Record<string, string> = {
  'word-search': '🔍 Recherche',
  'intrus': '🕵️ Intrus',
  'lecture-rapide': '⚡ Lecture',
  'coup-doeil': '👁️ Coup d\'œil',
  'phrases-brouillees': '🧩 Phrases',
  'collection': '🗂️ Collection',
  'ami-ennemi': '🎯 Ami & Ennemi',
}

const EXERCISE_COLORS: Record<string, string> = {
  'word-search': '#7C6FF7',
  'intrus': '#FF7B54',
  'lecture-rapide': '#FFD166',
  'coup-doeil': '#06D6A0',
  'phrases-brouillees': '#38BDF8',
  'collection': '#f472b6',
  'ami-ennemi': '#a3e635',
}

const EXERCISE_GRADIENTS: Record<string, string> = {
  'word-search': 'linear-gradient(135deg, #7C6FF7, #4a3fcc)',
  'intrus': 'linear-gradient(135deg, #FF7B54, #e8404a)',
  'lecture-rapide': 'linear-gradient(135deg, #FFD166, #f59e0b)',
  'coup-doeil': 'linear-gradient(135deg, #06D6A0, #059669)',
  'phrases-brouillees': 'linear-gradient(135deg, #38BDF8, #2563eb)',
  'collection': 'linear-gradient(135deg, #f472b6, #db2777)',
  'ami-ennemi': 'linear-gradient(135deg, #a3e635, #16a34a)',
}

const BADGES: Badge[] = [
  { id: 'first', label: 'Premier pas', emoji: '👣', condition: (s) => s.length >= 1 },
  { id: 'ten', label: '10 sessions', emoji: '🔟', condition: (s) => s.length >= 10 },
  { id: 'pts100', label: '100 pts', emoji: '💯', condition: (_, pts) => pts >= 100 },
  { id: 'pts500', label: '500 pts', emoji: '⭐', condition: (_, pts) => pts >= 500 },
  { id: 'pts1000', label: '1000 pts', emoji: '🌟', condition: (_, pts) => pts >= 1000 },
  { id: 'pts5000', label: '5000 pts', emoji: '🏆', condition: (_, pts) => pts >= 5000 },
  { id: 'allExercises', label: 'Explorateur', emoji: '🗺️', condition: (s) => {
    const types = new Set(s.map((x) => x.exerciseType))
    return types.size >= 3
  }},
  { id: 'streak3', label: 'Régularité', emoji: '🔥', condition: (s) => {
    if (s.length < 3) return false
    const dates = [...new Set(s.map((x) => x.playedAt.slice(0, 10)))].sort()
    for (let i = 0; i < dates.length - 2; i++) {
      const d0 = new Date(dates[i]), d1 = new Date(dates[i+1]), d2 = new Date(dates[i+2])
      const diff1 = (d1.getTime() - d0.getTime()) / 86400000
      const diff2 = (d2.getTime() - d1.getTime()) / 86400000
      if (diff1 === 1 && diff2 === 1) return true
    }
    return false
  }},
]

function calcStreak(sessions: Session[]): number {
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

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }

export default function DashboardPage() {
  const { currentUser } = useAuthStore()
  const { sessions, progress, loadProgress } = useProgressStore()
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (currentUser) {
      loadProgress(currentUser.id).then(() => setLoaded(true))
    }
  }, [currentUser?.id])

  if (!loaded) {
    return (
      <div className="flex items-center justify-center min-h-64 text-4xl animate-pulse">⏳</div>
    )
  }

  const totalPoints = currentUser?.totalPoints ?? 0
  const streak = calcStreak(sessions)
  const earnedBadges = BADGES.filter((b) => b.condition(sessions, totalPoints))

  const lineData = [...sessions]
    .reverse()
    .slice(-10)
    .map((s, i) => ({
      name: formatDate(s.playedAt),
      pts: s.score,
      index: i,
    }))

  const barData = progress.map((p) => ({
    name: EXERCISE_LABELS[p.exerciseType] ?? p.exerciseType,
    avg: p.avgScore,
    best: p.bestScore,
    type: p.exerciseType,
  }))

  const statCards = [
    {
      label: 'Points totaux',
      value: totalPoints,
      emoji: '⭐',
      gradient: 'linear-gradient(135deg, #7C6FF7, #4a3fcc)',
      shadow: 'rgba(124, 111, 247, 0.35)',
    },
    {
      label: 'Sessions',
      value: sessions.length,
      emoji: '🎮',
      gradient: 'linear-gradient(135deg, #FF7B54, #e8404a)',
      shadow: 'rgba(255, 123, 84, 0.35)',
    },
    {
      label: 'Série actuelle',
      value: `${streak}j`,
      emoji: '🔥',
      gradient: 'linear-gradient(135deg, #FFD166, #f59e0b)',
      shadow: 'rgba(255, 209, 102, 0.35)',
      textDark: true,
    },
  ]

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">

        {/* Header */}
        <motion.div variants={item}>
          <h2 className="text-3xl font-fredoka font-semibold text-ink">📊 Mes progrès</h2>
          <p className="text-gray-500 font-semibold">Suis ton évolution, {currentUser?.username} !</p>
        </motion.div>

        {/* Stats cards */}
        <motion.div variants={item} className="grid grid-cols-3 gap-3">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="rounded-2xl p-4 text-center relative overflow-hidden"
              style={{ background: card.gradient, boxShadow: `0 6px 20px ${card.shadow}` }}
            >
              <div
                className="absolute right-0 top-0 w-20 h-20 rounded-full pointer-events-none"
                style={{ background: 'rgba(255,255,255,0.12)', transform: 'translate(30%, -30%)' }}
              />
              <div className="text-2xl mb-1 relative z-10">{card.emoji}</div>
              <div
                className="font-black text-xl relative z-10"
                style={{ color: card.textDark ? '#2D2D3A' : 'white' }}
              >
                {card.value}
              </div>
              <div
                className="text-xs font-semibold mt-0.5 relative z-10"
                style={{ color: card.textDark ? 'rgba(45,45,58,0.65)' : 'rgba(255,255,255,0.75)' }}
              >
                {card.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Line chart */}
        {lineData.length >= 2 && (
          <motion.div variants={item} className="bg-white rounded-3xl p-5 shadow-card">
            <h3 className="font-fredoka font-semibold text-ink text-lg mb-4">📈 Points par session</h3>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fontFamily: 'Nunito' }} />
                <YAxis tick={{ fontSize: 11, fontFamily: 'Nunito' }} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, fontFamily: 'Nunito', fontSize: 13, border: 'none', boxShadow: '0 4px 20px rgba(45,45,58,0.12)' }}
                  formatter={(v) => [`${v} pts`, 'Score']}
                />
                <Line
                  type="monotone" dataKey="pts" stroke="#7C6FF7" strokeWidth={3}
                  dot={{ fill: '#7C6FF7', r: 5, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 7, stroke: '#7C6FF7', strokeWidth: 2, fill: '#fff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Bar chart */}
        {barData.length > 0 && (
          <motion.div variants={item} className="bg-white rounded-3xl p-5 shadow-card">
            <h3 className="font-fredoka font-semibold text-ink text-lg mb-4">🎯 Score moyen par exercice</h3>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={barData} barSize={36}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fontFamily: 'Nunito' }} />
                <YAxis tick={{ fontSize: 11, fontFamily: 'Nunito' }} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, fontFamily: 'Nunito', fontSize: 13, border: 'none', boxShadow: '0 4px 20px rgba(45,45,58,0.12)' }}
                  formatter={(v) => [`${v} pts`, 'Moyenne']}
                />
                <Bar dataKey="avg" radius={[8, 8, 0, 0]}>
                  {barData.map((entry) => (
                    <Cell key={entry.type} fill={EXERCISE_COLORS[entry.type] ?? '#7C6FF7'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Progress per exercise */}
        {progress.length > 0 && (
          <motion.div variants={item} className="bg-white rounded-3xl p-5 shadow-card">
            <h3 className="font-fredoka font-semibold text-ink text-lg mb-4">🏅 Par exercice</h3>
            <div className="space-y-4">
              {progress.map((p) => (
                <div key={p.exerciseType} className="flex items-center gap-4">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0"
                    style={{ background: EXERCISE_GRADIENTS[p.exerciseType] ?? 'linear-gradient(135deg, #7C6FF7, #4a3fcc)' }}
                  >
                    {p.exerciseType === 'word-search' ? '🔍' :
                      p.exerciseType === 'intrus' ? '🕵️' :
                      p.exerciseType === 'lecture-rapide' ? '⚡' :
                      p.exerciseType === 'coup-doeil' ? '👁️' :
                      p.exerciseType === 'phrases-brouillees' ? '🧩' :
                      p.exerciseType === 'collection' ? '🗂️' : '🎯'}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between text-xs text-gray-400 font-semibold">
                      <span className="text-ink font-bold text-sm">
                        {EXERCISE_LABELS[p.exerciseType]?.replace(/^[^\s]+\s/, '') ?? p.exerciseType}
                      </span>
                      <span>{p.totalSessions} session{p.totalSessions > 1 ? 's' : ''} · Meilleur : {p.bestScore} pts</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (p.avgScore / Math.max(p.bestScore, 1)) * 100)}%` }}
                        transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        style={{ background: EXERCISE_GRADIENTS[p.exerciseType] ?? 'linear-gradient(135deg, #7C6FF7, #4a3fcc)' }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Badges */}
        <motion.div variants={item} className="bg-white rounded-3xl p-5 shadow-card">
          <h3 className="font-fredoka font-semibold text-ink text-lg mb-4">🎖️ Mes badges</h3>
          <div className="flex flex-wrap gap-3">
            {BADGES.map((badge) => {
              const earned = earnedBadges.some((b) => b.id === badge.id)
              return (
                <motion.div
                  key={badge.id}
                  whileHover={earned ? { scale: 1.08 } : {}}
                  className="flex flex-col items-center gap-1.5 px-3 py-3 rounded-2xl transition-all"
                  style={earned ? {
                    background: 'linear-gradient(135deg, rgba(255,209,102,0.15), rgba(255,209,102,0.08))',
                    border: '2px solid rgba(255,209,102,0.5)',
                    boxShadow: '0 4px 12px rgba(255, 209, 102, 0.20)',
                  } : {
                    background: '#f9f9f9',
                    border: '2px solid #f0f0f0',
                    opacity: 0.4,
                  }}
                >
                  <span className="text-2xl">{badge.emoji}</span>
                  <span className="text-xs font-black text-ink text-center leading-tight" style={{ maxWidth: '5rem' }}>
                    {badge.label}
                  </span>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Recent history */}
        {sessions.length > 0 && (
          <motion.div variants={item} className="bg-white rounded-3xl p-5 shadow-card">
            <h3 className="font-fredoka font-semibold text-ink text-lg mb-4">🕐 Historique récent</h3>
            <div className="space-y-2">
              {sessions.slice(0, 10).map((s) => (
                <div key={s.id} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-sm shrink-0"
                    style={{ background: EXERCISE_GRADIENTS[s.exerciseType] ?? 'linear-gradient(135deg, #7C6FF7, #4a3fcc)' }}
                  >
                    {s.exerciseType === 'word-search' ? '🔍' :
                      s.exerciseType === 'intrus' ? '🕵️' :
                      s.exerciseType === 'coup-doeil' ? '👁️' :
                      s.exerciseType === 'phrases-brouillees' ? '🧩' :
                      s.exerciseType === 'collection' ? '🗂️' : '⚡'}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm text-ink">{EXERCISE_LABELS[s.exerciseType]}</p>
                    <p className="text-xs text-gray-400 font-semibold">{formatDate(s.playedAt)}</p>
                  </div>
                  <span
                    className="font-black text-sm px-3 py-1 rounded-full"
                    style={{
                      background: 'rgba(124,111,247,0.10)',
                      color: '#7C6FF7',
                    }}
                  >
                    {s.score} pts
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty state */}
        {sessions.length === 0 && (
          <motion.div variants={item} className="text-center py-16">
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="text-6xl mb-4"
            >
              🌱
            </motion.div>
            <h3 className="font-fredoka font-semibold text-xl text-ink mb-2">Ton aventure commence ici !</h3>
            <p className="text-gray-500 font-semibold">Joue ta première session pour voir tes stats apparaître.</p>
          </motion.div>
        )}

      </motion.div>
    </div>
  )
}
