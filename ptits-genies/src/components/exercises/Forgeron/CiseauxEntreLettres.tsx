import { Fragment } from 'react'
import { cn } from '@/lib/cn'

// Un mot affiché en grandes lettres espacées ; entre deux lettres, une zone cliquable
// (au moins 32 px de large sur ordinateur) pose ou retire une coupure. Des ciseaux apparaissent au survol.
// Position p (1 … mot.length - 1) = coupure juste avant la lettre d'indice p.
// Composant réutilisable : il ne sait rien des syllabes, il affiche et signale les clics.

export type EtatCoupure = 'juste' | 'fausse' | 'manquee'

interface CiseauxEntreLettresProps {
  mot: string
  /** Positions des coupures posées par l'élève. */
  coupures: readonly number[]
  /** Clic sur une zone entre deux lettres : poser ou retirer la coupure à cette position. */
  onBasculer: (position: number) => void
  desactive?: boolean
  /** Après validation : positions attendues. Les coupures passent en vert (justes), rouge (fausses) ou pointillé (manquées). */
  correction?: readonly number[]
  className?: string
}

export function etatCoupure(position: number, coupures: readonly number[], correction: readonly number[]): EtatCoupure | null {
  const posee = coupures.includes(position)
  const attendue = correction.includes(position)
  if (posee && attendue) return 'juste'
  if (posee) return 'fausse'
  if (attendue) return 'manquee'
  return null
}

export function CiseauxEntreLettres({ mot, coupures, onBasculer, desactive, correction, className }: CiseauxEntreLettresProps) {
  const lettres = [...mot]
  return (
    <div role="group" aria-label={`Mot à couper : ${mot}`} className={cn('flex flex-wrap items-stretch justify-center', className)}>
      {lettres.map((lettre, i) => (
        <Fragment key={i}>
          {i > 0 && (
            <ZoneCoupure
              position={i}
              avant={lettres[i - 1]}
              apres={lettre}
              posee={coupures.includes(i)}
              etat={correction ? etatCoupure(i, coupures, correction) : undefined}
              desactive={desactive || !!correction}
              onBasculer={onBasculer}
            />
          )}
          <span aria-hidden="true" className="flex select-none items-center font-texte text-[1.75rem] font-bold text-encre sm:text-4xl lg:text-[2.75rem]">
            {lettre}
          </span>
        </Fragment>
      ))}
      <span className="sr-only">{mot}</span>
    </div>
  )
}

interface ZoneCoupureProps {
  position: number
  avant: string
  apres: string
  posee: boolean
  etat?: EtatCoupure | null
  desactive?: boolean
  onBasculer: (position: number) => void
}

function ZoneCoupure({ position, avant, apres, posee, etat, desactive, onBasculer }: ZoneCoupureProps) {
  const libelleEtat = etat === 'juste' ? ' (coupure juste)' : etat === 'fausse' ? ' (coupure en trop)' : etat === 'manquee' ? ' (coupure oubliée)' : ''
  return (
    <button
      type="button"
      onClick={() => onBasculer(position)}
      disabled={desactive}
      aria-pressed={posee}
      aria-label={`Couper entre ${avant} et ${apres}${libelleEtat}`}
      className={cn(
        'group relative flex h-14 w-4 shrink-0 items-center justify-center rounded-lg sm:h-16 sm:w-6 md:h-20 md:w-8',
        'focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-1 focus-visible:outline-bleu',
        !desactive && 'cursor-pointer hover:bg-jaune/40',
        'disabled:cursor-default',
      )}
    >
      {etat === undefined && posee && <span aria-hidden="true" className="h-full w-1.5 rounded-full bg-rose" />}
      {etat === 'juste' && <span aria-hidden="true" className="h-full w-1.5 rounded-full bg-juste" />}
      {etat === 'fausse' && (
        <>
          <span aria-hidden="true" className="h-full w-1.5 rounded-full bg-faux" />
          <span aria-hidden="true" className="absolute -bottom-6 font-titre text-base text-faux-fonce">✗</span>
        </>
      )}
      {etat === 'manquee' && <span aria-hidden="true" className="h-full w-0 border-l-4 border-dashed border-juste-fonce" />}
      {etat === undefined && !posee && !desactive && (
        <span aria-hidden="true" className="pointer-events-none absolute -top-5 text-lg opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 md:-top-6 md:text-xl">
          ✂️
        </span>
      )}
      {etat === undefined && !posee && !desactive && (
        <span aria-hidden="true" className="h-1/2 w-0 border-l-2 border-dotted border-encre/20 group-hover:border-encre/60" />
      )}
    </button>
  )
}
