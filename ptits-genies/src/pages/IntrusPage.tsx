import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { useProgressStore } from '@/store/progressStore'
import { useTimer } from '@/hooks/useTimer'
import { calcIntrusScore } from '@/utils/scoring'
import { IntrusWordChip } from '@/components/exercises/Intrus/IntrusWordChip'
import type { IntrusLevel, IntrusList } from '@/types'

import level1Data from '@/data/intrus/level_1.json'
import level2Data from '@/data/intrus/level_2.json'
import level3Data from '@/data/intrus/level_3.json'
import level4Data from '@/data/intrus/level_4.json'
import level5Data from '@/data/intrus/level_5.json'

const allLevels = [level1Data, level2Data, level3Data, level4Data, level5Data] as IntrusLevel[]
const LISTS_PER_SESSION = 10

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildWordList(item: IntrusList): string[] {
  const words: string[] = []
  for (const w of item.pairedWords) {
    words.push(w, w)
  }
  words.push(item.intruder)
  return shuffle(words)
}

type ChipState = 'idle' | 'correct' | 'wrong' | 'revealed'
type Phase = 'level-select' | 'intro' | 'playing' | 'list-result' | 'session-result'

export default function IntrusPage() {
  const navigate = useNavigate()
  const { currentUser, refreshPoints } = useAuthStore()
  const { saveSession } = useProgressStore()

  const [phase, setPhase] = useState<Phase>('level-select')
  const [selectedLevel, setSelectedLevel] = useState(1)
  const [sessionLists, setSessionLists] = useState<IntrusList[]>([])
  const [listIndex, setListIndex] = useState(0)
  const [words, setWords] = useState<string[]>([])
  const [chipStates, setChipStates] = useState<ChipState[]>([])
  const [answered, setAnswered] = useState(false)
  const [lastCorrect, setLastCorrect] = useState(false)
  const [totalScore, setTotalScore] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [sessionStart] = useState(Date.now())

  const levelData = allLevels[selectedLevel - 1]
  const currentList = sessionLists[listIndex]

  const handleTimerExpire = useCallback(() => {
    if (!answered) revealAnswer(false)
  }, [answered, listIndex])

  const timer = useTimer(levelData?.timeLimit ?? 30, handleTimerExpire)

  function startSession(level: number) {
    const lvl = allLevels[level - 1]
    const lists = shuffle(lvl.lists).slice(0, LISTS_PER_SESSION)
    setSessionLists(lists)
    setListIndex(0)
    setTotalScore(0)
    setCorrectCount(0)
    setAnswered(false)
    setSelectedLevel(level)
    loadList(lists[0])
    setPhase('playing')
    setTimeout(() => timer.start(), 50)
  }

  function loadList(item: IntrusList) {
    const ws = buildWordList(item)
    setWords(ws)
    setChipStates(ws.map(() => 'idle'))
    setAnswered(false)
    setLastCorrect(false)
  }

  function revealAnswer(correct: boolean) {
    if (answered) return
    setAnswered(true)
    setLastCorrect(correct)
    timer.pause()

    const score = calcIntrusScore(correct, timer.seconds)
    setTotalScore((s) => s + score)
    if (correct) setCorrectCount((c) => c + 1)

    // Reveal all: correct = success chip, others = revealed
    setChipStates((prev) =>
      prev.map((_, i) => {
        if (words[i] === currentList.intruder) return correct ? 'correct' : 'revealed'
        return 'idle'
      })
    )

    setTimeout(() => nextList(score), 1800)
  }

  function handleChipClick(index: number) {
    if (answered) return
    const clicked = words[index]
    const correct = clicked === currentList.intruder

    setChipStates((prev) =>
      prev.map((s, i) => {
        if (i === index) return correct ? 'correct' : 'wrong'
        return s
      })
    )

    if (!correct) {
      setTimeout(() => {
        setChipStates((prev) => prev.map((s, i) => i === index ? 'idle' : s))
      }, 600)
      revealAnswer(false)
    } else {
      revealAnswer(true)
    }
  }

  function nextList(score?: number) {
    if (listIndex >= sessionLists.length - 1) {
      finishSession(score)
      return
    }
    const next = listIndex + 1
    setListIndex(next)
    loadList(sessionLists[next])
    timer.reset(levelData.timeLimit)
    setTimeout(() => timer.start(), 50)
  }

  async function finishSession(lastScore?: number) {
    if (!currentUser) return
    const finalScore = totalScore + (lastScore ?? 0)
    const duration = Math.round((Date.now() - sessionStart) / 1000)
    await saveSession({
      id: `${Date.now()}-intrus`,
      userId: currentUser.id,
      exerciseType: 'intrus',
      score: finalScore,
      duration,
      playedAt: new Date().toISOString(),
      details: {
        type: 'intrus',
        level: selectedLevel,
        correctAnswers: correctCount,
        totalLists: LISTS_PER_SESSION,
      },
    })
    await refreshPoints()
    setPhase('session-result')
  }

  // Level select
  if (phase === 'level-select') {
    return (
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🕵️</div>
          <h2 className="text-3xl font-black text-ink">L'Intrus</h2>
          <p className="text-gray-500 font-semibold mt-2">Choisis ton niveau de difficulté</p>
        </div>
        <div className="space-y-3">
          {[
            { level: 1, label: 'Débutant', emoji: '⭐', desc: 'Mots simples — 9 mots par liste' },
            { level: 2, label: 'Intermédiaire', emoji: '⭐⭐', desc: 'Mots plus longs — 17 à 19 mots par liste' },
            { level: 3, label: 'Avancé', emoji: '⭐⭐⭐', desc: 'Vocabulaire soutenu — 23 à 25 mots par liste' },
            { level: 4, label: 'Expert', emoji: '⭐⭐⭐⭐', desc: 'Mots complexes et proches — 29 à 31 mots' },
            { level: 5, label: 'Génie', emoji: '⭐⭐⭐⭐⭐', desc: 'Mots en -tion très similaires — 35 mots par liste' },
          ].map((l) => (
            <motion.button
              key={l.level}
              whileTap={{ scale: 0.97 }}
              onClick={() => startSession(l.level)}
              className="w-full text-left bg-white rounded-2xl p-4 shadow hover:shadow-md transition-shadow flex items-center gap-4"
            >
              <span className="text-2xl">{l.emoji}</span>
              <div>
                <p className="font-black text-ink">{l.label}</p>
                <p className="text-gray-500 text-sm font-semibold">{l.desc}</p>
              </div>
              <span className="ml-auto text-primary font-bold">→</span>
            </motion.button>
          ))}
        </div>
      </div>
    )
  }

  // Session result
  if (phase === 'session-result') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto text-center py-12"
      >
        <div className="text-6xl mb-4">🏆</div>
        <h2 className="text-3xl font-black text-ink mb-6">Bravo !</h2>
        <div className="bg-white rounded-3xl p-8 shadow-xl mb-6 space-y-4">
          <div>
            <p className="text-5xl font-black text-primary">{totalScore}</p>
            <p className="text-gray-500 font-semibold">points gagnés</p>
          </div>
          <div className="border-t pt-4">
            <p className="text-lg font-black text-ink">{correctCount} / {LISTS_PER_SESSION} bonnes réponses</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/accueil')} className="flex-1 bg-gray-100 text-ink font-bold py-3 rounded-2xl">Accueil</button>
          <button onClick={() => setPhase('level-select')} className="flex-1 bg-secondary text-white font-bold py-3 rounded-2xl">Rejouer</button>
        </div>
      </motion.div>
    )
  }

  // Playing
  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-gray-400 font-semibold">Liste {listIndex + 1} / {LISTS_PER_SESSION}</p>
          <p className="font-black text-lg text-ink">Trouve <span className="text-secondary">l'intrus</span> !</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-gray-400">Score</p>
            <p className="font-black text-secondary">{totalScore}</p>
          </div>
          <div className="relative w-14 h-14 flex items-center justify-center">
            <svg className="absolute inset-0 -rotate-90" width="56" height="56">
              <circle cx="28" cy="28" r="20" fill="none" stroke="#e5e7eb" strokeWidth="4" />
              <circle
                cx="28" cy="28" r="20" fill="none"
                stroke={timer.seconds > levelData.timeLimit * 0.5 ? '#06D6A0' : timer.seconds > levelData.timeLimit * 0.25 ? '#FFD166' : '#EF476F'}
                strokeWidth="4"
                strokeDasharray={2 * Math.PI * 20}
                strokeDashoffset={2 * Math.PI * 20 * (1 - timer.seconds / levelData.timeLimit)}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
              />
            </svg>
            <span className="font-black text-xs text-ink z-10">{timer.seconds}s</span>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="flex gap-1 mb-6">
        {sessionLists.map((_, i) => (
          <div key={i} className={`flex-1 h-2 rounded-full transition-colors ${i < listIndex ? 'bg-success' : i === listIndex ? 'bg-secondary' : 'bg-gray-200'}`} />
        ))}
      </div>

      {/* Words grid */}
      <div className="flex flex-wrap gap-3 justify-center min-h-32 mb-6">
        <AnimatePresence>
          {words.map((word, i) => (
            <motion.div key={`${listIndex}-${i}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <IntrusWordChip
                word={word}
                onClick={() => handleChipClick(i)}
                state={chipStates[i]}
                disabled={answered}
                size={words.length > 20 ? 'sm' : 'md'}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {answered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`text-center py-3 rounded-2xl font-black text-lg ${lastCorrect ? 'bg-success/20 text-success' : 'bg-error/20 text-error'}`}
          >
            {lastCorrect ? '✅ Bravo ! L\'intrus était bien ' : '❌ L\'intrus était : '}<span className="font-black">{currentList?.intruder}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
