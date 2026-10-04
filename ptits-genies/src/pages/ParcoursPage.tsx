import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useParcoursStore } from '@/store/parcoursStore'
import {
  NB_NIVEAUX, NOMS_JEUX, estTermine, jeuDuNiveau, lienPartie, seuilBoss, tourDuNiveau,
} from '@/parcours/regles'
import { Bouton, classesBouton } from '@/components/ui/Bouton'
import { Carte } from '@/components/ui/Carte'
import { EnTete } from '@/components/ui/EnTete'
import { Etiquette } from '@/components/ui/Etiquette'
import { cn } from '@/lib/cn'

const BANNIERES = {
  'jeu-termine': 'Bien joué ! Place au boss 👾',
  'boss-battu': 'Boss vaincu ! +100 points 🎉',
  'boss-rate': 'Le boss a résisté ! Il sera plus faible au prochain essai.',
} as const

const CASE = 'flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-2xl border-2 border-encre p-3 text-center sm:p-4'

export default function ParcoursPage() {
  const { currentUser } = useAuthStore()
  const { userId, etat, charge, echecChargement, erreur, dernierEvenement, charger, rejoindre, oublierEvenement } = useParcoursStore()
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [envoi, setEnvoi] = useState(false)

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

  const jeu = jeuDuNiveau(etat.place, etat.niveau)
  const tour = tourDuNiveau(etat.niveau)
  const surBoss = etat.etape === 'boss'
  const banniere = dernierEvenement && dernierEvenement !== 'parcours-termine' ? BANNIERES[dernierEvenement] : null

  const jouer = () => {
    oublierEvenement()
    navigate(lienPartie(etat))
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <EnTete titre="🗺️ Mon parcours" retourVers="/accueil" />

      {erreur && (
        <p role="alert" className="rounded-2xl border-2 border-encre bg-faux p-4 font-semibold text-encre">⚠️ {erreur}</p>
      )}
      {banniere && (
        <p
          role="status"
          className={cn(
            'rounded-2xl border-2 border-encre p-4 text-center font-titre text-xl text-encre shadow-dur-sm',
            dernierEvenement === 'boss-rate' ? 'bg-rose-pale' : 'bg-juste',
          )}
        >
          {banniere}
        </p>
      )}

      <Carte className="p-6 md:p-8">
        <Etiquette>Niveau {etat.niveau} · Tour {tour}</Etiquette>
        <div className="mt-6 flex items-stretch gap-3">
          <div className={cn(CASE, surBoss ? 'bg-juste' : 'bg-jaune shadow-dur')}>
            <span className="text-3xl" aria-hidden="true">🎮</span>
            <span className="break-words font-titre text-base text-encre sm:text-lg">{NOMS_JEUX[jeu]}</span>
            {surBoss &&<span className="font-semibold text-encre">✓ Fait</span>}
          </div>
          <span className="self-center font-titre text-2xl text-encre" aria-hidden="true">→</span>
          <div className={cn(CASE, surBoss ? 'bg-jaune shadow-dur' : 'bg-papier')}>
            <span className="text-3xl" aria-hidden="true">👾</span>
            <span className="font-titre text-lg text-encre">Boss</span>
            <span className="text-sm text-encre-doux">{NOMS_JEUX[jeu]} en plus dur</span>
          </div>
        </div>

        {surBoss && (
          <p className="mt-5 text-center text-lg font-semibold text-encre">
            Objectif : {Math.round(seuilBoss(etat.echecsBoss) * 100)} % de bonnes réponses
          </p>
        )}

        <div className="mt-6 flex justify-center">
          <Bouton taille="grand" onClick={jouer}>
            {!surBoss ? 'Jouer ▶' : etat.echecsBoss > 0 ? 'Retenter le boss ▶' : 'Affronter le boss ▶'}
          </Bouton>
        </div>
      </Carte>

      <Carte className="p-5">
        <h2 className="mb-3 font-titre text-lg text-encre">Mon chemin</h2>
        <ol className="flex flex-wrap items-center gap-2">
          {Array.from({ length: NB_NIVEAUX }, (_, i) => i + 1).map((n) => {
            const statut = n < etat.niveau ? 'fait' : n === etat.niveau ? 'en cours' : 'à venir'
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
    </div>
  )
}
