import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { useProgressStore } from '@/store/progressStore'
import { useParcoursStore } from '@/store/parcoursStore'
import { useModeParcours } from '@/parcours/useModeParcours'
import { tauxReussite } from '@/parcours/regles'
import { useStopwatch } from '@/hooks/useStopwatch'
import { calcCoupDoeilScore, calcCoupDoeilTimeBonus } from '@/utils/scoring'
import { getSeriesById, tirerSerie } from '@/data/coupDoeil/series'
import { ThemeHeader } from '@/components/exercises/CoupDoeil/ThemeHeader'
import { ColumnDisplay } from '@/components/exercises/CoupDoeil/ColumnDisplay'
import { CorrectionView } from '@/components/exercises/CoupDoeil/CorrectionView'
import { Bouton } from '@/components/ui/Bouton'
import { Carte, classesCarte } from '@/components/ui/Carte'
import { EnTete } from '@/components/ui/EnTete'
import { EcranFin } from '@/components/ui/EcranFin'
import { Etiquette } from '@/components/ui/Etiquette'
import type { CoupDoeilThemeKey } from '@/types'

// ── Exercise identity ──────────────────────────────────────────────────────
const EX = {
  emoji: '👁️',
  title: "D'un seul coup d'œil",
}

type Phase = 'intro' | 'series-select' | 'playing' | 'correction' | 'session-result'

const DIFFICULTY_STARS = ['★', '★★', '★★★', '★★★★']

// Les 4 niveaux proposés en jeu libre : une série de ce niveau est tirée au hasard.
const NIVEAUX = [
  { difficulte: 1, titre: 'Niveau 1', detail: 'Des mots courts' },
  { difficulte: 2, titre: 'Niveau 2', detail: 'Des groupes de mots courants' },
  { difficulte: 3, titre: 'Niveau 3', detail: 'Des groupes de mots plus longs, avec des pièges' },
  { difficulte: 4, titre: 'Niveau 4', detail: 'De longues expressions' },
]

