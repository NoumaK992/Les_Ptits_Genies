import { motion } from 'framer-motion'
import type { GeneratedGrid } from '@/types'
import { WordSearchGrid, cellKey } from './WordSearchGrid'

type CellState = 'default' | 'selected' | 'correct' | 'wrong' | 'missed'

interface Props {
  grid: GeneratedGrid
  selectedKeys: Set<string>
  gridIndex: number
  gridScore: number
  totalScore: number
  isLast: boolean
  onContinue: () => void
}

export function CorrectionOverlay({ grid, selectedKeys, gridIndex, gridScore, totalScore, isLast, onContinue }: Props) {
  const targetKeys = new Set(grid.targetPositions.map(([r, c]) => cellKey(r, c)))
  
  let correctSelections = 0
  let wrongSelections = 0
  let missedTargets = 0

  const cellStates = new Map<string, CellState>()

  // Build cell states
  for (let r = 0; r < grid.cells.length; r++) {
    for (let c = 0; c < grid.cells[r].length; c++) {
      const key = cellKey(r, c)
      const isTarget = targetKeys.has(key)
      const isSelected = selectedKeys.has(key)

      if (isTarget && isSelected) {
        cellStates.set(key, 'correct')
        correctSelections++
      } else if (isTarget && !isSelected) {
        cellStates.set(key, 'missed')
        missedTargets++
      } else if (!isTarget && isSelected) {
        cellStates.set(key, 'wrong')
        wrongSelections++
      } else {
        cellStates.set(key, 'default')
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <div className="text-center mb-4">
        <h3 className="text-xl font-black text-ink">
          Correction — Grille {gridIndex + 1}/6
        </h3>
        <p className="font-black text-xl text-ink mt-1">
          Mot : <span className="text-primary">{grid.targetWord}</span>
          <span className="text-gray-400 text-sm ml-2">({grid.targetCount} occurrence{grid.targetCount !== 1 ? 's' : ''})</span>
        </p>
      </div>

      {/* Stats */}
      <div className="flex justify-center gap-4 mb-4">
        <div className="bg-success/10 text-success font-black px-4 py-2 rounded-xl text-sm">
          ✅ {correctSelections} correcte{correctSelections !== 1 ? 's' : ''}
        </div>
        {missedTargets > 0 && (
          <div className="bg-accent/20 text-orange-700 font-black px-4 py-2 rounded-xl text-sm">
            ⚠️ {missedTargets} manquée{missedTargets !== 1 ? 's' : ''}
          </div>
        )}
        {wrongSelections > 0 && (
          <div className="bg-error/10 text-error font-black px-4 py-2 rounded-xl text-sm">
            ❌ {wrongSelections} erreur{wrongSelections !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Grid in correction mode */}
      <div className="flex justify-center mb-4">
        <WordSearchGrid cells={grid.cells} cellStates={cellStates} disabled />
      </div>

      {/* Score */}
      <div className="bg-white rounded-2xl p-4 shadow text-center mb-4">
        <p className="text-3xl font-black text-primary">+{gridScore} pts</p>
        <p className="text-gray-500 text-sm font-semibold">Total : {totalScore} pts</p>
      </div>

      {/* Special messages */}
      {grid.targetCount === 0 && (
        <div className="bg-primary/10 rounded-2xl p-3 text-center font-bold text-primary text-sm mb-4">
          Il n'y avait effectivement pas le mot dans cette grille !
        </div>
      )}

      <div className="flex justify-center">
        <button
          onClick={onContinue}
          className="bg-primary text-white font-black px-10 py-4 rounded-2xl text-lg shadow-lg active:scale-95 transition-transform"
        >
          {isLast ? 'Voir le résultat final 🏆' : 'Continuer →'}
        </button>
      </div>
    </motion.div>
  )
}
