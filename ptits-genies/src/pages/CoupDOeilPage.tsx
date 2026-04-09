import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { useProgressStore } from '@/store/progressStore'
import { useStopwatch } from '@/hooks/useStopwatch'
import { calcCoupDoeilScore, calcCoupDoeilTimeBonus } from '@/utils/scoring'
import { SERIES_LIST, getSeriesById } from '@/data/coupDoeil/series'
import { ThemeHeader } from '@/components/exercises/CoupDoeil/ThemeHeader'
import { ColumnDisplay } from '@/components/exercises/CoupDoeil/ColumnDisplay'
import { CorrectionView } from '@/components/exercises/CoupDoeil/CorrectionView'
import { StopwatchDisplay } from '@/components/exercises/WordSearch/TimerCircle'
import type { CoupDoeilThemeKey } from '@/types'

// ── Exercise identity ──────────────────────────────────────────────────────
const EX = {
  gradient: 'linear-gradient(135deg, #06D6A0 0%, #059669 100%)',
  shadow: '0 8px 28px rgba(6, 214, 160, 0.40)',
  color: '#059669',
  bgLight: 'rgba(6, 214, 160, 0.10)',
  emoji: '👁️',
  title: "D'un seul coup d'œil",
}

type Phase = 'intro' | 'series-select' | 'playing' | 'correction' | 'session-result'

const DIFFICULTY_STARS = ['★', '★★', '★★★', '★★★★']

