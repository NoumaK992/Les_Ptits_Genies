import type { ThemeWordPool, WordSearchTheme } from '@/types'
import { animauxTheme } from './animaux'
import { couleursTheme } from './couleurs'
import { sciencesTheme } from './sciences'
import { histoireTheme } from './histoire'
import { geographieTheme } from './geographie'
import { artsTheme } from './arts'
import { litteratureTheme } from './litterature'
import { natureTheme } from './nature'

export const ALL_THEMES: ThemeWordPool[] = [
  animauxTheme,
  couleursTheme,
  sciencesTheme,
  histoireTheme,
  geographieTheme,
  artsTheme,
  litteratureTheme,
  natureTheme,
]

export const THEME_LIST: WordSearchTheme[] = ALL_THEMES.map((t) => t.theme)

export function getThemeById(id: string): ThemeWordPool | undefined {
  return ALL_THEMES.find((t) => t.theme.id === id)
}
