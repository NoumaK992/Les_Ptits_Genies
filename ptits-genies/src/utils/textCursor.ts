export interface TextCursorOptions {
  words: string[]
  wpm: number
  onWordMasked: (index: number) => void
  onComplete: () => void
}

export function startTextCursor(options: TextCursorOptions): () => void {
  const { words, wpm, onWordMasked, onComplete } = options
  const msPerWord = (60 / wpm) * 1000
  let wordIndex = 0
  let lastTime: number | null = null
  let rafId: number
  let accumulated = 0

  function loop(timestamp: number) {
    if (lastTime === null) lastTime = timestamp
    accumulated += timestamp - lastTime
    lastTime = timestamp

    while (accumulated >= msPerWord && wordIndex < words.length) {
      accumulated -= msPerWord
      onWordMasked(wordIndex)
      wordIndex++
    }

    if (wordIndex >= words.length) {
      onComplete()
      return
    }

    rafId = requestAnimationFrame(loop)
  }

  rafId = requestAnimationFrame(loop)
  return () => cancelAnimationFrame(rafId)
}
