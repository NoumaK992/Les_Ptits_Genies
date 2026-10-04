import { motion } from 'framer-motion'
import type { GeneratedGrid } from '@/types'
import { WordSearchGrid, cellKey } from './WordSearchGrid'
import { Bouton } from '@/components/ui/Bouton'
import { Carte } from '@/components/ui/Carte'
import { Etiquette } from '@/components/ui/Etiquette'

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
      className="mx-auto max-w-2xl"
    >
      <Carte className="mb-4 p-4 text-center md:p-5">
        <Etiquette>Correction · Grille {gridIndex + 1}/6</Etiquette>
        <p className="mt-3 text-xl font-bold text-encre">
          Mot : <span className="font-titre">{grid.targetWord}</span>
          <span className="ml-2 text-base font-semibold text-encre-doux">({grid.targetCount} occurrence{grid.targetCount !== 1 ? 's' : ''})</span>
        </p>
      </Carte>

      {/* Stats */}
      <div className="mb-4 flex flex-wrap justify-center gap-2">
        <div className="rounded-full border-2 border-encre bg-juste px-4 py-1.5 text-base font-bold text-encre">
          ✓ {correctSelections} correcte{correctSelections !== 1 ? 's' : ''}
        </div>
        {missedTargets > 0 && (
          <div className="rounded-full border-2 border-dashed border-encre bg-rose-pale px-4 py-1.5 text-base font-bold text-encre">
            ! {missedTargets} manquée{missedTargets !== 1 ? 's' : ''}
          </div>
        )}
        {wrongSelections > 0 && (
          <div className="rounded-full border-2 border-encre bg-faux px-4 py-1.5 text-base font-bold text-encre">
            ✗ {wrongSelections} erreur{wrongSelections !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Grid in correction mode */}
      <div className="mb-4 flex justify-center">
        <WordSearchGrid cells={grid.cells} cellStates={cellStates} disabled />
      </div>

      {/* Score */}
      <Carte className="mb-4 p-4 text-center">
        <p className="font-titre text-3xl text-encre">+{gridScore} pts</p>
        <p className="mt-1 text-base text-encre-doux">Total : {totalScore} pts</p>
      </Carte>

      {/* Special messages */}
      {grid.targetCount === 0 && (
        <div className="mb-4 rounded-2xl border-2 border-encre bg-bleu p-3 text-center text-base font-bold text-encre">
          ℹ️ Il n'y avait effectivement pas le mot dans cette grille !
        </div>
      )}

      <div className="flex justify-center">
        <Bouton taille="grand" onClick={onContinue}>
          {isLast ? 'Voir le résultat final 🏆' : 'Continuer →'}
        </Bouton>
      </div>
    </motion.div>
  )
}
