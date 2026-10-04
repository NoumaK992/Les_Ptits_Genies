import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { useProgressStore } from '@/store/progressStore'
import { useParcoursStore } from '@/store/parcoursStore'
import { useItemsVusStore } from '@/store/itemsVusStore'
import { useModeParcours } from '@/parcours/useModeParcours'
import { tauxReussite } from '@/parcours/regles'
import { useStopwatch } from '@/hooks/useStopwatch'
import { calcWordSearchGridScore, calcWordSearchTimeBonus } from '@/utils/scoring'
import { generateSession } from '@/utils/gridGenerator'
import { ThemeSelector } from '@/components/exercises/WordSearch/ThemeSelector'
import { WordSearchGrid, cellKey } from '@/components/exercises/WordSearch/WordSearchGrid'
import { StopwatchDisplay } from '@/components/exercises/WordSearch/TimerCircle'
import { CorrectionOverlay } from '@/components/exercises/WordSearch/CorrectionOverlay'
import { THEME_LIST, getThemeById } from '@/data/wordSearch/themes'
import type { GeneratedGrid, GridResult } from '@/types'
import { Bouton } from '@/components/ui/Bouton'
import { Carte } from '@/components/ui/Carte'
import { EnTete } from '@/components/ui/EnTete'
import { EcranFin } from '@/components/ui/EcranFin'
import { Etiquette } from '@/components/ui/Etiquette'

// ── Exercise identity ──────────────────────────────────────────────────────
const EX = {
  emoji: '🔍',
  title: 'Recherche de mots',
}

type Phase = 'intro' | 'presentation' | 'theme-select' | 'playing' | 'correction' | 'session-result'
type CellState = 'default' | 'selected' | 'correct' | 'wrong' | 'missed'

/** Un thème jamais fait d'abord, sinon le moins récemment fait (identifiant : l'id du thème). */
function choisirTheme(): string | undefined {
  return useItemsVusStore.getState().choisir('word-search', THEME_LIST, 1)[0]?.id
}

// Mode parcours : thème choisi par choisirTheme, grilles générées comme dans handleThemeSelect.
function tirerPartieParcours(): { themeId: string; grids: GeneratedGrid[] } | null {
  const id = choisirTheme()
  const theme = id ? getThemeById(id) : undefined
  return id && theme ? { themeId: id, grids: generateSession(theme) } : null
}

