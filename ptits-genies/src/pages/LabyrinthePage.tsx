import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { useProgressStore } from '@/store/progressStore'
import { useParcoursStore } from '@/store/parcoursStore'
import { useItemsVusStore } from '@/store/itemsVusStore'
import { useModeParcours } from '@/parcours/useModeParcours'
import { tauxReussite } from '@/parcours/regles'
import { useStopwatch } from '@/hooks/useStopwatch'
import { classesCarte, Carte } from '@/components/ui/Carte'
import { EnTete } from '@/components/ui/EnTete'
import { EcranFin } from '@/components/ui/EcranFin'
import { Etiquette } from '@/components/ui/Etiquette'
import { TexteLabyrinthe } from '@/components/exercises/Labyrinthe/TexteLabyrinthe'
import { QuestionFinale } from '@/components/exercises/Labyrinthe/QuestionFinale'
import {
  calcLabyrintheEtoiles,
  calcLabyrintheScore,
  nombreCarrefours,
  preparerChoix,
  type ChoixCarrefour,
  type NiveauLabyrinthe,
  type ReponseCarrefour,
  type TexteLabyrinthe as Texte,
} from '@/components/exercises/Labyrinthe/logique'

import niveau1 from '@/data/labyrinthe/niveau_1.json'
import niveau2 from '@/data/labyrinthe/niveau_2.json'
import niveau3 from '@/data/labyrinthe/niveau_3.json'

const JEU = 'labyrinthe'
const TITRE = '🧭 Le Labyrinthe'

const TEXTES: Record<NiveauLabyrinthe, Texte[]> = {
  1: niveau1 as Texte[],
  2: niveau2 as Texte[],
  3: niveau3 as Texte[],
}

const NIVEAUX: Record<NiveauLabyrinthe, { label: string; emoji: string; desc: string; fond: string }> = {
  1: { label: 'Débutant', emoji: '🌱', desc: 'Texte court • 12 carrefours', fond: 'bg-juste' },
  2: { label: 'Intermédiaire', emoji: '🚀', desc: 'Texte moyen • 18 carrefours', fond: 'bg-jaune' },
  3: { label: 'Expert', emoji: '🏅', desc: 'Texte long • 25 carrefours', fond: 'bg-rose-pale' },
}

// Pause après un clic : courte si c'est juste, plus longue pour laisser voir la correction.
const PAUSE_JUSTE = 450
const PAUSE_ERREUR = 1200

type Phase = 'choix-niveau' | 'lecture' | 'question' | 'resultat'

interface Partie {
  niveau: NiveauLabyrinthe
  texte: Texte
  choix: ChoixCarrefour[][]
}

function creerPartie(niveau: NiveauLabyrinthe): Partie {
  // Anti-répétition : on évite les textes déjà lus par cet élève.
  const [texte] = useItemsVusStore.getState().choisir(JEU, TEXTES[niveau], 1)
  return { niveau, texte, choix: preparerChoix(texte) }
}

interface Resultat {
  score: number
  etoiles: 0 | 1 | 2 | 3
  bonnesCarrefours: number
  totalCarrefours: number
  questionJuste: boolean
}

