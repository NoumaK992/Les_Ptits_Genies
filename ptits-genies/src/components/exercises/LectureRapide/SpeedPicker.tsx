import { motion } from 'framer-motion'
import type { SpeedOption } from '@/types'

const speedOptions: SpeedOption[] = [
  { id: 'tortue', label: 'Tout doux', emoji: '🐢', wpm: 45, multiplier: 1 },
  { id: 'marche', label: 'Mon rythme', emoji: '🚶', wpm: 70, multiplier: 1.5 },
  { id: 'velo', label: 'Je pédale', emoji: '🚴', wpm: 100, multiplier: 2 },
  { id: 'voiture', label: 'Vite vite !', emoji: '🚗', wpm: 140, multiplier: 2.5 },
  { id: 'fusee', label: 'Mode génie', emoji: '🚀', wpm: 200, multiplier: 3 },
]

interface Props {
  selected: string
  onChange: (option: SpeedOption) => void
}

export { speedOptions }

export function SpeedPicker({ selected, onChange }: Props) {
  return (
    <div>
      <p className="font-bold text-base text-encre-doux mb-3 text-center">Choisis ta vitesse de lecture</p>
      <div className="flex gap-2 flex-wrap justify-center">
        {speedOptions.map((opt) => (
          <motion.button
            key={opt.id}
            whileTap={{ scale: 0.9 }}
            onClick={() => onChange(opt)}
            aria-pressed={selected === opt.id}
            className={`flex flex-col items-center px-4 py-3 rounded-2xl border-2 border-encre transition-all min-w-[70px] ${
              selected === opt.id
                ? 'bg-jaune shadow-dur-sm'
                : 'bg-papier hover:bg-jaune/40'
            }`}
          >
            <span className="text-2xl mb-1">{opt.emoji}</span>
            <span className="text-base font-bold text-encre">{opt.label}</span>
            <span className={`text-base font-black mt-0.5 ${selected === opt.id ? 'text-encre' : 'text-encre-doux'}`}>
              ×{opt.multiplier}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
