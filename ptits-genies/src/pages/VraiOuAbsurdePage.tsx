import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { useProgressStore } from '@/store/progressStore'
import { useParcoursStore } from '@/store/parcoursStore'
import { useItemsVusStore } from '@/store/itemsVusStore'
import { useModeParcours } from '@/parcours/useModeParcours'
import { tauxReussite } from '@/parcours/regles'
import { Bouton } from '@/components/ui/Bouton'
import { BoutonMot, type EtatMot } from '@/components/ui/BoutonMot'
import { Carte, classesCarte } from '@/components/ui/Carte'
import { EnTete } from '@/components/ui/EnTete'
import { EcranFin } from '@/components/ui/EcranFin'
import { Etiquette } from '@/components/ui/Etiquette'
import {
  PHRASES_PAR_PARTIE, MULTIPLICATEUR, composerPartie, calculerScore, calculerEtoiles,
  justesParMinute, marquerMot, marquerDifferences,
  type PhraseVA, type NiveauVA, type Morceau,
} from '@/components/exercices/vraiAbsurde/logique'

import niveau1 from '@/data/vraiAbsurde/niveau_1.json'
import niveau2 from '@/data/vraiAbsurde/niveau_2.json'
import niveau3 from '@/data/vraiAbsurde/niveau_3.json'

const JEU = 'vrai-absurde'
const TITRE = '⚖️ Vrai ou Absurde ?'

const PHRASES: Record<NiveauVA, PhraseVA[]> = {
  1: niveau1 as PhraseVA[],
  2: niveau2 as PhraseVA[],
  3: niveau3 as PhraseVA[],
}

const NIVEAUX: Record<NiveauVA, { label: string; emoji: string; desc: string; fond: string }> = {
  1: { label: 'Débutant', emoji: '🌱', desc: 'Phrases courtes • un mot qui se ressemble', fond: 'bg-juste' },
  2: { label: 'Intermédiaire', emoji: '🚀', desc: 'Phrases plus longues • une lettre qui change', fond: 'bg-jaune' },
  3: { label: 'Professionnel', emoji: '🏅', desc: 'Longues phrases • une erreur de logique', fond: 'bg-rose-pale' },
}

type Phase = 'choix' | 'jeu' | 'fin'

interface Partie {
  niveau: NiveauVA
  phrases: PhraseVA[]
  debut: number
}

interface Bilan {
  bonnes: number
  total: number
  score: number
  etoiles: 0 | 1 | 2 | 3
  secondes: number
  parMinute: number
  rates: PhraseVA[]
}

function formaterDuree(secondes: number): string {
  const m = Math.floor(secondes / 60)
  const s = secondes % 60
  return `${m} min ${String(s).padStart(2, '0')} s`
}

function Texte({ morceaux, classeMarque }: { morceaux: Morceau[]; classeMarque: string }) {
  return (
    <>
      {morceaux.map((m, i) =>
        m.marque
          ? <mark key={i} className={`rounded-md border-2 border-encre px-1 font-bold text-encre ${classeMarque}`}>{m.texte}</mark>
          : <span key={i}>{m.texte}</span>,
      )}
    </>
  )
}

