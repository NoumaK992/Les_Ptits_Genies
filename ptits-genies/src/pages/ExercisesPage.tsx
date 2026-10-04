import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Carte, classesCarte } from '@/components/ui/Carte'

const exercises = [
  {
    to: '/exercices/recherche-mots',
    emoji: '🔍',
    title: 'Recherche de mots',
    desc: 'Trouve le mot dans la grille',
    tag: 'Visuel',
  },
  {
    to: '/exercices/intrus',
    emoji: '🕵️',
    title: "L'Intrus",
    desc: 'Identifie le mot unique',
    tag: 'Attention',
  },
  {
    to: '/exercices/lecture-rapide',
    emoji: '⚡',
    title: 'Lecture rapide',
    desc: 'Lis et comprends vite',
    tag: 'Vitesse',
  },
  {
    to: '/exercices/coup-doeil',
    emoji: '👁️',
    title: "D'un coup d'œil",
    desc: 'Scanne et catégorise les mots',
    tag: 'Perception',
  },
  {
    to: '/exercices/phrases-brouillees',
    emoji: '🧩',
    title: 'Phrases brouillées',
    desc: 'Associe chaque trou à la bonne phrase',
    tag: 'Logique',
  },
  {
    to: '/exercices/collection-mots',
    emoji: '🗂️',
    title: 'Collection de mots',
    desc: 'Trouve le terme générique',
    tag: 'Vocabulaire',
  },
  {
    to: '/exercices/ami-et-ennemi',
    emoji: '🎯',
    title: 'Ami et Ennemi',
    desc: "Trouve le point commun et chasse l'intrus",
    tag: 'Analyse',
  },
  {
    to: '/exercices/vrai-ou-absurde',
    emoji: '⚖️',
    title: "Vrai ou Absurde ?",
    desc: "Dis si la phrase a du sens",
    tag: 'Compréhension',
  },
  {
    to: '/exercices/forgeron',
    emoji: '🔨',
    title: "Le Forgeron de mots",
    desc: "Coupe et reconstruis les mots en syllabes",
    tag: 'Décodage',
  },
  {
    to: '/exercices/labyrinthe',
    emoji: '🧭',
    title: "Le Labyrinthe",
    desc: "Choisis le bon mot à chaque carrefour",
    tag: 'Lecture suivie',
  },
  {
    to: '/exercices/coupe-mots',
    emoji: '✂️',
    title: "Coupe-Mots",
    desc: "Sépare les mots collés",
    tag: 'Décodage',
  },
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}
const item = {
  hidden: { opacity: 0, scale: 0.92, y: 12 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
}

// Pastille d'emoji : couleur alternée selon la position de l'exercice.
const FONDS_PASTILLE = ['bg-jaune', 'bg-rose-pale', 'bg-bleu']

export default function ExercisesPage() {
  const navigate = useNavigate()

  return (
    <div className="mx-auto max-w-2xl text-encre">
      <motion.h2
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 font-titre text-3xl leading-tight text-encre"
      >
        📚 Tous les exercices
      </motion.h2>

      {/* Rappel des règles de points de l'entraînement libre (le parcours rapporte bien plus). */}
      <Carte className="mb-6 flex items-start gap-3 bg-jaune p-4">
        <span aria-hidden="true" className="shrink-0 text-2xl">🎯</span>
        <p className="text-base font-semibold leading-relaxed text-encre">
          <span className="font-titre">Entraînement libre</span> : tu gagnes des points, mais beaucoup moins qu'en parcours.
          Le même jeu ne rapporte plus rien après 2 parties dans la journée.
        </p>
      </Carte>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-4"
      >
        {exercises.map((ex, index) => (
          // L'animation d'entrée reste sur ce conteneur : framer-motion pose un
          // `transform` en ligne qui écraserait le décalage au survol du bouton.
          <motion.div key={ex.to} variants={item}>
            <button
              type="button"
              onClick={() => navigate(ex.to)}
              className={`${classesCarte} flex w-full items-center gap-4 p-4 text-left transition hover:-translate-y-0.5 hover:shadow-dur-lg active:translate-y-0.5 active:shadow-dur-sm focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-bleu sm:p-5`}
            >
              {/* Pastille d'emoji */}
              <div
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border-2 border-encre text-3xl ${FONDS_PASTILLE[index % FONDS_PASTILLE.length]}`}
              >
                {ex.emoji}
              </div>

              {/* Texte */}
              <div className="min-w-0 flex-1">
                <span className="mb-0.5 block text-base font-bold uppercase tracking-wide text-encre-doux">
                  {ex.tag}
                </span>
                <h3 className="font-titre text-lg leading-tight text-encre sm:text-xl">
                  {ex.title}
                </h3>
                <p className="mt-1 text-base text-encre-doux">
                  {ex.desc}
                </p>
              </div>

              {/* Flèche */}
              <span aria-hidden="true" className="shrink-0 font-titre text-2xl text-encre">
                →
              </span>
            </button>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
