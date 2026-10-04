import { Bouton } from '@/components/ui/Bouton'
import { BoutonMot } from '@/components/ui/BoutonMot'
import { cn } from '@/lib/cn'
import type { Tuile } from './logique'

// Écran « Forge » : le mot a disparu ; l'élève clique les tuiles de syllabes dans l'ordre.
// Les tuiles déjà posées s'affichent sur l'enclume ; « Retirer la dernière » permet de corriger avant de valider.

interface ForgeProps {
  tuiles: readonly Tuile[]
  /** Clés des tuiles posées, dans l'ordre. */
  posees: readonly string[]
  onPoser: (cle: string) => void
  onRetirer: () => void
  /** Après validation : syllabes attendues (affichage de la correction). */
  correction?: readonly string[]
}

export function Forge({ tuiles, posees, onPoser, onRetirer, correction }: ForgeProps) {
  const parCle = new Map(tuiles.map((t) => [t.cle, t]))
  const textesPoses = posees.map((c) => parCle.get(c)?.texte ?? '')
  const fini = !!correction

  return (
    <div className="space-y-5">
      {/* Enclume : syllabes posées */}
      <div
        aria-live="polite"
        aria-label="Mot en cours de forge"
        className="flex min-h-20 flex-wrap items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-encre bg-sable p-3"
      >
        {posees.length === 0 && <span className="text-lg font-semibold text-encre-doux">Clique les syllabes dans l'ordre 🔨</span>}
        {textesPoses.map((texte, k) => {
          const juste = correction ? correction[k] === texte : null
          return (
            <span
              key={`${posees[k]}-${k}`}
              className={cn(
                'rounded-xl border-2 border-encre px-3 py-1.5 font-texte text-3xl font-bold tracking-widest text-encre shadow-dur-sm',
                juste === null ? (k % 2 === 0 ? 'bg-jaune' : 'bg-bleu') : juste ? 'bg-juste' : 'bg-faux',
              )}
            >
              {texte}
            </span>
          )
        })}
      </div>

      {!fini && (
        <>
          <div className="flex flex-wrap justify-center gap-3">
            {tuiles.map((t) => {
              const utilisee = posees.includes(t.cle)
              return (
                <BoutonMot
                  key={t.cle}
                  disabled={utilisee}
                  onClick={() => !utilisee && onPoser(t.cle)}
                  aria-label={`Syllabe ${t.texte}`}
                  className={cn('min-w-20 text-2xl tracking-widest', utilisee && 'opacity-30')}
                >
                  {t.texte}
                </BoutonMot>
              )
            })}
          </div>
          <div className="flex justify-center">
            <Bouton variante="secondaire" onClick={onRetirer} disabled={posees.length === 0}>
              ↩️ Retirer la dernière syllabe
            </Bouton>
          </div>
        </>
      )}
    </div>
  )
}
