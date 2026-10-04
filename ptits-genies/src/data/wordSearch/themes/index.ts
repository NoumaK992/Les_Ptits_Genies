import type { ThemeWordPool, WordSearchTheme } from '@/types'
import { animauxTheme } from './animaux'
import { couleursTheme } from './couleurs'
import { sciencesTheme } from './sciences'
import { histoireTheme } from './histoire'
import { geographieTheme } from './geographie'
import { artsTheme } from './arts'
import { litteratureTheme } from './litterature'
import { natureTheme } from './nature'
import { sportTheme } from './sport'
import { cuisineTheme } from './cuisine'
import { metiersTheme } from './metiers'
import { corpsTheme } from './corps'
import { musiqueTheme } from './musique'
import { transportsTheme } from './transports'
import { maisonTheme } from './maison'
import { ecoleTheme } from './ecole'
import { meteoTheme } from './meteo'
import { espaceTheme } from './espace'
import { merTheme } from './mer'
import { jeuxTheme } from './jeux'
import { technologieTheme } from './technologie'
import { emotionsTheme } from './emotions'
import { vetementsTheme } from './vetements'
import { fruitsLegumesTheme } from './fruits-legumes'

export const ALL_THEMES: ThemeWordPool[] = [
  animauxTheme,
  couleursTheme,
  sciencesTheme,
  histoireTheme,
  geographieTheme,
  artsTheme,
  litteratureTheme,
  natureTheme,
  sportTheme,
  cuisineTheme,
  metiersTheme,
  corpsTheme,
  musiqueTheme,
  transportsTheme,
  maisonTheme,
  ecoleTheme,
  meteoTheme,
  espaceTheme,
  merTheme,
  jeuxTheme,
  technologieTheme,
  emotionsTheme,
  vetementsTheme,
  fruitsLegumesTheme,
]

export const THEME_LIST: WordSearchTheme[] = ALL_THEMES.map((t) => t.theme)

export function getThemeById(id: string): ThemeWordPool | undefined {
  return ALL_THEMES.find((t) => t.theme.id === id)
}
