// ─── User & Auth ────────────────────────────────────────────────────
export interface User {
  id: string
  username: string
  passwordHash: string
  salt: string
  totalPoints: number
  createdAt: string
}

export interface AuthUser {
  id: string
  username: string
  totalPoints: number
}

// ─── Sessions & Progress ────────────────────────────────────────────
export type ExerciseType = 'word-search' | 'intrus' | 'lecture-rapide' | 'coup-doeil' | 'phrases-brouillees' | 'collection'

export interface Session {
  id: string
  userId: string
  exerciseType: ExerciseType
  score: number
  duration: number
  playedAt: string
  details: SessionDetails
}

export type SessionDetails =
  | WordSearchSessionDetails
  | IntrusSessionDetails
  | LectureRapideSessionDetails
  | CoupDoeilSessionDetails
  | PhrasesBrouilleesSessionDetails
  | CollectionSessionDetails

export interface WordSearchSessionDetails {
  type: 'word-search'
  theme: string
  gridsCompleted: number
  totalCorrectSelections: number
  totalMissedTargets: number
  totalWrongSelections: number
  totalElapsedSeconds: number
}

export interface IntrusSessionDetails {
  type: 'intrus'
  level: number
  correctAnswers: number
  totalLists: number
}

export interface LectureRapideSessionDetails {
  type: 'lecture-rapide'
  level: number
  speedMultiplier: number
  qcmScore: number
  textId: string
}

export interface PhrasesBrouilleesSessionDetails {
  type: 'phrases-brouillees'
  level: PhrasesBrouilleesLevel
  exerciseId: string
  totalGaps: number
  correctAnswers: number
  wrongAnswers: number
  accuracyScore: number
  timeBonus: number
  perfectBonus: number
  stars: 0 | 1 | 2 | 3
  totalElapsedSeconds: number
}

export interface Progress {
  id: string
  userId: string
  exerciseType: ExerciseType
  totalSessions: number
  bestScore: number
  avgScore: number
  lastPlayed: string
}

// ─── Word Search (word-grid based) ──────────────────────────────────
export interface WordSearchTheme {
  id: string
  label: string
  emoji: string
}

export interface DifficultyEntry {
  targetWord: string
  distractors: string[]
  fillerWords: string[]
}

export interface ThemeWordPool {
  theme: WordSearchTheme
  levels: [
    DifficultyEntry[],
    DifficultyEntry[],
    DifficultyEntry[],
    DifficultyEntry[],
    DifficultyEntry[],
    DifficultyEntry[]
  ]
}

export interface GeneratedGrid {
  difficulty: number
  targetWord: string
  cells: string[][]
  targetPositions: [number, number][]
  targetCount: number
}

export interface GridResult {
  gridIndex: number
  targetWord: string
  targetCount: number
  selectedKeys: string[]
  correctSelections: number
  missedTargets: number
  wrongSelections: number
  usedNoWordButton: boolean
  noWordWasCorrect: boolean
  gridScore: number
}

// ─── L'Intrus ────────────────────────────────────────────────────────
export interface IntrusList {
  id: string
  intruder: string
  pairedWords: string[]
}

export interface IntrusLevel {
  level: number
  timeLimit: number
  lists: IntrusList[]
}

// ─── Lecture Rapide ──────────────────────────────────────────────────
export interface QCMQuestion {
  question: string
  options: [string, string, string, string]
  correctIndex: 0 | 1 | 2 | 3
}

export interface LectureText {
  id: string
  title: string
  genre: string
  level: 1 | 2 | 3
  text: string
  qcm: QCMQuestion[]
}

export interface SpeedOption {
  id: string
  label: string
  emoji: string
  wpm: number
  multiplier: number
}

// ─── Phrases brouillées ───────────────────────────────────────────────
export type PhrasesBrouilleesLevel = 1 | 2 | 3

export interface ChoiceItem {
  letter: string
  text: string
}

export interface GapItem {
  number: number
  answerLetter: string
}

export type PhrasesSegment =
  | { type: 'text'; value: string }
  | { type: 'gap'; number: number }

export interface PhrasesBrouilleesExercise {
  id: string
  title: string
  source?: string
  level: PhrasesBrouilleesLevel
  segments: PhrasesSegment[]
  choices: ChoiceItem[]
  gaps: GapItem[]
}

// ─── Coup d'œil ──────────────────────────────────────────────────────
export type CoupDoeilThemeKey = 'a' | 'b' | 'c'

export interface CoupDoeilWord {
  id: string
  text: string
  theme: CoupDoeilThemeKey | null
}

export interface CoupDoeilSeries {
  id: number
  label: string
  themes: Record<CoupDoeilThemeKey, string>
  columns: [CoupDoeilWord[], CoupDoeilWord[], CoupDoeilWord[]]
}

export interface CoupDoeilSessionDetails {
  type: 'coup-doeil'
  seriesId: number
  correctCategorizations: number
  wrongCategorizations: number
  missedTargets: number
  falseAlarms: number
  totalElapsedSeconds: number
}

// ─── Dashboard / Badges ──────────────────────────────────────────────
export interface BadgeContext {
  sessions: Session[]
  totalPoints: number
  progress: Progress[]
  streak: number
}

export interface Badge {
  id: string
  label: string
  emoji: string
  description: string
  condition: (ctx: BadgeContext) => boolean
}

// ─── Collection de mots ───────────────────────────────────────────────
export type CollectionLevel = 1 | 2 | 3

export interface CollectionItem {
  id: string
  words: string[]
  genericTerm: string
  distractors: string[]
}

export interface CollectionSessionDetails {
  type: 'collection'
  level: CollectionLevel
  totalItems: number
  correctAnswers: number
  wrongAnswers: number
  accuracyScore: number
  timeBonus: number
  levelMultiplierBonus: number
  stars: 0 | 1 | 2 | 3
  totalElapsedSeconds: number
}
