import { cn } from '@/lib/cn'
import type { Correction } from './logique'

interface BandeLettresProps {
  lettres: string[]
  /** Positions des traits posés par l'élève (trait d'indice i : entre la lettre i et la lettre i + 1). */
  coupures: ReadonlySet<number>
  onBasculer: (position: number) => void
  /** Présente après « Valider » : les traits prennent la couleur de la correction et ne bougent plus. */
  correction?: Correction | null
}

type EtatFente = 'vide' | 'posee' | 'juste' | 'en-trop' | 'oubliee'

function etatFente(i: number, coupures: ReadonlySet<number>, correction?: Correction | null): EtatFente {
  if (!correction) return coupures.has(i) ? 'posee' : 'vide'
  if (correction.justes.includes(i)) return 'juste'
  if (correction.enTrop.includes(i)) return 'en-trop'
  if (correction.oubliees.includes(i)) return 'oubliee'
  return 'vide'
}

// Trait affiché dans la fente : épais et coloré quand il est posé, à peine visible au survol sinon.
const TRAITS: Record<EtatFente, string> = {
  vide: 'h-8 w-1 bg-transparent group-hover:bg-encre/25',
  posee: 'h-12 w-2 bg-rose border-2 border-encre',
  juste: 'h-12 w-2 bg-juste border-2 border-encre',
  'en-trop': 'h-12 w-2 bg-faux border-2 border-encre',
  oubliee: 'h-12 w-2 bg-jaune border-2 border-dashed border-encre',
}

const LIBELLES: Record<EtatFente, string> = {
  vide: '',
  posee: 'trait posé',
  juste: 'bonne séparation',
  'en-trop': 'séparation en trop',
  oubliee: 'séparation oubliée',
}

// La phrase collée, lettre par lettre, avec une fente cliquable entre chaque paire de lettres.
// Chaque bloc « lettre + fente » reste d'un seul tenant : les retours à la ligne tombent
// toujours après une fente, jamais au milieu d'une lettre.
export function BandeLettres({ lettres, coupures, onBasculer, correction }: BandeLettresProps) {
  const figee = !!correction
  return (
    <div className="flex flex-wrap items-center justify-center gap-y-3" aria-label="Phrase à découper">
      {lettres.map((lettre, i) => {
        const derniere = i === lettres.length - 1
        const etat = derniere ? 'vide' : etatFente(i, coupures, correction)
        const ouverte = etat !== 'vide'
        return (
            <span key={i} className="inline-flex items-center">
              <span className="select-none font-texte text-2xl font-semibold leading-none text-encre sm:text-3xl md:text-4xl" aria-hidden="true">
                {lettre}
              </span>
              {!derniere && (
                <button
                  type="button"
                  disabled={figee}
                  onClick={() => onBasculer(i)}
                  aria-pressed={coupures.has(i)}
                  aria-label={`Séparer « ${lettre} » et « ${lettres[i + 1]} »${LIBELLES[etat] ? ` (${LIBELLES[etat]})` : ''}`}
                  className={cn(
                    'group flex h-14 items-center justify-center rounded-lg transition-[width,background-color] duration-150',
                    'focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-1 focus-visible:outline-bleu',
                    'disabled:cursor-default',
                    ouverte ? 'w-10' : 'w-6 md:w-7',
                    !figee && 'cursor-pointer hover:bg-jaune/40',
                  )}
                >
                  <span aria-hidden="true" className={cn('block rounded-full transition-all duration-150', TRAITS[etat])} />
                </button>
              )}
            </span>
        )
      })}
    </div>
  )
}

/** Légende des couleurs, affichée sous la phrase corrigée. */
export function LegendeCorrection() {
  const elements: { etat: EtatFente; texte: string }[] = [
    { etat: 'juste', texte: 'bien coupé' },
    { etat: 'en-trop', texte: 'coupure en trop' },
    { etat: 'oubliee', texte: 'coupure oubliée' },
  ]
  return (
    <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-base font-semibold text-encre-doux">
      {elements.map(({ etat, texte }) => (
        <li key={etat} className="inline-flex items-center gap-2">
          <span aria-hidden="true" className={cn('inline-block rounded-full', TRAITS[etat], 'h-6')} />
          {texte}
        </li>
      ))}
    </ul>
  )
}
