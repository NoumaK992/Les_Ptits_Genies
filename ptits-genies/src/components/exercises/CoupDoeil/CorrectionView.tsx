import { motion } from 'framer-motion'
import type { CoupDoeilSeries, CoupDoeilThemeKey } from '@/types'
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

export function CorrectionView({ series, assignments, seriesScore, stats, onContinue }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-4"
    >
      {/* Stats bar */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 bg-green-100 border-2 border-green-300 rounded-xl px-3 py-2">
          <span className="text-lg">✅</span>
          <span className="font-black text-green-700">{stats.correct}</span>
          <span className="text-xs font-semibold text-green-600">correct{stats.correct > 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center gap-1.5 bg-orange-100 border-2 border-orange-300 rounded-xl px-3 py-2">
          <span className="text-lg">⚠️</span>
          <span className="font-black text-orange-700">{stats.missed}</span>
          <span className="text-xs font-semibold text-orange-600">manqué{stats.missed > 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center gap-1.5 bg-red-100 border-2 border-red-300 rounded-xl px-3 py-2">
          <span className="text-lg">❌</span>
          <span className="font-black text-red-700">{stats.wrong + stats.falseAlarms}</span>
          <span className="text-xs font-semibold text-red-600">erreur{stats.wrong + stats.falseAlarms > 1 ? 's' : ''}</span>
        </div>
        {stats.perfect && (
          <div className="flex items-center gap-1.5 bg-yellow-100 border-2 border-yellow-400 rounded-xl px-3 py-2">
            <span className="text-lg">⭐</span>
            <span className="font-black text-yellow-700">Parfait ! +60</span>
          </div>
        )}
      </div>

      {/* Score */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="bg-white rounded-2xl shadow p-4 flex items-center justify-between"
      >
        <span className="font-black text-ink text-lg">Score de la série</span>
        <span className="font-black text-2xl text-primary">{seriesScore} pts</span>
      </motion.div>

      {/* Corrected columns */}
      <div className="bg-white rounded-2xl shadow p-4">
        <h4 className="font-black text-ink mb-3 text-sm">Correction :</h4>
        <ColumnDisplay
          columns={series.columns}
          assignments={assignments}
          onAssign={() => {}}
          mode="correction"
        />
      </div>

      {/* Continue */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={onContinue}
        className="w-full bg-primary text-white font-black py-4 rounded-2xl shadow-lg hover:bg-primary/90 transition-colors"
      >
        Voir mes résultats
      </motion.button>
    </motion.div>
  )
}
