import type { CoupDoeilWord, CoupDoeilThemeKey } from '@/types'
import { WordItem } from './WordItem'

interface Props {
  columns: [CoupDoeilWord[], CoupDoeilWord[], CoupDoeilWord[]]
  assignments: Record<string, CoupDoeilThemeKey>
  onAssign: (wordId: string, theme: CoupDoeilThemeKey | null) => void
  mode: 'playing' | 'correction'
}

export function ColumnDisplay({ columns, assignments, onAssign, mode }: Props) {
  return (
    <div className="flex gap-2 w-full overflow-x-auto">
      {columns.map((col, colIdx) => (
        <div key={colIdx} className="flex-1 relative min-w-0">
          {/* Vertical guide line */}
          <div
            className="absolute top-0 bottom-0 bg-gray-400 pointer-events-none"
            style={{ left: '50%', width: '1px', transform: 'translateX(-50%)', zIndex: 0 }}
          />
          {/* Words */}
          <div className="relative flex flex-col items-center gap-1.5 py-2">
            {col.map((word) => (
              <WordItem
                key={word.id}
                word={word}
                assignment={assignments[word.id]}
                onAssign={onAssign}
                mode={mode}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
