import { useState, useEffect, useRef } from 'react'
import { startTextCursor } from '@/utils/textCursor'
import type { TextCursorHandle } from '@/utils/textCursor'

// Le curseur ne démarre qu'une fois la police du texte chargée : si elle arrivait
// en pleine lecture, le texte serait recomposé et des mots changeraient de ligne.
// Au-delà de 3 s on démarre quand même (police indisponible : on lit avec celle de secours).
function attendrePolice(): Promise<void> {
  if (!('fonts' in document)) return Promise.resolve()
  const chargee = document.fonts.load('500 1em Lexend').then(() => undefined, () => undefined)
  const delai = new Promise<void>((resolve) => setTimeout(resolve, 3000))
  return Promise.race([chargee, delai])
}

interface Props {
  text: string
  wpm: number
  onComplete: () => void
  onIndexChange?: (currentMaskedIndex: number) => void
}

export function TextMask({ text, wpm, onComplete, onIndexChange }: Props) {
  const words = text.split(/\s+/)
  const [maskedUpTo, setMaskedUpTo] = useState(-1)
  const [policeChargee, setPoliceChargee] = useState(false)
  const handleRef = useRef<TextCursorHandle | null>(null)

  useEffect(() => {
    let annule = false
    attendrePolice().then(() => {
      if (annule) return
      setPoliceChargee(true)
      handleRef.current = startTextCursor({
        words,
        wpm,
        onWordMasked: (i) => {
          setMaskedUpTo(i)
          onIndexChange?.(i)
        },
        onComplete,
      })
    })
    return () => {
      annule = true
      handleRef.current?.stop()
    }
  }, [])

  return (
    <div
      className={`leading-relaxed text-2xl md:text-3xl text-encre font-medium select-none ${policeChargee ? '' : 'invisible'}`}
    >
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
