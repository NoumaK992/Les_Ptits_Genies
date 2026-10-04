import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { useProgressStore } from '@/store/progressStore'
import { useParcoursStore } from '@/store/parcoursStore'
import { useItemsVusStore } from '@/store/itemsVusStore'
import { useModeParcours } from '@/parcours/useModeParcours'
import { tauxReussite } from '@/parcours/regles'
import { useStopwatch } from '@/hooks/useStopwatch'
import { Bouton } from '@/components/ui/Bouton'
import { Carte, classesCarte } from '@/components/ui/Carte'
import { EnTete } from '@/components/ui/EnTete'
import { EcranFin } from '@/components/ui/EcranFin'
import { Etiquette } from '@/components/ui/Etiquette'
import { BandeLettres, LegendeCorrection } from '@/components/exercises/CoupeMots/BandeLettres'
import {
  calculerEtoiles,
  calculerScore,
  coupuresAttendues,
  corriger,
  lettresCollees,
  type Correction,
  type PhraseCoupeMots,
} from '@/components/exercises/CoupeMots/logique'

import niveau1 from '@/data/coupeMots/niveau_1.json'
import niveau2 from '@/data/coupeMots/niveau_2.json'
import niveau3 from '@/data/coupeMots/niveau_3.json'

type Niveau = 1 | 2 | 3
type Phase = 'choix' | 'jeu' | 'correction' | 'fin'

const JEU = 'coupe-mots'
const TITRE = '✂️ Coupe-Mots'

const PHRASES: Record<Niveau, PhraseCoupeMots[]> = {
  1: niveau1 as PhraseCoupeMots[],
  2: niveau2 as PhraseCoupeMots[],
  3: niveau3 as PhraseCoupeMots[],
}

const NIVEAUX: Record<Niveau, { label: string; emoji: string; desc: string; nbPhrases: number; fond: string }> = {
  1: { label: 'Débutant', emoji: '🌱', desc: 'Phrases courtes • mots faciles', nbPhrases: 10, fond: 'bg-juste' },
  2: { label: 'Intermédiaire', emoji: '🚀', desc: 'Phrases moyennes • apostrophes', nbPhrases: 9, fond: 'bg-jaune' },
  3: { label: 'Professionnel', emoji: '🏅', desc: 'Longues phrases • mots longs', nbPhrases: 8, fond: 'bg-rose-pale' },
}

interface Bilan {
  justes: number
  attendues: number
  enTrop: number
  oubliees: number
  parfaites: number
}

const BILAN_VIDE: Bilan = { justes: 0, attendues: 0, enTrop: 0, oubliees: 0, parfaites: 0 }

