import { useEffect, useRef, useState } from 'react'
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
import { cn } from '@/lib/cn'
import { CiseauxEntreLettres } from '@/components/exercises/Forgeron/CiseauxEntreLettres'
import { decouper } from '@/components/exercises/Forgeron/logique'
import { GrilleFamille } from '@/components/exercises/Racines/GrilleFamille'
import { AssociationSens } from '@/components/exercises/Racines/AssociationSens'
import {
  DECOUPES_PAR_PARTIE, FAMILLES_PAR_PARTIE, corrigerFamille, coupuresAttendues, etiquettesDe, etoilesRacines, grilleDe,
  morceauxBienCoupes, scoreRacines, sensJustes,
  type CorrectionFamille, type DecoupeRacine, type FamilleRacine, type NiveauRacines,
} from '@/components/exercises/Racines/logique'

import familles1 from '@/data/racines/familles_niveau_1.json'
import familles2 from '@/data/racines/familles_niveau_2.json'
import familles3 from '@/data/racines/familles_niveau_3.json'
import decoupes1 from '@/data/racines/decoupes_niveau_1.json'
import decoupes2 from '@/data/racines/decoupes_niveau_2.json'
import decoupes3 from '@/data/racines/decoupes_niveau_3.json'

const TITRE = '🌳 Les Racines'
const JEU = 'racines'

const FAMILLES: Record<NiveauRacines, FamilleRacine[]> = {
  1: familles1 as unknown as FamilleRacine[],
  2: familles2 as unknown as FamilleRacine[],
  3: familles3 as unknown as FamilleRacine[],
}
const DECOUPES: Record<NiveauRacines, DecoupeRacine[]> = {
  1: decoupes1 as DecoupeRacine[],
  2: decoupes2 as DecoupeRacine[],
  3: decoupes3 as DecoupeRacine[],
}

const NIVEAUX: Record<NiveauRacines, { label: string; emoji: string; desc: string; fond: string }> = {
  1: { label: 'Graine', emoji: '🌱', desc: 'Familles faciles • re-, dé-, in-, -eur, -able', fond: 'bg-juste' },
  2: { label: 'Pousse', emoji: '🌿', desc: 'Racines qui changent (mer, marin) • suffixes variés', fond: 'bg-jaune' },
  3: { label: 'Grand arbre', emoji: '🌳', desc: 'Racines savantes (aqua, géo, -logie) • 3 morceaux', fond: 'bg-rose-pale' },
}

type Phase = 'choix' | 'famille' | 'famille-correction' | 'intermede' | 'coupe' | 'coupe-correction' | 'sens' | 'sens-correction' | 'fin'

interface Partie {
  niveau: NiveauRacines
  familles: FamilleRacine[]
  decoupes: DecoupeRacine[]
}

interface ResultatFamille {
  id: string
  racine: string
  correction: CorrectionFamille
}

interface ResultatDecoupe {
  id: string
  mot: string
  morceaux: string[]
  coupes: number
  sens: number
}

function nouvellePartie(niveau: NiveauRacines): Partie {
  const { choisir } = useItemsVusStore.getState()
  return {
    niveau,
    familles: choisir(JEU, FAMILLES[niveau], FAMILLES_PAR_PARTIE),
    decoupes: choisir(JEU, DECOUPES[niveau], DECOUPES_PAR_PARTIE),
  }
}