export default function VraiOuAbsurdePage() {
  const { currentUser, refreshPoints } = useAuthStore()
  const { saveSession } = useProgressStore()
  const { terminerPartie } = useParcoursStore()
  const choisir = useItemsVusStore((s) => s.choisir)
  const marquer = useItemsVusStore((s) => s.marquer)
  const modeParcours = useModeParcours()

  function nouvellePartie(niveau: NiveauVA): Partie {
    const phrases = composerPartie(PHRASES[niveau], PHRASES_PAR_PARTIE[niveau], (pool, n) => choisir(JEU, pool, n))
    return { niveau, phrases, debut: Date.now() }
  }

  // En parcours : pas d'écran de choix, la partie est prête dès le premier rendu
  // (calcul pur dans l'initialiseur : sans effet de bord, donc sans souci en StrictMode).
  const [partie, setPartie] = useState<Partie | null>(() =>
    modeParcours ? nouvellePartie(Math.min(Math.max(modeParcours.difficulte, 1), 3) as NiveauVA) : null,
  )
  const [phase, setPhase] = useState<Phase>(() => (partie ? 'jeu' : 'choix'))
  const [index, setIndex] = useState(0)
  const [reponse, setReponse] = useState<boolean | null>(null)
  const [resultats, setResultats] = useState<boolean[]>([])
  const [bilan, setBilan] = useState<Bilan | null>(null)
  const [enregistrement, setEnregistrement] = useState(false)
  const finiRef = useRef(false)

  function demarrer(niveau: NiveauVA) {
    finiRef.current = false
    setPartie(nouvellePartie(niveau))
    setIndex(0)
    setReponse(null)
    setResultats([])
    setBilan(null)
    setPhase('jeu')
  }

  function repondre(sens: boolean) {
    if (!partie || reponse !== null) return
    const phrase = partie.phrases[index]
    setReponse(sens)
    setResultats((r) => [...r, sens === phrase.sens])
  }

  async function terminer(p: Partie, res: boolean[]) {
    if (finiRef.current) return
    finiRef.current = true
    setEnregistrement(true)
    const total = p.phrases.length
    const bonnes = res.filter(Boolean).length
    const taux = tauxReussite(bonnes, total)
    const secondes = Math.max(1, Math.round((Date.now() - p.debut) / 1000))
    const score = calculerScore(bonnes, p.niveau)
    const rates = p.phrases.filter((ph, i) => !res[i])
    const ids = p.phrases.map((ph) => ph.id)
    const nouveauBilan: Bilan = {
      bonnes, total, score, secondes, rates,
      etoiles: calculerEtoiles(taux),
      parMinute: justesParMinute(bonnes, secondes),
    }
    try {
      if (currentUser) {
        await marquer(currentUser.id, JEU, ids)
        await saveSession({
          id: `${Date.now()}-va`,
          userId: currentUser.id,
          exerciseType: 'vrai-absurde',
          score,
          duration: secondes,
          playedAt: new Date().toISOString(),
          details: {
            type: 'vrai-absurde',
            niveau: p.niveau,
            bonnes,
            total,
            items: ids,
            reussite: taux,
            extra: {
              justesParMinute: nouveauBilan.parMinute,
              erreursSurSensees: rates.filter((ph) => ph.sens).length,
              erreursSurAbsurdes: rates.filter((ph) => !ph.sens).length,
              ratees: rates.map((ph) => ph.id),
            },
          },
        }, { parcours: modeParcours })
        await refreshPoints()
        if (modeParcours) await terminerPartie(currentUser.id, modeParcours, taux)
      }
    } catch (erreur) {
      // L'élève voit quand même son résultat ; l'erreur reste visible pour le débogage.
      console.error('Vrai ou Absurde : enregistrement de la partie impossible', erreur)
    } finally {
      setBilan(nouveauBilan)
      setEnregistrement(false)
      setPhase('fin')
    }
  }

  function suivant() {
    if (!partie || reponse === null) return
    if (index + 1 >= partie.phrases.length) {
      void terminer(partie, resultats)
      return
    }
    setIndex((i) => i + 1)
    setReponse(null)
  }

  // ── Choix du niveau (entraînement libre) ────────────────────────────────
  if (phase === 'choix' || !partie) {
    return (
      <div className="mx-auto max-w-xl">
        <EnTete titre={TITRE} />
        <Carte className="mb-6 p-5 text-lg leading-relaxed tracking-wide text-encre">
          <p>Lis chaque phrase en entier dans ta tête.</p>
          <p className="mt-2">Si elle a du sens, clique sur <strong>« Ça tient debout »</strong>. Si elle est impossible, clique sur <strong>« C'est absurde »</strong>.</p>
          <p className="mt-2">Attention : parfois, un seul mot change tout ! <span className="font-bold">« Le chien ronge un ours »</span> est absurde : c'est un <span className="font-bold">os</span>.</p>
        </Carte>

        <div className="space-y-3">
          {([1, 2, 3] as NiveauVA[]).map((niveau) => {
            const meta = NIVEAUX[niveau]
            return (
              <motion.button
                key={niveau}
                type="button"
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.02, y: -2 }}
                onClick={() => demarrer(niveau)}
                className={`w-full overflow-hidden text-left transition-all hover:shadow-dur-lg ${classesCarte}`}
              >
                <div className="flex items-center gap-4 p-5">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-encre text-2xl ${meta.fond}`}>
                    {meta.emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-0.5 flex flex-wrap items-center gap-2">
                      <p className="font-black text-encre">{meta.label}</p>
                      <span className="rounded-full border-2 border-encre bg-jaune px-2 py-0.5 text-sm font-black text-encre">
                        ×{MULTIPLICATEUR[niveau]}
                      </span>
                    </div>
                    <p className="text-base font-semibold text-encre-doux">{meta.desc} • {PHRASES_PAR_PARTIE[niveau]} phrases</p>
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
  if (phase === 'fin' && bilan) {
    const meta = NIVEAUX[partie.niveau]
    return (
      <EcranFin
        titre={bilan.bonnes === bilan.total ? 'Sans faute ! 🎉' : 'Résultat'}
        etoiles={bilan.etoiles}
        score={bilan.score}
        detail={`points · ${meta.label} ${meta.emoji}`}
        onRejouer={() => demarrer(partie.niveau)}
        parcours={!!modeParcours}
      >
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="col-span-2 rounded-xl border-2 border-encre bg-sable p-3">
            <p className="text-lg font-black text-juste-fonce">{bilan.bonnes} / {bilan.total} ✓</p>
            <p className="text-base font-semibold text-encre-doux">Bonnes réponses</p>
          </div>
          <div className="rounded-xl border-2 border-encre bg-sable p-3">
            <p className="text-lg font-black text-encre tabular-nums">{formaterDuree(bilan.secondes)}</p>
            <p className="text-base font-semibold text-encre-doux">Durée</p>
          </div>
          <div className="rounded-xl border-2 border-encre bg-sable p-3">
            <p className="text-lg font-black text-encre tabular-nums">{bilan.parMinute}</p>
            <p className="text-base font-semibold text-encre-doux">Justes par minute</p>
          </div>
        </div>
        {bilan.rates.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 font-black text-encre">À revoir</p>
            <ul className="space-y-2">
              {bilan.rates.map((ph) => (
                <li key={ph.id} className="rounded-xl border-2 border-encre bg-papier p-3 text-base leading-relaxed tracking-wide text-encre">
                  {ph.sens ? (
                    <>
                      <p>{ph.phrase}</p>
                      <p className="mt-1 font-semibold text-juste-fonce">Cette phrase tenait debout.</p>
                    </>
                  ) : (
                    <>
                      <p><Texte morceaux={marquerMot(ph.phrase, ph.motPiege)} classeMarque="bg-rose-pale" /></p>
                      <p className="mt-1 font-semibold">
                        → <Texte morceaux={marquerDifferences(ph.phrase, ph.correction ?? '')} classeMarque="bg-juste" />
                      </p>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </EcranFin>
    )
  }

  // ── Partie en cours ─────────────────────────────────────────────────────
  const phrase = partie.phrases[index]
  const total = partie.phrases.length
  const repondu = reponse !== null
  const juste = repondu && reponse === phrase.sens
  const bonnes = resultats.filter(Boolean).length

  function etatBouton(valeur: boolean): EtatMot {
    if (!repondu) return 'normal'
    if (valeur === phrase.sens) return 'juste'
    return valeur === reponse ? 'faux' : 'normal'
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <EnTete
        titre={TITRE}
        retourVers={modeParcours ? '/parcours' : undefined}
        droite={
          <span className="rounded-full border-2 border-encre bg-papier px-3 py-1 font-bold text-encre">
            {bonnes} ✓
          </span>
        }
      />
      {modeParcours?.etape === 'boss' && <Etiquette couleur="rose-pale">👾 Boss du niveau</Etiquette>}
      <p className="text-base font-bold text-encre-doux">
        Niveau {NIVEAUX[partie.niveau].label} · Phrase {index + 1} / {total}
      </p>

      <div className="h-3 overflow-hidden rounded-full border-2 border-encre bg-encre/10">
        <motion.div
          className="h-full rounded-full bg-rose"
          animate={{ width: `${Math.round(((index + (repondu ? 1 : 0)) / total) * 100)}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      <Carte className="flex min-h-40 items-center justify-center p-6 md:p-8">
        <motion.p
          key={phrase.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-xl font-semibold leading-relaxed tracking-wide text-encre md:text-2xl"
        >
          {repondu && !phrase.sens
            ? <Texte morceaux={marquerMot(phrase.phrase, phrase.motPiege)} classeMarque="bg-rose-pale" />
            : phrase.phrase}
        </motion.p>
      </Carte>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <BoutonMot
          etat={etatBouton(true)}
          onClick={() => repondre(true)}
          disabled={repondu}
          className="min-h-20 w-full text-xl font-bold tracking-wide"
        >
          <span aria-hidden="true">✅</span> Ça tient debout
        </BoutonMot>
        <BoutonMot
          etat={etatBouton(false)}
          onClick={() => repondre(false)}
          disabled={repondu}
          className="min-h-20 w-full text-xl font-bold tracking-wide"
        >
          <span aria-hidden="true">🤪</span> C'est absurde
        </BoutonMot>
      </div>

      {repondu && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          role="status"
          className={`rounded-2xl border-2 border-encre p-4 text-encre ${juste ? 'bg-juste' : 'bg-faux'}`}
        >
          <p className="text-xl font-black">{juste ? '✓ Bien vu !' : '✗ Raté !'}</p>
          {phrase.sens ? (
            !juste && <p className="mt-1 text-lg font-semibold tracking-wide">Cette phrase tient debout : elle a du sens.</p>
          ) : (
            <div className="mt-2 rounded-xl border-2 border-encre bg-papier p-3 text-lg leading-relaxed tracking-wide">
              <p>
                C'est absurde à cause du mot{' '}
                <mark className="rounded-md border-2 border-encre bg-rose-pale px-1 font-bold text-encre">{phrase.motPiege}</mark>.
              </p>
              <p className="mt-1">
                La bonne phrase : <Texte morceaux={marquerDifferences(phrase.phrase, phrase.correction ?? '')} classeMarque="bg-jaune" />
              </p>
            </div>
          )}
          <div className="mt-3 flex justify-end">
            <Bouton taille="grand" onClick={suivant} disabled={enregistrement} autoFocus>
              {index + 1 >= total ? 'Résultats' : 'Suivant →'}
            </Bouton>
          </div>
        </motion.div>
      )}
    </div>
  )
}
