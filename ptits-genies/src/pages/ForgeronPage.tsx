import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
import { cn } from '@/lib/cn'
import { CiseauxEntreLettres } from '@/components/exercises/Forgeron/CiseauxEntreLettres'
import { Forge } from '@/components/exercises/Forgeron/Forge'
import {
  MOTS_PAR_PARTIE, decoupeJuste, decouper, etoilesForgeron, forgeJuste, positionsAttendues, scoreForgeron, tuilesDe,
  type MotForgeron, type NiveauForgeron, type Tuile,
} from '@/components/exercises/Forgeron/logique'

import niveau1 from '@/data/forgeron/niveau_1.json'
import niveau2 from '@/data/forgeron/niveau_2.json'
import niveau3 from '@/data/forgeron/niveau_3.json'

const TITRE = '🔨 Le Forgeron de mots'
const JEU = 'forgeron'

const POOLS: Record<NiveauForgeron, MotForgeron[]> = {
  1: niveau1 as MotForgeron[],
  2: niveau2 as MotForgeron[],
  3: niveau3 as MotForgeron[],
}

const NIVEAUX: Record<NiveauForgeron, { label: string; emoji: string; desc: string; fond: string }> = {
  1: { label: 'Apprenti', emoji: '🌱', desc: 'Mots de 2 ou 3 syllabes, sons simples', fond: 'bg-juste' },
  2: { label: 'Compagnon', emoji: '🚀', desc: 'Sons complexes : ou, ain, eau, gn, tr…', fond: 'bg-jaune' },
  3: { label: 'Maître forgeron', emoji: '🏅', desc: 'Longs mots de 4 à 6 syllabes', fond: 'bg-rose-pale' },
}

type Phase = 'choix' | 'decoupe' | 'decoupe-correction' | 'forge' | 'forge-correction' | 'fin'

interface ResultatMot {
  id: string
  mot: string
  syllabes: string[]
  decoupe: boolean
  forge: boolean
  /** Syllabes posées par l'élève lors de la forge (pour le suivi des confusions). */
  forgeEleve: string[]
  leurresChoisis: string[]
}

interface Partie {
  niveau: NiveauForgeron
  mots: MotForgeron[]
}

function nouvellePartie(niveau: NiveauForgeron): Partie {
  const mots = useItemsVusStore.getState().choisir(JEU, POOLS[niveau], MOTS_PAR_PARTIE[niveau])
  return { niveau, mots }
}