export default function CoupDOeilPage() {
  const { currentUser, refreshPoints } = useAuthStore()
  const { saveSession } = useProgressStore()
  const stopwatch = useStopwatch()
  const { terminerPartie } = useParcoursStore()
  const modeParcours = useModeParcours()
  // En parcours, une série de la difficulté demandée est tirée une seule fois au montage.
  const [serieParcours] = useState<number | null>(() => (modeParcours ? tirerSerie(modeParcours.difficulte).id : null))

  // En parcours, ni intro ni choix de série : on démarre directement en partie.
  const [phase, setPhase] = useState<Phase>(serieParcours ? 'playing' : 'intro')
  const [seriesId, setSeriesId] = useState<number>(serieParcours ?? 1)
  const [assignments, setAssignments] = useState<Record<string, CoupDoeilThemeKey>>({})
  const [seriesScore, setSeriesScore] = useState(0)
  const [timeBonus, setTimeBonus] = useState(0)
  const [stats, setStats] = useState({ correct: 0, wrong: 0, missed: 0, falseAlarms: 0, perfect: false })

  const series = getSeriesById(seriesId)
  // Évite un double démarrage (StrictMode) et une double validation (double clic).
  const demarreRef = useRef(false)
  const valideRef = useRef(false)

  useEffect(() => {
    if (serieParcours && !demarreRef.current) {
      demarreRef.current = true
      handleSeriesSelect(serieParcours)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleSeriesSelect(id: number) {
    setSeriesId(id)
    setAssignments({})
    setSeriesScore(0)
    setTimeBonus(0)
    setStats({ correct: 0, wrong: 0, missed: 0, falseAlarms: 0, perfect: false })
    stopwatch.reset()
    valideRef.current = false
    setPhase('playing')
    setTimeout(() => stopwatch.start(), 50)
  }

  function handleAssign(wordId: string, theme: CoupDoeilThemeKey | null) {
    setAssignments((prev) => {
      const next = { ...prev }
      if (theme === null) delete next[wordId]
      else next[wordId] = theme
      return next
    })
  }

  async function handleValidate() {
    if (!series || !currentUser || valideRef.current) return
    valideRef.current = true
    stopwatch.pause()
    const allWords = series.columns.flat()
    const targets = allWords.filter((w) => w.theme !== null)
    const totalTargets = targets.length
    let correct = 0, wrong = 0, missed = 0, falseAlarms = 0
    for (const word of allWords) {
      const assigned = assignments[word.id]
      if (word.theme === null) { if (assigned !== undefined) falseAlarms++ }
      else { if (assigned === undefined) missed++; else if (assigned === word.theme) correct++; else wrong++ }
    }
    const isPerfect = wrong === 0 && missed === 0 && falseAlarms === 0 && correct === totalTargets
    const score = calcCoupDoeilScore({ correctCategorizations: correct, wrongCategorizations: wrong, missedTargets: missed, falseAlarms, totalTargets })
    const bonus = calcCoupDoeilTimeBonus(stopwatch.seconds)
    setSeriesScore(score)
    setTimeBonus(bonus)
    setStats({ correct, wrong, missed, falseAlarms, perfect: isPerfect })
    const reussite = tauxReussite(correct, totalTargets)
    await saveSession({
      id: `${Date.now()}-cd`, userId: currentUser.id, exerciseType: 'coup-doeil',
      score: score + bonus, duration: stopwatch.seconds, playedAt: new Date().toISOString(),
      details: { type: 'coup-doeil', seriesId, correctCategorizations: correct, wrongCategorizations: wrong, missedTargets: missed, falseAlarms, totalElapsedSeconds: stopwatch.seconds, reussite },
    })
    await refreshPoints()
    if (modeParcours) await terminerPartie(currentUser.id, modeParcours, reussite)
    setPhase('correction')
  }

  function feedbackMessage() {
    const allWords = series?.columns.flat() ?? []
    const totalTargets = allWords.filter((w) => w.theme !== null).length
    if (totalTargets === 0) return 'Bien joué !'
    const ratio = stats.correct / totalTargets
    if (ratio >= 0.8) return 'Excellent ! Tu as un regard de faucon !'
    if (ratio >= 0.5) return "Bravo ! Continue comme ça !"
    return "Bien essayé ! Rejoue pour t'améliorer !"
  }

  // ── Intro ─────────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <div className="max-w-lg mx-auto">
        <EnTete titre={EX.title} />
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', bounce: 0.5 }}
          className="text-center"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-24 h-24 mx-auto rounded-2xl border-2 border-encre bg-bleu shadow-dur flex items-center justify-center text-5xl mb-4"
          >
            {EX.emoji}
          </motion.div>
          <p className="text-lg text-encre-doux font-semibold mb-6">Exploite ton champ de vision !</p>
        </motion.div>

        <Carte className="p-6 mb-6 text-left space-y-4">
          {[
            { icon: '👀', text: 'Lis chaque colonne du regard, de haut en bas, le long du trait central.' },
            { icon: '🏷️', text: 'Clique sur un mot pour lui attribuer la catégorie a, b ou c.' },
            { icon: '🎯', text: 'Chaque série a 3 thèmes à identifier. Les autres mots sont des distracteurs.' },
            { icon: '⚡', text: 'Plus tu vas vite, plus tu gagnes de points de vitesse !' },
          ].map(({ icon, text }) => (
            <div key={icon} className="flex items-start gap-3">
              <span className="text-xl shrink-0">{icon}</span>
              <span className="text-base font-semibold text-encre">{text}</span>
            </div>
          ))}
        </Carte>

        <div className="text-center">
          <Bouton taille="grand" onClick={() => setPhase('series-select')}>
            C'est parti !
          </Bouton>
        </div>
      </div>
    )
  }

  // ── Series Select ─────────────────────────────────────────────────────
  if (phase === 'series-select') {
    return (
      <div className="max-w-lg mx-auto">
        <EnTete titre={`${EX.emoji} Choisis ton niveau`} />

        <div className="space-y-3">
          {NIVEAUX.map((n, i) => (
            <motion.button
              key={n.difficulte}
              type="button"
              whileTap={{ scale: 0.97 }}
              whileHover={{ scale: 1.02, y: -2 }}
              onClick={() => handleSeriesSelect(tirerSerie(n.difficulte).id)}
              className={`${classesCarte} w-full text-left p-5 hover:shadow-dur-lg transition-shadow focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-bleu`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-black text-lg text-encre">{n.titre}</span>
                <span className="text-base font-bold text-encre" aria-label={`Difficulté ${i + 1} sur 4`}>
                  {DIFFICULTY_STARS[i]}
                </span>
              </div>
              <p className="text-base font-semibold text-encre-doux">{n.detail}</p>
            </motion.button>
          ))}
        </div>
      </div>
    )
  }

  // ── Playing ─────────────────────────────────────────────────────────────
  if (phase === 'playing' && series) {
    // Pastille du chrono : le fond reprend les anciens seuils de couleur (4 min, 5 min).
    const fondChrono = stopwatch.seconds < 240 ? 'bg-papier' : stopwatch.seconds < 300 ? 'bg-jaune' : 'bg-faux'
    return (
      <div className="max-w-2xl mx-auto flex flex-col gap-4">
        <EnTete
          titre={`${EX.emoji} ${series.label}`}
          droite={
            <span className={`rounded-full border-2 border-encre px-3 py-1 font-bold text-encre tabular-nums ${fondChrono}`}>
              ⏱️ {stopwatch.formatted}
            </span>
          }
          retourVers={modeParcours ? '/parcours' : undefined}
        />

        {modeParcours?.etape === 'boss' && <Etiquette couleur="rose-pale" className="self-start">👾 Boss du niveau</Etiquette>}

        <ThemeHeader themes={series.themes} />

        <Carte className="p-4">
          <ColumnDisplay columns={series.columns} assignments={assignments} onAssign={handleAssign} mode="playing" />
        </Carte>

        <Bouton taille="grand" onClick={handleValidate} className="w-full">
          Valider mes réponses ✓
        </Bouton>
      </div>
    )
  }

  // ── Correction ─────────────────────────────────────────────────────────
  if (phase === 'correction' && series) {
    return (
      <div className="max-w-2xl mx-auto">
        <EnTete titre={`Correction : ${series.label}`} retourVers={modeParcours ? '/parcours' : undefined} />
        <ThemeHeader themes={series.themes} />
        <CorrectionView
          series={series}
          assignments={assignments}
          seriesScore={seriesScore}
          stats={stats}
          onContinue={() => setPhase('session-result')}
        />
      </div>
    )
  }

  // ── Session Result ─────────────────────────────────────────────────────
  if (phase === 'session-result') {
    const total = seriesScore + timeBonus
    return (
      <EcranFin
        titre={`🎉 ${feedbackMessage()}`}
        score={total}
        detail="points au total"
        onRejouer={() => setPhase('series-select')}
        retourVers="/accueil"
        parcours={!!modeParcours}
      >
        <div className="space-y-4">
          <div className="border-t-2 border-encre/20 pt-3 space-y-1 text-base text-encre-doux font-semibold text-center">
            <p>Score de précision : {seriesScore} pts</p>
            <p>Bonus de vitesse : <span className="text-juste-fonce font-black">+{timeBonus} pts</span></p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center">
            {[
              { label: 'Corrects', value: stats.correct, icone: '✓', couleur: 'text-juste-fonce' },
              { label: 'Manqués', value: stats.missed, icone: '◌', couleur: 'text-encre' },
              { label: 'Erreurs', value: stats.wrong + stats.falseAlarms, icone: '✗', couleur: 'text-faux-fonce' },
              { label: 'Temps', value: stopwatch.formatted, icone: '⏱️', couleur: 'text-encre' },
            ].map(({ label, value, icone, couleur }) => (
              <div key={label} className="rounded-xl border-2 border-encre bg-sable p-3">
                <div className={`font-black text-lg ${couleur}`}>
                  <span className="mr-1">{icone}</span>
                  {value}
                </div>
                <div className="text-base text-encre-doux font-semibold">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </EcranFin>
    )
  }

  return null
}
