import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { useProgressStore } from '@/store/progressStore'
import { calcLectureScore } from '@/utils/scoring'
import { SpeedPicker, speedOptions } from '@/components/exercises/LectureRapide/SpeedPicker'
import { TextMask } from '@/components/exercises/LectureRapide/TextMask'
import { QCMBlock } from '@/components/exercises/LectureRapide/QCMBlock'
import type { LectureText, SpeedOption, QCMQuestion } from '@/types'

import texts1 from '@/data/lectureRapide/texts_niveau1.json'
import texts2 from '@/data/lectureRapide/texts_niveau2.json'
import texts3 from '@/data/lectureRapide/texts_niveau3.json'

// ── Exercise identity ──────────────────────────────────────────────────────
const EX = {
  gradient: 'linear-gradient(135deg, #FFD166 0%, #f59e0b 100%)',
  shadow: '0 8px 28px rgba(255, 209, 102, 0.45)',
  color: '#b45309',
  bgLight: 'rgba(255, 209, 102, 0.12)',
  emoji: '⚡',
  title: 'Lecture rapide',
}

const allTexts = [
  texts1 as LectureText[],
  texts2 as LectureText[],
  texts3 as LectureText[],
]

type Phase = 'level-select' | 'text-select' | 'speed-select' | 'reading' | 'qcm' | 'result'

const LEVEL_META = [
  { gradient: 'linear-gradient(135deg, #06D6A0, #059669)', emoji: '🌱', label: 'Débutant', words: '~250 mots' },
  { gradient: 'linear-gradient(135deg, #FFD166, #f59e0b)', emoji: '🚀', label: 'Intermédiaire', words: '~500 mots' },
  { gradient: 'linear-gradient(135deg, #EF476F, #be123c)', emoji: '🏅', label: 'Professionnel', words: '~750 mots' },
]