export default function LabyrinthePage() {
  const stopwatch = useStopwatch()
  const { currentUser, refreshPoints } = useAuthStore()
  const { saveSession } = useProgressStore()
  const { terminerPartie } = useParcoursStore()
  const marquer = useItemsVusStore((s) => s.marquer)
  const modeParcours = useModeParcours()
  // En parcours, le niveau est imposé (borné à 1-3).
  const niveauParcours = modeParcours ? (Math.min(Math.max(modeParcours.difficulte, 1), 3) as NiveauLabyrinthe) : null

  // En parcours, pas d'écran de choix : la partie existe dès le premier rendu.
  const [partie, setPartie] = useState<Partie | null>(() => (niveauParcours ? creerPartie(niveauParcours) : null))
  const [phase, setPhase] = useState<Phase>(niveauParcours ? 'lecture' : 'choix-niveau')
  const [reponses, setReponses] = useState<ReponseCarrefour[]>([])
  const [enAttente, setEnAttente] = useState<ChoixCarrefour | null>(null)
  const [reponseQuestion, setReponseQuestion] = useState<number | null>(null)
  const [enregistrement, setEnregistrement] = useState(false)
  const [resultat, setResultat] = useState<Resultat | null>(null)

  const finiRef = useRef(false)
  const demarreRef = useRef(false)
  const minuterieRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Démarre le chronomètre une seule fois quand la partie est créée au premier rendu (parcours).
  useEffect(() => {
    if (partie && !demarreRef.current) {
      demarreRef.current = true
      stopwatch.reset()
      stopwatch.start()
    }
    return () => {
      if (minuterieRef.current) clearTimeout(minuterieRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function commencer(niveau: NiveauLabyrinthe) {
    if (minuterieRef.current) clearTimeout(minuterieRef.current)
    setPartie(creerPartie(niveau))
    setReponses([])
    setEnAttente(null)
    setReponseQuestion(null)
    setEnregistrement(false)
    setResultat(null)
    finiRef.current = false
    demarreRef.current = true
    stopwatch.reset()
    stopwatch.start()
    setPhase('lecture')
  }

  function choisir(choix: ChoixCarrefour) {
    if (!partie || enAttente || phase !== 'lecture') return
    const indice = reponses.length
    const carrefour = partie.choix[indice]
    const bonne = carrefour.find((c) => c.type === 'bonne')!.mot
    setEnAttente(choix)
    minuterieRef.current = setTimeout(() => {
      setReponses((r) => [...r, { choisi: choix, bonne }])
      setEnAttente(null)
      if (indice + 1 >= partie.choix.length) setPhase('question')
    }, choix.type === 'bonne' ? PAUSE_JUSTE : PAUSE_ERREUR)
  }

  function repondreQuestion(index: number) {
    if (reponseQuestion !== null) return
    setReponseQuestion(index)
    stopwatch.pause()
  }

  async function terminer() {
    if (!partie || finiRef.current || reponseQuestion === null) return
    finiRef.current = true
    setEnregistrement(true)
    stopwatch.pause()

    const totalCarrefours = nombreCarrefours(partie.texte)
    const bonnesCarrefours = reponses.filter((r) => r.choisi.type === 'bonne').length
    const questionJuste = reponseQuestion === partie.texte.question.bonne
    const bonnes = bonnesCarrefours + (questionJuste ? 1 : 0)
    const total = totalCarrefours + 1
    const taux = tauxReussite(bonnes, total)
    const duree = stopwatch.seconds
    const score = calcLabyrintheScore({ bonnes, total, secondes: duree, niveau: partie.niveau })
    const etoiles = calcLabyrintheEtoiles(taux)

    if (currentUser) {
      const erreursGrammaire = reponses.filter((r) => r.choisi.type === 'grammaire').length
      const erreursSens = reponses.filter((r) => r.choisi.type === 'sens').length
      await saveSession(
        {
          id: `${Date.now()}-la`,
          userId: currentUser.id,
          exerciseType: 'labyrinthe',
          score,
          duration: duree,
          playedAt: new Date().toISOString(),
          details: {
            type: 'labyrinthe',
            niveau: partie.niveau,
            bonnes,
            total,
            items: [partie.texte.id],
            reussite: taux,
            extra: {
              carrefoursJustes: bonnesCarrefours,
              carrefours: totalCarrefours,
              questionJuste,
              erreursGrammaire,
              erreursSens,
              carrefoursParMinute: duree > 0 ? Math.round((bonnesCarrefours / duree) * 600) / 10 : null,
            },
          },
        },
        { parcours: !!modeParcours },
      )
      await refreshPoints()
      if (modeParcours) await terminerPartie(currentUser.id, modeParcours, taux)
      await marquer(currentUser.id, JEU, [partie.texte.id])
    }

    setResultat({ score, etoiles, bonnesCarrefours, totalCarrefours, questionJuste })
    setEnregistrement(false)
    setPhase('resultat')
  }

  // ── Choix du niveau (entraînement libre) ────────────────────────────────
  if (phase === 'choix-niveau' || !partie) {
    return (
      <div className="mx-auto max-w-xl">
        <EnTete titre={TITRE} />
        <p className="mb-6 text-lg font-semibold leading-relaxed text-encre-doux">
          Lis le texte. À chaque carrefour, clique sur le mot qui va dans la phrase. À la fin, une question sur tout le texte.
        </p>
        <div className="space-y-3">
          {([1, 2, 3] as NiveauLabyrinthe[]).map((niveau) => {
            const meta = NIVEAUX[niveau]
            return (
              <motion.button
                key={niveau}
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.02, y: -2 }}
                onClick={() => commencer(niveau)}
                className={`w-full overflow-hidden text-left transition-all hover:shadow-dur-lg ${classesCarte}`}
              >
                <div className="flex items-center gap-4 p-5">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-encre text-2xl ${meta.fond}`}>
                    {meta.emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-black text-encre">{meta.label}</p>
                    <p className="text-base font-semibold text-encre-doux">{meta.desc}</p>
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

  // ── Résultat ────────────────────────────────────────────────────────────
  if (phase === 'resultat' && resultat) {
    const meta = NIVEAUX[partie.niveau]
    return (
      <EcranFin
        titre="Sorti du labyrinthe ! 🎉"
        etoiles={resultat.etoiles}
        score={resultat.score}
        detail={`points · ${meta.label} ${meta.emoji}`}
        onRejouer={() => commencer(partie.niveau)}
        retourVers="/exercices"
        parcours={!!modeParcours}
      >
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="rounded-xl border-2 border-encre bg-sable p-3">
            <p className="text-lg font-black text-juste-fonce">{resultat.bonnesCarrefours}/{resultat.totalCarrefours} ✓</p>
            <p className="text-base font-semibold text-encre-doux">Carrefours</p>
          </div>
          <div className="rounded-xl border-2 border-encre bg-sable p-3">
            <p className="text-lg font-black tabular-nums text-encre">{stopwatch.formatted}</p>
            <p className="text-base font-semibold text-encre-doux">Durée</p>
          </div>
          <div className="col-span-2 rounded-xl border-2 border-encre bg-sable p-3">
            <p className="text-lg font-black text-encre">{resultat.questionJuste ? '✓ Question réussie' : '✗ Question ratée'}</p>
            <p className="text-base font-semibold text-encre-doux">« {partie.texte.titre} »</p>
          </div>
        </div>
      </EcranFin>
    )
  }

  // ── Lecture et question finale ──────────────────────────────────────────
  const total = partie.choix.length
  const franchis = reponses.length
  const justes = reponses.filter((r) => r.choisi.type === 'bonne').length

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <EnTete
        titre={TITRE}
        droite={
          <>
            <span className="rounded-full border-2 border-encre bg-papier px-3 py-1 font-bold tabular-nums text-encre">
              ⏱️ {stopwatch.formatted}
            </span>
            <span className="rounded-full border-2 border-encre bg-papier px-3 py-1 font-bold text-encre">
              {justes} ✓ / {franchis - justes} ✗
            </span>
          </>
        }
        retourVers={modeParcours ? '/parcours' : undefined}
      />
      {modeParcours?.etape === 'boss' && <Etiquette couleur="rose-pale">👾 Boss du niveau</Etiquette>}
      <p className="text-base font-bold text-encre-doux">
        Niveau {NIVEAUX[partie.niveau].label} · Carrefour {Math.min(franchis + 1, total)} / {total}
      </p>

      <div className="h-3 overflow-hidden rounded-full border-2 border-encre bg-encre/10">
        <motion.div
          className="h-full rounded-full bg-rose"
          animate={{ width: `${Math.round((franchis / total) * 100)}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      <Carte className="p-5 md:p-8">
        <h2 className="mb-4 font-titre text-2xl leading-tight text-encre">{partie.texte.titre}</h2>
        <TexteLabyrinthe
          texte={partie.texte}
          choix={partie.choix}
          reponses={reponses}
          enAttente={enAttente}
          onChoisir={choisir}
        />
      </Carte>

      {phase === 'question' && (
        <QuestionFinale
          question={partie.texte.question}
          reponse={reponseQuestion}
          onRepondre={repondreQuestion}
          onTerminer={terminer}
          enregistrement={enregistrement}
        />
      )}
    </div>
  )
}
