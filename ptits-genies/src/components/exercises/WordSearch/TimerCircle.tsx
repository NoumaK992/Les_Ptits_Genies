interface Props {
  formatted: string
  seconds: number
}

export function StopwatchDisplay({ formatted, seconds }: Props) {
  const color = seconds < 240 ? 'text-success' : seconds < 300 ? 'text-accent' : 'text-error'
  return (
    <div className="flex items-center gap-2 bg-white rounded-2xl px-4 py-2 shadow-sm">
      <span className="text-lg">⏱️</span>
      <span className={`font-black text-lg tabular-nums ${color}`}>{formatted}</span>
    </div>
  )
}
