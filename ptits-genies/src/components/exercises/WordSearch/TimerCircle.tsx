interface Props {
  formatted: string
  seconds: number
}

// Chronomètre en pastille. Le fond change avec le temps écoulé
// (texte toujours en encre pour rester lisible sur fond coloré).
export function StopwatchDisplay({ formatted, seconds }: Props) {
  const fond = seconds < 240 ? 'bg-papier' : seconds < 300 ? 'bg-jaune' : 'bg-faux'
  return (
    <div className={`flex items-center gap-2 rounded-full border-2 border-encre px-3 py-1 font-bold text-encre ${fond}`}>
      <span className="text-lg" aria-hidden="true">⏱️</span>
      <span className="text-base tabular-nums">{formatted}</span>
    </div>
  )
}
