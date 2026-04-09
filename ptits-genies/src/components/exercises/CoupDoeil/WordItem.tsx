import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { CoupDoeilWord, CoupDoeilThemeKey } from '@/types'

interface Props {
  word: CoupDoeilWord
  assignment: CoupDoeilThemeKey | undefined
  onAssign: (wordId: string, theme: CoupDoeilThemeKey | null) => void
  mode: 'playing' | 'correction'
}

const THEME_COLORS: Record<CoupDoeilThemeKey, { bg: string; border: string; text: string; btn: string }> = {
  a: { bg: 'bg-blue-100',   border: 'border-blue-400',   text: 'text-blue-700',   btn: 'bg-blue-500 hover:bg-blue-600 text-white' },
  b: { bg: 'bg-green-100',  border: 'border-green-400',  text: 'text-green-700',  btn: 'bg-green-500 hover:bg-green-600 text-white' },
  c: { bg: 'bg-orange-100', border: 'border-orange-400', text: 'text-orange-700', btn: 'bg-orange-500 hover:bg-orange-600 text-white' },
}

export function WordItem({ word, assignment, onAssign, mode }: Props) {
  const [open, setOpen] = useState(false)

  // ── Playing mode ──────────────────────────────────────────────────
  if (mode === 'playing') {
    const assigned = assignment
    const style = assigned ? THEME_COLORS[assigned] : null

    return (
      <div className="relative flex flex-col items-center z-10">
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
          className={`relative px-2 py-0.5 rounded-lg text-sm font-semibold transition-all cursor-pointer
            ${style
              ? `${style.bg} ${style.border} border-2 ${style.text}`
              : 'text-gray-700 hover:bg-gray-100 border-2 border-transparent'
            }`}
        >
          {word.text}
          {assigned && (
            <span className={`ml-1 text-xs font-black ${style!.text}`}>[{assigned}]</span>
          )}
        </motion.button>

        <AnimatePresence>
          {open && !assigned && (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.95 }}
              transition={{ duration: 0.12 }}
              className="absolute top-full mt-1 flex gap-1 bg-white rounded-xl shadow-lg border border-gray-100 p-1.5 z-50"
            >
              {(['a', 'b', 'c'] as CoupDoeilThemeKey[]).map((t) => (
                <button
                  key={t}
                  onClick={(e) => {
                    e.stopPropagation()
                    onAssign(word.id, t)
                    setOpen(false)
                  }}
                  className={`w-7 h-7 rounded-lg text-xs font-black transition-all ${THEME_COLORS[t].btn}`}
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
    stateClass = 'text-gray-400'
  } else if (!isTarget && isAssigned) {
    // False alarm: distractor was tagged
    stateClass = 'line-through text-red-400 bg-red-50 border-2 border-red-300 rounded-lg'
    indicator = '✗'
    hint = 'distracteur'
  } else if (isTarget && isAssigned && assignment === word.theme) {
    // Correct
    stateClass = 'text-green-700 bg-green-100 border-2 border-green-400 rounded-lg'
    indicator = '✓'
  } else if (isTarget && isAssigned && assignment !== word.theme) {
    // Wrong category
    stateClass = 'text-red-700 bg-red-100 border-2 border-red-400 rounded-lg'
    indicator = '✗'
    hint = word.theme!
  } else if (isTarget && !isAssigned) {
    // Missed target
    stateClass = 'text-orange-700 bg-orange-100 border-2 border-orange-400 rounded-lg animate-pulse'
    indicator = '◌'
    hint = word.theme!
  }

  return (
    <div className={`px-2 py-0.5 text-sm font-semibold z-10 relative text-center ${stateClass}`}>
      {word.text}
      {indicator && <span className="ml-1 font-black text-xs">{indicator}</span>}
      {hint && (
        <span className="ml-1 text-xs font-bold opacity-80">
          → [{hint}]
        </span>
      )}
    </div>
  )
}
