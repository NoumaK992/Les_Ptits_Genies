import { motion } from 'framer-motion'
import type { WordSearchTheme } from '@/types'
import { classesCarte } from '@/components/ui/Carte'

interface Props {
  themes: WordSearchTheme[]
  onSelect: (themeId: string) => void
  /** Thèmes déjà joués (affichés avec une petite coche). */
  dejaFaits?: ReadonlySet<string>
  /** Lance un thème jamais fait (ou le moins récemment fait). */
  onSurprise?: () => void
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } }
const item = { hidden: { opacity: 0, scale: 0.9 }, show: { opacity: 1, scale: 1 } }

export function ThemeSelector({ themes, onSelect, dejaFaits, onSurprise }: Props) {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 text-center">
        <h2 className="font-titre text-2xl text-encre md:text-3xl">Choisis un thème</h2>
        <p className="mt-2 text-base text-encre-doux">Les mots seront en lien avec le thème choisi</p>
        {onSurprise && (
          <button
            type="button"
            onClick={onSurprise}
            className={`${classesCarte} mt-4 inline-flex min-h-12 items-center gap-2 px-5 py-2 font-bold text-encre transition-colors hover:bg-jaune focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-bleu`}
          >
            <span aria-hidden="true">🎲</span> Un thème que je n'ai pas encore fait
          </button>
        )}
      </div>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-3 md:grid-cols-4"
      >
        {themes.map((t) => (
          <motion.button
            key={t.id}
            type="button"
            variants={item}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(t.id)}
            className={`${classesCarte} flex min-h-28 flex-col items-center justify-center gap-2 p-4 transition-colors hover:bg-jaune focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-bleu`}
          >
            <span className="text-3xl" aria-hidden="true">{t.emoji}</span>
            <span className="text-center text-base font-bold text-encre">{t.label}</span>
            {dejaFaits?.has(t.id) && <span className="text-sm font-semibold text-encre-doux">✓ déjà fait</span>}
          </motion.button>
        ))}
      </motion.div>
    </div>
  )
}
