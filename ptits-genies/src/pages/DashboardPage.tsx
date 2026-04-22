import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from 'recharts'
import { useAuthStore } from '@/store/authStore'
import { useProgressStore } from '@/store/progressStore'
import { BADGES, BADGE_CATEGORIES } from '@/data/badges'
import { calcStreak } from '@/utils/streak'

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


function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }

export default function DashboardPage() {
  const { currentUser } = useAuthStore()
  const { sessions, progress, loadProgress, syncBadges } = useProgressStore()
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (currentUser) {
      loadProgress(currentUser.id).then(() => setLoaded(true))
    }
  }, [currentUser?.id])

  const totalPoints = currentUser?.totalPoints ?? 0
  const streak = calcStreak(sessions)
  const badgeCtx = { sessions, totalPoints, progress, streak }
  const earnedBadgeIds = new Set(BADGES.filter((b) => b.condition(badgeCtx)).map((b) => b.id))

  useEffect(() => {
    if (currentUser && loaded && earnedBadgeIds.size > 0) {
      syncBadges(currentUser.id, [...earnedBadgeIds])
    }
  }, [[...earnedBadgeIds].sort().join(','), loaded])

  if (!loaded) {
    return (
      <div className="flex items-center justify-center min-h-64 text-4xl animate-pulse">⏳</div>
    )
  }

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
                        transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
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
          <h3 className="font-fredoka font-semibold text-ink text-lg mb-1">🎖️ Mes badges</h3>
          <p className="text-xs text-gray-400 font-semibold mb-4">
            {earnedBadgeIds.size} / {BADGES.length} obtenus
          </p>
          <div className="space-y-5">
            {BADGE_CATEGORIES.map((cat) => {
              const catBadges = BADGES.filter((b) => b.category === cat.id)
              return (
                <div key={cat.id}>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">{cat.label}</p>
                  <div className="flex flex-wrap gap-3">
                    {catBadges.map((badge) => {
                      const earned = earnedBadgeIds.has(badge.id)
                      return (
                        <motion.div
                          key={badge.id}
                          whileHover={earned ? { scale: 1.08 } : { scale: 1.03 }}
                          className="flex flex-col items-center gap-1 px-3 py-3 rounded-2xl transition-all"
                          style={earned ? {
                            background: 'linear-gradient(135deg, rgba(255,209,102,0.15), rgba(255,209,102,0.08))',
                            border: '2px solid rgba(255,209,102,0.5)',
                            boxShadow: '0 4px 12px rgba(255, 209, 102, 0.20)',
                          } : {
                            background: '#f9f9f9',
                            border: '2px dashed #e5e7eb',
                          }}
                        >
                          <span className="text-2xl" style={earned ? {} : { filter: 'grayscale(1)', opacity: 0.4 }}>
                            {badge.emoji}
                          </span>
                          <span
                            className="text-xs font-black text-center leading-tight"
                            style={{ maxWidth: '5.5rem', color: earned ? '#1E293B' : '#9ca3af' }}
                          >
                            {badge.label}
                          </span>
                          {!earned && (
                            <span className="text-[10px] text-gray-400 text-center leading-tight font-semibold" style={{ maxWidth: '5.5rem' }}>
                              {badge.description}
                            </span>
                          )}
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
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
