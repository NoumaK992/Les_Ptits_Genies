import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useProgressStore } from '@/store/progressStore'
import { calcStreak } from '@/utils/streak'
import type { ExerciseType } from '@/types'

const ALL_EXERCISES: {
  type: ExerciseType
  emoji: string
  title: string
  to: string
}[] = [
  { type: 'word-search', emoji: '🔍', title: 'Recherche de mots', to: '/exercices/recherche-mots' },
  { type: 'intrus', emoji: '🕵️', title: "L'Intrus", to: '/exercices/intrus' },
  { type: 'lecture-rapide', emoji: '⚡', title: 'Lecture rapide', to: '/exercices/lecture-rapide' },
  { type: 'coup-doeil', emoji: '👁️', title: "D'un coup d'œil", to: '/exercices/coup-doeil' },
  { type: 'phrases-brouillees', emoji: '🧩', title: 'Phrases brouillées', to: '/exercices/phrases-brouillees' },
  { type: 'collection', emoji: '🗂️', title: 'Collection de mots', to: '/exercices/collection-mots' },
]

function getRelativeDate(dateStr: string): string {
  const diffDays = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 86_400_000
  )
  if (diffDays === 0) return "aujourd'hui"
  if (diffDays === 1) return 'hier'
  return `il y a ${diffDays} jours`
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as number[] } },
}

export default function HomePage() {
  const { currentUser } = useAuthStore()
  const { progress, sessions, loadProgress } = useProgressStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (currentUser) loadProgress(currentUser.id)
  }, [currentUser?.id])

  const streak = calcStreak(sessions)

  const getTotalSessions = (type: string) =>
    progress.find((p) => p.exerciseType === type)?.totalSessions ?? 0

  // Défi du jour = exercice le moins joué (0 sessions = jamais joué, priorité absolue)
  const challenge = [...ALL_EXERCISES].sort(
    (a, b) => getTotalSessions(a.type) - getTotalSessions(b.type)
  )[0]

  const challengeSessions = getTotalSessions(challenge.type)
  const challengeMsg =
    challengeSessions === 0
      ? "Jamais joué — essaie aujourd'hui !"
      : `${challengeSessions} session${challengeSessions > 1 ? 's' : ''} — bats ton record !`

  const lastSession = sessions[0] ?? null
  const lastExercise = lastSession
    ? ALL_EXERCISES.find((e) => e.type === lastSession.exerciseType) ?? null
    : null

  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">

        {/* Barre supérieure */}
        <motion.div variants={item} className="flex justify-between items-center">
          <span className="text-white font-bold text-lg">
            Salut, {currentUser?.username} 👋
          </span>
          <span className="text-sm capitalize" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {today}
          </span>
        </motion.div>

        {/* Ligne de stats */}
        <motion.div variants={item} className="grid grid-cols-3 gap-3">
          <div
            className="rounded-2xl p-4 text-center"
            style={{
              background: 'rgba(124,111,247,0.15)',
              border: '1px solid rgba(124,111,247,0.30)',
            }}
          >
            <div className="text-xl font-black" style={{ color: '#a78bfa' }}>
              {currentUser?.totalPoints ?? 0}
            </div>
            <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.40)' }}>
              ⭐ points
            </div>
          </div>

          <div
            className="rounded-2xl p-4 text-center"
            style={{
              background: 'rgba(255,211,102,0.15)',
              border: '1px solid rgba(255,211,102,0.30)',
            }}
          >
            <div className="text-xl font-black" style={{ color: '#FFD166' }}>
              {streak}
            </div>
            <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.40)' }}>
              🔥 jours
            </div>
          </div>

          <div
            className="rounded-2xl p-4 text-center"
            style={{
              background: 'rgba(6,214,160,0.15)',
              border: '1px solid rgba(6,214,160,0.30)',
            }}
          >
            <div className="text-xl font-black" style={{ color: '#06D6A0' }}>
              {progress.length}/6
            </div>
            <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.40)' }}>
              📚 exercices
            </div>
          </div>
        </motion.div>

        {/* Défi du jour */}
        <motion.div
          variants={item}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="rounded-2xl p-5 cursor-pointer"
          style={{
            background: 'rgba(124,111,247,0.10)',
            border: '1px solid rgba(124,111,247,0.50)',
          }}
          onClick={() => navigate(challenge.to)}
        >
          <p
            className="text-xs font-black uppercase tracking-widest mb-2"
            style={{ color: '#a78bfa' }}
          >
            ✦ Défi du jour
          </p>
          <h2 className="text-white font-black text-xl mb-1">
            {challenge.emoji} {challenge.title}
          </h2>
          <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.45)' }}>
            {challengeMsg}
          </p>
          <button
            className="w-full py-2.5 rounded-xl text-white font-black text-sm"
            style={{ background: 'linear-gradient(135deg, #7C6FF7, #4a3fcc)' }}
          >
            ▶ Jouer
          </button>
        </motion.div>

        {/* Bas de page : dernière session + voir tous les exercices */}
        <motion.div variants={item} className="flex gap-3">
          {lastSession && lastExercise ? (
            <div
              className="flex-1 rounded-xl p-3"
              style={{ background: 'rgba(255,255,255,0.05)' }}
            >
              <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.30)' }}>
                Récent
              </p>
              <p className="text-white text-sm font-semibold">
                {lastExercise.emoji} {lastExercise.title}
              </p>
              <p className="text-xs mt-0.5 font-black" style={{ color: '#FFD166' }}>
                +{lastSession.score} pts
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>
                {getRelativeDate(lastSession.playedAt)}
              </p>
            </div>
          ) : (
            <div
              className="flex-1 rounded-xl p-3"
              style={{ background: 'rgba(255,255,255,0.04)' }}
            >
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
                Aucune session encore — c'est parti ! 🌱
              </p>
            </div>
          )}

          <button
            onClick={() => navigate('/exercices')}
            className="flex-1 rounded-xl p-3 text-sm font-black transition-all hover:scale-[1.02]"
            style={{
              background: 'rgba(124,111,247,0.15)',
              border: '1px solid rgba(124,111,247,0.30)',
              color: '#a78bfa',
            }}
          >
            📚 Voir tous<br />les exercices →
          </button>
        </motion.div>

      </motion.div>
    </div>
  )
}
