// ─── Word Search ─────────────────────────────────────────────────────
export function calcWordSearchGridScore(params: {
  correctSelections: number
  missedTargets: number
  wrongSelections: number
  totalTargets: number
  usedNoWordButton: boolean
  noWordWasCorrect: boolean
}): number {
  const { correctSelections, missedTargets, wrongSelections, totalTargets, usedNoWordButton, noWordWasCorrect } = params

  // Zero-occurrence grid: only "Il n'y a pas le mot" scores points
  if (totalTargets === 0) {
    if (usedNoWordButton && noWordWasCorrect) {
      // Correct: 200 pts minus penalties for wrong clicks
      return Math.max(0, 200 - wrongSelections * 25)
    }
    // Did not press the button, or pressed it incorrectly: 0
    return 0
  }

  // Grid with targets: score is proportional to correct finds
  if (correctSelections === 0) return 0

  const accuracy = correctSelections / totalTargets // 0..1
  let score = Math.round(200 * accuracy)
  score -= wrongSelections * 25
  score -= missedTargets * 30
  if (usedNoWordButton && !noWordWasCorrect) score -= 50
  return Math.max(0, score)
}

export function calcWordSearchTimeBonus(elapsedSeconds: number): number {
  const IDEAL = 120
  const MAX = 600
  const factor = Math.max(0, (MAX - elapsedSeconds) / (MAX - IDEAL))
  return Math.floor(200 * factor)
}

// ─── L'Intrus ────────────────────────────────────────────────────────
export function calcIntrusScore(correct: boolean, secondsRemaining: number): number {
  if (!correct) return 0
  return 50 + secondsRemaining * 2
}

// ─── Lecture Rapide ──────────────────────────────────────────────────
export function calcLectureScore(correctAnswers: number, multiplier: number, level: number): number {
  return Math.round(correctAnswers * 100 * multiplier * level)
}

// ─── Coup d'œil ──────────────────────────────────────────────────────
export function calcCoupDoeilScore(params: {
  correctCategorizations: number
  wrongCategorizations: number
  missedTargets: number
  falseAlarms: number
  totalTargets: number
}): number {
  const { correctCategorizations, wrongCategorizations, missedTargets, falseAlarms, totalTargets } = params
  let score = correctCategorizations * 50
  score -= wrongCategorizations * 20
  score -= missedTargets * 15
  score -= falseAlarms * 10
  if (
    wrongCategorizations === 0 &&
    missedTargets === 0 &&
    falseAlarms === 0 &&
    correctCategorizations === totalTargets
  ) {
    score += 60
  }
  return Math.max(0, score)
}

export function calcCoupDoeilTimeBonus(elapsedSeconds: number): number {
  const IDEAL = 90
  const MAX = 480
  if (elapsedSeconds <= IDEAL) return 200
  const factor = Math.max(0, (MAX - elapsedSeconds) / (MAX - IDEAL))
  return Math.floor(200 * factor)
}

// ─── Phrases brouillées ───────────────────────────────────────────────
export function calcPhrasesBrouilleesScore(params: {
  correctAnswers: number
  totalGaps: number
  elapsedSeconds: number
  wrongAnswers: number
}): {
  totalScore: number
  accuracyScore: number
  timeBonus: number
  perfectBonus: number
} {
  const { correctAnswers, totalGaps, elapsedSeconds, wrongAnswers } = params
  if (totalGaps <= 0) {
    return { totalScore: 0, accuracyScore: 0, timeBonus: 0, perfectBonus: 0 }
  }

  const accuracyRatio = Math.min(1, Math.max(0, correctAnswers / totalGaps))
  const baseAccuracy = Math.round(800 * accuracyRatio)
  const penalty = wrongAnswers * 20
  const accuracyScore = Math.max(0, baseAccuracy - penalty)

  const IDEAL = 90
  const MAX = 900
  const timeFactor = Math.max(0, (MAX - elapsedSeconds) / (MAX - IDEAL))
  const timeBonus = Math.floor(150 * timeFactor)

  const perfectBonus = correctAnswers === totalGaps && wrongAnswers === 0 ? 50 : 0
  const totalScore = Math.max(0, Math.min(1000, accuracyScore + timeBonus + perfectBonus))

  return { totalScore, accuracyScore, timeBonus, perfectBonus }
}

export function calcPhrasesBrouilleesStars(score: number): 0 | 1 | 2 | 3 {
  if (score >= 850) return 3
  if (score >= 650) return 2
  if (score >= 400) return 1
  return 0
}

// ─── Collection de mots ───────────────────────────────────────────────
// Level multipliers: débutant ×1.0, intermédiaire ×1.6, professionnel ×2.5
// This ensures a professional player always scores higher than a beginner at equal error rate.
const COLLECTION_LEVEL_MULTIPLIER: Record<1 | 2 | 3, number> = {
  1: 1.0,
  2: 1.6,
  3: 2.5,
}

// Ideal times and max times per level
const COLLECTION_IDEAL_SECONDS: Record<1 | 2 | 3, number> = {
  1: 90,
  2: 120,
  3: 180,
}
const COLLECTION_MAX_SECONDS: Record<1 | 2 | 3, number> = {
  1: 300,
  2: 480,
  3: 720,
}

export function calcCollectionScore(params: {
  correctAnswers: number
  wrongAnswers: number
  totalItems: number
  elapsedSeconds: number
  level: 1 | 2 | 3
}): {
  totalScore: number
  accuracyScore: number
  timeBonus: number
  levelMultiplierBonus: number
} {
  const { correctAnswers, wrongAnswers, totalItems, elapsedSeconds, level } = params
  if (totalItems <= 0) {
    return { totalScore: 0, accuracyScore: 0, timeBonus: 0, levelMultiplierBonus: 0 }
  }

  const multiplier = COLLECTION_LEVEL_MULTIPLIER[level]

  // Accuracy: base 500 pts * multiplier, minus 40 pts per wrong answer
  const accuracyRatio = Math.min(1, Math.max(0, correctAnswers / totalItems))
  const baseAccuracy = Math.round(500 * accuracyRatio)
  const penalty = wrongAnswers * 40
  const accuracyScore = Math.max(0, baseAccuracy - penalty)

  // Time bonus: base 300 pts, scaled linearly between IDEAL and MAX
  const IDEAL = COLLECTION_IDEAL_SECONDS[level]
  const MAX = COLLECTION_MAX_SECONDS[level]
  const timeFactor = elapsedSeconds <= IDEAL
    ? 1
    : Math.max(0, (MAX - elapsedSeconds) / (MAX - IDEAL))
  const timeBonus = Math.floor(300 * timeFactor)

  // Level multiplier bonus applied on top of accuracy+time
  const rawScore = accuracyScore + timeBonus
  const levelMultiplierBonus = Math.round(rawScore * (multiplier - 1))

  const totalScore = Math.max(0, Math.min(2000, rawScore + levelMultiplierBonus))

  return { totalScore, accuracyScore, timeBonus, levelMultiplierBonus }
}

export function calcCollectionStars(score: number, level: 1 | 2 | 3): 0 | 1 | 2 | 3 {
  // Thresholds scale with level to keep stars meaningful
  const thresholds: Record<1 | 2 | 3, [number, number, number]> = {
    1: [300, 550, 700],
    2: [480, 880, 1120],
    3: [750, 1375, 1750],
  }
  const [one, two, three] = thresholds[level]
  if (score >= three) return 3
  if (score >= two) return 2
  if (score >= one) return 1
  return 0
}
