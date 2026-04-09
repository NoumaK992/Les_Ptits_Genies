import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { useProgressStore } from '@/store/progressStore'
import { useStopwatch } from '@/hooks/useStopwatch'
import { calcWordSearchGridScore, calcWordSearchTimeBonus } from '@/utils/scoring'
import { generateSession } from '@/utils/gridGenerator'
import { ThemeSelector } from '@/components/exercises/WordSearch/ThemeSelector'
import { WordSearchGrid, cellKey } from '@/components/exercises/WordSearch/WordSearchGrid'
import { StopwatchDisplay } from '@/components/exercises/WordSearch/TimerCircle'
import { CorrectionOverlay } from '@/components/exercises/WordSearch/CorrectionOverlay'
import { THEME_LIST, getThemeById } from '@/data/wordSearch/themes'
import type { GeneratedGrid, GridResult } from '@/types'

// ── Exercise identity ──────────────────────────────────────────────────────
const EX = {
  gradient: 'linear-gradient(135deg, #7C6FF7 0%, #4a3fcc 100%)',
  shadow: '0 8px 28px rgba(124, 111, 247, 0.40)',
  color: '#7C6FF7',
  emoji: '🔍',
  title: 'Recherche de mots',
}

type Phase = 'intro' | 'presentation' | 'theme-select' | 'playing' | 'correction' | 'session-result'
type CellState = 'default' | 'selected' | 'correct' | 'wrong' | 'missed'

