import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { useAuthStore } from '@/store/authStore'
import { useProgressStore } from '@/store/progressStore'
import { useParcoursStore } from '@/store/parcoursStore'
import { useModeParcours } from '@/parcours/useModeParcours'
import { parametresLecture, tauxReussite } from '@/parcours/regles'
import { calcLectureScore, calcLectureBonus } from '@/utils/scoring'
import { SpeedPicker, speedOptions } from '@/components/exercises/LectureRapide/SpeedPicker'
import { TextMask } from '@/components/exercises/LectureRapide/TextMask'
import { QCMBlock } from '@/components/exercises/LectureRapide/QCMBlock'
import { Bouton, classesBouton } from '@/components/ui/Bouton'
import { Carte, classesCarte } from '@/components/ui/Carte'
import { EnTete } from '@/components/ui/EnTete'
import { EcranFin } from '@/components/ui/EcranFin'
import { Etiquette } from '@/components/ui/Etiquette'
import type { LectureText, SpeedOption, QCMQuestion } from '@/types'

import texts1 from '@/data/lectureRapide/texts_niveau1.json'
import texts2 from '@/data/lectureRapide/texts_niveau2.json'
import texts3 from '@/data/lectureRapide/texts_niveau3.json'

// ── Exercise identity ──────────────────────────────────────────────────────
const EX = {
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
  { fond: 'bg-juste', emoji: '🌱', label: 'Débutant', words: '~250 mots' },
  { fond: 'bg-jaune', emoji: '🚀', label: 'Intermédiaire', words: '~500 mots' },
  { fond: 'bg-rose-pale', emoji: '🏅', label: 'Professionnel', words: '~750 mots' },
]

function pickRandomText(level: 1 | 2 | 3): LectureText {
  const pool = allTexts[level - 1]
  return pool[Math.floor(Math.random() * pool.length)]
}

// Mode parcours : longueur, vitesse et texte fixés d'avance, la lecture démarre tout de suite.
function tirerPartieParcours(d: number): { level: 1 | 2; speed: SpeedOption; text: LectureText } {
  const { niveau, vitesse } = parametresLecture(d)
  return { level: niveau, speed: speedOptions[vitesse], text: pickRandomText(niveau) }
}

