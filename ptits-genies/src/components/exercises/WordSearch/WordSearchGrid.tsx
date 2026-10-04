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
  default: 'bg-papier border-encre/30 hover:bg-jaune/40 cursor-pointer',
  selected: 'bg-jaune border-encre font-bold cursor-pointer',
  correct: 'bg-juste border-encre font-bold',
  wrong: 'bg-faux border-encre font-bold line-through',
  missed: 'bg-rose-pale border-encre border-dashed font-bold',
}

// Repère visuel en plus de la couleur (correction uniquement)
const stateIcons: Partial<Record<CellState, { signe: string; lu: string }>> = {
  correct: { signe: '✓', lu: 'bien trouvé' },
  wrong: { signe: '✗', lu: 'erreur' },
  missed: { signe: '!', lu: 'manqué' },
}

// Determine optimal column count based on longest word
function getColsConfig(cells: string[][]): { colsClass: string; textClass: string } {
  const maxLen = Math.max(...cells.flat().map((w) => w.length))

  if (maxLen <= 8) {
    // Short words (CHAT, LOUP, RENARD, MOUTON...)
    return { colsClass: 'grid-cols-6', textClass: 'text-sm sm:text-base' }
  }
  if (maxLen <= 12) {
    // Medium words (CROCODILE, PERROQUET, SAUTERELLE...)
    return { colsClass: 'grid-cols-5', textClass: 'text-xs sm:text-sm md:text-base' }
  }
  // Long words (PHOTOSYNTHESE, ELECTROMAGNETISME, BIOLUMINESCENCE...)
  return { colsClass: 'grid-cols-4', textClass: 'text-xs sm:text-sm md:text-base' }
}

export function WordSearchGrid({ cells, cellStates, onCellClick, disabled }: Props) {
  const { colsClass, textClass } = useMemo(() => getColsConfig(cells), [cells])

  return (
    <div className="w-full">
      <div className="rounded-2xl border-2 border-encre bg-sable p-1 sm:p-2">
        <div className={`grid ${colsClass} gap-1`}>
          {cells.map((row, r) =>
            row.map((word, c) => {
              const key = cellKey(r, c)
              const state = cellStates.get(key) ?? 'default'
              const clickable = !disabled && (state === 'default' || state === 'selected')
              const icone = stateIcons[state]
              return (
                <motion.button
                  key={key}
                  type="button"
                  whileTap={clickable ? { scale: 0.92 } : {}}
                  onClick={clickable ? () => onCellClick?.(r, c) : undefined}
                  aria-pressed={clickable ? state === 'selected' : undefined}
                  className={`relative w-full min-w-0 rounded-lg border px-0.5 py-2 sm:px-1 sm:py-2.5 ${textClass} font-texte font-semibold text-encre transition-colors select-none text-center break-all focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-1 focus-visible:outline-bleu ${stateStyles[state]} ${clickable ? '' : 'cursor-default'}`}
                >
                  {word}
                  {icone && (
                    <>
                      <span
                        aria-hidden="true"
                        className="absolute -right-1 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full border border-encre bg-papier font-titre text-[0.625rem] leading-none text-encre"
                      >
                        {icone.signe}
                      </span>
                      <span className="sr-only">({icone.lu})</span>
                    </>
                  )}
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
