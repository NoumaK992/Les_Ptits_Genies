import { BoutonMot, type EtatMot } from '@/components/ui/BoutonMot'

interface Props {
  word: string
  onClick: () => void
  state: 'idle' | 'correct' | 'wrong' | 'revealed'
  disabled?: boolean
  size?: 'sm' | 'md'
}

// idle → normal, correct → juste (✓), wrong → faux (✗).
// « revealed » (l'intrus que l'élève n'a pas trouvé) n'a pas d'équivalent dans
// BoutonMot : on le montre en jaune, avec un doigt pointé en plus de la couleur.
const ETATS: Record<Props['state'], EtatMot> = {
  idle: 'normal',
  correct: 'juste',
  wrong: 'faux',
  revealed: 'normal',
}

export function IntrusWordChip({ word, onClick, state, disabled, size = 'md' }: Props) {
  const revele = state === 'revealed'
  return (
    <BoutonMot
      etat={ETATS[state]}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={[
        'max-w-full break-words select-none',
        size === 'sm' ? 'px-3 text-base' : '',
        revele ? 'bg-jaune hover:bg-jaune' : '',
        state === 'idle' && !disabled ? 'cursor-pointer' : 'cursor-default',
      ].join(' ')}
    >
      {revele && <span aria-hidden="true">👉</span>}
      {word}
      {revele && <span className="sr-only">(c'était l'intrus)</span>}
    </BoutonMot>
  )
}
