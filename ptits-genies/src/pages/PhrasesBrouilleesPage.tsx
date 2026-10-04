import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { useProgressStore } from '@/store/progressStore'
import { useParcoursStore } from '@/store/parcoursStore'
import { useModeParcours } from '@/parcours/useModeParcours'
import { tauxReussite } from '@/parcours/regles'
import { useStopwatch } from '@/hooks/useStopwatch'
import { calcPhrasesBrouilleesScore, calcPhrasesBrouilleesStars } from '@/utils/scoring'
import type { PhrasesBrouilleesExercise, PhrasesBrouilleesLevel, PhrasesSegment } from '@/types'
import { EnTete } from '@/components/ui/EnTete'
import { EcranFin } from '@/components/ui/EcranFin'
import { Carte, classesCarte } from '@/components/ui/Carte'
import { classesBouton } from '@/components/ui/Bouton'
import { Etiquette } from '@/components/ui/Etiquette'

import level1Data from '@/data/phrasesBrouillees/level_1.json'
import level2Data from '@/data/phrasesBrouillees/level_2.json'
import level3Data from '@/data/phrasesBrouillees/level_3.json'

// ── Exercise identity ──────────────────────────────────────────────────────
const EX = {
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

const LEVEL_META: Record<PhrasesBrouilleesLevel, { label: string; emoji: string; desc: string; fond: string }> = {
  1: { label: 'Débutant', emoji: '🌱', desc: 'Textes courts et phrases manquantes courtes', fond: 'bg-bleu' },
  2: { label: 'Intermédiaire', emoji: '🚀', desc: 'Textes de longueur moyenne et enchaînements plus fins', fond: 'bg-jaune' },
  3: { label: 'Professionnel', emoji: '🏅', desc: 'Textes longs et phrases quasi complètes', fond: 'bg-rose-pale' },
}

const PASTILLE = 'rounded-full border-2 border-encre bg-papier px-3 py-1 font-bold text-encre'

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

// Mode parcours : niveau imposé par la difficulté, texte tiré au hasard parmi les textes jouables.
function tirerPartieParcours(d: number): { level: PhrasesBrouilleesLevel; exercise: PhrasesBrouilleesExercise } {
  const level = Math.min(Math.max(d, 1), 3) as PhrasesBrouilleesLevel
  const valides = LEVELS[level].filter(isValidExercise)
  const pool = valides.length > 0 ? valides : LEVELS[level]
  return { level, exercise: pool[Math.floor(Math.random() * pool.length)] }
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
  const baseClass = 'inline-flex items-center justify-center gap-1 min-w-14 min-h-10 px-3 rounded-xl border-2 border-encre mx-1 align-middle font-bold text-base text-encre transition-colors'

  const stateClass = !validated
    ? letter ? 'bg-jaune shadow-dur-sm' : 'bg-sable border-dashed'
    : isCorrect
      ? 'bg-juste'
      : 'bg-faux'

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
      {validated && (
        <>
          <span aria-hidden="true" className="font-titre">{isCorrect ? '✓' : '✗'}</span>
          <span className="sr-only">({isCorrect ? 'bonne réponse' : 'mauvaise réponse'})</span>
        </>
      )}
    </span>
  )
}


