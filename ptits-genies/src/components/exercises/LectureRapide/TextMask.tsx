import { useState, useEffect, useRef } from 'react'
import { startTextCursor } from '@/utils/textCursor'
import type { TextCursorHandle } from '@/utils/textCursor'

interface Props {
  text: string
  wpm: number
  onComplete: () => void
  onIndexChange?: (currentMaskedIndex: number) => void
}

export function TextMask({ text, wpm, onComplete, onIndexChange }: Props) {
  const words = text.split(/\s+/)
  const [maskedUpTo, setMaskedUpTo] = useState(-1)
  const handleRef = useRef<TextCursorHandle | null>(null)

  useEffect(() => {
    handleRef.current = startTextCursor({
      words,
      wpm,
      onWordMasked: (i) => {
        setMaskedUpTo(i)
        onIndexChange?.(i)
      },
      onComplete,
    })
    return () => handleRef.current?.stop()
  }, [])

  return (
    <div className="leading-relaxed text-2xl md:text-3xl text-ink font-medium select-none">
      {words.map((word, i) => (
        <span
          key={i}
          className={`transition-opacity duration-150 ${i <= maskedUpTo ? 'opacity-0' : 'opacity-100'}`}
        >
          {word}{' '}
        </span>
      ))}
    </div>
  )
}
