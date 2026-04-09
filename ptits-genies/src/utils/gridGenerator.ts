import type { ThemeWordPool, GeneratedGrid, DifficultyEntry } from '@/types'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function getTargetCount(difficulty: number): number {
  switch (difficulty) {
    case 1: return Math.floor(Math.random() * 3) + 2      // 2-4
    case 2: return Math.floor(Math.random() * 2) + 2      // 2-3
    case 3: return Math.random() < 0.2 ? 0 : Math.floor(Math.random() * 3) + 1  // 0-3
    case 4: return Math.random() < 0.3 ? 0 : Math.floor(Math.random() * 2) + 1  // 0-2
    case 5: return Math.random() < 0.4 ? 0 : Math.floor(Math.random() * 2) + 1  // 0-2
    case 6: return Math.random() < 0.5 ? 0 : 1            // 0-1
    default: return 1
  }
}

// Determine grid dimensions based on word lengths
function getGridDimensions(entry: DifficultyEntry): { rows: number; cols: number } {
  const allWords = [entry.targetWord, ...entry.distractors, ...entry.fillerWords]
  const maxLen = Math.max(...allWords.map((w) => w.length))

  if (maxLen <= 8) return { rows: 10, cols: 6 }     // 60 cells
  if (maxLen <= 12) return { rows: 12, cols: 5 }     // 60 cells
  return { rows: 15, cols: 4 }                        // 60 cells
}

function generateGrid(entry: DifficultyEntry, difficulty: number): GeneratedGrid {
  const targetCount = getTargetCount(difficulty)
  const { rows: ROWS, cols: COLS } = getGridDimensions(entry)
  const TOTAL = ROWS * COLS

  // Build flat array of words
  const words: string[] = Array(targetCount).fill(entry.targetWord)
  const distractors = shuffle(entry.distractors)
  const fillers = shuffle(entry.fillerWords)
  const pool = [...distractors, ...fillers]

  let i = 0
  while (words.length < TOTAL && i < pool.length) {
    if (pool[i] !== entry.targetWord) words.push(pool[i])
    i++
  }
  // If still not enough, repeat distractors
  while (words.length < TOTAL) {
    words.push(pool[Math.floor(Math.random() * pool.length)])
  }

  const shuffled = shuffle(words.slice(0, TOTAL))

  // Reshape into rows x cols
  const cells: string[][] = []
  for (let r = 0; r < ROWS; r++) {
    cells.push(shuffled.slice(r * COLS, r * COLS + COLS))
  }

  // Record target positions
  const targetPositions: [number, number][] = []
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (cells[r][c] === entry.targetWord) {
        targetPositions.push([r, c])
      }
    }
  }

  return { difficulty, targetWord: entry.targetWord, cells, targetPositions, targetCount }
}

export function generateSession(theme: ThemeWordPool): GeneratedGrid[] {
  const usedWords = new Set<string>()
  const grids: GeneratedGrid[] = []

  for (let diff = 1; diff <= 6; diff++) {
    const pool = theme.levels[diff - 1]
    const available = pool.filter((e) => !usedWords.has(e.targetWord))
    const entry = available.length > 0
      ? available[Math.floor(Math.random() * available.length)]
      : pool[Math.floor(Math.random() * pool.length)]
    usedWords.add(entry.targetWord)
    grids.push(generateGrid(entry, diff))
  }

  return grids
}
