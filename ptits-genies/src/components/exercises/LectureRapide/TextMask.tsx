import { useState, useEffect, useRef } from 'react'
import { startTextCursor } from '@/utils/textCursor'

interface Props {
  text: string
  wpm: number
  onComplete: () => void
}

export function TextMask({ text, wpm, onComplete }: Props) {
  const words = text.split(/\s+/)
  const [maskedUpTo, setMaskedUpTo] = useState(-1)
  const stopRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    stopRef.current = startTextCursor({
      words,
      wpm,
      onWordMasked: (i) => setMaskedUpTo(i),
      onComplete,
    })
    return () => stopRef.current?.()
  }, [])

  return (
    <div className="leading-relaxed text-base md:text-lg text-ink font-medium select-none">
      {words.map((word, i) => (
        <span
          key={i}
          className={`transition-opacity duration-200 ${i <= maskedUpTo ? 'opacity-0' : 'opacity-100'}`}
        >
          {word}{' '}
        </span>
      ))}
    </div>
  )
}
