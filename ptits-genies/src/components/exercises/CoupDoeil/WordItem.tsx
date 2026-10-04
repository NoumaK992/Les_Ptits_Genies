import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { CoupDoeilWord, CoupDoeilThemeKey } from '@/types'
import { FOND_THEME } from './ThemeHeader'

interface Props {
  word: CoupDoeilWord
  assignment: CoupDoeilThemeKey | undefined
  onAssign: (wordId: string, theme: CoupDoeilThemeKey | null) => void
  mode: 'playing' | 'correction'
}


export function WordItem({ word, assignment, onAssign, mode }: Props) {
  const [open, setOpen] = useState(false)

  // ── Playing mode ──────────────────────────────────────────────────
  if (mode === 'playing') {
    const assigned = assignment

    return (
      <div className={`relative flex flex-col items-center ${open ? 'z-40' : 'z-10'}`}>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            if (assigned) {
              onAssign(word.id, null)
              setOpen(false)
            } else {
              setOpen((v) => !v)
            }
          }}
          className={`relative max-w-full px-2 py-0.5 rounded-lg text-base font-semibold text-encre text-center transition-all cursor-pointer
            focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-bleu
            ${assigned
              ? `${FOND_THEME[assigned]} border-2 border-encre`
              : 'hover:bg-jaune/40 border-2 border-transparent'
            }`}
        >
          {word.text}
          {assigned && (
            <span className="ml-1 text-base font-black text-encre">[{assigned}]</span>
          )}
        </motion.button>

        <AnimatePresence>
          {open && !assigned && (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.95 }}
              transition={{ duration: 0.12 }}
              className="absolute top-full mt-1 flex gap-1 bg-papier rounded-xl shadow-dur-sm border-2 border-encre p-1.5 z-50"
            >
              {(['a', 'b', 'c'] as CoupDoeilThemeKey[]).map((t) => (
                <button
                  key={t}
                  onClick={(e) => {
                    e.stopPropagation()
                    onAssign(word.id, t)
                    setOpen(false)
                  }}
                  className={`w-10 h-10 rounded-lg border-2 border-encre font-titre text-base text-encre transition-all hover:-translate-y-px ${FOND_THEME[t]}`}
                >
                  {t}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  // ── Correction mode ───────────────────────────────────────────────
  const isTarget = word.theme !== null
  const isAssigned = assignment !== undefined

  let stateClass = ''
  let indicator = ''
  let hint = ''

  if (!isTarget && !isAssigned) {
    // Distractor, correctly ignored
    stateClass = 'text-encre-doux'
  } else if (!isTarget && isAssigned) {
    // False alarm: distractor was tagged
    stateClass = 'line-through text-encre bg-faux border-2 border-encre rounded-lg'
    indicator = '✗'
    hint = 'distracteur'
  } else if (isTarget && isAssigned && assignment === word.theme) {
    // Correct
    stateClass = 'text-encre bg-juste border-2 border-encre rounded-lg'
    indicator = '✓'
  } else if (isTarget && isAssigned && assignment !== word.theme) {
    // Wrong category
    stateClass = 'text-encre bg-faux border-2 border-encre rounded-lg'
    indicator = '✗'
    hint = word.theme!
  } else if (isTarget && !isAssigned) {
    // Missed target
    stateClass = 'text-encre bg-rose-pale border-2 border-dashed border-encre rounded-lg animate-pulse'
    indicator = '◌'
    hint = word.theme!
  }

  return (
    <div className={`max-w-full px-2 py-0.5 text-base font-semibold z-10 relative text-center ${stateClass}`}>
      {word.text}
      {indicator && <span className="ml-1 font-titre text-base">{indicator}</span>}
      {hint && (
        <span className="ml-1 text-base font-bold">
          → [{hint}]
        </span>
      )}
    </div>
  )
}
