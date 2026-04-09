import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const exercises = [
  {
    to: '/exercices/recherche-mots',
    emoji: '🔍',
    title: 'Recherche de mots',
    desc: 'Trouve le mot dans la grille',
    gradient: 'linear-gradient(135deg, #7C6FF7 0%, #4a3fcc 100%)',
    shadow: 'rgba(124, 111, 247, 0.32)',
    tag: 'Visuel',
  },
  {
    to: '/exercices/intrus',
    emoji: '🕵️',
    title: "L'Intrus",
    desc: 'Identifie le mot unique',
    gradient: 'linear-gradient(135deg, #FF7B54 0%, #e8404a 100%)',
    shadow: 'rgba(255, 123, 84, 0.32)',
    tag: 'Attention',
  },
  {
    to: '/exercices/lecture-rapide',
    emoji: '⚡',
    title: 'Lecture rapide',
    desc: 'Lis et comprends vite',
    gradient: 'linear-gradient(135deg, #FFD166 0%, #f59e0b 100%)',
    shadow: 'rgba(255, 209, 102, 0.32)',
    tag: 'Vitesse',
    textDark: true,
  },
  {
    to: '/exercices/coup-doeil',
    emoji: '👁️',
    title: "D'un coup d'œil",
    desc: 'Scanne et catégorise les mots',
    gradient: 'linear-gradient(135deg, #06D6A0 0%, #059669 100%)',
    shadow: 'rgba(6, 214, 160, 0.32)',
    tag: 'Perception',
  },
  {
    to: '/exercices/phrases-brouillees',
    emoji: '🧩',
    title: 'Phrases brouillées',
    desc: 'Associe chaque trou à la bonne phrase',
    gradient: 'linear-gradient(135deg, #38BDF8 0%, #2563eb 100%)',
    shadow: 'rgba(56, 189, 248, 0.32)',
    tag: 'Logique',
  },
  {
    to: '/exercices/collection-mots',
    emoji: '🗂️',
    title: 'Collection de mots',
    desc: 'Trouve le terme générique',
    gradient: 'linear-gradient(135deg, #f472b6 0%, #db2777 100%)',
    shadow: 'rgba(244, 114, 182, 0.32)',
    tag: 'Vocabulaire',
  },
  {
    to: '/exercices/ami-et-ennemi',
    emoji: '🎯',
    title: 'Ami et Ennemi',
    desc: "Trouve le point commun et chasse l'intrus",
    gradient: 'linear-gradient(135deg, #a3e635 0%, #16a34a 100%)',
    shadow: 'rgba(163, 230, 53, 0.32)',
    tag: 'Analyse',
    textDark: true,
  },
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}
const item = {
  hidden: { opacity: 0, scale: 0.92, y: 12 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as number[] } },
}

export default function ExercisesPage() {
  const navigate = useNavigate()

  return (
    <div className="max-w-2xl mx-auto">
      <motion.h2
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-fredoka font-semibold text-ink mb-6"
      >
        📚 Tous les exercices
      </motion.h2>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-3"
      >
        {exercises.map((ex) => {
          const dark = ex.textDark
          return (
            <motion.button
              key={ex.to}
              variants={item}
              onClick={() => navigate(ex.to)}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="w-full text-left rounded-3xl overflow-hidden transition-all"
              style={{ boxShadow: `0 5px 20px ${ex.shadow}` }}
            >
              <div
                className="p-5 flex items-center gap-4 relative overflow-hidden"
                style={{ background: ex.gradient }}
              >
                {/* Background accent circle */}
                <div
                  className="absolute right-0 top-0 w-36 h-36 rounded-full pointer-events-none"
                  style={{ background: 'rgba(255,255,255,0.10)', transform: 'translate(35%, -35%)' }}
                />

                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                  style={{ background: 'rgba(255,255,255,0.22)' }}
                >
                  {ex.emoji}
                </div>

                {/* Text */}
                <div className="flex-1 relative z-10 text-left">
                  <span
                    className="inline-block text-xs font-black px-2 py-0.5 rounded-full mb-1"
                    style={{
                      background: 'rgba(255,255,255,0.22)',
                      color: dark ? '#2D2D3A' : 'white',
                    }}
                  >
                    {ex.tag}
                  </span>
                  <h3
                    className="font-fredoka font-semibold text-lg leading-tight"
                    style={{ color: dark ? '#2D2D3A' : 'white' }}
                  >
                    {ex.title}
                  </h3>
                  <p
                    className="text-xs font-semibold mt-0.5"
                    style={{ color: dark ? 'rgba(45,45,58,0.65)' : 'rgba(255,255,255,0.78)' }}
                  >
                    {ex.desc}
                  </p>
                </div>

                {/* Arrow */}
                <div className="relative z-10 shrink-0">
                  <span
                    className="text-lg font-black"
                    style={{ color: dark ? 'rgba(45,45,58,0.60)' : 'rgba(255,255,255,0.85)' }}
                  >
                    →
                  </span>
                </div>
              </div>
            </motion.button>
          )
        })}
      </motion.div>
    </div>
  )
}
