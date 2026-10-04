import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useParcoursStore } from '@/store/parcoursStore'
import {
  BONUS_BOSS, NB_NIVEAUX, NOMS_JEUX, PARTIES_PAR_JEU, dateDuJour, estTermine, estVerrouille, jeuDeLEtape, jeuDuNiveau,
  lienPartie, seuilBoss, tourDuNiveau, type EtatParcours, type EvenementParcours,
} from '@/parcours/regles'
import { CONSIGNES } from '@/parcours/consignes'
import { Bouton, classesBouton } from '@/components/ui/Bouton'
import { Carte } from '@/components/ui/Carte'
import { EnTete } from '@/components/ui/EnTete'
import { Etiquette } from '@/components/ui/Etiquette'
import { cn } from '@/lib/cn'

const CASE = 'flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-2xl border-2 border-encre p-3 text-center sm:p-4'

function banniere(evenement: EvenementParcours | null, etat: EtatParcours): string | null {
  const total = PARTIES_PAR_JEU[jeuDuNiveau(etat.place, etat.niveau, etat.manche)]
  switch (evenement) {
    case 'partie-terminee': return `Partie ${etat.partiesFaites} / ${total} terminée ! Continue 💪`
    case 'jeu-termine': return 'Entraînement terminé ! Place au boss 👾'
    case 'boss-battu': return etat.etape === 'lecture'
      ? `Boss vaincu ! +${BONUS_BOSS} points 🎉 Dernière étape : la lecture.`
      : `Boss vaincu ! +${BONUS_BOSS} points 🎉 Place au 2e jeu de la séance.`
    case 'boss-rate': return 'Le boss a résisté ! Il sera plus faible au prochain essai.'
    case 'niveau-termine': return `Niveau ${etat.niveau - 1} validé ! 🎉`
    default: return null
  }
}

// ── Écran « Comment jouer ? », affiché avant d'entrer dans un jeu du parcours ──
function Consignes({ etat, onJouer, onFermer }: { etat: EtatParcours; onJouer: () => void; onFermer: () => void }) {
  const jeu = jeuDeLEtape(etat)
  const lignes = CONSIGNES[jeu]
  const objectif = etat.etape === 'boss'
    ? `Boss : il te faut ${Math.round(seuilBoss(etat.echecsBoss) * 100)} % de bonnes réponses.`
    : null
  const peutParler = typeof window !== 'undefined' && 'speechSynthesis' in window

  // Arrête la lecture à voix haute si l'élève quitte l'écran.
  useEffect(() => () => { if (peutParler) window.speechSynthesis.cancel() }, [peutParler])

  const ecouter = () => {
    if (!peutParler) return
    window.speechSynthesis.cancel()
    const texte = [`Comment jouer à ${NOMS_JEUX[jeu].replace(/^\S+\s/, '')}.`, ...lignes, objectif ?? ''].join(' ')
    const enonce = new SpeechSynthesisUtterance(texte)
    enonce.lang = 'fr-FR'
    enonce.rate = 0.9
    const voix = window.speechSynthesis.getVoices().find((v) => v.lang.startsWith('fr'))
    if (voix) enonce.voice = voix
    window.speechSynthesis.speak(enonce)
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Carte className="p-6 md:p-8">
        <Etiquette couleur={etat.etape === 'boss' ? 'rose-pale' : etat.etape === 'lecture' ? 'bleu' : 'jaune'}>
          {etat.etape === 'boss' ? '👾 Boss' : etat.etape === 'lecture' ? '⚡ Lecture de fin de niveau' : '🎮 Entraînement'}
        </Etiquette>
        <h1 className="mt-4 font-titre text-3xl text-encre">Comment jouer ?</h1>
        <p className="mt-1 font-titre text-xl text-encre">{NOMS_JEUX[jeu]}</p>
        <ol className="mt-5 space-y-3">
          {lignes.map((ligne, i) => (
            <li key={i} className="flex items-start gap-3 text-lg text-encre">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-encre bg-jaune font-bold">{i + 1}</span>
              <span className="pt-0.5">{ligne}</span>
            </li>
          ))}
        </ol>
        {objectif && (
          <p className="mt-5 rounded-2xl border-2 border-encre bg-rose-pale p-4 text-lg font-semibold text-encre">{objectif}</p>
        )}
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <Bouton taille="grand" onClick={onJouer}>J'ai compris, c'est parti ! ▶</Bouton>
          {peutParler && <Bouton variante="secondaire" onClick={ecouter}>🔊 Écouter</Bouton>}
          <Bouton variante="discret" onClick={onFermer}>← Retour</Bouton>
        </div>
      </Carte>
    </div>
  )
}

