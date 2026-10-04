import { BoutonMot, type EtatMot } from '@/components/ui/BoutonMot'
import { cn } from '@/lib/cn'
import type { DecoupeRacine } from './logique'

interface AssociationSensProps {
  decoupe: DecoupeRacine
  /** Étiquettes proposées (bons sens + leurres, mélangés). */
  etiquettes: readonly string[]
  /** Étiquette choisie pour chaque morceau (null = pas encore). */
  choix: readonly (string | null)[]
  /** Morceau en cours d'association. */
  actif: number
  onChoisirMorceau: (k: number) => void
  onChoisirEtiquette: (etiquette: string) => void
  correction?: boolean
}

// Associer chaque morceau à son sens par clics successifs (jamais de glisser-déposer) :
// le morceau actif est surligné, un clic sur une étiquette la lui donne, puis on passe au suivant.
export function AssociationSens({ decoupe, etiquettes, choix, actif, onChoisirMorceau, onChoisirEtiquette, correction }: AssociationSensProps) {
  return (
    <div className="space-y-6">
      <ol className="flex flex-wrap items-start justify-center gap-3 md:gap-4" aria-label="Morceaux du mot">
        {decoupe.morceaux.map((morceau, k) => {
          const pris = choix[k]
          const juste = pris === decoupe.sens[k]
          const etat: EtatMot = correction ? (juste ? 'juste' : 'faux') : k === actif ? 'selectionne' : 'normal'
          return (
            <li key={k} className="flex w-36 flex-col items-center gap-2 sm:w-40">
              <BoutonMot
                etat={etat}
                onClick={() => onChoisirMorceau(k)}
                disabled={correction}
                aria-label={`Morceau ${morceau}${pris ? ` : ${pris}` : ''}`}
                className="min-h-14 w-full text-2xl tracking-widest"
              >
                {morceau}
              </BoutonMot>
              <p
                className={cn(
                  'flex min-h-12 w-full items-center justify-center rounded-xl border-2 px-2 py-1 text-center text-base font-semibold leading-snug text-encre',
                  pris ? 'border-encre bg-papier' : 'border-dashed border-encre/40 text-encre-doux',
                )}
              >
                {pris ?? '?'}
              </p>
              {correction && !juste && (
                <p className="text-center text-base font-bold leading-snug text-juste-fonce">→ {decoupe.sens[k]}</p>
              )}
            </li>
          )
        })}
      </ol>

      {!correction && (
        <div>
          <p className="mb-3 text-center text-lg font-bold text-encre">
            Que veut dire « <span className="font-texte tracking-wider">{decoupe.morceaux[actif]}</span> » ?
          </p>
          <ul className="flex flex-wrap justify-center gap-3" aria-label="Étiquettes de sens">
            {etiquettes.map((etiquette) => {
              const utilisee = choix.includes(etiquette)
              return (
                <li key={etiquette}>
                  <BoutonMot
                    onClick={() => onChoisirEtiquette(etiquette)}
                    className={cn('min-h-14 text-lg', utilisee && 'bg-sable opacity-60')}
                    aria-label={`Sens : ${etiquette}${utilisee ? ' (déjà utilisé)' : ''}`}
                  >
                    {etiquette}
                  </BoutonMot>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
