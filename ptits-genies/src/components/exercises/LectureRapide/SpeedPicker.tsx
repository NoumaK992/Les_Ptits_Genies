import { motion } from 'framer-motion'
import type { SpeedOption } from '@/types'

const speedOptions: SpeedOption[] = [
  { id: 'tortue', label: 'Tout doux', emoji: '🐢', wpm: 100, multiplier: 1 },
  { id: 'marche', label: 'Mon rythme', emoji: '🚶', wpm: 180, multiplier: 1.5 },
  { id: 'velo', label: 'Je pédale', emoji: '🚴', wpm: 280, multiplier: 2 },
  { id: 'voiture', label: 'Vite vite !', emoji: '🚗', wpm: 420, multiplier: 2.5 },
  { id: 'fusee', label: 'Mode génie', emoji: '🚀', wpm: 600, multiplier: 3 },
]

interface Props {
  selected: string
  onChange: (option: SpeedOption) => void
}

export { speedOptions }

export function SpeedPicker({ selected, onChange }: Props) {
  return (
    <div>
      <p className="font-bold text-sm text-gray-500 mb-3 text-center">Choisis ta vitesse de lecture</p>
      <div className="flex gap-2 flex-wrap justify-center">
        {speedOptions.map((opt) => (
          <motion.button
            key={opt.id}
            whileTap={{ scale: 0.9 }}
            onClick={() => onChange(opt)}
            className={`flex flex-col items-center px-4 py-3 rounded-2xl border-2 transition-all min-w-[70px] ${
              selected === opt.id
                ? 'border-primary bg-primary/10 shadow-md'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <span className="text-2xl mb-1">{opt.emoji}</span>
            <span className="text-xs font-bold text-ink">{opt.label}</span>
            <span className={`text-xs font-black mt-0.5 ${selected === opt.id ? 'text-primary' : 'text-gray-400'}`}>
              ×{opt.multiplier}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
