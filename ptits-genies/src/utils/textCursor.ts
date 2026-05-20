export interface TextCursorOptions {
  words: string[]
  wpm: number
  onWordMasked: (index: number) => void
  onComplete: () => void
}

export interface TextCursorHandle {
  stop: () => void
  /** Current masked index at call time (-1 if no word masked yet). */
  getCurrentIndex: () => number
}

export function startTextCursor(options: TextCursorOptions): TextCursorHandle {
  const { words, wpm, onWordMasked, onComplete } = options
  const msPerWord = (60 / wpm) * 1000
  const startTime = performance.now()
  let lastFrameTime = startTime
  let lastEmittedIndex = -1
  let rafId: number
  let cancelled = false
  let pausedOffset = 0

  function loop(timestamp: number) {
    if (cancelled) return

    const delta = timestamp - lastFrameTime
    if (delta > 500) {
      pausedOffset += delta
    }
    lastFrameTime = timestamp

    const elapsed = timestamp - startTime - pausedOffset
    // Word N stays visible during the window [N*msPerWord, (N+1)*msPerWord].
    // So the last index that should already be masked at `elapsed` is floor(elapsed/msPerWord) - 1.
    const targetIndex = Math.min(Math.floor(elapsed / msPerWord) - 1, words.length - 1)

    while (lastEmittedIndex < targetIndex) {
      lastEmittedIndex++
      onWordMasked(lastEmittedIndex)
    }

    if (lastEmittedIndex >= words.length - 1) {
      onComplete()
      return
    }

    rafId = requestAnimationFrame(loop)
  }

  rafId = requestAnimationFrame(loop)
  return {
    stop: () => {
      cancelled = true
      cancelAnimationFrame(rafId)
    },
    getCurrentIndex: () => lastEmittedIndex,
  }
}
