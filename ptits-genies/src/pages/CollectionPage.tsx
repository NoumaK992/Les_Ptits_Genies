import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { useProgressStore } from '@/store/progressStore'
import { useParcoursStore } from '@/store/parcoursStore'
import { useModeParcours } from '@/parcours/useModeParcours'
import { tauxReussite } from '@/parcours/regles'
import { useStopwatch } from '@/hooks/useStopwatch'
import { calcCollectionScore, calcCollectionStars } from '@/utils/scoring'
import { classesBouton } from '@/components/ui/Bouton'
import { BoutonMot, type EtatMot } from '@/components/ui/BoutonMot'
import { Carte, classesCarte } from '@/components/ui/Carte'
import { EnTete } from '@/components/ui/EnTete'
import { EcranFin } from '@/components/ui/EcranFin'
import { Etiquette } from '@/components/ui/Etiquette'
import type { CollectionItem, CollectionLevel, CollectionSessionDetails } from '@/types'

import level1Data from '@/data/collection/level_1.json'
import level2Data from '@/data/collection/level_2.json'
import level3Data from '@/data/collection/level_3.json'

// ── Exercise identity ──────────────────────────────────────────────────────
const EX = {
  emoji: '🗂️',
  title: 'Collection de mots',
}

type Phase = 'level-select' | 'playing' | 'feedback' | 'result'

const LEVELS: Record<CollectionLevel, CollectionItem[]> = {
  1: level1Data as CollectionItem[],
  2: level2Data as CollectionItem[],
  3: level3Data as CollectionItem[],
}

