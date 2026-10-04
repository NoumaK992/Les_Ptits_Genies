import { BoutonMot, type EtatMot } from '@/components/ui/BoutonMot'
import { cn } from '@/lib/cn'
import type { CorrectionFamille, FamilleRacine } from './logique'

interface GrilleFamilleProps {
  famille: FamilleRacine
  /** Mots affichés, dans l'ordre (membres et intrus mélangés). */
  grille: readonly string[]
  selection: readonly string[]
  onBasculer: (mot: string) => void
  /** Après « J'ai fini » : la grille se fige et montre la correction. */
  correction?: CorrectionFamille
}

// Grille de mots à cliquer. En correction : membre trouvé ✓, intrus cliqué ✗,
// membre oublié en pointillés, intrus évité grisé.
export function GrilleFamille({ famille, grille, selection, onBasculer, correction }: GrilleFamilleProps) {
  return (
    <ul className="flex flex-wrap justify-center gap-3" aria-label={`Mots à trier pour la racine ${famille.racine}`}>
      {grille.map((mot) => {
        const choisi = selection.includes(mot)
        let etat: EtatMot = choisi ? 'selectionne' : 'normal'
        let classe = ''
        let mention: string | null = null
        if (correction) {
          if (correction.trouves.includes(mot)) etat = 'juste'
          else if (correction.intrusCliques.includes(mot)) etat = 'faux'
          else if (correction.oublies.includes(mot)) {
            etat = 'normal'
            classe = 'border-dashed bg-juste/30'
            mention = 'oublié'
          } else {
            etat = 'normal'
            classe = 'opacity-60'
          }
        }
        return (
          <li key={mot}>
            <BoutonMot
              etat={etat}
              onClick={() => onBasculer(mot)}
              disabled={!!correction}
              className={cn('min-h-14 px-5 text-xl tracking-wide', classe)}
            >
              {mot}
              {mention && <span className="text-base font-bold text-juste-fonce">({mention})</span>}
            </BoutonMot>
          </li>
        )
      })}
    </ul>
  )
}
