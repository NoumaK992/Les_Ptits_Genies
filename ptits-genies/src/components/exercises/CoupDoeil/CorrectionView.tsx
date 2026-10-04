import { motion } from 'framer-motion'
import { cn } from '@/lib/cn'
import type { CoupDoeilSeries, CoupDoeilThemeKey } from '@/types'
import { Bouton } from '@/components/ui/Bouton'
import { Carte, classesCarte } from '@/components/ui/Carte'
import { ColumnDisplay } from './ColumnDisplay'

interface Props {
  series: CoupDoeilSeries
  assignments: Record<string, CoupDoeilThemeKey>
  seriesScore: number
  stats: {
    correct: number
    wrong: number
    missed: number
    falseAlarms: number
    perfect: boolean
  }
  onContinue: () => void
}

const PASTILLE = 'flex items-center gap-1.5 rounded-xl border-2 border-encre px-3 py-2 text-encre shadow-dur-sm'

export function CorrectionView({ series, assignments, seriesScore, stats, onContinue }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-4"
    >
      {/* Stats bar */}
      <div className="flex gap-3 flex-wrap">
        <div className={cn(PASTILLE, 'bg-juste')}>
          <span className="text-lg">✅</span>
          <span className="font-black">{stats.correct}</span>
          <span className="text-base font-semibold">correct{stats.correct > 1 ? 's' : ''}</span>
        </div>
        <div className={cn(PASTILLE, 'bg-rose-pale')}>
          <span className="text-lg">⚠️</span>
          <span className="font-black">{stats.missed}</span>
          <span className="text-base font-semibold">manqué{stats.missed > 1 ? 's' : ''}</span>
        </div>
        <div className={cn(PASTILLE, 'bg-faux')}>
          <span className="text-lg">❌</span>
          <span className="font-black">{stats.wrong + stats.falseAlarms}</span>
          <span className="text-base font-semibold">erreur{stats.wrong + stats.falseAlarms > 1 ? 's' : ''}</span>
        </div>
        {stats.perfect && (
          <div className={cn(PASTILLE, 'bg-jaune')}>
            <span className="text-lg">⭐</span>
            <span className="font-black">Parfait ! +60</span>
          </div>
        )}
      </div>

      {/* Score */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className={`${classesCarte} p-4 flex flex-wrap items-center justify-between gap-2`}
      >
        <span className="font-black text-encre text-lg">Score de la série</span>
        <span className="font-titre text-2xl text-encre">{seriesScore} pts</span>
      </motion.div>

      {/* Corrected columns */}
      <Carte className="p-4">
        <h4 className="font-black text-encre mb-3 text-base">Correction :</h4>
        <ColumnDisplay
          columns={series.columns}
          assignments={assignments}
          onAssign={() => {}}
          mode="correction"
        />
      </Carte>

      {/* Continue */}
      <Bouton taille="grand" onClick={onContinue} className="w-full">
        Voir mes résultats
      </Bouton>
    </motion.div>
  )
}
