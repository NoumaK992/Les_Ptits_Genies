import type { EtatParcours } from '@/parcours/regles'

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
export type ExerciseType = 'word-search' | 'intrus' | 'lecture-rapide' | 'coup-doeil' | 'phrases-brouillees' | 'collection' | 'ami-ennemi' | 'vrai-absurde' | 'forgeron' | 'labyrinthe' | 'coupe-mots' | 'racines'

export interface Session {
  id: string
  userId: string
  exerciseType: ExerciseType
  score: number
  duration: number
  playedAt: string
  details: SessionDetails
}

export type SessionDetails = (
  | WordSearchSessionDetails
  | IntrusSessionDetails
  | LectureRapideSessionDetails
  | CoupDoeilSessionDetails
  | PhrasesBrouilleesSessionDetails
  | CollectionSessionDetails
  | AmiEnnemiSessionDetails
  | NouveauJeuSessionDetails
) & {
  /** Taux de bonnes réponses de la partie, entre 0 et 1 (succès « Sans faute ! »). Absent des parties anciennes. */
  reussite?: number
  /** Partie lancée depuis le parcours ou en entraînement libre (points réduits). */
  mode?: 'parcours' | 'libre'
  /** Points réellement ajoutés au total de l'élève pour cette partie. */
  pointsGagnes?: number
}

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
  /** Niveau de difficulté de la série (1 = mots courts … 4 = locutions longues). */
  difficulte: 1 | 2 | 3 | 4
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
  /** État du parcours de l'élève (null s'il n'a pas encore saisi de code). */
  parcours?: EtatParcours | null
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

export interface AmiEnnemiSessionDetails {
  type: 'ami-ennemi'
  niveau: 'debutant' | 'intermediaire' | 'professionnel'
  /** Nombre de manches (séries) de la partie. */
  manches: number
  /** Manches menées au bout sans échec (intrus puis point commun). */
  manchesReussies: number
  erreurs: number
}

/** Détails communs aux jeux issus de la recherche sur la fluence (Vrai ou Absurde, Forgeron, Labyrinthe, Coupe-Mots). */
export interface NouveauJeuSessionDetails {
  type: 'vrai-absurde' | 'forgeron' | 'labyrinthe' | 'coupe-mots' | 'racines'
  niveau: number
  bonnes: number
  total: number
  /** Identifiants des éléments joués (anti-répétition, suivi). */
  items: string[]
  /** Détails propres au jeu (erreurs par type de piège, etc.). */
  extra?: Record<string, unknown>
}