export default function LectureRapidePage() {
  const navigate = useNavigate()
  const { currentUser, refreshPoints } = useAuthStore()
  const { saveSession } = useProgressStore()

  const [phase, setPhase] = useState<Phase>('level-select')
  const [selectedLevel, setSelectedLevel] = useState<1 | 2 | 3>(1)
  const [selectedSpeed, setSelectedSpeed] = useState<SpeedOption>(speedOptions[1])
  const [currentText, setCurrentText] = useState<LectureText | null>(null)
  const [score, setScore] = useState(0)
  const [selectedQuestions, setSelectedQuestions] = useState<QCMQuestion[]>([])
  const [sessionStart] = useState(Date.now())

  function pickRandomText(level: 1 | 2 | 3): LectureText {
    const pool = allTexts[level - 1]
    return pool[Math.floor(Math.random() * pool.length)]
  }

  function pickQuestions(text: LectureText): QCMQuestion[] {
    const shuffled = [...text.qcm].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, 3)
  }

  function goToQCM() {
    if (!currentText) return
    setSelectedQuestions(pickQuestions(currentText))
    setPhase('qcm')
  }

  async function handleQCMSubmit(correctCount: number) {
    const finalScore = calcLectureScore(correctCount, selectedSpeed.multiplier, selectedLevel)
    setScore(finalScore)
    if (!currentUser || !currentText) return
    const duration = Math.round((Date.now() - sessionStart) / 1000)
    await saveSession({
      id: `${Date.now()}-lr`, userId: currentUser.id, exerciseType: 'lecture-rapide',
      score: finalScore, duration, playedAt: new Date().toISOString(),
      details: {
        type: 'lecture-rapide', level: selectedLevel,
        speedMultiplier: selectedSpeed.multiplier, qcmScore: correctCount, textId: currentText.id,
      },
    })
    await refreshPoints()
    setPhase('result')
  }

  // ── Level select ────────────────────────────────────────────────────────
  if (phase === 'level-select') {
    return (
      <div className="max-w-lg mx-auto">
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
          <p className="text-gray-500 font-semibold">Choisis la longueur du texte</p>
        </div>

        <div className="space-y-3">
          {([1, 2, 3] as const).map((lvl) => {
            const meta = LEVEL_META[lvl - 1]
            const genres = allTexts[lvl - 1].map((t) => t.genre).filter((v, i, a) => a.indexOf(v) === i).slice(0, 3).join(', ')
            return (
              <motion.button
                key={lvl}
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.02, y: -2 }}
                onClick={() => { setSelectedLevel(lvl); setPhase('text-select') }}
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
                      <p className="font-black text-ink">Niveau {lvl} — {meta.label}</p>
                      <span
                        className="text-xs font-black px-2 py-0.5 rounded-full"
                        style={{ background: EX.bgLight, color: EX.color }}
                      >
                        {meta.words}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 font-semibold">{genres}</p>
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
    const texts = allTexts[selectedLevel - 1]
    const meta = LEVEL_META[selectedLevel - 1]
    return (
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
            style={{ background: EX.gradient }}
          >
            {EX.emoji}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-fredoka font-semibold text-ink">Choisis ton texte</h2>
            <p className="text-gray-500 text-sm font-semibold">Niveau {selectedLevel} — {meta.label}</p>
          </div>
          <button
            onClick={() => setPhase('level-select')}
            className="text-sm px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 font-bold text-gray-600"
          >
            ← Retour
          </button>
        </div>

        <div className="space-y-3">
          {texts.map((t) => (
            <motion.button
              key={t.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => { setCurrentText(t); setPhase('speed-select') }}
              className="w-full text-left bg-white rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-black text-ink truncate">{t.title}</p>
                  <p className="text-gray-400 text-sm font-semibold mt-0.5">{t.genre}</p>
                </div>
                <span className="font-black text-gray-300 text-lg shrink-0">→</span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    )
  }

  // ── Speed select ────────────────────────────────────────────────────────
  if (phase === 'speed-select') {
    return (
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
            style={{ background: EX.gradient }}
          >
            {EX.emoji}
          </div>
          <div>
            <h2 className="text-xl font-fredoka font-semibold text-ink">Choisis ta vitesse</h2>
            <p className="text-gray-500 text-sm font-semibold">Plus tu lis vite, plus tu gagnes !</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-card mb-5">
          <SpeedPicker selected={selectedSpeed.id} onChange={setSelectedSpeed} />
        </div>

        <div
          className="rounded-2xl p-4 mb-5 text-sm font-semibold text-ink flex items-start gap-2"
          style={{ background: EX.bgLight, border: `1.5px solid rgba(255,209,102,0.30)` }}
        >
          <span className="text-lg shrink-0">ℹ️</span>
          <span>Les mots du texte vont disparaître progressivement. Lis-les avant qu'ils s'effacent !</span>
        </div>

        <button
          onClick={() => setPhase('reading')}
          className="w-full text-ink font-black py-4 rounded-2xl text-lg active:scale-95 transition-all"
          style={{ background: EX.gradient, boxShadow: EX.shadow }}
        >
          Commencer la lecture ! 📖
        </button>
        <button
          onClick={() => setPhase('text-select')}
          className="w-full mt-3 text-gray-400 font-semibold py-2 hover:text-gray-600 transition-colors"
        >
          ← Retour
        </button>
      </div>
    )
  }

  // ── Reading ─────────────────────────────────────────────────────────────
  if (phase === 'reading' && currentText) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl p-4 shadow-card mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
              style={{ background: EX.gradient }}
            >
              {EX.emoji}
            </div>
            <div>
              <p className="font-black text-ink text-sm truncate max-w-40">{currentText.title}</p>
              <p className="text-xs text-gray-400 font-semibold">{currentText.genre}</p>
            </div>
          </div>
          <div
            className="px-3 py-1.5 rounded-xl text-center"
            style={{ background: EX.bgLight }}
          >
            <p className="text-xs font-semibold" style={{ color: EX.color }}>Vitesse</p>
            <p className="font-black text-sm" style={{ color: EX.color }}>{selectedSpeed.emoji} ×{selectedSpeed.multiplier}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-card mb-4 min-h-48">
          <TextMask text={currentText.text} wpm={selectedSpeed.wpm} onComplete={goToQCM} />
        </div>

        <p className="text-center text-sm text-gray-400 font-semibold animate-pulse">
          📖 Lis avant que les mots disparaissent…
        </p>
      </div>
    )
  }

  // ── QCM ─────────────────────────────────────────────────────────────────
  if (phase === 'qcm' && currentText) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl p-4 shadow-card mb-4 flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
            style={{ background: EX.gradient }}
          >
            🧠
          </div>
          <div>
            <p className="font-black text-ink text-sm">Questions de compréhension</p>
            <p className="text-xs text-gray-400 font-semibold">Tu as bien lu ? Prouve-le !</p>
          </div>
        </div>
        <QCMBlock questions={selectedQuestions} onSubmit={handleQCMSubmit} />
      </div>
    )
  }

  // ── Result ──────────────────────────────────────────────────────────────
  if (phase === 'result') {
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
          🎓
        </motion.div>
        <h2 className="text-3xl font-fredoka font-semibold text-ink mb-6">Lecture terminée !</h2>

        <div className="bg-white rounded-3xl p-8 shadow-card mb-6 space-y-4">
          <div>
            <p
              className="text-6xl font-fredoka font-bold score-reveal"
              style={{ background: EX.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
            >
              {score}
            </p>
            <p className="text-gray-400 font-semibold mt-1">points gagnés</p>
          </div>
          <div className="border-t pt-4 flex justify-center gap-4 text-sm font-semibold text-gray-500">
            <span>Vitesse : {selectedSpeed.emoji} ×{selectedSpeed.multiplier}</span>
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
            onClick={() => setPhase('level-select')}
            className="flex-1 text-ink font-bold py-3 rounded-2xl active:scale-95 transition-all"
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
