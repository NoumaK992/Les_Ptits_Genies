import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useProgressStore } from '@/store/progressStore'
import { calcStreak } from '@/utils/streak'
import type { ExerciseType } from '@/types'
import { Bouton } from '@/components/ui/Bouton'
import { Carte, classesCarte } from '@/components/ui/Carte'
import { Etiquette } from '@/components/ui/Etiquette'
import { useParcoursStore } from '@/store/parcoursStore'
import { NOMS_JEUX, dateDuJour, estTermine, estVerrouille, jeuDuNiveau } from '@/parcours/regles'

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
  { type: 'ami-ennemi', emoji: '🎯', title: 'Ami et Ennemi', to: '/exercices/ami-et-ennemi' },
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
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
}

export default function HomePage() {
  const { currentUser } = useAuthStore()
  const { progress, sessions, loadProgress } = useProgressStore()
  const navigate = useNavigate()
  const parcours = useParcoursStore()

  useEffect(() => {
    if (currentUser) {
      loadProgress(currentUser.id)
      // Comme sur la page parcours : ne pas recharger un état déjà en mémoire (message d'erreur conservé).
      if (!parcours.charge || parcours.userId !== currentUser.id) parcours.charger(currentUser.id)
    }
  }, [currentUser?.id])

  const etatParcours = parcours.userId === currentUser?.id ? parcours.etat : null

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
    <div className="mx-auto max-w-2xl text-encre">
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">

        {/* Barre supérieure */}
        <motion.div variants={item} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <span className="font-titre text-xl text-encre sm:text-2xl">
            Salut, {currentUser?.username} 👋
          </span>
          <span className="text-base capitalize text-encre-doux">
            {today}
          </span>
        </motion.div>

        {/* Mon parcours : le point d'entrée principal des séances */}
        <motion.div variants={item}>
          <Carte className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
            <div className="min-w-0">
              <Etiquette couleur="bleu">🗺️ Mon parcours</Etiquette>
              {etatParcours && !estTermine(etatParcours) ? (
                <>
                  <p className="mt-3 font-titre text-2xl text-encre">Niveau {etatParcours.niveau}</p>
                  <p className="text-lg text-encre-doux">
                    {estVerrouille(etatParcours, dateDuJour())
                      ? `🔒 S'ouvre à ta prochaine séance`
                      : etatParcours.etape === 'boss'
                        ? `Boss du niveau ${etatParcours.niveau} 👾`
                        : etatParcours.etape === 'lecture'
                          ? '⚡ Lecture de fin de niveau'
                          : `Aujourd'hui : ${NOMS_JEUX[jeuDuNiveau(etatParcours.place, etatParcours.niveau)]}`}
                  </p>
                </>
              ) : etatParcours ? (
                <p className="mt-3 font-titre text-2xl text-encre">Parcours terminé 🏆</p>
              ) : (
                <p className="mt-3 font-titre text-2xl text-encre">Commence ton parcours</p>
              )}
            </div>
            <Bouton taille="grand" onClick={() => navigate('/parcours')}>
              {etatParcours ? 'Continuer ▶' : 'Commencer ▶'}
            </Bouton>
          </Carte>
        </motion.div>

        {/* Ligne de stats */}
        <motion.div variants={item} className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="rounded-2xl border-2 border-encre bg-jaune p-2 text-center shadow-dur-sm sm:p-4">
            <div className="font-titre text-2xl text-encre">
              {currentUser?.totalPoints ?? 0}
            </div>
            <div className="mt-0.5 break-words text-base font-semibold text-encre">
              ⭐ points
            </div>
          </div>

          <div className="rounded-2xl border-2 border-encre bg-rose-pale p-2 text-center shadow-dur-sm sm:p-4">
            <div className="font-titre text-2xl text-encre">
              {streak}
            </div>
            <div className="mt-0.5 break-words text-base font-semibold text-encre">
              🔥 jours
            </div>
          </div>

          <div className="rounded-2xl border-2 border-encre bg-bleu p-2 text-center shadow-dur-sm sm:p-4">
            <div className="font-titre text-2xl text-encre">
              {progress.length}/{ALL_EXERCISES.length}
            </div>
            <div className="mt-0.5 break-words text-base font-semibold text-encre">
              📚 exercices
            </div>
          </div>
        </motion.div>

        {/* Défi du jour */}
        <motion.div
          variants={item}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className={`${classesCarte} cursor-pointer p-5`}
          onClick={() => navigate(challenge.to)}
        >
          <Etiquette>✦ Défi du jour</Etiquette>
          <h2 className="mb-1 mt-4 font-titre text-2xl leading-tight text-encre">
            {challenge.emoji} {challenge.title}
          </h2>
          <p className="mb-4 text-base text-encre-doux">
            {challengeMsg}
          </p>
          <Bouton className="w-full">
            ▶ Jouer
          </Bouton>
        </motion.div>

        {/* Bas de page : dernière session + voir tous les exercices */}
        <motion.div variants={item} className="flex gap-3">
          {lastSession && lastExercise ? (
            <Carte className="flex-1 p-3 shadow-dur-sm">
              <p className="mb-1 text-base font-bold text-encre-doux">
                Récent
              </p>
              <p className="text-base font-semibold text-encre">
                {lastExercise.emoji} {lastExercise.title}
              </p>
              <p className="mt-0.5 text-base font-bold text-juste-fonce">
                +{lastSession.score} pts
              </p>
              <p className="mt-0.5 text-base text-encre-doux">
                {getRelativeDate(lastSession.playedAt)}
              </p>
            </Carte>
          ) : (
            <Carte className="flex-1 p-3 shadow-dur-sm">
              <p className="text-base text-encre-doux">
                Aucune session encore — c'est parti ! 🌱
              </p>
            </Carte>
          )}

          <Bouton
            variante="secondaire"
            onClick={() => navigate('/exercices')}
            className="h-auto flex-1 flex-col p-3 text-center"
          >
            <span>📚 Voir tous<br />les exercices →</span>
          </Bouton>
        </motion.div>

      </motion.div>
    </div>
  )
}