export default function ForgeronPage() {
  const stopwatch = useStopwatch()
  const { currentUser, refreshPoints } = useAuthStore()
  const { saveSession } = useProgressStore()
  const { terminerPartie } = useParcoursStore()
  const marquer = useItemsVusStore((s) => s.marquer)
  const modeParcours = useModeParcours()
  const niveauParcours = modeParcours ? (Math.min(Math.max(modeParcours.difficulte, 1), 3) as NiveauForgeron) : null

  // En parcours : pas d'écran de choix, la partie est prête dès le premier rendu (robuste au double rendu de StrictMode).
  const [partie, setPartie] = useState<Partie | null>(() => (niveauParcours ? nouvellePartie(niveauParcours) : null))
  const [phase, setPhase] = useState<Phase>(niveauParcours ? 'decoupe' : 'choix')
  const [index, setIndex] = useState(0)
  const [coupures, setCoupures] = useState<number[]>([])
  const [tuiles, setTuiles] = useState<Tuile[]>(() => (partie?.mots[0] ? tuilesDe(partie.mots[0]) : []))
  const [posees, setPosees] = useState<string[]>([])
  const [resultats, setResultats] = useState<ResultatMot[]>([])
  const [bilan, setBilan] = useState({ score: 0, taux: 0 })
  const finiRef = useRef(false)

  useEffect(() => {
    if (niveauParcours) {
      stopwatch.reset()
      stopwatch.start()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const mot = partie?.mots[index] ?? null
  const total = partie?.mots.length ?? 0
  const resultatCourant = resultats[index]

  function demarrer(niveau: NiveauForgeron) {
    const p = nouvellePartie(niveau)
    setPartie(p)
    setIndex(0)
    setCoupures([])
    setTuiles(p.mots[0] ? tuilesDe(p.mots[0]) : [])
    setPosees([])
    setResultats([])
    finiRef.current = false
    stopwatch.reset()
    stopwatch.start()
    setPhase('decoupe')
  }

  function basculer(position: number) {
    setCoupures((c) => (c.includes(position) ? c.filter((x) => x !== position) : [...c, position]))
  }

  function validerDecoupe() {
    if (!mot) return
    const juste = decoupeJuste(coupures, mot.syllabes)
    setResultats((r) => [
      ...r.slice(0, index),
      { id: mot.id, mot: mot.mot, syllabes: mot.syllabes, decoupe: juste, forge: false, forgeEleve: [], leurresChoisis: [] },
    ])
    setPhase('decoupe-correction')
  }

  function allerALaForge() {
    setPosees([])
    setPhase('forge')
  }

  function validerForge() {
    if (!mot) return
    const parCle = new Map(tuiles.map((t) => [t.cle, t]))
    const choisies = posees.map((c) => parCle.get(c)!).filter(Boolean)
    const textes = choisies.map((t) => t.texte)
    const juste = forgeJuste(textes, mot.syllabes)
    setResultats((r) =>
      r.map((x, k) => (k === index ? { ...x, forge: juste, forgeEleve: textes, leurresChoisis: choisies.filter((t) => t.leurre).map((t) => t.texte) } : x)),
    )
    setPhase('forge-correction')
  }

  async function suivant() {
    if (!partie) return
    const n = index + 1
    if (n < total) {
      setIndex(n)
      setCoupures([])
      setPosees([])
      setTuiles(tuilesDe(partie.mots[n]))
      setPhase('decoupe')
      return
    }
    stopwatch.pause()
    await terminer()
  }

  async function terminer() {
    if (!currentUser || !partie || finiRef.current) return
    finiRef.current = true
    const decoupesJustes = resultats.filter((r) => r.decoupe).length
    const forgesJustes = resultats.filter((r) => r.forge).length
    const bonnes = decoupesJustes + forgesJustes
    const totalPoints = 2 * partie.mots.length
    const taux = tauxReussite(bonnes, totalPoints)
    const score = scoreForgeron(bonnes, partie.niveau)
    const items = partie.mots.map((m) => m.id)
    setBilan({ score, taux })
    await saveSession(
      {
        id: `${Date.now()}-fo`,
        userId: currentUser.id,
        exerciseType: 'forgeron',
        score,
        duration: stopwatch.seconds,
        playedAt: new Date().toISOString(),
        details: {
          type: 'forgeron',
          niveau: partie.niveau,
          bonnes,
          total: totalPoints,
          items,
          reussite: taux,
          extra: {
            mots: partie.mots.length,
            decoupesJustes,
            forgesJustes,
            leurresChoisis: resultats.flatMap((r) => r.leurresChoisis),
            decoupesRatees: resultats.filter((r) => !r.decoupe).map((r) => r.id),
            forgesRatees: resultats.filter((r) => !r.forge).map((r) => ({ id: r.id, eleve: r.forgeEleve.join('-') })),
          },
        },
      },
      { parcours: !!modeParcours },
    )
    await marquer(currentUser.id, JEU, items)
    await refreshPoints()
    if (modeParcours) await terminerPartie(currentUser.id, modeParcours, taux)
    setPhase('fin')
  }

  // ── Choix du niveau (entraînement libre) ───────────────────────────────
  if (phase === 'choix' || !partie) {
    return (
      <div className="mx-auto max-w-xl">
        <EnTete titre={TITRE} />
        <p className="mb-6 text-lg font-semibold text-encre-doux">
          Coupe les mots en syllabes, puis reforge-les avec les bonnes syllabes.
        </p>
        <div className="space-y-3">
          {([1, 2, 3] as NiveauForgeron[]).map((niveau) => {
            const meta = NIVEAUX[niveau]
            return (
              <motion.button
                key={niveau}
                type="button"
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.02, y: -2 }}
                onClick={() => demarrer(niveau)}
                className={cn('w-full overflow-hidden text-left transition-all hover:shadow-dur-lg', classesCarte)}
              >
                <div className="flex items-center gap-4 p-5">
                  <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-encre text-2xl', meta.fond)}>
                    {meta.emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-black text-encre">Niveau {niveau} · {meta.label}</p>
                    <p className="text-base font-semibold text-encre-doux">{meta.desc} • {MOTS_PAR_PARTIE[niveau]} mots</p>
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

  // ── Fin de partie ──────────────────────────────────────────────────────
  if (phase === 'fin') {
    const decoupesJustes = resultats.filter((r) => r.decoupe).length
    const forgesJustes = resultats.filter((r) => r.forge).length
    const rates = resultats.filter((r) => !r.decoupe || !r.forge)
    const meta = NIVEAUX[partie.niveau]
    return (
      <EcranFin
        titre="La forge est froide ! 🔨"
        etoiles={etoilesForgeron(bilan.taux)}
        score={bilan.score}
        detail={`points · ${meta.label} ${meta.emoji} · ${Math.round(bilan.taux * 100)} % de réussite`}
        onRejouer={() => demarrer(partie.niveau)}
        retourVers="/exercices"
        parcours={!!modeParcours}
      >
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="rounded-xl border-2 border-encre bg-sable p-3">
            <p className="text-lg font-black text-juste-fonce">{decoupesJustes}/{total} ✂️</p>
            <p className="text-base font-semibold text-encre-doux">Mots bien coupés</p>
          </div>
          <div className="rounded-xl border-2 border-encre bg-sable p-3">
            <p className="text-lg font-black text-juste-fonce">{forgesJustes}/{total} 🔨</p>
            <p className="text-base font-semibold text-encre-doux">Mots bien forgés</p>
          </div>
          <div className="col-span-2 rounded-xl border-2 border-encre bg-sable p-3">
            <p className="text-lg font-black tabular-nums text-encre">{stopwatch.formatted}</p>
            <p className="text-base font-semibold text-encre-doux">Durée</p>
          </div>
        </div>
        {rates.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 font-bold text-encre">À revoir :</p>
            <ul className="flex flex-wrap gap-2">
              {rates.map((r) => (
                <li key={r.id} className="rounded-xl border-2 border-encre bg-papier px-3 py-1 font-texte text-lg font-semibold tracking-wider text-encre">
                  {r.syllabes.join(' - ')}
                </li>
              ))}
            </ul>
          </div>
        )}
      </EcranFin>
    )
  }

  if (!mot) return null
  const enDecoupe = phase === 'decoupe' || phase === 'decoupe-correction'
  const attendues = positionsAttendues(mot.syllabes)

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <EnTete
        titre={TITRE}
        droite={
          <>
            <span className="rounded-full border-2 border-encre bg-papier px-3 py-1 font-bold tabular-nums text-encre">⏱️ {stopwatch.formatted}</span>
            <span className="rounded-full border-2 border-encre bg-papier px-3 py-1 font-bold text-encre">Mot {index + 1} / {total}</span>
          </>
        }
        retourVers={modeParcours ? '/parcours' : undefined}
      />
      {modeParcours?.etape === 'boss' && <Etiquette couleur="rose-pale">👾 Boss du niveau</Etiquette>}

      <div className="h-3 overflow-hidden rounded-full border-2 border-encre bg-encre/10">
        <motion.div
          className="h-full rounded-full bg-rose"
          animate={{ width: `${Math.round(((index + (phase === 'forge-correction' ? 1 : phase === 'decoupe' ? 0 : 0.5)) / total) * 100)}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      <Carte className="px-2 py-5 sm:px-5 md:p-8">
        <p className="mb-6 text-center text-lg font-bold text-encre">
          {enDecoupe ? '✂️ Étape 1 : coupe le mot en syllabes en cliquant entre les lettres.' : '🔨 Étape 2 : le mot a disparu ! Reforge-le en cliquant les syllabes dans l\'ordre.'}
        </p>

        {enDecoupe ? (
          <div className="pb-6 pt-4">
            <CiseauxEntreLettres
              mot={mot.mot}
              coupures={coupures}
              onBasculer={basculer}
              correction={phase === 'decoupe-correction' ? attendues : undefined}
            />
          </div>
        ) : (
          <Forge
            tuiles={tuiles}
            posees={posees}
            onPoser={(cle) => setPosees((p) => [...p, cle])}
            onRetirer={() => setPosees((p) => p.slice(0, -1))}
            correction={phase === 'forge-correction' ? mot.syllabes : undefined}
          />
        )}

        {phase === 'decoupe' && (
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Bouton variante="secondaire" onClick={() => setCoupures([])} disabled={coupures.length === 0}>Tout effacer</Bouton>
            <Bouton onClick={validerDecoupe} disabled={coupures.length === 0}>Valider ma découpe ✓</Bouton>
          </div>
        )}
        {phase === 'forge' && (
          <div className="mt-6 flex justify-center">
            <Bouton onClick={validerForge} disabled={posees.length === 0}>Valider mon mot ✓</Bouton>
          </div>
        )}
      </Carte>

      <AnimatePresence>
        {phase === 'decoupe-correction' && resultatCourant && (
          <motion.div
            key="corr-decoupe"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={cn('flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-encre p-4 text-encre', resultatCourant.decoupe ? 'bg-juste' : 'bg-faux')}
          >
            <div>
              <p className="text-lg font-black">{resultatCourant.decoupe ? '✓ Bien coupé !' : '✗ Pas tout à fait.'}</p>
              {!resultatCourant.decoupe && (
                <p className="text-base font-semibold">
                  Tu as coupé : <span className="font-black tracking-wider">{decouper(mot.mot, coupures).join(' - ')}</span>
                  <br />
                  Il fallait : <span className="font-black tracking-wider">{mot.syllabes.join(' - ')}</span>
                </p>
              )}
            </div>
            <Bouton onClick={allerALaForge}>Forger le mot 🔨</Bouton>
          </motion.div>
        )}
        {phase === 'forge-correction' && resultatCourant && (
          <motion.div
            key="corr-forge"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={cn('flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-encre p-4 text-encre', resultatCourant.forge ? 'bg-juste' : 'bg-faux')}
          >
            <div>
              <p className="text-lg font-black">{resultatCourant.forge ? '✓ Mot bien forgé !' : '✗ Ce n\'est pas le bon mot.'}</p>
              <p className="mt-1 flex flex-wrap items-center gap-1 text-base font-semibold">
                <span>Le mot :</span>
                {mot.syllabes.map((s, k) => (
                  <span key={k} className={cn('rounded-lg border-2 border-encre px-2 font-texte text-xl font-bold tracking-widest', k % 2 === 0 ? 'bg-jaune' : 'bg-bleu')}>
                    {s}
                  </span>
                ))}
                <span aria-hidden="true">→</span>
                <span className="font-texte text-xl font-black tracking-widest">{mot.mot}</span>
              </p>
            </div>
            <Bouton onClick={suivant}>{index + 1 >= total ? 'Résultats' : 'Mot suivant →'}</Bouton>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
