import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { useProgressStore } from '@/store/progressStore'
import { useStopwatch } from '@/hooks/useStopwatch'
import { calcPhrasesBrouilleesScore, calcPhrasesBrouilleesStars } from '@/utils/scoring'
import type { PhrasesBrouilleesExercise, PhrasesBrouilleesLevel, PhrasesSegment } from '@/types'

import level1Data from '@/data/phrasesBrouillees/level_1.json'
import level2Data from '@/data/phrasesBrouillees/level_2.json'
import level3Data from '@/data/phrasesBrouillees/level_3.json'

// ── Exercise identity ──────────────────────────────────────────────────────
const EX = {
  gradient: 'linear-gradient(135deg, #38BDF8 0%, #2563eb 100%)',
  shadow: '0 8px 28px rgba(56, 189, 248, 0.40)',
  color: '#2563eb',
  bgLight: 'rgba(56, 189, 248, 0.10)',
  emoji: '🧩',
  title: 'Phrases brouillées',
}

type Phase = 'level-select' | 'text-select' | 'playing' | 'result'
type LevelMap = Record<PhrasesBrouilleesLevel, PhrasesBrouilleesExercise[]>

const LEVELS: LevelMap = {
  1: level1Data as PhrasesBrouilleesExercise[],
  2: level2Data as PhrasesBrouilleesExercise[],
  3: level3Data as PhrasesBrouilleesExercise[],
}

const LEVEL_META: Record<PhrasesBrouilleesLevel, { label: string; emoji: string; desc: string; gradient: string }> = {
  1: { label: 'Débutant', emoji: '🌱', desc: 'Textes courts et phrases manquantes courtes', gradient: 'linear-gradient(135deg, #06D6A0, #059669)' },
  2: { label: 'Intermédiaire', emoji: '🚀', desc: 'Textes de longueur moyenne et enchaînements plus fins', gradient: 'linear-gradient(135deg, #FFD166, #f59e0b)' },
  3: { label: 'Professionnel', emoji: '🏅', desc: 'Textes longs et phrases quasi complètes', gradient: 'linear-gradient(135deg, #EF476F, #be123c)' },
}

function getStarsDisplay(stars: 0 | 1 | 2 | 3): string {
  return '★'.repeat(stars) + '☆'.repeat(3 - stars)
}

function isValidExercise(exercise: PhrasesBrouilleesExercise): boolean {
  const letters = new Set(exercise.choices.map((c) => c.letter))
  if (letters.size !== exercise.choices.length) return false
  const numbers = new Set(exercise.gaps.map((g) => g.number))
  if (numbers.size !== exercise.gaps.length) return false
  for (const gap of exercise.gaps) {
    if (!letters.has(gap.answerLetter)) return false
  }
  const segmentGapCount = exercise.segments.filter((s) => s.type === 'gap').length
  return segmentGapCount === exercise.gaps.length
}

function displaySegment(
  segment: PhrasesSegment,
  assignments: Record<number, string>,
  validated: boolean,
  correctness: Record<number, boolean>,
  onDropGap: (gapNumber: number, letter: string) => void,
) {
  if (segment.type === 'text') return <span>{segment.value}</span>

  const letter = assignments[segment.number]
  const isCorrect = correctness[segment.number]
  const baseClass = 'inline-flex items-center justify-center min-w-14 h-10 px-3 rounded-xl border-2 mx-1 align-middle font-black text-sm transition-colors'

  const stateClass = !validated
    ? 'border-primary/40 bg-primary/10 text-primary'
    : isCorrect
      ? 'border-success bg-success/20 text-success'
      : 'border-error bg-error/20 text-error'

  return (
    <span
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault()
        const draggedLetter = e.dataTransfer.getData('text/plain')
        if (draggedLetter) onDropGap(segment.number, draggedLetter)
      }}
      className={`${baseClass} ${stateClass}`}
      aria-label={`Trou numéro ${segment.number}`}
    >
      {letter ? `${segment.number}:${letter}` : `#${segment.number}`}
    </span>
  )
}