function Frise({ niveau }: { niveau: number }) {
  return (
    <Carte className="p-5">
      <h2 className="mb-3 font-titre text-lg text-encre">Mon chemin</h2>
      <ol className="flex flex-wrap items-center gap-2">
        {Array.from({ length: NB_NIVEAUX }, (_, i) => i + 1).map((n) => {
          const statut = n < niveau ? 'fait' : n === niveau ? 'en cours' : 'à venir'
          return (
            <li key={n} className="flex items-center gap-2">
              <span
                aria-label={`Niveau ${n} : ${statut}`}
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full border-2 border-encre font-bold',
                  statut === 'fait' && 'bg-juste text-encre',
                  statut === 'en cours' && 'bg-jaune text-encre shadow-dur-sm',
                  statut === 'à venir' && 'bg-papier text-encre-doux',
                )}
              >
                {statut === 'fait' ? '✓' : n}
              </span>
              {(n === 8 || n === 16) && <span aria-hidden="true" className="mx-1 h-8 w-0.5 bg-encre/30" />}
            </li>
          )
        })}
      </ol>
    </Carte>
  )
}

export default function ParcoursPage() {
  const { currentUser } = useAuthStore()
  const { userId, etat, charge, echecChargement, erreur, dernierEvenement, charger, rejoindre, oublierEvenement } = useParcoursStore()
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [envoi, setEnvoi] = useState(false)
  const [consignesOuvertes, setConsignesOuvertes] = useState(false)

  // Ne recharge pas un état déjà en mémoire : cela effacerait le message d'erreur
  // d'un enregistrement raté juste avant (retour depuis un jeu).
  useEffect(() => {
    if (currentUser && (!charge || echecChargement || userId !== currentUser.id)) charger(currentUser.id)
  }, [currentUser?.id])

  if (!currentUser) return null

  if (!charge || userId !== currentUser.id) {
    return <p className="py-20 text-center text-3xl" aria-label="Chargement">⏳</p>
  }

  // ── Chargement raté (wifi coupé…) : surtout ne pas redemander le code à un élève déjà inscrit ──
  if (echecChargement && !etat) {
    return (
      <Carte className="mx-auto max-w-xl p-6 text-center md:p-8">
        <p className="text-lg font-semibold text-encre">⚠️ {erreur}</p>
        <p className="mt-2 text-encre-doux">Ta progression n'est pas perdue.</p>
        <Bouton className="mt-5" taille="grand" onClick={() => charger(currentUser.id)}>Réessayer</Bouton>
      </Carte>
    )
  }

  // ── Première visite : saisie du code de groupe ──
  if (!etat) {
    const valider = async (e: FormEvent) => {
      e.preventDefault()
      setEnvoi(true)
      await rejoindre(currentUser.id, code)
      setEnvoi(false)
    }
    return (
      <div className="mx-auto max-w-xl">
        <EnTete titre="🗺️ Mon parcours" retourVers="/accueil" />
        <Carte className="p-6 md:p-8">
          <form onSubmit={valider} className="space-y-4">
            <label htmlFor="code-groupe" className="block font-titre text-2xl text-encre">Ton code de groupe ?</label>
            <p className="text-encre-doux">Ton professeur te l'a donné : une lettre et un chiffre, par exemple B5.</p>
            <input
              id="code-groupe"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={2}
              autoComplete="off"
              autoFocus
              className="min-h-14 w-32 rounded-xl border-2 border-encre bg-papier px-4 text-center font-titre text-3xl uppercase tracking-widest text-encre focus:bg-jaune/30 focus:outline-none"
            />
            {erreur && <p className="font-semibold text-faux-fonce">✗ {erreur}</p>}
            <div>
              <Bouton type="submit" taille="grand" disabled={envoi || code.trim().length === 0}>C'est parti !</Bouton>
            </div>
          </form>
        </Carte>
      </div>
    )
  }

  // ── Parcours terminé ──
  if (estTermine(etat)) {
    return (
      <Carte className="mx-auto max-w-xl p-8 text-center">
        <Etiquette>Bravo</Etiquette>
        <h1 className="mt-4 font-titre text-4xl text-encre">Parcours terminé 🏆</h1>
        <p className="mt-3 text-lg text-encre-doux">Tu as vaincu les {NB_NIVEAUX} boss. Tu peux continuer à t'entraîner librement.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/exercices" className={classesBouton('principal', 'grand')}>Les exercices</Link>
          <Link to="/accueil" className={classesBouton('secondaire', 'grand')}>Accueil</Link>
        </div>
      </Carte>
    )
  }

  const message = banniere(dernierEvenement, etat)
  const bandeaux = (
    <>
      {erreur && (
        <p role="alert" className="rounded-2xl border-2 border-encre bg-faux p-4 font-semibold text-encre">⚠️ {erreur}</p>
      )}
      {message && (
        <p
          role="status"
          className={cn(
            'rounded-2xl border-2 border-encre p-4 text-center font-titre text-xl text-encre shadow-dur-sm',
            dernierEvenement === 'boss-rate' ? 'bg-rose-pale' : 'bg-juste',
          )}
        >
          {message}
        </p>
      )}
    </>
  )

  // ── Un niveau par jour : le suivant attend la prochaine séance ──
  if (estVerrouille(etat, dateDuJour())) {
    return (
      <div className="mx-auto max-w-2xl space-y-5">
        <EnTete titre="🗺️ Mon parcours" retourVers="/accueil" />
        {bandeaux}
        <Carte className="p-6 text-center md:p-8">
          <p className="text-5xl" aria-hidden="true">🔒</p>
          <h1 className="mt-3 font-titre text-2xl text-encre">Le niveau {etat.niveau} s'ouvrira à ta prochaine séance</h1>
          <p className="mt-2 text-lg text-encre-doux">Un niveau par jour : ton cerveau a besoin de temps pour progresser. En attendant, tu peux t'entraîner librement.</p>
          <Link to="/exercices" className={cn(classesBouton('principal', 'grand'), 'mt-6')}>S'entraîner librement</Link>
        </Carte>
        <Frise niveau={etat.niveau} />
      </div>
    )
  }

  const jeu = jeuDuNiveau(etat.place, etat.niveau, etat.manche)
  const total = PARTIES_PAR_JEU[jeu]
  const tour = tourDuNiveau(etat.niveau)
  const etape = etat.etape

  const lancer = () => {
    oublierEvenement()
    navigate(lienPartie(etat))
  }

  if (consignesOuvertes) {
    return <Consignes etat={etat} onJouer={lancer} onFermer={() => setConsignesOuvertes(false)} />
  }

  // Les consignes s'affichent d'office à l'entrée d'une étape (1re partie d'entraînement, boss, lecture).
  const consignesObligatoires = etape !== 'jeu' || etat.partiesFaites === 0
  const jouer = () => (consignesObligatoires ? setConsignesOuvertes(true) : lancer())

  const libelle =
    etape === 'jeu'
      ? etat.partiesFaites === 0 ? "Commencer l'entraînement ▶" : `Partie suivante ▶ (${etat.partiesFaites + 1} / ${total})`
      : etape === 'boss'
        ? etat.echecsBoss > 0 ? 'Retenter le boss ▶' : 'Affronter le boss ▶'
        : 'Lecture de fin de niveau ▶'

  // Trois cases : 1er jeu de la séance, 2e jeu, lecture de fin de niveau.
  type Case = 'jeuA' | 'jeuB' | 'lecture'
  const caseEnCours: Case = etape === 'lecture' ? 'lecture' : etat.manche === 0 ? 'jeuA' : 'jeuB'
  const ordre: Record<Case, number> = { jeuA: 0, jeuB: 1, lecture: 2 }
  const statutCase = (laquelle: Case) =>
    ordre[laquelle] < ordre[caseEnCours] ? 'fait' : laquelle === caseEnCours ? 'en cours' : 'à venir'
  const fondCase = (laquelle: Case) => {
    const s = statutCase(laquelle)
    return s === 'fait' ? 'bg-juste' : s === 'en cours' ? 'bg-jaune shadow-dur' : 'bg-papier'
  }
  const sousTitreJeu = (laquelle: Case) => {
    const s = statutCase(laquelle)
    if (s === 'fait') return '✓ Fait'
    if (s === 'à venir') return 'Entraînement + boss'
    return etape === 'boss' ? '👾 Boss' : `Entraînement ${etat.partiesFaites} / ${total}`
  }
  const jeuA = jeuDuNiveau(etat.place, etat.niveau, 0)
  const jeuB = jeuDuNiveau(etat.place, etat.niveau, 1)

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <EnTete titre="🗺️ Mon parcours" retourVers="/accueil" />
      {bandeaux}

      <Carte className="p-6 md:p-8">
        <Etiquette>Niveau {etat.niveau} · Tour {tour}</Etiquette>
        <div className="mt-6 flex flex-col items-stretch gap-2 sm:flex-row sm:gap-3">
          <div className={cn(CASE, fondCase('jeuA'))}>
            <span className="text-sm font-semibold uppercase tracking-wide text-encre">Jeu 1</span>
            <span className="break-words font-titre text-base text-encre sm:text-lg">{NOMS_JEUX[jeuA]}</span>
            <span className="text-sm font-semibold text-encre">{sousTitreJeu('jeuA')}</span>
          </div>
          <span className="self-center font-titre text-xl text-encre" aria-hidden="true"><span className="sm:hidden">↓</span><span className="hidden sm:inline">→</span></span>
          <div className={cn(CASE, fondCase('jeuB'))}>
            <span className="text-sm font-semibold uppercase tracking-wide text-encre">Jeu 2</span>
            <span className="break-words font-titre text-base text-encre sm:text-lg">{NOMS_JEUX[jeuB]}</span>
            <span className="text-sm font-semibold text-encre">{sousTitreJeu('jeuB')}</span>
          </div>
          <span className="self-center font-titre text-xl text-encre" aria-hidden="true"><span className="sm:hidden">↓</span><span className="hidden sm:inline">→</span></span>
          <div className={cn(CASE, fondCase('lecture'))}>
            <span className="text-3xl" aria-hidden="true">⚡</span>
            <span className="font-titre text-base text-encre sm:text-lg">Lecture</span>
            <span className="text-sm text-encre">de fin de niveau</span>
          </div>
        </div>

        {etape === 'boss' && (
          <p className="mt-5 text-center text-lg font-semibold text-encre">
            Objectif : {Math.round(seuilBoss(etat.echecsBoss) * 100)} % de bonnes réponses
          </p>
        )}

        <div className="mt-6 flex flex-col items-center gap-3">
          <Bouton taille="grand" onClick={jouer}>{libelle}</Bouton>
          <Bouton variante="discret" onClick={() => setConsignesOuvertes(true)}>📖 Revoir les consignes</Bouton>
        </div>
      </Carte>

      <Frise niveau={etat.niveau} />
    </div>
  )
}