export default function PhrasesBrouilleesPage() {
  const stopwatch = useStopwatch()
  const { currentUser, refreshPoints } = useAuthStore()
  const { saveSession } = useProgressStore()
  const modeParcours = useModeParcours()
  const { terminerPartie } = useParcoursStore()

  // Tirage fait une seule fois au montage (initialiseur paresseux) : l'écran de jeu s'affiche
  // dès le premier rendu, sans passer par les écrans de choix ni changer de texte en StrictMode.
  const [depart] = useState(() => (modeParcours ? tirerPartieParcours(modeParcours.difficulte) : null))

  const [phase, setPhase] = useState<Phase>(depart ? 'playing' : 'level-select')
  const [selectedLevel, setSelectedLevel] = useState<PhrasesBrouilleesLevel>(depart?.level ?? 1)
  const [availableExercises, setAvailableExercises] = useState<PhrasesBrouilleesExercise[]>([])
  const [playedByLevel, setPlayedByLevel] = useState<Record<PhrasesBrouilleesLevel, string[]>>({ 1: [], 2: [], 3: [] })
  const [exercise, setExercise] = useState<PhrasesBrouilleesExercise | null>(depart?.exercise ?? null)
  const [assignments, setAssignments] = useState<Record<number, string>>({})
  const [hasStartedTimer, setHasStartedTimer] = useState(depart !== null)
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

  // Mode parcours : la partie est déjà en place, on lance seulement le chrono
  // (comme startExercise). start() est idempotent : sans risque si l'effet est rejoué.
  useEffect(() => {
    if (depart) stopwatch.start()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
    if (modeParcours) {
      await terminerPartie(currentUser.id, modeParcours.etape, tauxReussite(correctAnswers, exercise.gaps.length))
    }
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
        <EnTete titre={`${EX.emoji} ${EX.title}`} />
        <p className="mb-6 text-lg font-semibold text-encre-doux">Glisse les phrases vers les trous numérotés</p>

        <div className="space-y-4">
          {(Object.keys(LEVEL_META) as unknown as PhrasesBrouilleesLevel[]).map((level) => {
            const meta = LEVEL_META[level]
            return (
              <motion.button
                key={level}
                type="button"
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.02, y: -2 }}
                onClick={() => pickLevel(level)}
                className={`${classesCarte} flex w-full items-center gap-4 p-5 text-left transition-[box-shadow,background-color] hover:bg-jaune/40 hover:shadow-dur-lg focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-bleu`}
              >
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-encre text-2xl ${meta.fond}`}>
                  {meta.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-titre text-lg text-encre">{meta.label}</p>
                  <p className="text-base font-semibold text-encre-doux">{meta.desc}</p>
                </div>
                <span aria-hidden="true" className="font-titre text-xl text-encre">→</span>
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
      <div className="max-w-3xl mx-auto">
        <EnTete titre={`${EX.emoji} Choisis un texte`} onRetour={() => setPhase('level-select')} />
        <p className="mb-4 text-base font-semibold text-encre-doux">
          {LEVEL_META[selectedLevel].label} — {availableExercises.length} textes disponibles
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableExercises.map((item, index) => {
            const isPlayed = playedByLevel[selectedLevel].includes(item.id)
            return (
              <motion.button
                key={item.id}
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={() => startExercise(selectedLevel, item)}
                className={`${classesCarte} p-4 text-left transition-[box-shadow,background-color] hover:bg-jaune/40 hover:shadow-dur-lg focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-bleu`}
              >
                <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-base font-bold text-encre-doux">
                    Texte {index + 1}
                  </p>
                  <span className={`rounded-full border-2 border-encre px-2 py-0.5 text-base font-bold text-encre ${isPlayed ? 'bg-sable' : 'bg-jaune'}`}>
                    {isPlayed ? 'Déjà joué' : 'Nouveau'}
                  </span>
                </div>
                <p className="mb-1 font-titre text-lg text-encre">{item.title}</p>
                <p className="text-base font-semibold text-encre-doux">
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
        <EnTete
          titre={`${EX.emoji} ${EX.title}`}
          droite={
            <>
              <span className={PASTILLE}>Trous : {filledGaps}/{totalGaps}</span>
              <span className={`${PASTILLE} tabular-nums`}>⏱ {stopwatch.formatted}</span>
            </>
          }
          retourVers={modeParcours ? '/parcours' : undefined}
        />
        {modeParcours?.etape === 'boss' && <Etiquette couleur="rose-pale">👾 Boss du niveau</Etiquette>}

        {/* Progress bar */}
        <div className="h-4 overflow-hidden rounded-full border-2 border-encre bg-encre/10">
          <motion.div
            className="h-full bg-bleu"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>

        {/* Text card */}
        <Carte className="p-4 md:p-6">
          <p className="mb-1 text-base font-semibold text-encre-doux">Niveau {LEVEL_META[selectedLevel].label}</p>
          <h3 className="mb-1 font-titre text-xl text-encre">{exercise.title}</h3>
          {exercise.source && <p className="mb-4 text-base text-encre-doux">{exercise.source}</p>}

          <p className="break-words text-lg font-semibold leading-10 text-encre">
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
                type="button"
                onClick={() => handleRemoveGap(g.number)}
                className="min-h-12 rounded-full border-2 border-encre bg-papier px-4 text-base font-bold text-encre transition-colors hover:bg-rose-pale focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-bleu"
              >
                Vider #{g.number}
              </button>
            ))}
          </div>
        </Carte>

        {/* Choice cards */}
        <Carte className="p-4 md:p-6">
          <h4 className="mb-4 font-titre text-lg text-encre">Phrases à placer</h4>
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
                  className={`cursor-grab rounded-xl border-2 border-encre p-3 transition-colors active:cursor-grabbing ${
                    isUsed ? 'bg-sable opacity-50' : 'bg-papier shadow-dur-sm hover:bg-jaune/40'
                  }`}
                >
                  <p className="mb-1 font-titre text-base text-encre">
                    {choice.letter}
                  </p>
                  <p className="break-words text-base font-semibold leading-7 text-encre">{choice.text}</p>
                </div>
              )
            })}
          </div>
        </Carte>

        <motion.button
          type="button"
          whileTap={{ scale: canValidate ? 0.97 : 1 }}
          disabled={!canValidate}
          onClick={handleValidate}
          className={`${classesBouton('principal', 'grand')} w-full`}
        >
          Vérifier mes réponses ✓
        </motion.button>
      </div>
    )
  }

  // ── Result ──────────────────────────────────────────────────────────────
  return (
    <div className="py-6">
      <EcranFin
        titre="🎉 Résultat"
        etoiles={result.stars}
        score={result.totalScore}
        detail="points"
        onRejouer={() => startExercise(selectedLevel, exercise)}
        retourVers="/exercices"
        parcours={!!modeParcours}
      >
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Bonnes réponses', value: `✓ ${result.correctAnswers}/${totalGaps}`, color: 'text-juste-fonce' },
            { label: 'Durée', value: stopwatch.formatted, color: 'text-encre' },
            { label: 'Précision', value: String(result.accuracyScore), color: 'text-encre' },
            { label: 'Bonus temps', value: `+${result.timeBonus}`, color: 'text-encre' },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-xl border-2 border-encre bg-sable p-3 text-center">
              <p className={`font-titre text-lg ${color}`}>{value}</p>
              <p className="text-base font-semibold text-encre-doux">{label}</p>
            </div>
          ))}
        </div>

        {/* Correction : le texte avec les trous corrigés (✓ / ✗) */}
        <div className="mt-6">
          <Etiquette couleur="bleu">Correction</Etiquette>
          <p className="mt-4 break-words text-base font-semibold leading-10 text-encre">
            {exercise.segments.map((segment, index) => (
              <span key={segment.type === 'text' ? `t-${index}` : `g-${segment.number}`}>
                {displaySegment(segment, assignments, true, correctness, handleDropGap)}
              </span>
            ))}
          </p>
        </div>
      </EcranFin>
    </div>
  )
}