export default function PhrasesBrouilleesPage() {
  const navigate = useNavigate()
  const stopwatch = useStopwatch()
  const { currentUser, refreshPoints } = useAuthStore()
  const { saveSession } = useProgressStore()

  const [phase, setPhase] = useState<Phase>('level-select')
  const [selectedLevel, setSelectedLevel] = useState<PhrasesBrouilleesLevel>(1)
  const [availableExercises, setAvailableExercises] = useState<PhrasesBrouilleesExercise[]>([])
  const [playedByLevel, setPlayedByLevel] = useState<Record<PhrasesBrouilleesLevel, string[]>>({ 1: [], 2: [], 3: [] })
  const [exercise, setExercise] = useState<PhrasesBrouilleesExercise | null>(null)
  const [assignments, setAssignments] = useState<Record<number, string>>({})
  const [hasStartedTimer, setHasStartedTimer] = useState(false)
  const [validated, setValidated] = useState(false)
  const [correctness, setCorrectness] = useState<Record<number, boolean>>({})
  const [result, setResult] = useState({
    totalScore: 0, accuracyScore: 0, timeBonus: 0, perfectBonus: 0,
    stars: 0 as 0 | 1 | 2 | 3, correctAnswers: 0, wrongAnswers: 0,
  })

  const totalGaps = useMemo(() => exercise?.gaps.length ?? 0, [exercise])
  const filledGaps = useMemo(() => Object.keys(assignments).length, [assignments])
  const usedLetters = useMemo(() => new Set(Object.values(assignments)), [assignments])
  const canValidate = totalGaps > 0 && filledGaps === totalGaps && !validated

  function pickLevel(level: PhrasesBrouilleesLevel) {
    const pool = LEVELS[level].filter(isValidExercise)
    setSelectedLevel(level)
    setAvailableExercises(pool)
    setPhase('text-select')
  }

  function startExercise(level: PhrasesBrouilleesLevel, chosen: PhrasesBrouilleesExercise) {
    setSelectedLevel(level)
    setExercise(chosen)
    setAssignments({})
    setHasStartedTimer(false)
    setValidated(false)
    setCorrectness({})
    setResult({ totalScore: 0, accuracyScore: 0, timeBonus: 0, perfectBonus: 0, stars: 0, correctAnswers: 0, wrongAnswers: 0 })
    stopwatch.reset()
    stopwatch.start()
    setHasStartedTimer(true)
    setPhase('playing')
  }

  function handleDropGap(gapNumber: number, letter: string) {
    if (validated) return
    if (!hasStartedTimer) { stopwatch.start(); setHasStartedTimer(true) }
    setAssignments((prev) => ({ ...prev, [gapNumber]: letter }))
  }

  function handleRemoveGap(gapNumber: number) {
    if (validated) return
    setAssignments((prev) => { const next = { ...prev }; delete next[gapNumber]; return next })
  }

  async function handleValidate() {
    if (!exercise || !currentUser || !canValidate) return
    stopwatch.pause()

    const byGap: Record<number, string> = {}
    for (const g of exercise.gaps) byGap[g.number] = g.answerLetter

    const gapCorrectness: Record<number, boolean> = {}
    let correctAnswers = 0
    for (const g of exercise.gaps) {
      const ok = assignments[g.number] === byGap[g.number]
      gapCorrectness[g.number] = ok
      if (ok) correctAnswers++
    }
    const wrongAnswers = exercise.gaps.length - correctAnswers

    const scoreData = calcPhrasesBrouilleesScore({ correctAnswers, totalGaps: exercise.gaps.length, elapsedSeconds: stopwatch.seconds, wrongAnswers })
    const stars = calcPhrasesBrouilleesStars(scoreData.totalScore)

    setCorrectness(gapCorrectness)
    setValidated(true)
    setResult({ ...scoreData, stars, correctAnswers, wrongAnswers })

    await saveSession({
      id: `${Date.now()}-pb`, userId: currentUser.id, exerciseType: 'phrases-brouillees',
      score: scoreData.totalScore, duration: stopwatch.seconds, playedAt: new Date().toISOString(),
      details: {
        type: 'phrases-brouillees', level: selectedLevel, exerciseId: exercise.id,
        totalGaps: exercise.gaps.length, correctAnswers, wrongAnswers,
        accuracyScore: scoreData.accuracyScore, timeBonus: scoreData.timeBonus,
        perfectBonus: scoreData.perfectBonus, stars, totalElapsedSeconds: stopwatch.seconds,
      },
    })
    setPlayedByLevel((prev) => {
      const existing = prev[selectedLevel]
      if (existing.includes(exercise.id)) return prev
      return { ...prev, [selectedLevel]: [...existing, exercise.id] }
    })
    await refreshPoints()
    setPhase('result')
  }

  // ── Level select ────────────────────────────────────────────────────────
  if (phase === 'level-select') {
    return (
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <motion.div
            animate={{ y: [0, -7, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-24 h-24 mx-auto rounded-3xl flex items-center justify-center text-5xl mb-5"
            style={{ background: EX.gradient, boxShadow: EX.shadow }}
          >
            {EX.emoji}
          </motion.div>
          <h2 className="text-3xl font-fredoka font-semibold text-ink mb-2">{EX.title}</h2>
          <p className="text-gray-500 font-semibold">Glisse les phrases vers les trous numérotés</p>
        </div>

        <div className="space-y-3">
          {(Object.keys(LEVEL_META) as unknown as PhrasesBrouilleesLevel[]).map((level) => {
            const meta = LEVEL_META[level]
            return (
              <motion.button
                key={level}
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.02, y: -2 }}
                onClick={() => pickLevel(level)}
                className="w-full text-left bg-white rounded-2xl overflow-hidden transition-all"
                style={{ boxShadow: '0 4px 16px rgba(45,45,58,0.10)' }}
              >
                <div className="flex items-center gap-4 p-5">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                    style={{ background: meta.gradient }}
                  >
                    {meta.emoji}
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-ink">{meta.label}</p>
                    <p className="text-sm text-gray-400 font-semibold">{meta.desc}</p>
                  </div>
                  <span className="font-black text-gray-300 text-lg">→</span>
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>
    )
  }

  // ── Text select ─────────────────────────────────────────────────────────
  if (phase === 'text-select') {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
              style={{ background: EX.gradient }}
            >
              {EX.emoji}
            </div>
            <div>
              <h2 className="text-xl font-fredoka font-semibold text-ink">Choisis un texte</h2>
              <p className="text-gray-500 text-sm font-semibold">
                {LEVEL_META[selectedLevel].label} — {availableExercises.length} textes disponibles
              </p>
            </div>
          </div>
          <button
            onClick={() => setPhase('level-select')}
            className="text-sm px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 font-bold text-gray-600"
          >
            ← Retour
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {availableExercises.map((item, index) => {
            const isPlayed = playedByLevel[selectedLevel].includes(item.id)
            return (
              <motion.button
                key={item.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => startExercise(selectedLevel, item)}
                className="text-left bg-white rounded-2xl p-4 shadow-card hover:shadow-card-hover transition-all"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p
                    className="text-xs font-black"
                    style={{ color: EX.color }}
                  >
                    Texte {index + 1}
                  </p>
                  <span className={`text-[10px] px-2 py-1 rounded-full font-black ${isPlayed ? 'bg-gray-100 text-gray-500' : 'bg-success/15 text-success'}`}>
                    {isPlayed ? 'Déjà joué' : 'Nouveau'}
                  </span>
                </div>
                <p className="font-black text-ink mb-1">{item.title}</p>
                <p className="text-xs text-gray-500 font-semibold">
                  {item.gaps.length} trou{item.gaps.length > 1 ? 's' : ''}
                </p>
              </motion.button>
            )
          })}
        </div>
      </div>
    )
  }

  if (!exercise) return null

  // ── Playing ─────────────────────────────────────────────────────────────
  if (phase === 'playing') {
    const progress = totalGaps === 0 ? 0 : Math.round((filledGaps / totalGaps) * 100)

    return (
      <div className="max-w-4xl mx-auto space-y-5">
        {/* Game header */}
        <div className="bg-white rounded-2xl p-4 shadow-card flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
              style={{ background: EX.gradient }}
            >
              {EX.emoji}
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold">Niveau {LEVEL_META[selectedLevel].label}</p>
              <p className="font-black text-sm text-ink">{exercise.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl text-center" style={{ background: EX.bgLight }}>
              <p className="text-xs font-semibold" style={{ color: 'rgba(37,99,235,0.7)' }}>Trous</p>
              <p className="font-black text-sm" style={{ color: EX.color }}>{filledGaps}/{totalGaps}</p>
            </div>
            <div className="px-3 py-1.5 rounded-xl text-center" style={{ background: 'rgba(255,123,84,0.10)' }}>
              <p className="text-xs font-semibold text-gray-400">Temps</p>
              <p className="font-black text-sm tabular-nums text-secondary">{stopwatch.formatted}</p>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
            style={{ background: EX.gradient }}
          />
        </div>

        {/* Text card */}
        <div className="bg-white rounded-3xl p-5 shadow-card">
          <h3 className="font-black text-xl text-ink mb-1">{exercise.title}</h3>
          {exercise.source && <p className="text-sm text-gray-400 mb-4">{exercise.source}</p>}

          <p className="leading-9 text-ink font-semibold">
            {exercise.segments.map((segment, index) => (
              <span key={segment.type === 'text' ? `t-${index}` : `g-${segment.number}`}>
                {displaySegment(segment, assignments, false, correctness, handleDropGap)}
              </span>
            ))}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {exercise.gaps.map((g) => (
              <button
                key={g.number}
                onClick={() => handleRemoveGap(g.number)}
                className="text-xs px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 font-bold text-gray-600"
              >
                Vider #{g.number}
              </button>
            ))}
          </div>
        </div>

        {/* Choice cards */}
        <div className="bg-white rounded-3xl p-5 shadow-card">
          <h4 className="font-fredoka font-semibold text-ink text-lg mb-4">Phrases à placer</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {exercise.choices.map((choice) => {
              const isUsed = usedLetters.has(choice.letter)
              return (
                <div
                  key={choice.letter}
                  draggable={!validated}
                  onDragStart={(e) => {
                    if (!hasStartedTimer) { stopwatch.start(); setHasStartedTimer(true) }
                    e.dataTransfer.setData('text/plain', choice.letter)
                    e.dataTransfer.effectAllowed = 'move'
                  }}
                  className={`cursor-grab active:cursor-grabbing border-2 rounded-2xl p-3 transition-all ${
                    isUsed ? 'border-gray-200 bg-gray-100/80 opacity-50' : 'border-gray-100 hover:border-primary/40 bg-gray-50 hover:bg-white'
                  }`}
                >
                  <p
                    className="font-black mb-1 text-sm"
                    style={{ color: isUsed ? '#9ca3af' : EX.color }}
                  >
                    {choice.letter}
                  </p>
                  <p className="text-sm font-semibold leading-6 text-ink">{choice.text}</p>
                </div>
              )
            })}
          </div>
        </div>

        <motion.button
          whileTap={{ scale: canValidate ? 0.97 : 1 }}
          disabled={!canValidate}
          onClick={handleValidate}
          className="w-full font-black py-4 rounded-2xl transition-all text-lg"
          style={canValidate
            ? { background: EX.gradient, color: 'white', boxShadow: EX.shadow }
            : { background: '#e5e7eb', color: '#9ca3af', cursor: 'not-allowed' }
          }
        >
          Vérifier mes réponses ✓
        </motion.button>
      </div>
    )
  }

  // ── Result ──────────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-lg mx-auto text-center py-8"
    >
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0.6, delay: 0.1 }}
        className="text-7xl mb-4"
      >
        🎉
      </motion.div>
      <h2 className="text-3xl font-fredoka font-semibold text-ink mb-2">Résultat</h2>
      <p className="text-2xl text-yellow-500 font-black mb-6">{getStarsDisplay(result.stars)}</p>

      <div className="bg-white rounded-3xl p-6 shadow-card space-y-4 mb-6">
        <div>
          <p
            className="text-6xl font-fredoka font-bold score-reveal"
            style={{ background: EX.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
          >
            {result.totalScore}
          </p>
          <p className="text-gray-400 font-semibold mt-1">points</p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {[
            { label: 'Bonnes réponses', value: `${result.correctAnswers}/${totalGaps}`, color: 'text-success' },
            { label: 'Durée', value: stopwatch.formatted, color: 'text-secondary' },
            { label: 'Précision', value: String(result.accuracyScore), color: 'text-ink' },
            { label: 'Bonus temps', value: `+${result.timeBonus}`, color: 'text-ink' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-gray-50 rounded-xl p-3">
              <p className={`font-black text-lg ${color}`}>{value}</p>
              <p className="text-gray-400 font-semibold text-xs">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => startExercise(selectedLevel, exercise)}
          className="flex-1 text-white font-bold py-3 rounded-2xl active:scale-95 transition-all"
          style={{ background: EX.gradient, boxShadow: EX.shadow }}
        >
          Rejouer
        </button>
        <button
          onClick={() => navigate('/exercices')}
          className="flex-1 bg-gray-100 text-ink font-bold py-3 rounded-2xl hover:bg-gray-200 transition-colors"
        >
          Exercices
        </button>
      </div>
    </motion.div>
  )
}
