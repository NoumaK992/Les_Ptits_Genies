import { useMemo } from 'react'
import { motion } from 'framer-motion'

type CellState = 'default' | 'selected' | 'correct' | 'wrong' | 'missed'

interface Props {
  cells: string[][]
  cellStates: Map<string, CellState>
  onCellClick?: (row: number, col: number) => void
  disabled?: boolean
}

function cellKey(r: number, c: number): string {
  return `${r}-${c}`
}

const stateStyles: Record<CellState, string> = {
  default: 'bg-white text-ink hover:bg-primary/10 cursor-pointer border-gray-200',
  selected: 'bg-primary/20 text-primary border-primary/40 cursor-pointer font-black',
  correct: 'bg-success/20 text-success border-success/40 font-black',
  wrong: 'bg-error/20 text-error border-error/40 font-black line-through',
  missed: 'bg-accent/30 text-orange-700 border-accent font-black animate-pulse',
}

// Determine optimal column count based on longest word
function getColsConfig(cells: string[][]): { colsClass: string; textClass: string } {
  const maxLen = Math.max(...cells.flat().map((w) => w.length))

  if (maxLen <= 8) {
    // Short words (CHAT, LOUP, RENARD, MOUTON...)
    return { colsClass: 'grid-cols-6', textClass: 'text-xs sm:text-sm' }
  }
  if (maxLen <= 12) {
    // Medium words (CROCODILE, PERROQUET, SAUTERELLE...)
    return { colsClass: 'grid-cols-5', textClass: 'text-[0.65rem] sm:text-xs md:text-sm' }
  }
  // Long words (PHOTOSYNTHESE, ELECTROMAGNETISME, BIOLUMINESCENCE...)
  return { colsClass: 'grid-cols-4', textClass: 'text-[0.55rem] sm:text-xs md:text-sm' }
}

export function WordSearchGrid({ cells, cellStates, onCellClick, disabled }: Props) {
  const { colsClass, textClass } = useMemo(() => getColsConfig(cells), [cells])

  return (
    <div className="w-full">
      <div className="bg-gray-50 rounded-2xl p-1.5 sm:p-2 shadow-inner">
        <div className={`grid ${colsClass} gap-1`}>
          {cells.map((row, r) =>
            row.map((word, c) => {
              const key = cellKey(r, c)
              const state = cellStates.get(key) ?? 'default'
              const clickable = !disabled && (state === 'default' || state === 'selected')
              return (
                <motion.button
                  key={key}
                  whileTap={clickable ? { scale: 0.92 } : {}}
                  onClick={clickable ? () => onCellClick?.(r, c) : undefined}
                  className={`w-full py-1.5 sm:py-2 px-1 rounded-lg border ${textClass} font-semibold transition-colors select-none text-center break-all ${stateStyles[state]} ${clickable ? '' : 'cursor-default'}`}
                >
                  {word}
                </motion.button>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

export { cellKey }
