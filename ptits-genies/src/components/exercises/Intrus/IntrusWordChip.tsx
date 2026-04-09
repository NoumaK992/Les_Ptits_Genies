import { motion } from 'framer-motion'

interface Props {
  word: string
  onClick: () => void
  state: 'idle' | 'correct' | 'wrong' | 'revealed'
  disabled?: boolean
  size?: 'sm' | 'md'
}

export function IntrusWordChip({ word, onClick, state, disabled, size = 'md' }: Props) {
  const stateClasses = {
    idle: 'bg-white border-2 border-gray-200 text-ink hover:border-primary hover:shadow-md cursor-pointer',
    correct: 'bg-success border-2 border-success text-white cursor-default',
    wrong: 'bg-error border-2 border-error text-white cursor-default',
    revealed: 'bg-accent border-2 border-accent text-ink cursor-default',
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-4 py-2 text-sm'

  return (
    <motion.button
      onClick={disabled ? undefined : onClick}
      whileHover={state === 'idle' && !disabled ? { scale: 1.05 } : {}}
      whileTap={state === 'idle' && !disabled ? { scale: 0.95 } : {}}
      animate={state === 'correct' ? { scale: [1, 1.2, 1] } : state === 'wrong' ? { x: [-4, 4, -4, 4, 0] } : {}}
      className={`${sizeClasses} rounded-2xl font-bold transition-colors select-none ${stateClasses[state]}`}
    >
      {word}
    </motion.button>
  )
}