export default function WordSearchPage() {
  const { currentUser, refreshPoints } = useAuthStore()
  const { saveSession } = useProgressStore()
  const stopwatch = useStopwatch()
  const modeParcours = useModeParcours()
  const { terminerPartie } = useParcoursStore()

  // Tirage fait une seule fois au montage (initialiseur paresseux) : la grille s'affiche dès le
  // premier rendu, sans intro ni présentation, et le thème ne change pas si StrictMode rejoue le rendu.
  const [depart] = useState(() => (modeParcours ? tirerPartieParcours() : null))

  const [phase, setPhase] = useState<Phase>(depart ? 'playing' : 'intro')
  const [themeId, setThemeId] = useState(depart?.themeId ?? '')
  const [grids, setGrids] = useState<GeneratedGrid[]>(depart?.grids ?? [])
  const [gridIndex, setGridIndex] = useState(0)
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set())
  const [usedNoWord, setUsedNoWord] = useState(false)
  const [results, setResults] = useState<GridResult[]>([])
  const [totalScore, setTotalScore] = useState(0)

  const currentGrid = grids[gridIndex]

  const cellStates = new Map<string, CellState>()
  if (currentGrid) {
    for (let r = 0; r < currentGrid.cells.length; r++) {
      for (let c = 0; c < currentGrid.cells[r].length; c++) {
        const key = cellKey(r, c)
        cellStates.set(key, selectedKeys.has(key) ? 'selected' : 'default')
      }
    }
  }

  // Mode parcours : la partie est déjà en place, on lance le chrono comme handleThemeSelect.
  // Le minuteur est annulé au démontage, donc un effet rejoué par StrictMode ne démarre qu'une fois.
  useEffect(() => {
    if (!depart) return
    const t = setTimeout(() => stopwatch.start(), 50)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Empêche un double clic sur le dernier « Continuer » d'enregistrer deux fois la partie.
  const finiRef = useRef(false)

  function handleThemeSelect(id: string) {
    const theme = getThemeById(id)
    if (!theme) return
    finiRef.current = false
    setThemeId(id)
    const sessionGrids = generateSession(theme)
    setGrids(sessionGrids)
    setGridIndex(0)
    setSelectedKeys(new Set())
    setUsedNoWord(false)
    setResults([])
    setTotalScore(0)
    setPhase('playing')
    stopwatch.reset()
    setTimeout(() => stopwatch.start(), 50)
  }

  function handleCellClick(row: number, col: number) {
    const key = cellKey(row, col)
    setSelectedKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function handleNoWord() {
    setUsedNoWord(true)
    submitGrid(true)
  }

  function submitGrid(noWordUsed = false) {
    const grid = currentGrid
    if (!grid) return
    const targetKeys = new Set(grid.targetPositions.map(([r, c]) => cellKey(r, c)))
    let correctSelections = 0, wrongSelections = 0, missedTargets = 0
    selectedKeys.forEach((key) => { if (targetKeys.has(key)) correctSelections++; else wrongSelections++ })
    targetKeys.forEach((key) => { if (!selectedKeys.has(key)) missedTargets++ })
    const noWordCorrect = grid.targetCount === 0 && noWordUsed
    const gridScore = calcWordSearchGridScore({
      correctSelections, missedTargets, wrongSelections,
      totalTargets: grid.targetCount,
      usedNoWordButton: noWordUsed || usedNoWord,
      noWordWasCorrect: noWordCorrect,
    })
    const result: GridResult = {
      gridIndex, targetWord: grid.targetWord, targetCount: grid.targetCount,
      selectedKeys: Array.from(selectedKeys), correctSelections, missedTargets,
      wrongSelections, usedNoWordButton: noWordUsed || usedNoWord,
      noWordWasCorrect: noWordCorrect, gridScore,
    }
    setResults((prev) => [...prev, result])
    setTotalScore((prev) => prev + gridScore)
    setPhase('correction')
  }

  function handleCorrectionContinue() {
    if (gridIndex >= 5) {
      stopwatch.pause()
      finishSession()
      return
    }
    const next = gridIndex + 1
    setGridIndex(next)
    setSelectedKeys(new Set())
    setUsedNoWord(false)
    setPhase('playing')
  }

  async function finishSession() {
    if (!currentUser || finiRef.current) return
    finiRef.current = true
    const timeBonus = calcWordSearchTimeBonus(stopwatch.seconds)
    const finalScore = totalScore + timeBonus
    const totalCorrect = results.reduce((s, r) => s + r.correctSelections, 0)
    const totalMissed = results.reduce((s, r) => s + r.missedTargets, 0)
    const totalWrong = results.reduce((s, r) => s + r.wrongSelections, 0)
    const reussite = tauxReussite(totalCorrect, totalCorrect + totalMissed + totalWrong)
    await saveSession({
      id: `${Date.now()}-ws`, userId: currentUser.id, exerciseType: 'word-search',
      score: finalScore, duration: stopwatch.seconds, playedAt: new Date().toISOString(),
      details: {
        type: 'word-search', theme: themeId, gridsCompleted: 6,
        totalCorrectSelections: totalCorrect, totalMissedTargets: totalMissed,
        totalWrongSelections: totalWrong, totalElapsedSeconds: stopwatch.seconds,
        reussite,
      },
    }, { parcours: modeParcours })
    void useItemsVusStore.getState().marquer(currentUser.id, 'word-search', [themeId])
    if (modeParcours) {
      await terminerPartie(currentUser.id, modeParcours, reussite)
    }
    await refreshPoints()
    setTotalScore((prev) => prev + timeBonus)
    setPhase('session-result')
  }

  // ─── Intro ─────────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <div>
        <EnTete titre={EX.title} />
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', bounce: 0.5 }}>
          <Carte className="mx-auto max-w-lg p-6 text-center md:p-8">
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-encre bg-bleu text-5xl shadow-dur"
              aria-hidden="true"
            >
              {EX.emoji}
            </motion.div>
            <h2 className="mb-3 font-titre text-3xl text-encre">{EX.title}</h2>
            <p className="mb-8 text-base text-encre-doux md:text-lg">
              Trouve toutes les occurrences d'un mot dans la grille !
            </p>
            <Bouton taille="grand" onClick={() => setPhase('presentation')}>
              Commencer
            </Bouton>
          </Carte>
        </motion.div>
      </div>
    )
  }

  // ─── Presentation ──────────────────────────────────────────────────────
  if (phase === 'presentation') {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-lg py-4">
        <h2 className="mb-6 text-center font-titre text-2xl text-encre md:text-3xl">Comment jouer ?</h2>
        <Carte className="mb-6 space-y-4 p-6">
          {[
            { icon: '🎯', text: "Un mot cible t'est donné. Clique sur toutes ses occurrences dans la grille." },
            { icon: '🔢', text: 'Le mot peut apparaître 0, 1 ou plusieurs fois.' },
            { icon: '🚫', text: 'Si le mot est absent, clique sur "Il n\'y a pas le mot".' },
            { icon: '✅', text: 'Clique sur "Suivant" quand tu as terminé ta sélection.' },
            { icon: '⏱️', text: 'Un chronomètre tourne pendant les 6 grilles. Plus tu es rapide, plus tu gagnes de points !' },
            { icon: '❌', text: 'Attention : chaque erreur retire des points.' },
            { icon: '📈', text: 'La difficulté augmente de la grille 1 à la grille 6.' },
          ].map(({ icon, text }) => (
            <div key={icon} className="flex items-start gap-3">
              <span className="shrink-0 text-xl" aria-hidden="true">{icon}</span>
              <span className="text-base text-encre">{text}</span>
            </div>
          ))}
        </Carte>
        <div className="text-center">
          <Bouton taille="grand" onClick={() => setPhase('theme-select')}>
            Continuer →
          </Bouton>
        </div>
      </motion.div>
    )
  }

  // ─── Theme Select ──────────────────────────────────────────────────────
  if (phase === 'theme-select') {
    const vus = useItemsVusStore.getState().vusDe('word-search')
    return (
      <ThemeSelector
        themes={THEME_LIST}
        dejaFaits={new Set(Object.keys(vus))}
        onSelect={handleThemeSelect}
        onSurprise={() => {
          const id = choisirTheme()
          if (id) handleThemeSelect(id)
        }}
      />
    )
  }

  // ─── Correction ────────────────────────────────────────────────────────
  if (phase === 'correction' && currentGrid) {
    const lastResult = results[results.length - 1]
    return (
      <CorrectionOverlay
        grid={currentGrid}
        selectedKeys={new Set(lastResult?.selectedKeys ?? [])}
        gridIndex={gridIndex}
        gridScore={lastResult?.gridScore ?? 0}
        totalScore={totalScore}
        isLast={gridIndex >= 5}
        onContinue={handleCorrectionContinue}
      />
    )
  }

  // ─── Session Result ────────────────────────────────────────────────────
  if (phase === 'session-result') {
    const timeBonus = calcWordSearchTimeBonus(stopwatch.seconds)
    const gridTotal = results.reduce((s, r) => s + r.gridScore, 0)
    return (
      <EcranFin
        titre="Session terminée ! 🏆"
        score={totalScore}
        detail="points au total"
        onRejouer={() => setPhase('intro')}
        retourVers="/accueil"
        parcours={!!modeParcours}
      >
        <div className="space-y-1 border-t-2 border-encre/20 pt-4 text-center text-base text-encre">
          <p>Grilles : {gridTotal} pts</p>
          <p>Bonus temps ({stopwatch.formatted}) : <span className="font-bold text-juste-fonce">+{timeBonus} pts</span></p>
        </div>
      </EcranFin>
    )
  }

  // ─── Playing ───────────────────────────────────────────────────────────
  if (phase === 'playing' && currentGrid) {
    return (
      <div className="mx-auto max-w-3xl">
        {/* Game header */}
        <EnTete
          titre={EX.title}
          droite={
            <>
              <span className="rounded-full border-2 border-encre bg-papier px-3 py-1 text-base font-bold text-encre">
                {totalScore} pts
              </span>
              <StopwatchDisplay formatted={stopwatch.formatted} seconds={stopwatch.seconds} />
            </>
          }
          retourVers={modeParcours ? '/parcours' : undefined}
        />
        {modeParcours?.etape === 'boss' && <Etiquette couleur="rose-pale" className="mb-4">👾 Boss du niveau</Etiquette>}

        {/* Mot cible */}
        <Carte className="mb-4 flex flex-wrap items-center gap-3 p-4">
          <Etiquette couleur="bleu">Grille {gridIndex + 1} / 6</Etiquette>
          <p className="text-lg font-bold text-encre">
            Mot : <span className="rounded-md border-2 border-encre bg-jaune px-2 py-0.5 font-titre">{currentGrid.targetWord}</span>
          </p>
        </Carte>

        {/* Progress bar */}
        <div className="mb-4 flex gap-1.5" aria-label={`Grille ${gridIndex + 1} sur 6`}>
          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={i}
              className={`h-3 flex-1 rounded-full border-2 border-encre transition-colors duration-500 ${
                i < gridIndex ? 'bg-juste' : i === gridIndex ? 'bg-jaune' : 'bg-encre/10'
              }`}
            />
          ))}
        </div>

        {/* Hint */}
        <Carte className="mb-4 flex flex-wrap items-center gap-3 p-3">
          <span className="text-lg" aria-hidden="true">ℹ️</span>
          <p className="min-w-0 flex-1 text-base text-encre">
            Clique sur toutes les occurrences de « <span className="font-bold">{currentGrid.targetWord}</span> », puis clique sur « Suivant ».
          </p>
          {selectedKeys.size > 0 && (
            <span className="whitespace-nowrap rounded-full border-2 border-encre bg-jaune px-3 py-1 text-base font-bold text-encre">
              {selectedKeys.size} sélectionné{selectedKeys.size > 1 ? 's' : ''}
            </span>
          )}
        </Carte>

        {/* Grid */}
        <div className="mb-4 flex justify-center">
          <WordSearchGrid
            cells={currentGrid.cells}
            cellStates={cellStates}
            onCellClick={handleCellClick}
          />
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap justify-center gap-3">
          <Bouton variante="secondaire" onClick={handleNoWord}>
            🚫 Il n'y a pas le mot
          </Bouton>
          <Bouton onClick={() => submitGrid(usedNoWord)}>
            Suivant →
          </Bouton>
        </div>
      </div>
    )
  }

  return null
}