export default function RacinesPage() {
  const stopwatch = useStopwatch()
  const { currentUser, refreshPoints } = useAuthStore()
  const { saveSession } = useProgressStore()
  const { terminerPartie } = useParcoursStore()
  const marquer = useItemsVusStore((s) => s.marquer)
  const modeParcours = useModeParcours()
  const niveauParcours = modeParcours ? (Math.min(Math.max(modeParcours.difficulte, 1), 3) as NiveauRacines) : null

  // En parcours : pas d'écran de choix, la partie est prête dès le premier rendu (robuste au double rendu de StrictMode).
  const [partie, setPartie] = useState<Partie | null>(() => (niveauParcours ? nouvellePartie(niveauParcours) : null))
  const [phase, setPhase] = useState<Phase>(niveauParcours ? 'famille' : 'choix')
  const [index, setIndex] = useState(0)
  const [grille, setGrille] = useState<string[]>(() => (partie?.familles[0] ? grilleDe(partie.familles[0]) : []))
  const [selection, setSelection] = useState<string[]>([])
  const [coupures, setCoupures] = useState<number[]>([])
  const [etiquettes, setEtiquettes] = useState<string[]>([])
  const [choix, setChoix] = useState<(string | null)[]>([])
  const [actif, setActif] = useState(0)
  const [resFamilles, setResFamilles] = useState<ResultatFamille[]>([])
  const [resDecoupes, setResDecoupes] = useState<ResultatDecoupe[]>([])
  const [bilan, setBilan] = useState({ score: 0, taux: 0 })
  const finiRef = useRef(false)

  useEffect(() => {
    if (niveauParcours) {
      stopwatch.reset()
      stopwatch.start()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function demarrer(niveau: NiveauRacines) {
    const p = nouvellePartie(niveau)
    setPartie(p)
    setIndex(0)
    setGrille(p.familles[0] ? grilleDe(p.familles[0]) : [])
    setSelection([])
    setCoupures([])
    setResFamilles([])
    setResDecoupes([])
    finiRef.current = false
    stopwatch.reset()
    stopwatch.start()
    setPhase('famille')
  }

  // ── Manche « Famille » ──────────────────────────────────────────────────
  function basculerMot(mot: string) {
    if (phase !== 'famille') return
    setSelection((s) => (s.includes(mot) ? s.filter((x) => x !== mot) : [...s, mot]))
  }

  function validerFamille() {
    const famille = partie?.familles[index]
    if (!famille || phase !== 'famille') return
    setResFamilles((r) => [...r.slice(0, index), { id: famille.id, racine: famille.racine, correction: corrigerFamille(famille, selection) }])
    setPhase('famille-correction')
  }

  function familleSuivante() {
    if (!partie) return
    const n = index + 1
    setSelection([])
    if (n < partie.familles.length) {
      setIndex(n)
      setGrille(grilleDe(partie.familles[n]))
      setPhase('famille')
      return
    }
    setIndex(0)
    setCoupures([])
    setPhase('intermede')
  }

  // ── Manche « Découpe » ──────────────────────────────────────────────────
  function basculerCoupure(position: number) {
    if (phase !== 'coupe') return
    setCoupures((c) => (c.includes(position) ? c.filter((x) => x !== position) : [...c, position]))
  }

  function validerCoupe() {
    const decoupe = partie?.decoupes[index]
    if (!decoupe || phase !== 'coupe') return
    setResDecoupes((r) => [
      ...r.slice(0, index),
      { id: decoupe.id, mot: decoupe.mot, morceaux: decoupe.morceaux, coupes: morceauxBienCoupes(coupures, decoupe.morceaux), sens: 0 },
    ])
    setPhase('coupe-correction')
  }

  function allerAuxSens() {
    const decoupe = partie?.decoupes[index]
    if (!decoupe) return
    setEtiquettes(etiquettesDe(decoupe))
    setChoix(decoupe.morceaux.map(() => null))
    setActif(0)
    setPhase('sens')
  }

  function choisirEtiquette(etiquette: string) {
    if (phase !== 'sens') return
    const suivant = choix.map((c, k) => (k === actif ? etiquette : c === etiquette ? null : c))
    setChoix(suivant)
    const libre = suivant.findIndex((c, k) => c === null && k !== actif)
    if (libre >= 0) setActif(libre)
  }

  function validerSens() {
    const decoupe = partie?.decoupes[index]
    if (!decoupe || phase !== 'sens') return
    const justes = sensJustes(decoupe, choix)
    setResDecoupes((r) => r.map((x, k) => (k === index ? { ...x, sens: justes } : x)))
    setPhase('sens-correction')
  }

  async function decoupeSuivante() {
    if (!partie) return
    const n = index + 1
    if (n < partie.decoupes.length) {
      setIndex(n)
      setCoupures([])
      setPhase('coupe')
      return
    }
    stopwatch.pause()
    await terminer()
  }

  // ── Fin de partie (une seule fois) ──────────────────────────────────────
  async function terminer() {
    if (!partie || finiRef.current) return
    finiRef.current = true
    try {
      const membres = resFamilles.reduce((n, r) => n + r.correction.trouves.length + r.correction.oublies.length, 0)
      const membresTrouves = resFamilles.reduce((n, r) => n + r.correction.trouves.length, 0)
      const intrus = resFamilles.reduce((n, r) => n + r.correction.intrusCliques.length + r.correction.intrusEvites.length, 0)
      const intrusEvites = resFamilles.reduce((n, r) => n + r.correction.intrusEvites.length, 0)
      const morceauxTotal = resDecoupes.reduce((n, r) => n + r.morceaux.length, 0)
      const morceauxCoupes = resDecoupes.reduce((n, r) => n + r.coupes, 0)
      const morceauxSens = resDecoupes.reduce((n, r) => n + r.sens, 0)
      const bonnes = membresTrouves + intrusEvites + morceauxCoupes + morceauxSens
      const total = membres + intrus + 2 * morceauxTotal
      const taux = tauxReussite(bonnes, total)
      const score = scoreRacines(bonnes, partie.niveau)
      const items = [...partie.familles.map((f) => f.id), ...partie.decoupes.map((d) => d.id)]
      setBilan({ score, taux })
      if (!currentUser) return
      await saveSession(
        {
          id: `${Date.now()}-ra`,
          userId: currentUser.id,
          exerciseType: 'racines',
          score,
          duration: stopwatch.seconds,
          playedAt: new Date().toISOString(),
          details: {
            type: 'racines',
            niveau: partie.niveau,
            bonnes,
            total,
            items,
            reussite: taux,
            extra: {
              membresTrouves,
              membres,
              intrusEvites,
              intrus,
              morceauxCoupes,
              morceauxSens,
              morceauxTotal,
              intrusCliques: resFamilles.flatMap((r) => r.correction.intrusCliques),
              membresOublies: resFamilles.flatMap((r) => r.correction.oublies),
              decoupesRatees: resDecoupes.filter((r) => r.coupes < r.morceaux.length || r.sens < r.morceaux.length).map((r) => r.id),
            },
          },
        },
        { parcours: modeParcours },
      )
      await marquer(currentUser.id, JEU, items)
      await refreshPoints()
      if (modeParcours) await terminerPartie(currentUser.id, modeParcours, taux)
    } finally {
      setPhase('fin')
    }
  }

  // ── Choix du niveau (entraînement libre) ────────────────────────────────
  if (phase === 'choix' || !partie) {
    return (
      <div className="mx-auto max-w-xl">
        <EnTete titre={TITRE} />
        <p className="mb-6 text-lg font-semibold text-encre-doux">
          Retrouve les mots d'une même famille, puis coupe des mots en morceaux pour comprendre leur sens.
        </p>
        <div className="space-y-3">
          {([1, 2, 3] as NiveauRacines[]).map((niveau) => {
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
                    <p className="text-base font-semibold text-encre-doux">
                      {meta.desc} • {FAMILLES_PAR_PARTIE} familles, {DECOUPES_PAR_PARTIE} mots
                    </p>
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
    const membres = resFamilles.reduce((n, r) => n + r.correction.trouves.length + r.correction.oublies.length, 0)
    const membresTrouves = resFamilles.reduce((n, r) => n + r.correction.trouves.length, 0)
    const intrus = resFamilles.reduce((n, r) => n + r.correction.intrusCliques.length + r.correction.intrusEvites.length, 0)
    const intrusEvites = resFamilles.reduce((n, r) => n + r.correction.intrusEvites.length, 0)
    const morceauxTotal = resDecoupes.reduce((n, r) => n + r.morceaux.length, 0)
    const morceauxCoupes = resDecoupes.reduce((n, r) => n + r.coupes, 0)
    const morceauxSens = resDecoupes.reduce((n, r) => n + r.sens, 0)
    const aRevoir = resDecoupes.filter((r) => r.coupes < r.morceaux.length || r.sens < r.morceaux.length)
    const meta = NIVEAUX[partie.niveau]
    const tuiles = [
      { valeur: `${membresTrouves}/${membres}`, emoji: '🌳', libelle: 'Membres trouvés' },
      { valeur: `${intrusEvites}/${intrus}`, emoji: '🚫', libelle: 'Faux amis évités' },
      { valeur: `${morceauxCoupes}/${morceauxTotal}`, emoji: '✂️', libelle: 'Morceaux bien coupés' },
      { valeur: `${morceauxSens}/${morceauxTotal}`, emoji: '💡', libelle: 'Sens trouvés' },
    ]
    return (
      <EcranFin
        titre="Les racines sont plantées ! 🌳"
        etoiles={etoilesRacines(bilan.taux)}
        score={bilan.score}
        detail={`points · ${meta.label} ${meta.emoji} · ${Math.round(bilan.taux * 100)} % de réussite`}
        onRejouer={() => demarrer(partie.niveau)}
        retourVers="/exercices"
        parcours={!!modeParcours}
      >
        <div className="grid grid-cols-2 gap-2 text-center">
          {tuiles.map((t) => (
            <div key={t.libelle} className="rounded-xl border-2 border-encre bg-sable p-3">
              <p className="text-lg font-black text-juste-fonce">{t.valeur} {t.emoji}</p>
              <p className="text-base font-semibold text-encre-doux">{t.libelle}</p>
            </div>
          ))}
          <div className="col-span-2 rounded-xl border-2 border-encre bg-sable p-3">
            <p className="text-lg font-black tabular-nums text-encre">{stopwatch.formatted}</p>
            <p className="text-base font-semibold text-encre-doux">Durée</p>
          </div>
        </div>
        {aRevoir.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 font-bold text-encre">Mots à revoir :</p>
            <ul className="flex flex-wrap gap-2">
              {aRevoir.map((r) => (
                <li key={r.id} className="rounded-xl border-2 border-encre bg-papier px-3 py-1 font-texte text-lg font-semibold tracking-wider text-encre">
                  {r.morceaux.join(' | ')}
                </li>
              ))}
            </ul>
          </div>
        )}
      </EcranFin>
    )
  }

  // ── Partie en cours ─────────────────────────────────────────────────────
  const enFamille = phase === 'famille' || phase === 'famille-correction'
  const famille = enFamille ? partie.familles[index] : null
  const decoupe = !enFamille && phase !== 'intermede' ? partie.decoupes[index] : null
  const etapes = partie.familles.length + partie.decoupes.length
  const faites = enFamille
    ? index + (phase === 'famille-correction' ? 1 : 0)
    : partie.familles.length + index + (phase === 'sens-correction' ? 1 : phase === 'intermede' ? 0 : phase === 'coupe' ? 0 : 0.5)
  const resFamille = famille ? resFamilles[index] : undefined
  const resDecoupe = decoupe ? resDecoupes[index] : undefined

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <EnTete
        titre={TITRE}
        droite={
          <>
            <span className="rounded-full border-2 border-encre bg-papier px-3 py-1 font-bold tabular-nums text-encre">⏱️ {stopwatch.formatted}</span>
            <span className="rounded-full border-2 border-encre bg-papier px-3 py-1 font-bold text-encre">
              {enFamille ? `Famille ${index + 1} / ${partie.familles.length}` : `Mot ${Math.min(index + 1, partie.decoupes.length)} / ${partie.decoupes.length}`}
            </span>
          </>
        }
        retourVers={modeParcours ? '/parcours' : undefined}
      />
      {modeParcours?.etape === 'boss' && <Etiquette couleur="rose-pale">👾 Boss du niveau</Etiquette>}

      <div className="h-3 overflow-hidden rounded-full border-2 border-encre bg-encre/10">
        <motion.div className="h-full rounded-full bg-rose" animate={{ width: `${Math.round((faites / etapes) * 100)}%` }} transition={{ duration: 0.4 }} />
      </div>

      {/* Manche 1 : la famille */}
      {famille && (
        <>
          <Carte className="px-3 py-6 md:p-8">
            <p className="text-center text-base font-bold text-encre-doux">Manche 1 · La famille</p>
            <div className="my-4 flex flex-col items-center gap-1">
              <p className="rounded-2xl border-[3px] border-encre bg-juste px-6 py-2 font-texte text-3xl font-bold tracking-wider text-encre md:text-4xl">
                🌳 {famille.racine}
              </p>
              {famille.sens && <p className="text-lg font-semibold text-encre-doux">({famille.sens})</p>}
            </div>
            <p className="mb-6 text-center text-lg font-bold text-encre">
              Clique tous les mots de la famille de « {famille.racine} ». Attention aux faux amis !
            </p>
            <GrilleFamille
              famille={famille}
              grille={grille}
              selection={selection}
              onBasculer={basculerMot}
              correction={phase === 'famille-correction' ? resFamille?.correction : undefined}
            />
            {phase === 'famille' && (
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Bouton variante="secondaire" onClick={() => setSelection([])} disabled={selection.length === 0}>Tout effacer</Bouton>
                <Bouton taille="grand" onClick={validerFamille} disabled={selection.length === 0}>J'ai fini ✓</Bouton>
              </div>
            )}
          </Carte>

          {phase === 'famille-correction' && resFamille && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 rounded-2xl border-2 border-encre bg-papier p-4 text-encre">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border-2 border-encre bg-juste px-3 py-1 font-bold">
                  🌳 Membres trouvés : {resFamille.correction.trouves.length}/{famille.membres.length}
                </span>
                <span className={cn('rounded-full border-2 border-encre px-3 py-1 font-bold', resFamille.correction.intrusCliques.length ? 'bg-faux' : 'bg-juste')}>
                  🚫 Faux amis évités : {resFamille.correction.intrusEvites.length}/{famille.intrus.length}
                </span>
              </div>
              <div>
                <p className="mb-2 text-lg font-black">Les faux amis de « {famille.racine} » :</p>
                <ul className="space-y-2">
                  {famille.intrus.map((mot) => {
                    const piege = resFamille.correction.intrusCliques.includes(mot)
                    return (
                      <li key={mot} className={cn('rounded-xl border-2 border-encre p-3 text-base leading-relaxed', piege ? 'bg-faux' : 'bg-sable')}>
                        <span className="font-texte text-lg font-black tracking-wide">{mot}</span>
                        {piege && <span className="font-bold"> (tu l'as cliqué ✗)</span>}
                        <br />
                        {famille.explications[mot]}
                      </li>
                    )
                  })}
                </ul>
              </div>
              <div className="flex justify-end">
                <Bouton onClick={familleSuivante}>{index + 1 >= partie.familles.length ? 'Manche 2 →' : 'Famille suivante →'}</Bouton>
              </div>
            </motion.div>
          )}
        </>
      )}

      {/* Entre les deux manches */}
      {phase === 'intermede' && (
        <Carte className="p-6 text-center md:p-8">
          <p className="text-base font-bold text-encre-doux">Manche 2 · La découpe</p>
          <p className="mt-3 font-titre text-2xl text-encre md:text-3xl">✂️ Coupe les mots en morceaux</p>
          <p className="mx-auto mt-4 max-w-xl text-lg font-semibold leading-relaxed text-encre">
            Un mot peut être fait de plusieurs morceaux : un début, un cœur et une fin.
            <br />
            Exemple : <span className="font-texte font-black tracking-wider">in | cass | able</span> = ne… pas + casser + qu'on peut.
          </p>
          <p className="mt-3 text-lg font-semibold text-encre-doux">Coupe d'abord le mot, puis trouve le sens de chaque morceau.</p>
          <div className="mt-6 flex justify-center">
            <Bouton taille="grand" onClick={() => setPhase('coupe')}>C'est parti →</Bouton>
          </div>
        </Carte>
      )}

      {/* Manche 2 : la découpe */}
      {decoupe && (
        <>
          <Carte className="px-2 py-5 sm:px-5 md:p-8">
            <p className="text-center text-base font-bold text-encre-doux">Manche 2 · La découpe</p>
            <p className="mb-6 mt-2 text-center text-lg font-bold text-encre">
              {phase === 'coupe' || phase === 'coupe-correction'
                ? '✂️ Étape 1 : coupe le mot en morceaux en cliquant entre les lettres.'
                : '💡 Étape 2 : clique un morceau, puis l\'étiquette qui donne son sens.'}
            </p>

            {(phase === 'coupe' || phase === 'coupe-correction') && (
              <div className="pb-6 pt-4">
                <CiseauxEntreLettres
                  mot={decoupe.mot}
                  coupures={coupures}
                  onBasculer={basculerCoupure}
                  correction={phase === 'coupe-correction' ? coupuresAttendues(decoupe.morceaux) : undefined}
                />
              </div>
            )}

            {(phase === 'sens' || phase === 'sens-correction') && (
              <AssociationSens
                decoupe={decoupe}
                etiquettes={etiquettes}
                choix={choix}
                actif={actif}
                onChoisirMorceau={setActif}
                onChoisirEtiquette={choisirEtiquette}
                correction={phase === 'sens-correction'}
              />
            )}

            {phase === 'coupe' && (
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Bouton variante="secondaire" onClick={() => setCoupures([])} disabled={coupures.length === 0}>Tout effacer</Bouton>
                <Bouton onClick={validerCoupe} disabled={coupures.length === 0}>Valider ma découpe ✓</Bouton>
              </div>
            )}
            {phase === 'sens' && (
              <div className="mt-6 flex justify-center">
                <Bouton onClick={validerSens} disabled={choix.some((c) => c === null)}>Valider les sens ✓</Bouton>
              </div>
            )}
          </Carte>

          {phase === 'coupe-correction' && resDecoupe && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-encre p-4 text-encre',
                resDecoupe.coupes === decoupe.morceaux.length ? 'bg-juste' : 'bg-faux',
              )}
            >
              <div>
                <p className="text-lg font-black">
                  {resDecoupe.coupes === decoupe.morceaux.length
                    ? '✓ Bien coupé !'
                    : `${resDecoupe.coupes} morceau${resDecoupe.coupes > 1 ? 'x' : ''} bien coupé${resDecoupe.coupes > 1 ? 's' : ''} sur ${decoupe.morceaux.length}`}
                </p>
                {resDecoupe.coupes < decoupe.morceaux.length && (
                  <p className="text-base font-semibold">
                    Tu as coupé : <span className="font-black tracking-wider">{decouper(decoupe.mot, coupures).join(' | ')}</span>
                    <br />
                    Il fallait : <span className="font-black tracking-wider">{decoupe.morceaux.join(' | ')}</span>
                  </p>
                )}
              </div>
              <Bouton onClick={allerAuxSens}>Trouver le sens 💡</Bouton>
            </motion.div>
          )}

          {phase === 'sens-correction' && resDecoupe && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-encre p-4 text-encre',
                resDecoupe.sens === decoupe.morceaux.length ? 'bg-juste' : 'bg-papier',
              )}
            >
              <div className="min-w-0">
                <p className="text-lg font-black">
                  {resDecoupe.sens === decoupe.morceaux.length ? '✓ Tous les sens sont justes !' : `${resDecoupe.sens} sens juste${resDecoupe.sens > 1 ? 's' : ''} sur ${decoupe.morceaux.length}`}
                </p>
                <p className="mt-1 text-base font-semibold leading-relaxed">
                  <span className="font-texte text-lg font-black tracking-wider">{decoupe.mot}</span> ={' '}
                  {decoupe.morceaux.map((m, k) => `${m} (${decoupe.sens[k]})`).join(' + ')}
                </p>
              </div>
              <Bouton onClick={decoupeSuivante}>{index + 1 >= partie.decoupes.length ? 'Résultats' : 'Mot suivant →'}</Bouton>
            </motion.div>
          )}
        </>
      )}
    </div>
  )
}