const LEVEL_META: Record<CollectionLevel, { label: string; emoji: string; desc: string; seriesCount: number; multiplierLabel: string; fond: string }> = {
  1: { label: 'Débutant', emoji: '🌱', desc: 'Séries courtes • catégories concrètes', seriesCount: 6, multiplierLabel: '×1', fond: 'bg-juste' },
  2: { label: 'Intermédiaire', emoji: '🚀', desc: 'Séries moyennes • catégories variées', seriesCount: 10, multiplierLabel: '×1.6', fond: 'bg-jaune' },
  3: { label: 'Professionnel', emoji: '🏅', desc: 'Séries longues • catégories abstraites', seriesCount: 15, multiplierLabel: '×2.5', fond: 'bg-rose-pale' },
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

export default function CollectionPage() {
  const stopwatch = useStopwatch()
  const { currentUser, refreshPoints } = useAuthStore()
  const { saveSession } = useProgressStore()
  const { terminerPartie } = useParcoursStore()
  const modeParcours = useModeParcours()
  // En parcours, le niveau est imposé (borné à 1-3).
  const niveauParcours = modeParcours ? (Math.min(Math.max(modeParcours.difficulte, 1), 3) as CollectionLevel) : null

  // En parcours, pas d'écran de choix : on démarre directement en partie.
  const [phase, setPhase] = useState<Phase>(niveauParcours ? 'playing' : 'level-select')
  const [selectedLevel, setSelectedLevel] = useState<CollectionLevel>(niveauParcours ?? 1)
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

  // Évite un double démarrage (StrictMode) et un double enregistrement (double clic sur « Résultats »).
  const demarreRef = useRef(false)
  const finiRef = useRef(false)

  useEffect(() => {
    if (niveauParcours && !demarreRef.current) {
      demarreRef.current = true
      startGame(niveauParcours)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
    finiRef.current = false
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
    if (!currentUser || finiRef.current) return
    finiRef.current = true
    const scoreData = calcCollectionScore({ correctAnswers: correct, wrongAnswers: wrong, totalItems, elapsedSeconds: stopwatch.seconds, level: selectedLevel })
    const stars = calcCollectionStars(scoreData.totalScore, selectedLevel)
    setResult({ ...scoreData, stars })
    const details: CollectionSessionDetails = { type: 'collection', level: selectedLevel, totalItems, correctAnswers: correct, wrongAnswers: wrong, accuracyScore: scoreData.accuracyScore, timeBonus: scoreData.timeBonus, levelMultiplierBonus: scoreData.levelMultiplierBonus, stars, totalElapsedSeconds: stopwatch.seconds }
    await saveSession({ id: `${Date.now()}-col`, userId: currentUser.id, exerciseType: 'collection', score: scoreData.totalScore, duration: stopwatch.seconds, playedAt: new Date().toISOString(), details })
    await refreshPoints()
    if (modeParcours) await terminerPartie(currentUser.id, modeParcours, tauxReussite(correct, totalItems))
    setPhase('result')
  }

  // ── Level select ────────────────────────────────────────────────────────
  if (phase === 'level-select') {
    return (
      <div className="max-w-xl mx-auto">
        <EnTete titre={`${EX.title} ${EX.emoji}`} />
        <p className="text-encre-doux font-semibold text-lg mb-6">Trouve le terme générique qui englobe tous les autres</p>

        <div className="space-y-3">
          {([1, 2, 3] as CollectionLevel[]).map((level) => {
            const meta = LEVEL_META[level]
            return (
              <motion.button
                key={level}
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.02, y: -2 }}
                onClick={() => startGame(level)}
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
                      <p className="font-black text-encre">{meta.label}</p>
                      <span className="text-sm font-black px-2 py-0.5 rounded-full border-2 border-encre bg-jaune text-encre">
                        {meta.multiplierLabel}
                      </span>
                    </div>
                    <p className="text-base text-encre-doux font-semibold">{meta.desc} • {meta.seriesCount} séries</p>
                  </div>
                  <span aria-hidden="true" className="font-black text-encre text-lg">→</span>
                </div>
              </motion.button>
            )
          })}
        </div>

        <p className="text-center text-base text-encre-doux font-semibold mt-6">
          Un joueur professionnel gagne toujours plus qu'un débutant à erreurs égales.
        </p>
      </div>
    )
  }

  // ── Result ──────────────────────────────────────────────────────────────
  if (phase === 'result') {
    const meta = LEVEL_META[selectedLevel]
    return (
      <EcranFin
        titre="Résultat 🎉"
        etoiles={result.stars}
        score={result.totalScore}
        detail={`points · ${meta.label} ${meta.emoji}`}
        onRejouer={() => startGame(selectedLevel)}
        retourVers="/accueil"
        parcours={!!modeParcours}
      >
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="rounded-xl border-2 border-encre bg-sable p-3">
            <p className="font-black text-juste-fonce text-lg">{correctCount}/{totalItems} ✓</p>
            <p className="text-encre-doux font-semibold text-base">Bonnes réponses</p>
          </div>
          <div className="rounded-xl border-2 border-encre bg-sable p-3">
            <p className="font-black text-encre text-lg tabular-nums">{stopwatch.formatted}</p>
            <p className="text-encre-doux font-semibold text-base">Durée</p>
          </div>
          <div className="rounded-xl border-2 border-encre bg-sable p-3">
            <p className="font-black text-encre text-lg">{result.accuracyScore}</p>
            <p className="text-encre-doux font-semibold text-base">Précision</p>
          </div>
          <div className="rounded-xl border-2 border-encre bg-sable p-3">
            <p className="font-black text-encre text-lg">+{result.timeBonus}</p>
            <p className="text-encre-doux font-semibold text-base">Bonus temps</p>
          </div>
          <div className="rounded-xl border-2 border-encre bg-sable p-3 col-span-2">
            <p className="font-black text-encre text-lg">+{result.levelMultiplierBonus}</p>
            <p className="text-encre-doux font-semibold text-base">Bonus niveau ({LEVEL_META[selectedLevel].multiplierLabel})</p>
          </div>
        </div>
      </EcranFin>
    )
  }

  // ── Playing / Feedback ─────────────────────────────────────────────────
  if (!currentItem) return null

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Game header */}
      <EnTete
        titre={`${EX.title} ${EX.emoji}`}
        droite={
          <>
            <span className="rounded-full border-2 border-encre bg-papier px-3 py-1 font-bold text-encre tabular-nums">
              ⏱️ {stopwatch.formatted}
            </span>
            <span className="rounded-full border-2 border-encre bg-papier px-3 py-1 font-bold text-encre">
              {correctCount} ✓ / {wrongCount} ✗
            </span>
          </>
        }
        retourVers={modeParcours ? '/parcours' : undefined}
      />
      {modeParcours?.etape === 'boss' && <Etiquette couleur="rose-pale">👾 Boss du niveau</Etiquette>}
      <p className="text-base font-bold text-encre-doux">
        Niveau {LEVEL_META[selectedLevel].label} · Série {currentIndex + 1} / {totalItems}
      </p>

      {/* Progress bar */}
      <div className="h-3 bg-encre/10 border-2 border-encre rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-rose"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Word list */}
      <Carte className="p-5">
        <p className="text-base text-encre-doux font-semibold mb-3">Trouve le terme générique :</p>
        <div className="flex flex-wrap gap-2">
          {shuffledWords.map((word) => {
            const estLeGenerique = phase === 'feedback' && word === currentItem.genericTerm
            return (
              <span
                key={word}
                className={`px-3 py-1.5 rounded-xl font-semibold text-base border-2 border-encre text-encre transition-colors ${
                  estLeGenerique ? 'bg-juste font-black' : 'bg-papier'
                }`}
              >
                {word}
                {estLeGenerique && <span aria-hidden="true" className="ml-1">✓</span>}
              </span>
            )
          })}
        </div>
      </Carte>

      {/* QCM choices */}
      <div className="grid grid-cols-2 gap-3">
        <AnimatePresence mode="wait">
          {choices.map((choice) => {
            const isSelected = selectedChoice === choice
            const isTheCorrect = choice === currentItem.genericTerm
            let etat: EtatMot = 'normal'

            if (phase === 'feedback') {
              if (isTheCorrect) etat = 'juste'
              else if (isSelected && !isTheCorrect) etat = 'faux'
            }

            return (
              <BoutonMot
                key={choice}
                etat={etat}
                onClick={() => phase === 'playing' && handleChoice(choice)}
                className="w-full min-w-0 justify-between text-left text-base leading-snug"
              >
                <span className="min-w-0 break-words">{choice}</span>
              </BoutonMot>
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
            className={`rounded-2xl border-2 border-encre p-4 flex flex-wrap items-center justify-between gap-3 text-encre ${isCorrect ? 'bg-juste' : 'bg-faux'}`}
          >
            <div>
              <p className="font-black text-lg">
                {isCorrect ? '✓ Bonne réponse !' : '✗ Raté !'}
              </p>
              {!isCorrect && (
                <p className="text-base font-semibold">
                  Le terme générique était : <span className="font-black">{currentItem.genericTerm}</span>
                </p>
              )}
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleNext}
              className={classesBouton('principal')}
            >
              {currentIndex + 1 >= totalItems ? 'Résultats' : 'Suivant →'}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
