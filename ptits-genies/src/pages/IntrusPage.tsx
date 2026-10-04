import { useState, useEffect, useCallback, useRef } from 'react'
import { EnTete } from '@/components/ui/EnTete'
import { EcranFin } from '@/components/ui/EcranFin'
import { Carte, classesCarte } from '@/components/ui/Carte'
import { Etiquette } from '@/components/ui/Etiquette'
import { couleurs } from '@/theme/couleurs'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { useProgressStore } from '@/store/progressStore'
import { useParcoursStore } from '@/store/parcoursStore'
import { useModeParcours } from '@/parcours/useModeParcours'
import { tauxReussite } from '@/parcours/regles'
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
  const { currentUser, refreshPoints } = useAuthStore()
  const { saveSession } = useProgressStore()
  const { terminerPartie } = useParcoursStore()
  const modeParcours = useModeParcours()
  // En parcours, le niveau est imposé (borné aux niveaux existants).
  const niveauParcours = modeParcours ? Math.min(Math.max(modeParcours.difficulte, 1), allLevels.length) : null

  // En parcours, pas d'écran de choix : on démarre directement en partie.
  const [phase, setPhase] = useState<Phase>(niveauParcours ? 'playing' : 'level-select')
  const [selectedLevel, setSelectedLevel] = useState(niveauParcours ?? 1)
  const [sessionLists, setSessionLists] = useState<IntrusList[]>([])
  const [listIndex, setListIndex] = useState(0)
  const [words, setWords] = useState<string[]>([])
  const [chipStates, setChipStates] = useState<ChipState[]>([])
  const [answered, setAnswered] = useState(false)
  const [lastCorrect, setLastCorrect] = useState(false)
  const [totalScore, setTotalScore] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [sessionStart] = useState(Date.now())
  // Garde contre une double réponse sur la même liste (fin de chrono + clic, ou StrictMode).
  const answeredRef = useRef(false)
  const demarreRef = useRef(false)

  const levelData = allLevels[selectedLevel - 1]
  const currentList = sessionLists[listIndex]

  const handleTimerExpire = useCallback(() => {
    if (!answered) revealAnswer(false)
  }, [answered, listIndex])

  const timer = useTimer(levelData?.timeLimit ?? 30, handleTimerExpire)

  // Démarrage direct en parcours (le ref évite un double démarrage sous StrictMode).
  useEffect(() => {
    if (niveauParcours && !demarreRef.current) {
      demarreRef.current = true
      startSession(niveauParcours)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
    // Le chrono repart de la durée du niveau choisi (et non du reste de la partie précédente).
    timer.reset(lvl.timeLimit)
    setTimeout(() => timer.start(), 50)
  }

  function loadList(item: IntrusList) {
    const ws = buildWordList(item)
    setWords(ws)
    setChipStates(ws.map(() => 'idle'))
    setAnswered(false)
    setLastCorrect(false)
    answeredRef.current = false
  }

  function revealAnswer(correct: boolean) {
    if (answered || answeredRef.current) return
    answeredRef.current = true
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

    // correctCount de cette closure n'inclut pas encore la liste en cours : on transmet le total à jour.
    const bonnes = correctCount + (correct ? 1 : 0)
    setTimeout(() => nextList(score, bonnes), 1800)
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

  function nextList(score?: number, bonnes?: number) {
    if (listIndex >= sessionLists.length - 1) {
      finishSession(score, bonnes)
      return
    }
    const next = listIndex + 1
    setListIndex(next)
    loadList(sessionLists[next])
    timer.reset(levelData.timeLimit)
    setTimeout(() => timer.start(), 50)
  }

  async function finishSession(lastScore?: number, bonnes?: number) {
    if (!currentUser) return
    const finalScore = totalScore + (lastScore ?? 0)
    const finalCorrect = bonnes ?? correctCount
    const duration = Math.round((Date.now() - sessionStart) / 1000)
    const reussite = tauxReussite(finalCorrect, LISTS_PER_SESSION)
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
        correctAnswers: finalCorrect,
        totalLists: LISTS_PER_SESSION,
        reussite,
      },
    })
    await refreshPoints()
    if (modeParcours) await terminerPartie(currentUser.id, modeParcours, reussite)
    setPhase('session-result')
  }

  // Level select
  if (phase === 'level-select') {
    return (
      <div className="mx-auto max-w-lg">
        <EnTete titre="🕵️ L'Intrus" />
        <p className="mb-6 text-lg font-semibold text-encre-doux">Choisis ton niveau de difficulté</p>
        <div className="space-y-4">
          {[
            { level: 1, label: 'Débutant', emoji: '⭐', desc: 'Mots simples — 9 mots par liste' },
            { level: 2, label: 'Intermédiaire', emoji: '⭐⭐', desc: 'Mots plus longs — 17 à 19 mots par liste' },
            { level: 3, label: 'Avancé', emoji: '⭐⭐⭐', desc: 'Vocabulaire soutenu — 23 à 25 mots par liste' },
            { level: 4, label: 'Expert', emoji: '⭐⭐⭐⭐', desc: 'Mots complexes et proches — 29 à 31 mots' },
            { level: 5, label: 'Génie', emoji: '⭐⭐⭐⭐⭐', desc: 'Mots en -tion très similaires — 35 mots par liste' },
          ].map((l) => (
            <motion.button
              key={l.level}
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => startSession(l.level)}
              className={`${classesCarte} flex min-h-12 w-full items-center gap-4 p-4 text-left transition-[transform,box-shadow,background-color] hover:-translate-x-px hover:-translate-y-px hover:bg-jaune/40 hover:shadow-dur-lg focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-bleu`}
            >
              <span aria-hidden="true" className="w-16 shrink-0 break-all text-center text-base leading-snug sm:w-32 sm:text-xl">{l.emoji}</span>
              <div className="min-w-0">
                <p className="font-titre text-lg text-encre">{l.label}</p>
                <p className="text-base font-semibold text-encre-doux">{l.desc}</p>
              </div>
              <span aria-hidden="true" className="ml-auto font-titre text-xl text-encre">→</span>
            </motion.button>
          ))}
        </div>
      </div>
    )
  }

  // Session result
  if (phase === 'session-result') {
    return (
      <div className="py-6">
        <EcranFin
          titre="🏆 Bravo !"
          score={totalScore}
          detail="points gagnés"
          onRejouer={() => setPhase('level-select')}
          retourVers="/accueil"
          parcours={!!modeParcours}
        >
          <p className="rounded-xl border-2 border-encre bg-sable p-4 text-center text-lg font-bold text-encre">
            {correctCount} / {LISTS_PER_SESSION} bonnes réponses
          </p>
        </EcranFin>
      </div>
    )
  }

  const pastille = 'rounded-full border-2 border-encre bg-papier px-3 py-1 font-bold text-encre'
  const couleurChrono =
    timer.seconds > levelData.timeLimit * 0.5
      ? couleurs.juste
      : timer.seconds > levelData.timeLimit * 0.25
        ? couleurs.jaune
        : couleurs.faux

  // Parcours : la partie se prépare au premier effet, rien à afficher d'ici là.
  if (sessionLists.length === 0) return null

  // Playing
  return (
    <div className="mx-auto max-w-2xl">
      <EnTete
        titre="Trouve l'intrus !"
        retourVers={modeParcours ? '/parcours' : undefined}
        droite={
          <>
            <span className={pastille}>Score : {totalScore}</span>
            <div className="relative flex h-14 w-14 items-center justify-center rounded-full border-2 border-encre bg-papier">
              <svg className="absolute inset-0 -rotate-90" width="52" height="52" viewBox="0 0 56 56" aria-hidden="true">
                <circle cx="28" cy="28" r="20" fill="none" stroke={couleurs.encre} strokeOpacity={0.15} strokeWidth="4" />
                <circle
                  cx="28" cy="28" r="20" fill="none"
                  stroke={couleurChrono}
                  strokeWidth="4"
                  strokeDasharray={2 * Math.PI * 20}
                  strokeDashoffset={2 * Math.PI * 20 * (1 - timer.seconds / levelData.timeLimit)}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
                />
              </svg>
              <span className="z-10 text-sm font-bold text-encre">{timer.seconds}s</span>
            </div>
          </>
        }
      />

      {modeParcours?.etape === 'boss' && <Etiquette couleur="rose-pale" className="mb-4">👾 Boss du niveau</Etiquette>}

      <p className="mb-2 text-base font-semibold text-encre-doux">Liste {listIndex + 1} / {LISTS_PER_SESSION}</p>

      {/* Progress */}
      <div className="mb-6 flex gap-1">
        {sessionLists.map((_, i) => (
          <div
            key={i}
            className={`h-3 flex-1 rounded-full border-2 border-encre transition-colors ${i < listIndex ? 'bg-juste' : i === listIndex ? 'bg-jaune' : 'bg-papier'}`}
          />
        ))}
      </div>

      {/* Words grid */}
      <Carte className="mb-6 p-4 md:p-6">
        <div className="flex min-h-32 flex-wrap justify-center gap-3">
          <AnimatePresence>
            {words.map((word, i) => (
              <motion.div key={`${listIndex}-${i}`} className="max-w-full" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
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
      </Carte>

      {/* Feedback */}
      <AnimatePresence>
        {answered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            role="status"
            className={`rounded-2xl border-2 border-encre px-4 py-3 text-center text-lg font-bold text-encre shadow-dur-sm ${lastCorrect ? 'bg-juste' : 'bg-faux'}`}
          >
            <span aria-hidden="true" className="mr-2 font-titre">{lastCorrect ? '✓' : '✗'}</span>
            {lastCorrect ? 'Bravo ! L\'intrus était bien ' : 'L\'intrus était : '}<span className="font-titre">{currentList?.intruder}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
