import { motion } from 'framer-motion'
import type { WordSearchTheme } from '@/types'

interface Props {
  themes: WordSearchTheme[]
  onSelect: (themeId: string) => void
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } }
const item = { hidden: { opacity: 0, scale: 0.9 }, show: { opacity: 1, scale: 1 } }

export function ThemeSelector({ themes, onSelect }: Props) {
  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-6">
        <h3 className="text-xl font-black text-ink">Choisis un thème</h3>
        <p className="text-gray-500 text-sm font-semibold mt-1">Les mots seront en lien avec le thème choisi</p>
      </div>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        {themes.map((t) => (
          <motion.button
            key={t.id}
            variants={item}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(t.id)}
            className="bg-white rounded-2xl p-4 shadow hover:shadow-md transition-shadow flex flex-col items-center gap-2 border-2 border-transparent hover:border-primary/30"
          >
            <span className="text-3xl">{t.emoji}</span>
            <span className="font-bold text-sm text-ink text-center">{t.label}</span>
          </motion.button>
        ))}
      </motion.div>
    </div>
  )
}
