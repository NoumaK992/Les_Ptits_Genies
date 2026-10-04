import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { BoutonMot, type EtatMot } from '@/components/ui/BoutonMot'
import { Carte } from '@/components/ui/Carte'
import { Bouton } from '@/components/ui/Bouton'
import { cn } from '@/lib/cn'
import type { TexteLabyrinthe } from './logique'

interface Props {
  question: TexteLabyrinthe['question']
  /** Index du choix cliqué, ou null tant que l'élève n'a pas répondu. */
  reponse: number | null
  onRepondre: (index: number) => void
  onTerminer: () => void
  enregistrement: boolean
}

export function QuestionFinale({ question, reponse, onRepondre, onTerminer, enregistrement }: Props) {
  const repondu = reponse !== null
  const juste = reponse === question.bonne
  const ref = useRef<HTMLDivElement>(null)

  // La question apparaît sous le texte : on l'amène à l'écran.
  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <Carte className="space-y-4 p-5 md:p-6">
        <p className="text-base font-bold text-encre-doux">Question sur tout le texte</p>
        <h2 className="font-texte text-xl font-bold leading-relaxed tracking-wide text-encre md:text-2xl">{question.enonce}</h2>
        <div className="flex flex-col gap-3">
          {question.choix.map((c, i) => {
            let etat: EtatMot = 'normal'
            if (repondu) {
              if (i === question.bonne) etat = 'juste'
              else if (i === reponse) etat = 'faux'
            }
            return (
              <BoutonMot
                key={c}
                etat={etat}
                disabled={repondu}
                onClick={() => onRepondre(i)}
                className="w-full justify-between text-left text-xl leading-relaxed tracking-wide"
              >
                <span className="min-w-0 break-words">{c}</span>
              </BoutonMot>
            )
          })}
        </div>
        {repondu && (
          <div
            className={cn('flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-encre p-4 text-encre', juste ? 'bg-juste' : 'bg-faux')}
          >
            <p className="text-lg font-black">{juste ? '✓ Bien compris !' : '✗ Ce n\'était pas ça.'}</p>
            <Bouton onClick={onTerminer} disabled={enregistrement}>
              {enregistrement ? 'Un instant…' : 'Voir mon résultat →'}
            </Bouton>
          </div>
        )}
      </Carte>
    </motion.div>
  )
}
