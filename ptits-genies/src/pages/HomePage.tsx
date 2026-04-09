import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { useProgressStore } from '@/store/progressStore'
import { usePWAInstall } from '@/hooks/usePWAInstall'
import { useEffect } from 'react'

const exercises = [
  {
    to: '/exercices/recherche-mots',
    emoji: '🔍',
    title: 'Recherche de mots',
    desc: '6 grilles par session — trouve toutes les occurrences !',
    gradient: 'linear-gradient(135deg, #7C6FF7 0%, #4a3fcc 100%)',
    shadow: 'rgba(124, 111, 247, 0.40)',
    tag: 'Visuel',
    type: 'word-search',
  },
  {
    to: '/exercices/intrus',
    emoji: '🕵️',
    title: "L'Intrus",
    desc: 'Trouve le mot unique parmi les doublons — 10 listes !',
    gradient: 'linear-gradient(135deg, #FF7B54 0%, #e8404a 100%)',
    shadow: 'rgba(255, 123, 84, 0.40)',
    tag: 'Attention',
    type: 'intrus',
  },
  {
    to: '/exercices/lecture-rapide',
    emoji: '⚡',
    title: 'Lecture rapide',
    desc: 'Lis vite, comprends mieux — 3 niveaux de textes !',
    gradient: 'linear-gradient(135deg, #FFD166 0%, #f59e0b 100%)',
    shadow: 'rgba(255, 209, 102, 0.40)',
    tag: 'Vitesse',
    textDark: true,
    type: 'lecture-rapide',
  },
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
}
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as number[] } },
}

export default function HomePage() {
  const { currentUser } = useAuthStore()
  const { progress, loadProgress } = useProgressStore()
  const { canInstall, install } = usePWAInstall()
  const navigate = useNavigate()

  useEffect(() => {
    if (currentUser) loadProgress(currentUser.id)
  }, [currentUser?.id])

  function getBestScore(exerciseType: string) {
    const p = progress.find((p) => p.exerciseType === exerciseType)
    return p ? p.bestScore : null
  }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir'

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header greeting */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-fredoka font-semibold text-ink">
          {greeting}, <span className="text-primary">{currentUser?.username}</span> ! 👋
        </h2>
        <p className="text-gray-500 font-semibold mt-1">Quel exercice veux-tu faire aujourd'hui ?</p>
      </motion.div>

      {/* Exercise cards */}
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
        {exercises.map((ex) => {
          const best = getBestScore(ex.type)
          const dark = ex.textDark
          return (
            <motion.button
              key={ex.to}
              variants={item}
              onClick={() => navigate(ex.to)}
              whileHover={{ scale: 1.02, y: -3 }}
              whileTap={{ scale: 0.98 }}
              className="w-full text-left rounded-3xl overflow-hidden transition-all"
              style={{ boxShadow: `0 8px 32px ${ex.shadow}` }}
            >
              <div
                className="p-6 relative overflow-hidden"
                style={{ background: ex.gradient }}
              >
                {/* Background shapes */}
                <div
                  className="absolute right-0 top-0 w-48 h-48 rounded-full pointer-events-none"
                  style={{ background: 'rgba(255,255,255,0.12)', transform: 'translate(35%, -35%)' }}
                />
                <div
                  className="absolute right-12 bottom-0 w-28 h-28 rounded-full pointer-events-none"
                  style={{ background: 'rgba(255,255,255,0.08)', transform: 'translateY(50%)' }}
                />

                <div className="flex items-start justify-between gap-4 relative z-10">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0"
                      style={{ background: 'rgba(255,255,255,0.22)' }}
                    >
                      {ex.emoji}
                    </div>

                    <div>
                      {/* Tag */}
                      <span
                        className="inline-block text-xs font-black px-2.5 py-0.5 rounded-full mb-1.5"
                        style={{
                          background: 'rgba(255,255,255,0.22)',
                          color: dark ? '#2D2D3A' : 'white',
                        }}
                      >
                        {ex.tag}
                      </span>
                      <h3
                        className="font-fredoka font-semibold text-xl leading-tight"
                        style={{ color: dark ? '#2D2D3A' : 'white' }}
                      >
                        {ex.title}
                      </h3>
                      <p
                        className="text-sm font-semibold mt-1"
                        style={{ color: dark ? 'rgba(45,45,58,0.70)' : 'rgba(255,255,255,0.82)' }}
                      >
                        {ex.desc}
                      </p>
                    </div>
                  </div>

                  {/* Best score */}
                  {best !== null && (
                    <div
                      className="shrink-0 text-center px-3 py-2 rounded-2xl"
                      style={{ background: 'rgba(255,255,255,0.22)' }}
                    >
                      <div className="text-xl">⭐</div>
                      <div
                        className="text-xs font-black mt-0.5"
                        style={{ color: dark ? '#2D2D3A' : 'white' }}
                      >
                        {best}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex justify-end relative z-10">
                  <span
                    className="text-sm font-black flex items-center gap-1"
                    style={{ color: dark ? 'rgba(45,45,58,0.80)' : 'rgba(255,255,255,0.90)' }}
                  >
                    Jouer <span>→</span>
                  </span>
                </div>
              </div>
            </motion.button>
          )
        })}
      </motion.div>

      {/* All exercises link */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-5"
      >
        <button
          onClick={() => navigate('/exercices')}
          className="w-full bg-white rounded-2xl p-4 shadow-card flex items-center justify-between hover:shadow-card-hover transition-all"
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
              style={{ background: 'linear-gradient(135deg, rgba(124,111,247,0.12), rgba(74,63,204,0.12))' }}
            >
              ✨
            </div>
            <div>
              <p className="font-black text-ink text-sm">Tous les exercices</p>
              <p className="text-gray-400 text-xs font-semibold">4 autres exercices disponibles</p>
            </div>
          </div>
          <span className="text-primary font-black">→</span>
        </button>
      </motion.div>

      {/* PWA install prompt */}
      <AnimatePresence>
        {canInstall && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 border-2 border-primary/20 rounded-2xl p-4 flex items-center gap-4"
            style={{ background: 'rgba(124,111,247,0.06)' }}
          >
            <span className="text-2xl">📲</span>
            <div className="flex-1">
              <p className="font-black text-ink text-sm">Installer l'application</p>
              <p className="text-gray-500 text-xs font-semibold">Accès rapide, même sans connexion !</p>
            </div>
            <button
              onClick={install}
              className="text-white font-bold px-4 py-2 rounded-xl text-sm"
              style={{ background: 'linear-gradient(135deg, #7C6FF7, #4a3fcc)' }}
            >
              Installer
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Motivational footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-8 text-center text-gray-400 text-sm font-semibold"
      >
        💡 Chaque exercice complété te rend plus intelligent(e) !
      </motion.div>
    </div>
  )
}
