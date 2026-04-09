import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { useProgressStore } from '@/store/progressStore'
import { useStopwatch } from '@/hooks/useStopwatch'
import { calcCollectionScore, calcCollectionStars } from '@/utils/scoring'
import type { CollectionItem, CollectionLevel, CollectionSessionDetails } from '@/types'

import level1Data from '@/data/collection/level_1.json'
import level2Data from '@/data/collection/level_2.json'
import level3Data from '@/data/collection/level_3.json'

// ── Exercise identity ──────────────────────────────────────────────────────
const EX = {
  gradient: 'linear-gradient(135deg, #f472b6 0%, #db2777 100%)',
  shadow: '0 8px 28px rgba(244, 114, 182, 0.40)',
  color: '#db2777',
  bgLight: 'rgba(244, 114, 182, 0.10)',
  emoji: '🗂️',
  title: 'Collection de mots',
}

type Phase = 'level-select' | 'playing' | 'feedback' | 'result'

const LEVELS: Record<CollectionLevel, CollectionItem[]> = {
  1: level1Data as CollectionItem[],
  2: level2Data as CollectionItem[],
  3: level3Data as CollectionItem[],
}

const LEVEL_META: Record<CollectionLevel, { label: string; emoji: string; desc: string; seriesCount: number; multiplierLabel: string; gradient: string }> = {
  1: { label: 'Débutant', emoji: '🌱', desc: 'Séries courtes • catégories concrètes', seriesCount: 6, multiplierLabel: '×1', gradient: 'linear-gradient(135deg, #06D6A0, #059669)' },
  2: { label: 'Intermédiaire', emoji: '🚀', desc: 'Séries moyennes • catégories variées', seriesCount: 10, multiplierLabel: '×1.6', gradient: 'linear-gradient(135deg, #FFD166, #f59e0b)' },
  3: { label: 'Professionnel', emoji: '🏅', desc: 'Séries longues • catégories abstraites', seriesCount: 15, multiplierLabel: '×2.5', gradient: 'linear-gradient(135deg, #EF476F, #be123c)' },
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildChoices(item: CollectionItem): string[] {
  return shuffleArray([item.genericTerm, ...item.distractors])
}

function getStarsDisplay(stars: 0 | 1 | 2 | 3): string {
  return '★'.repeat(stars) + '☆'.repeat(3 - stars)
}

export default function CollectionPage() {
  const navigate = useNavigate()
  const stopwatch = useStopwatch()
  const { currentUser, refreshPoints } = useAuthStore()
  const { saveSession } = useProgressStore()

  const [phase, setPhase] = useState<Phase>('level-select')
  const [selectedLevel, setSelectedLevel] = useState<CollectionLevel>(1)
  const [queue, setQueue] = useState<CollectionItem[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [choices, setChoices] = useState<string[]>([])
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [wrongCount, setWrongCount] = useState(0)
  const [result, setResult] = useState({ totalScore: 0, accuracyScore: 0, timeBonus: 0, levelMultiplierBonus: 0, stars: 0 as 0 | 1 | 2 | 3 })

  const currentItem = queue[currentIndex] ?? null
  const totalItems = queue.length
  const progress = totalItems === 0 ? 0 : Math.round((currentIndex / totalItems) * 100)

  const shuffledWords = useMemo(() => {
    if (!currentItem) return []
    return shuffleArray(currentItem.words)
  }, [currentItem])

  function startGame(level: CollectionLevel) {
    const pool = shuffleArray(LEVELS[level])
    const count = LEVEL_META[level].seriesCount
    const selected = pool.slice(0, count)
    setSelectedLevel(level)
    setQueue(selected)
    setCurrentIndex(0)
    setCorrectCount(0)
    setWrongCount(0)
    setSelectedChoice(null)
    setIsCorrect(null)
    stopwatch.reset()
    stopwatch.start()
    setPhase('playing')
  }

  useEffect(() => {
    if (currentItem) {
      setChoices(buildChoices(currentItem))
      setSelectedChoice(null)
      setIsCorrect(null)
    }
  }, [currentIndex, currentItem])

  async function handleChoice(choice: string) {
    if (selectedChoice !== null) return
    const correct = choice === currentItem!.genericTerm
    setSelectedChoice(choice)
    setIsCorrect(correct)
    if (correct) setCorrectCount((c) => c + 1)
    else setWrongCount((c) => c + 1)
    setPhase('feedback')
  }

  async function handleNext() {
    const nextIndex = currentIndex + 1
    if (nextIndex >= totalItems) {
      stopwatch.pause()
      await finishGame(correctCount, wrongCount)
    } else {
      setCurrentIndex(nextIndex)
      setPhase('playing')
    }
  }

  async function finishGame(correct: number, wrong: number) {
    if (!currentUser) return
    const scoreData = calcCollectionScore({ correctAnswers: correct, wrongAnswers: wrong, totalItems, elapsedSeconds: stopwatch.seconds, level: selectedLevel })
    const stars = calcCollectionStars(scoreData.totalScore, selectedLevel)
    setResult({ ...scoreData, stars })
    const details: CollectionSessionDetails = { type: 'collection', level: selectedLevel, totalItems, correctAnswers: correct, wrongAnswers: wrong, accuracyScore: scoreData.accuracyScore, timeBonus: scoreData.timeBonus, levelMultiplierBonus: scoreData.levelMultiplierBonus, stars, totalElapsedSeconds: stopwatch.seconds }
    await saveSession({ id: `${Date.now()}-col`, userId: currentUser.id, exerciseType: 'collection', score: scoreData.totalScore, duration: stopwatch.seconds, playedAt: new Date().toISOString(), details })
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
          <p className="text-gray-500 font-semibold">Trouve le terme générique qui englobe tous les autres</p>
        </div>

        <div className="space-y-3">
          {([1, 2, 3] as CollectionLevel[]).map((level) => {
            const meta = LEVEL_META[level]
            return (
              <motion.button
                key={level}
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.02, y: -2 }}
                onClick={() => startGame(level)}
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
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-black text-ink">{meta.label}</p>
                      <span
                        className="text-xs font-black px-2 py-0.5 rounded-full"
                        style={{ background: EX.bgLight, color: EX.color }}
                      >
                        {meta.multiplierLabel}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 font-semibold">{meta.desc} • {meta.seriesCount} séries</p>
                  </div>
                  <span className="font-black text-gray-300 text-lg">→</span>
                </div>
              </motion.button>
            )
          })}
        </div>

        <p className="text-center text-xs text-gray-400 font-semibold mt-6">
          Un joueur professionnel gagne toujours plus qu'un débutant à erreurs égales.
        </p>
      </div>
    )
  }

  // ── Result ──────────────────────────────────────────────────────────────
  if (phase === 'result') {
    const meta = LEVEL_META[selectedLevel]
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
        <h2 className="text-3xl font-fredoka font-semibold text-ink mb-1">Résultat</h2>
        <p className="text-gray-400 font-semibold mb-2">{meta.label} {meta.emoji}</p>
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
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="font-black text-success text-lg">{correctCount}/{totalItems}</p>
              <p className="text-gray-400 font-semibold text-xs">Bonnes réponses</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="font-black text-secondary text-lg">{stopwatch.formatted}</p>
              <p className="text-gray-400 font-semibold text-xs">Durée</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="font-black text-ink text-lg">{result.accuracyScore}</p>
              <p className="text-gray-400 font-semibold text-xs">Précision</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="font-black text-ink text-lg">+{result.timeBonus}</p>
              <p className="text-gray-400 font-semibold text-xs">Bonus temps</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 col-span-2">
              <p className="font-black text-lg" style={{ color: EX.color }}>+{result.levelMultiplierBonus}</p>
              <p className="text-gray-400 font-semibold text-xs">Bonus niveau ({LEVEL_META[selectedLevel].multiplierLabel})</p>
            </div>
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
            onClick={() => startGame(selectedLevel)}
            className="flex-1 text-white font-bold py-3 rounded-2xl active:scale-95 transition-all"
            style={{ background: EX.gradient, boxShadow: EX.shadow }}
          >
            Rejouer
          </button>
        </div>
      </motion.div>
    )
  }

  // ── Playing / Feedback ─────────────────────────────────────────────────
  if (!currentItem) return null

  return (
    <div className="max-w-2xl mx-auto space-y-4">
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
            <p className="font-black text-sm text-ink">Série {currentIndex + 1} / {totalItems}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl text-center" style={{ background: EX.bgLight }}>
            <p className="text-xs font-semibold" style={{ color: 'rgba(219,39,119,0.7)' }}>Chrono</p>
            <p className="font-black text-sm tabular-nums text-lg" style={{ color: EX.color }}>{stopwatch.formatted}</p>
          </div>
          <div className="px-3 py-1.5 rounded-xl text-center" style={{ background: 'rgba(6,214,160,0.10)' }}>
            <p className="text-xs font-semibold text-gray-400">Score</p>
            <p className="font-black text-sm text-success">{correctCount} ✓ / {wrongCount} ✗</p>
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

      {/* Word list */}
      <div className="bg-white rounded-3xl p-5 shadow-card">
        <p className="text-xs text-gray-400 font-semibold mb-3">Trouve le terme générique :</p>
        <div className="flex flex-wrap gap-2">
          {shuffledWords.map((word) => (
            <span
              key={word}
              className={`px-3 py-1.5 rounded-xl font-semibold text-sm border-2 transition-colors ${
                phase === 'feedback' && word === currentItem.genericTerm
                  ? 'border-success bg-success/15 text-success font-black'
                  : 'border-gray-200 bg-gray-50 text-ink'
              }`}
            >
              {word}
            </span>
          ))}
        </div>
      </div>

      {/* QCM choices */}
      <div className="grid grid-cols-2 gap-3">
        <AnimatePresence mode="wait">
          {choices.map((choice) => {
            const isSelected = selectedChoice === choice
            const isTheCorrect = choice === currentItem.genericTerm
            let style: React.CSSProperties = { background: 'white', border: '2px solid #e5e7eb', color: '#2D2D3A' }

            if (phase === 'feedback') {
              if (isTheCorrect) style = { background: 'rgba(6,214,160,0.12)', border: '2px solid #06D6A0', color: '#06D6A0' }
              else if (isSelected && !isTheCorrect) style = { background: 'rgba(239,71,111,0.12)', border: '2px solid #EF476F', color: '#EF476F' }
              else style = { background: '#f9f9f9', border: '2px solid #f0f0f0', color: '#9ca3af' }
            }

            return (
              <motion.button
                key={choice}
                whileTap={phase === 'playing' ? { scale: 0.96 } : {}}
                onClick={() => phase === 'playing' && handleChoice(choice)}
                className="rounded-2xl p-4 font-black text-left shadow-sm transition-all"
                style={style}
              >
                <span className="text-base leading-snug">{choice}</span>
                {phase === 'feedback' && isTheCorrect && <span className="ml-2">✓</span>}
                {phase === 'feedback' && isSelected && !isTheCorrect && <span className="ml-2">✗</span>}
              </motion.button>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Feedback banner */}
      <AnimatePresence>
        {phase === 'feedback' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`rounded-2xl p-4 flex items-center justify-between gap-3 ${isCorrect ? 'bg-success/12' : 'bg-error/12'}`}
          >
            <div>
              <p className={`font-black text-lg ${isCorrect ? 'text-success' : 'text-error'}`}>
                {isCorrect ? '✓ Bonne réponse !' : '✗ Raté !'}
              </p>
              {!isCorrect && (
                <p className="text-sm font-semibold text-gray-600">
                  Le terme générique était : <span className="font-black text-ink">{currentItem.genericTerm}</span>
                </p>
              )}
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleNext}
              className="text-white font-black px-5 py-2.5 rounded-xl shadow"
              style={{ background: EX.gradient }}
            >
              {currentIndex + 1 >= totalItems ? 'Résultats' : 'Suivant →'}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