export default function CoupeMotsPage() {
  const stopwatch = useStopwatch()
  const { currentUser, refreshPoints } = useAuthStore()
  const { saveSession } = useProgressStore()
  const { terminerPartie } = useParcoursStore()
  const choisir = useItemsVusStore((s) => s.choisir)
  const marquer = useItemsVusStore((s) => s.marquer)
  const modeParcours = useModeParcours()
  // En parcours, le niveau est imposé (borné à 1-3).
  const niveauParcours = modeParcours ? (Math.min(Math.max(modeParcours.difficulte, 1), 3) as Niveau) : null

  // En parcours, la partie est prête dès le premier rendu : pas d'écran de choix.
  const [niveau, setNiveau] = useState<Niveau>(niveauParcours ?? 1)
  const [phase, setPhase] = useState<Phase>(niveauParcours ? 'jeu' : 'choix')
  const [phrases, setPhrases] = useState<PhraseCoupeMots[]>(() =>
    niveauParcours ? choisir(JEU, PHRASES[niveauParcours], NIVEAUX[niveauParcours].nbPhrases) : [],
  )
  const [index, setIndex] = useState(0)
  const [coupures, setCoupures] = useState<Set<number>>(() => new Set())
  const [correction, setCorrection] = useState<Correction | null>(null)
  const [bilan, setBilan] = useState<Bilan>(BILAN_VIDE)
  const [resultat, setResultat] = useState({ score: 0, etoiles: 0 as 0 | 1 | 2 | 3, taux: 0 })

  const finiRef = useRef(false)

  // Le chronomètre démarre avec la partie (démarrage idempotent : sans risque en StrictMode).
  useEffect(() => {
    if (niveauParcours) stopwatch.start()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const phrase = phrases[index] ?? null
  const lettres = useMemo(() => (phrase ? lettresCollees(phrase.mots) : []), [phrase])
  const total = phrases.length
  const progression = total === 0 ? 0 : Math.round(((index + (phase === 'correction' ? 1 : 0)) / total) * 100)

  function demarrer(n: Niveau) {
    setNiveau(n)
    setPhrases(choisir(JEU, PHRASES[n], NIVEAUX[n].nbPhrases))
    setIndex(0)
    setCoupures(new Set())
    setCorrection(null)
    setBilan(BILAN_VIDE)
    finiRef.current = false
    stopwatch.reset()
    stopwatch.start()
    setPhase('jeu')
  }

  function basculer(position: number) {
    if (phase !== 'jeu') return
    setCoupures((avant) => {
      const apres = new Set(avant)
      if (apres.has(position)) apres.delete(position)
      else apres.add(position)
      return apres
    })
  }

  function valider() {
    if (!phrase || phase !== 'jeu') return
    const c = corriger(phrase.mots, coupures)
    setCorrection(c)
    setBilan((b) => ({
      justes: b.justes + c.justes.length,
      attendues: b.attendues + coupuresAttendues(phrase.mots).length,
      enTrop: b.enTrop + c.enTrop.length,
      oubliees: b.oubliees + c.oubliees.length,
      parfaites: b.parfaites + (c.parfaite ? 1 : 0),
    }))
    setPhase('correction')
  }

  async function suivant() {
    if (phase !== 'correction') return
    if (index + 1 < total) {
      setIndex(index + 1)
      setCoupures(new Set())
      setCorrection(null)
      setPhase('jeu')
      return
    }
    stopwatch.pause()
    await terminer()
  }

  async function terminer() {
    if (!currentUser || finiRef.current) return
    finiRef.current = true
    const taux = tauxReussite(bilan.justes, bilan.attendues + bilan.enTrop)
    const score = calculerScore(taux, bilan.parfaites, niveau)
    setResultat({ score, etoiles: calculerEtoiles(taux), taux })
    const ids = phrases.map((p) => p.id)
    await saveSession(
      {
        id: `${Date.now()}-cm`,
        userId: currentUser.id,
        exerciseType: 'coupe-mots',
        score,
        duration: stopwatch.seconds,
        playedAt: new Date().toISOString(),
        details: {
          type: 'coupe-mots',
          niveau,
          bonnes: bilan.parfaites,
          total,
          items: ids,
          reussite: taux,
          extra: {
            coupuresJustes: bilan.justes,
            coupuresAttendues: bilan.attendues,
            coupuresEnTrop: bilan.enTrop,
            coupuresOubliees: bilan.oubliees,
          },
        },
      },
      { parcours: modeParcours },
    )
    await marquer(currentUser.id, JEU, ids)
    await refreshPoints()
    if (modeParcours) await terminerPartie(currentUser.id, modeParcours, taux)
    setPhase('fin')
  }

  // ── Choix du niveau (entraînement libre) ────────────────────────────────
  if (phase === 'choix') {
    return (
      <div className="mx-auto max-w-xl">
        <EnTete titre={TITRE} />
        <p className="mb-6 text-lg font-semibold text-encre-doux">
          Les mots se sont collés ! Clique entre les lettres pour les séparer.
        </p>
        <div className="space-y-3">
          {([1, 2, 3] as Niveau[]).map((n) => {
            const meta = NIVEAUX[n]
            return (
              <motion.button
                key={n}
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.02, y: -2 }}
                onClick={() => demarrer(n)}
                className={`w-full overflow-hidden text-left transition-all hover:shadow-dur-lg ${classesCarte}`}
              >
                <div className="flex items-center gap-4 p-5">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-encre text-2xl ${meta.fond}`}>
                    {meta.emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-black text-encre">{meta.label}</p>
                    <p className="text-base font-semibold text-encre-doux">{meta.desc} • {meta.nbPhrases} phrases</p>
                  </div>
                  <span aria-hidden="true" className="text-lg font-black text-encre">→</span>
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>
    )
  }

  // ── Fin de partie ───────────────────────────────────────────────────────
  if (phase === 'fin') {
    const meta = NIVEAUX[niveau]
    return (
      <EcranFin
        titre="Résultat 🎉"
        etoiles={resultat.etoiles}
        score={resultat.score}
        detail={`points · ${meta.label} ${meta.emoji}`}
        onRejouer={() => demarrer(niveau)}
        retourVers="/exercices"
        parcours={!!modeParcours}
      >
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="rounded-xl border-2 border-encre bg-sable p-3">
            <p className="text-lg font-black text-juste-fonce">{bilan.parfaites}/{total} ✓</p>
            <p className="text-base font-semibold text-encre-doux">Phrases parfaites</p>
          </div>
          <div className="rounded-xl border-2 border-encre bg-sable p-3">
            <p className="text-lg font-black tabular-nums text-encre">{stopwatch.formatted}</p>
            <p className="text-base font-semibold text-encre-doux">Durée</p>
          </div>
          <div className="rounded-xl border-2 border-encre bg-sable p-3">
            <p className="text-lg font-black text-encre">{bilan.justes}/{bilan.attendues}</p>
            <p className="text-base font-semibold text-encre-doux">Coupures justes</p>
          </div>
          <div className="rounded-xl border-2 border-encre bg-sable p-3">
            <p className="text-lg font-black text-encre">{Math.round(resultat.taux * 100)} %</p>
            <p className="text-base font-semibold text-encre-doux">Réussite</p>
          </div>
        </div>
      </EcranFin>
    )
  }

  // ── Partie en cours ─────────────────────────────────────────────────────
  if (!phrase) return null
  const avecApostrophe = phrase.mots.some((m) => m.includes("'"))

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <EnTete
        titre={TITRE}
        droite={
          <>
            <span className="rounded-full border-2 border-encre bg-papier px-3 py-1 font-bold tabular-nums text-encre">
              ⏱️ {stopwatch.formatted}
            </span>
            <span className="rounded-full border-2 border-encre bg-papier px-3 py-1 font-bold text-encre">
              {bilan.parfaites} ✓
            </span>
          </>
        }
        retourVers={modeParcours ? '/parcours' : undefined}
      />
      {modeParcours?.etape === 'boss' && <Etiquette couleur="rose-pale">👾 Boss du niveau</Etiquette>}
      <p className="text-base font-bold text-encre-doux">
        Niveau {NIVEAUX[niveau].label} · Phrase {index + 1} / {total}
      </p>

      <div className="h-3 overflow-hidden rounded-full border-2 border-encre bg-encre/10">
        <motion.div className="h-full rounded-full bg-rose" animate={{ width: `${progression}%` }} transition={{ duration: 0.4 }} />
      </div>

      {/* Consigne visuelle */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-base font-semibold text-encre-doux">
        <p>Clique entre deux lettres pour poser un trait. Reclique pour l'enlever.</p>
        {niveau >= 2 && (
          <p className={avecApostrophe ? 'text-encre' : undefined}>
            Apostrophe : coupe juste après elle →{' '}
            <span className="inline-flex items-center rounded-lg border-2 border-encre bg-papier px-2 font-texte text-xl text-encre">
              l'
              <span aria-hidden="true" className="mx-1.5 inline-block h-6 w-1.5 rounded-full bg-rose" />
              école
            </span>
          </p>
        )}
      </div>

      <Carte className="px-3 py-6 md:px-6 md:py-8">
        <BandeLettres lettres={lettres} coupures={coupures} onBasculer={basculer} correction={correction} />
      </Carte>

      {phase === 'jeu' && (
        <div className="flex flex-wrap justify-center gap-3">
          <Bouton variante="secondaire" onClick={() => setCoupures(new Set())} disabled={coupures.size === 0}>
            Tout effacer
          </Bouton>
          <Bouton taille="grand" onClick={valider}>Valider ✓</Bouton>
        </div>
      )}

      {phase === 'correction' && correction && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <LegendeCorrection />
            <div
              className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-encre p-4 text-encre ${
                correction.parfaite ? 'bg-juste' : 'bg-papier'
              }`}
            >
              <div className="min-w-0">
                <p className="text-lg font-black">
                  {correction.parfaite
                    ? '✓ Parfait, tous les mots sont bien séparés !'
                    : `${correction.justes.length} coupure${correction.justes.length > 1 ? 's' : ''} juste${correction.justes.length > 1 ? 's' : ''} sur ${coupuresAttendues(phrase.mots).length}`}
                </p>
                <p className="mt-1 font-texte text-2xl text-encre">{phrase.mots.join(' ')}</p>
              </div>
              <Bouton onClick={suivant}>{index + 1 >= total ? 'Résultats' : 'Suivant →'}</Bouton>
            </div>
          </motion.div>
        )}
    </div>
  )
}