export default function WordSearchPage() {
  const navigate = useNavigate()
  const { currentUser, refreshPoints } = useAuthStore()
  const { saveSession } = useProgressStore()
  const stopwatch = useStopwatch()

  const [phase, setPhase] = useState<Phase>('intro')
  const [themeId, setThemeId] = useState('')
  const [grids, setGrids] = useState<GeneratedGrid[]>([])
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

  function handleThemeSelect(id: string) {
    const theme = getThemeById(id)
    if (!theme) return
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
    if (!currentUser) return
    const timeBonus = calcWordSearchTimeBonus(stopwatch.seconds)
    const finalScore = totalScore + timeBonus
    const totalCorrect = results.reduce((s, r) => s + r.correctSelections, 0)
    const totalMissed = results.reduce((s, r) => s + r.missedTargets, 0)
    const totalWrong = results.reduce((s, r) => s + r.wrongSelections, 0)
    await saveSession({
      id: `${Date.now()}-ws`, userId: currentUser.id, exerciseType: 'word-search',
      score: finalScore, duration: stopwatch.seconds, playedAt: new Date().toISOString(),
      details: {
        type: 'word-search', theme: themeId, gridsCompleted: 6,
        totalCorrectSelections: totalCorrect, totalMissedTargets: totalMissed,
        totalWrongSelections: totalWrong, totalElapsedSeconds: stopwatch.seconds,
      },
    })
    await refreshPoints()
    setTotalScore((prev) => prev + timeBonus)
    setPhase('session-result')
  }

  // ─── Intro ─────────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <div className="max-w-lg mx-auto text-center py-10">
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', bounce: 0.5 }}>
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-24 h-24 mx-auto rounded-3xl flex items-center justify-center text-5xl mb-6"
            style={{ background: EX.gradient, boxShadow: EX.shadow }}
          >
            {EX.emoji}
          </motion.div>
          <h2 className="text-3xl font-fredoka font-semibold text-ink mb-2">{EX.title}</h2>
          <p className="text-gray-500 font-semibold mb-8">
            Trouve toutes les occurrences d'un mot dans la grille !
          </p>
          <button
            onClick={() => setPhase('presentation')}
            className="text-white font-black px-10 py-4 rounded-2xl text-xl active:scale-95 transition-all"
            style={{ background: EX.gradient, boxShadow: EX.shadow }}
          >
            Commencer
          </button>
        </motion.div>
      </div>
    )
  }

  // ─── Presentation ──────────────────────────────────────────────────────
  if (phase === 'presentation') {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto py-8">
        <h2 className="text-2xl font-fredoka font-semibold text-ink mb-6 text-center">Comment jouer ?</h2>
        <div className="bg-white rounded-3xl p-6 mb-6 space-y-4 shadow-card">
          {[
            { icon: '🎯', text: "Un mot cible t'est donné. Clique sur toutes ses occurrences dans la grille." },
            { icon: '🔢', text: 'Le mot peut apparaître 0, 1 ou plusieurs fois.' },
            { icon: '🚫', text: 'Si le mot est absent, clique sur "Il n\'y a pas le mot".' },
            { icon: '✅', text: 'Clique sur "Suivant" quand tu as terminé ta sélection.' },
            { icon: '⏱️', text: 'Un chronomètre tourne pendant les 6 grilles. Plus tu es rapide, plus tu gagnes de points !' },
            { icon: '❌', text: 'Attention : chaque erreur retire des points.' },
            { icon: '📈', text: 'La difficulté augmente de la grille 1 à la grille 6.' },
          ].map(({ icon, text }) => (
            <div key={icon} className="flex gap-3 items-start">
              <span className="text-xl shrink-0">{icon}</span>
              <span className="font-semibold text-ink text-sm">{text}</span>
            </div>
          ))}
        </div>
        <div className="text-center">
          <button
            onClick={() => setPhase('theme-select')}
            className="text-white font-black px-10 py-4 rounded-2xl text-lg active:scale-95 transition-all"
            style={{ background: EX.gradient, boxShadow: EX.shadow }}
          >
            Continuer →
          </button>
        </div>
      </motion.div>
    )
  }

  // ─── Theme Select ──────────────────────────────────────────────────────
  if (phase === 'theme-select') {
    return <ThemeSelector themes={THEME_LIST} onSelect={handleThemeSelect} />
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
          🏆
        </motion.div>
        <h2 className="text-3xl font-fredoka font-semibold text-ink mb-6">Session terminée !</h2>
        <div className="bg-white rounded-3xl p-8 shadow-card mb-6 space-y-4">
          <div>
            <p
              className="text-6xl font-fredoka font-bold score-reveal"
              style={{ background: EX.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
            >
              {totalScore}
            </p>
            <p className="text-gray-400 font-semibold mt-1">points au total</p>
          </div>
          <div className="border-t pt-3 space-y-1 text-sm text-gray-500 font-semibold">
            <p>Grilles : {gridTotal} pts</p>
            <p>Bonus temps ({stopwatch.formatted}) : <span className="text-success font-black">+{timeBonus} pts</span></p>
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
            onClick={() => setPhase('intro')}
            className="flex-1 text-white font-bold py-3 rounded-2xl transition-all active:scale-95"
            style={{ background: EX.gradient, boxShadow: EX.shadow }}
          >
            Rejouer
          </button>
        </div>
      </motion.div>
    )
  }

  // ─── Playing ───────────────────────────────────────────────────────────
  if (phase === 'playing' && currentGrid) {
    return (
      <div className="max-w-3xl mx-auto">
        {/* Game header */}
        <div className="bg-white rounded-2xl p-4 shadow-card mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
              style={{ background: EX.gradient }}
            >
              {EX.emoji}
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold">Grille {gridIndex + 1} / 6</p>
              <p className="font-black text-sm text-ink">
                Mot : <span style={{ color: EX.color }}>{currentGrid.targetWord}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="px-3 py-1.5 rounded-xl text-center"
              style={{ background: 'rgba(124,111,247,0.10)' }}
            >
              <p className="text-xs font-semibold" style={{ color: 'rgba(124,111,247,0.7)' }}>Score</p>
              <p className="font-black text-sm" style={{ color: EX.color }}>{totalScore}</p>
            </div>
            <StopwatchDisplay formatted={stopwatch.formatted} seconds={stopwatch.seconds} />
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex gap-1.5 mb-4">
          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={i}
              className="flex-1 h-2.5 rounded-full transition-all duration-500"
              style={{
                background: i < gridIndex ? '#06D6A0' : i === gridIndex ? EX.gradient : '#e5e7eb',
              }}
            />
          ))}
        </div>

        {/* Hint */}
        <div className="bg-white rounded-2xl p-3 mb-4 flex items-center gap-3 shadow-card">
          <span className="text-lg">ℹ️</span>
          <p className="text-sm font-semibold text-gray-600">
            Clique sur toutes les occurrences de "<span className="font-black" style={{ color: EX.color }}>{currentGrid.targetWord}</span>", puis clique sur "Suivant".
          </p>
          {selectedKeys.size > 0 && (
            <span
              className="ml-auto font-black text-xs px-2 py-1 rounded-full whitespace-nowrap"
              style={{ background: 'rgba(124,111,247,0.12)', color: EX.color }}
            >
              {selectedKeys.size} sélectionné{selectedKeys.size > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Grid */}
        <div className="flex justify-center mb-4">
          <WordSearchGrid
            cells={currentGrid.cells}
            cellStates={cellStates}
            onCellClick={handleCellClick}
          />
        </div>

        {/* Action buttons */}
        <div className="flex justify-center gap-3">
          <button
            onClick={handleNoWord}
            className="bg-white border-2 border-gray-200 hover:border-error text-gray-500 hover:text-error font-bold px-5 py-3 rounded-2xl transition-colors shadow-card text-sm"
          >
            🚫 Il n'y a pas le mot
          </button>
          <button
            onClick={() => submitGrid(usedNoWord)}
            className="text-white font-black px-8 py-3 rounded-2xl active:scale-95 transition-all text-sm"
            style={{ background: EX.gradient, boxShadow: EX.shadow }}
          >
            Suivant →
          </button>
        </div>
      </div>
    )
  }

  return null
}