export default function LectureRapidePage() {
  const { currentUser, refreshPoints } = useAuthStore()
  const { saveSession } = useProgressStore()
  const modeParcours = useModeParcours()
  const { terminerPartie } = useParcoursStore()

  // Tirage fait une seule fois au montage (initialiseur paresseux) : la lecture s'affiche dès le
  // premier rendu, sans écran de choix, et le texte ne change pas si StrictMode rejoue le rendu.
  // cursorIndex (-1) et wordsAheadAtSubmit (0) partent déjà des valeurs du bouton « Commencer la lecture ».
  const [depart] = useState(() => (modeParcours ? tirerPartieParcours(modeParcours.difficulte) : null))

  const [phase, setPhase] = useState<Phase>(depart ? 'reading' : 'level-select')
  const [selectedLevel, setSelectedLevel] = useState<1 | 2 | 3>(depart?.level ?? 1)
  const [selectedSpeed, setSelectedSpeed] = useState<SpeedOption>(depart?.speed ?? speedOptions[1])
  const [currentText, setCurrentText] = useState<LectureText | null>(depart?.text ?? null)
  const [score, setScore] = useState(0)
  const [qcmScore, setQcmScore] = useState(0)
  const [bonusPoints, setBonusPoints] = useState(0)
  const [cursorIndex, setCursorIndex] = useState(-1)
  const [wordsAheadAtSubmit, setWordsAheadAtSubmit] = useState(0)
  const [selectedQuestions, setSelectedQuestions] = useState<QCMQuestion[]>([])
  const [sessionStart] = useState(Date.now())

  const totalWords = currentText ? currentText.text.split(/\s+/).length : 0
  const liveWordsAhead = Math.max(0, totalWords - 1 - cursorIndex)
  const livePotentialBonus = Math.round(liveWordsAhead * 5 * selectedSpeed.multiplier)

  function pickQuestions(text: LectureText): QCMQuestion[] {
    const shuffled = [...text.qcm].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, 3)
  }

  function goToQCM() {
    if (!currentText) return
    setWordsAheadAtSubmit(liveWordsAhead)
    setSelectedQuestions(pickQuestions(currentText))
    setPhase('qcm')
  }

  async function handleQCMSubmit(correctCount: number) {
    const qcm = calcLectureScore(correctCount, selectedSpeed.multiplier, selectedLevel)
    const bonus = calcLectureBonus(wordsAheadAtSubmit, selectedSpeed.multiplier, correctCount, 3)
    const finalScore = qcm + bonus
    setQcmScore(qcm)
    setBonusPoints(bonus)
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
    if (modeParcours) await terminerPartie(currentUser.id, modeParcours, tauxReussite(correctCount, 3))
    await refreshPoints()
    setPhase('result')
  }

  // ── Level select ────────────────────────────────────────────────────────
  if (phase === 'level-select') {
    return (
      <div className="max-w-lg mx-auto">
        <EnTete titre={`${EX.title} ${EX.emoji}`} />
        <p className="text-encre-doux font-semibold text-lg mb-6">Choisis la longueur du texte</p>

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
                className={`w-full text-left overflow-hidden transition-all hover:shadow-dur-lg ${classesCarte}`}
              >
                <div className="flex items-center gap-4 p-5">
                  <div
                    className={`w-12 h-12 rounded-xl border-2 border-encre flex items-center justify-center text-2xl shrink-0 ${meta.fond}`}
                  >
                    {meta.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <p className="font-black text-encre">Niveau {lvl} · {meta.label}</p>
                      <span className="text-sm font-black px-2 py-0.5 rounded-full border-2 border-encre bg-jaune text-encre">
                        {meta.words}
                      </span>
                    </div>
                    <p className="text-base text-encre-doux font-semibold">{genres}</p>
                  </div>
                  <span aria-hidden="true" className="font-black text-encre text-lg">→</span>
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
        <EnTete titre="Choisis ton texte" onRetour={() => setPhase('level-select')} />
        <p className="text-encre-doux text-lg font-semibold mb-6">Niveau {selectedLevel} · {meta.label} {meta.emoji}</p>

        <div className="space-y-3">
          {texts.map((t) => (
            <motion.button
              key={t.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => { setCurrentText(t); setPhase('speed-select') }}
              className={`w-full text-left p-5 transition-all hover:shadow-dur-lg ${classesCarte}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-black text-encre truncate">{t.title}</p>
                  <p className="text-encre-doux text-base font-semibold mt-0.5">{t.genre}</p>
                </div>
                <span aria-hidden="true" className="font-black text-encre text-lg shrink-0">→</span>
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
        <EnTete titre="Choisis ta vitesse" onRetour={() => setPhase('text-select')} />
        <p className="text-encre-doux text-lg font-semibold mb-6">Plus tu lis vite, plus tu gagnes !</p>

        <Carte className="p-6 mb-5">
          <SpeedPicker selected={selectedSpeed.id} onChange={setSelectedSpeed} />
        </Carte>

        <div className="rounded-2xl border-2 border-encre bg-bleu p-4 mb-5 text-base font-semibold text-encre flex items-start gap-2">
          <span className="text-lg shrink-0">ℹ️</span>
          <span>Les mots du texte vont disparaître progressivement. Lis-les avant qu'ils s'effacent !</span>
        </div>

        <Bouton
          taille="grand"
          onClick={() => {
            setCursorIndex(-1)
            setWordsAheadAtSubmit(0)
            setPhase('reading')
          }}
          className="w-full"
        >
          Commencer la lecture ! 📖
        </Bouton>
      </div>
    )
  }

  // En parcours : sortie vers le parcours (et étiquette du boss) pendant la lecture et le QCM.
  const enteteParcours = modeParcours && (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <Link to="/parcours" className={cn(classesBouton('discret'), 'px-2')}>← Retour au parcours</Link>
      {modeParcours.etape === 'boss' && <Etiquette couleur="rose-pale">👾 Boss du niveau</Etiquette>}
    </div>
  )

  // ── Reading ─────────────────────────────────────────────────────────────
  if (phase === 'reading' && currentText) {
    return (
      <div className="max-w-2xl mx-auto">
        {enteteParcours}
        <Carte className="p-4 mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl border-2 border-encre bg-jaune flex items-center justify-center text-xl shrink-0">
              {EX.emoji}
            </div>
            <div className="min-w-0">
              <p className="font-black text-encre text-base truncate max-w-40 md:max-w-md">{currentText.title}</p>
              <p className="text-base text-encre-doux font-semibold">{currentText.genre}</p>
            </div>
          </div>
          <div className="px-3 py-1.5 rounded-xl border-2 border-encre bg-jaune text-center shrink-0">
            <p className="text-sm font-semibold text-encre">Vitesse</p>
            <p className="font-black text-base text-encre">{selectedSpeed.emoji} ×{selectedSpeed.multiplier}</p>
          </div>
        </Carte>

        <Carte className="p-6 mb-4 min-h-48">
          <TextMask
            text={currentText.text}
            wpm={selectedSpeed.wpm}
            onComplete={goToQCM}
            onIndexChange={setCursorIndex}
          />
        </Carte>

        <div className="mb-4 flex justify-center">
          <motion.button
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, type: 'spring', bounce: 0.4 }}
            whileTap={{ scale: 0.96 }}
            onClick={goToQCM}
            className={`${classesBouton('principal', 'grand')} gap-3 max-w-md w-full sm:w-auto`}
          >
            <span>J'ai fini ! ✋</span>
            {livePotentialBonus > 0 && (
              <span className="text-base font-black px-2.5 py-1 rounded-full border-2 border-encre bg-papier text-encre">
                +{livePotentialBonus} pts
              </span>
            )}
          </motion.button>
        </div>
        <p className="text-center text-base text-encre-doux font-semibold animate-pulse">
          📖 Lis avant que les mots disparaissent…
        </p>

      </div>
    )
  }

  // ── QCM ─────────────────────────────────────────────────────────────────
  if (phase === 'qcm' && currentText) {
    return (
      <div className="max-w-2xl mx-auto">
        {enteteParcours}
        <Carte className="p-4 mb-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl border-2 border-encre bg-rose-pale flex items-center justify-center text-xl shrink-0">
            🧠
          </div>
          <div>
            <p className="font-black text-encre text-base">Questions de compréhension</p>
            <p className="text-base text-encre-doux font-semibold">Tu as bien lu ? Prouve-le !</p>
          </div>
        </Carte>
        <QCMBlock questions={selectedQuestions} onSubmit={handleQCMSubmit} />
      </div>
    )
  }

  // ── Result ──────────────────────────────────────────────────────────────
  if (phase === 'result') {
    return (
      <EcranFin
        titre="Lecture terminée ! 🎓"
        score={score}
        detail="points gagnés"
        onRejouer={() => setPhase('level-select')}
        retourVers="/accueil"
        parcours={!!modeParcours}
      >
        <div className="space-y-2 border-t-2 border-encre/20 pt-4 text-base font-bold text-encre">
          {bonusPoints > 0 && (
            <>
              <div className="flex justify-between gap-3">
                <span>Compréhension (QCM)</span>
                <span className="shrink-0">+{qcmScore} pts</span>
              </div>
              <div className="flex justify-between gap-3">
                <span>⚡ Bonus de vitesse ({wordsAheadAtSubmit} mot{wordsAheadAtSubmit > 1 ? 's' : ''} d'avance)</span>
                <span className="shrink-0">+{bonusPoints} pts</span>
              </div>
            </>
          )}
          <p className="text-center text-encre-doux">Vitesse : {selectedSpeed.emoji} ×{selectedSpeed.multiplier}</p>
        </div>
      </EcranFin>
    )
  }

  return null
}