export default function CoupDOeilPage() {
  const navigate = useNavigate()
  const { currentUser, refreshPoints } = useAuthStore()
  const { saveSession } = useProgressStore()
  const stopwatch = useStopwatch()

  const [phase, setPhase] = useState<Phase>('intro')
  const [seriesId, setSeriesId] = useState<number>(1)
  const [assignments, setAssignments] = useState<Record<string, CoupDoeilThemeKey>>({})
  const [seriesScore, setSeriesScore] = useState(0)
  const [timeBonus, setTimeBonus] = useState(0)
  const [stats, setStats] = useState({ correct: 0, wrong: 0, missed: 0, falseAlarms: 0, perfect: false })

  const series = getSeriesById(seriesId)

  function handleSeriesSelect(id: number) {
    setSeriesId(id)
    setAssignments({})
    setSeriesScore(0)
    setTimeBonus(0)
    setStats({ correct: 0, wrong: 0, missed: 0, falseAlarms: 0, perfect: false })
    stopwatch.reset()
    setPhase('playing')
    setTimeout(() => stopwatch.start(), 50)
  }

  function handleAssign(wordId: string, theme: CoupDoeilThemeKey | null) {
    setAssignments((prev) => {
      const next = { ...prev }
      if (theme === null) delete next[wordId]
      else next[wordId] = theme
      return next
    })
  }

  async function handleValidate() {
    if (!series || !currentUser) return
    stopwatch.pause()
    const allWords = series.columns.flat()
    const targets = allWords.filter((w) => w.theme !== null)
    const totalTargets = targets.length
    let correct = 0, wrong = 0, missed = 0, falseAlarms = 0
    for (const word of allWords) {
      const assigned = assignments[word.id]
      if (word.theme === null) { if (assigned !== undefined) falseAlarms++ }
      else { if (assigned === undefined) missed++; else if (assigned === word.theme) correct++; else wrong++ }
    }
    const isPerfect = wrong === 0 && missed === 0 && falseAlarms === 0 && correct === totalTargets
    const score = calcCoupDoeilScore({ correctCategorizations: correct, wrongCategorizations: wrong, missedTargets: missed, falseAlarms, totalTargets })
    const bonus = calcCoupDoeilTimeBonus(stopwatch.seconds)
    setSeriesScore(score)
    setTimeBonus(bonus)
    setStats({ correct, wrong, missed, falseAlarms, perfect: isPerfect })
    await saveSession({
      id: `${Date.now()}-cd`, userId: currentUser.id, exerciseType: 'coup-doeil',
      score: score + bonus, duration: stopwatch.seconds, playedAt: new Date().toISOString(),
      details: { type: 'coup-doeil', seriesId, correctCategorizations: correct, wrongCategorizations: wrong, missedTargets: missed, falseAlarms, totalElapsedSeconds: stopwatch.seconds },
    })
    await refreshPoints()
    setPhase('correction')
  }

  function feedbackMessage() {
    const allWords = series?.columns.flat() ?? []
    const totalTargets = allWords.filter((w) => w.theme !== null).length
    if (totalTargets === 0) return 'Bien joué !'
    const ratio = stats.correct / totalTargets
    if (ratio >= 0.8) return 'Excellent ! Tu as un regard de faucon !'
    if (ratio >= 0.5) return "Bravo ! Continue comme ça !"
    return "Bien essayé ! Rejoue pour t'améliorer !"
  }

  // ── Intro ─────────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <div className="max-w-lg mx-auto text-center py-10">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', bounce: 0.5 }}
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-24 h-24 mx-auto rounded-3xl flex items-center justify-center text-5xl mb-6"
            style={{ background: EX.gradient, boxShadow: EX.shadow }}
          >
            {EX.emoji}
          </motion.div>
          <h2 className="text-3xl font-fredoka font-semibold text-ink mb-2">{EX.title}</h2>
          <p className="text-gray-500 font-semibold mb-8">Exploite ton champ de vision !</p>
        </motion.div>

        <div className="bg-white rounded-3xl p-6 shadow-card mb-6 text-left space-y-4">
          {[
            { icon: '👀', text: 'Lis chaque colonne du regard, de haut en bas, le long du trait central.' },
            { icon: '🏷️', text: 'Clique sur un mot pour lui attribuer la catégorie a, b ou c.' },
            { icon: '🎯', text: 'Chaque série a 3 thèmes à identifier. Les autres mots sont des distracteurs.' },
            { icon: '⚡', text: 'Plus tu vas vite, plus tu gagnes de points de vitesse !' },
          ].map(({ icon, text }) => (
            <div key={icon} className="flex items-start gap-3">
              <span className="text-xl shrink-0">{icon}</span>
              <span className="text-sm font-semibold text-ink">{text}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => setPhase('series-select')}
          className="text-white font-black px-10 py-4 rounded-2xl text-xl active:scale-95 transition-all"
          style={{ background: EX.gradient, boxShadow: EX.shadow }}
        >
          C'est parti !
        </button>
      </div>
    )
  }

  // ── Series Select ─────────────────────────────────────────────────────
  if (phase === 'series-select') {
    return (
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
            style={{ background: EX.gradient }}
          >
            {EX.emoji}
          </div>
          <h2 className="text-xl font-fredoka font-semibold text-ink">Choisis ta série</h2>
        </div>

        <div className="space-y-3">
          {SERIES_LIST.map((s, i) => (
            <motion.button
              key={s.id}
              whileTap={{ scale: 0.97 }}
              whileHover={{ scale: 1.02, y: -2 }}
              onClick={() => handleSeriesSelect(s.id)}
              className="w-full text-left bg-white rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-black text-ink">{s.label}</span>
                <span className="text-yellow-500 text-sm font-bold">{DIFFICULTY_STARS[i]}</span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {(['a', 'b', 'c'] as CoupDoeilThemeKey[]).map((k) => {
                  const colors: Record<CoupDoeilThemeKey, string> = { a: EX.color, b: '#2563eb', c: '#f59e0b' }
                  return (
                    <span key={k} className="text-xs font-semibold" style={{ color: colors[k] }}>
                      {k}) {s.themes[k]}
                    </span>
                  )
                })}
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    )
  }

  // ── Playing ─────────────────────────────────────────────────────────────
  if (phase === 'playing' && series) {
    return (
      <div className="max-w-2xl mx-auto flex flex-col gap-4">
        {/* Game header */}
        <div className="bg-white rounded-2xl p-4 shadow-card flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
              style={{ background: EX.gradient }}
            >
              {EX.emoji}
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold">Série</p>
              <p className="font-black text-ink text-sm">{series.label}</p>
            </div>
          </div>
          <StopwatchDisplay formatted={stopwatch.formatted} seconds={stopwatch.seconds} />
        </div>

        <ThemeHeader themes={series.themes} />

        <div className="bg-white rounded-3xl shadow-card p-4">
          <ColumnDisplay columns={series.columns} assignments={assignments} onAssign={handleAssign} mode="playing" />
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleValidate}
          className="w-full text-white font-black py-4 rounded-2xl active:scale-95 transition-all"
          style={{ background: EX.gradient, boxShadow: EX.shadow }}
        >
          Valider mes réponses ✓
        </motion.button>
      </div>
    )
  }

  // ── Correction ─────────────────────────────────────────────────────────
  if (phase === 'correction' && series) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-4">
          <h2 className="font-fredoka font-semibold text-ink text-xl">Correction — {series.label}</h2>
          <ThemeHeader themes={series.themes} />
        </div>
        <CorrectionView
          series={series}
          assignments={assignments}
          seriesScore={seriesScore}
          stats={stats}
          onContinue={() => setPhase('session-result')}
        />
      </div>
    )
  }

  // ── Session Result ─────────────────────────────────────────────────────
  if (phase === 'session-result') {
    const total = seriesScore + timeBonus
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto text-center py-12"
      >
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', bounce: 0.6, delay: 0.1 }}
          className="text-7xl mb-4"
        >
          🎉
        </motion.div>
        <h2 className="text-3xl font-fredoka font-semibold text-ink mb-2">{feedbackMessage()}</h2>

        <div className="bg-white rounded-3xl p-8 shadow-card mb-6 space-y-4">
          <div>
            <p
              className="text-6xl font-fredoka font-bold score-reveal"
              style={{ background: EX.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
            >
              {total}
            </p>
            <p className="text-gray-400 font-semibold mt-1">points au total</p>
          </div>

          <div className="border-t pt-3 space-y-1 text-sm text-gray-500 font-semibold">
            <p>Score de précision : {seriesScore} pts</p>
            <p>Bonus de vitesse : <span className="text-success font-black">+{timeBonus} pts</span></p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            {[
              { label: 'Corrects', value: stats.correct, color: 'text-success' },
              { label: 'Manqués', value: stats.missed, color: 'text-orange-500' },
              { label: 'Erreurs', value: stats.wrong + stats.falseAlarms, color: 'text-error' },
              { label: 'Temps', value: stopwatch.formatted, color: 'text-gray-600' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3">
                <div className={`font-black text-lg ${color}`}>{value}</div>
                <div className="text-xs text-gray-400 font-semibold">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate('/accueil')}
            className="flex-1 bg-gray-100 text-ink font-bold py-3 rounded-2xl hover:bg-gray-200 transition-colors"
          >
            Accueil
          </button>
          <button
            onClick={() => setPhase('series-select')}
            className="flex-1 text-white font-bold py-3 rounded-2xl active:scale-95 transition-all"
            style={{ background: EX.gradient, boxShadow: EX.shadow }}
          >
            Rejouer
          </button>
        </div>
      </motion.div>
    )
  }

  return null
}
