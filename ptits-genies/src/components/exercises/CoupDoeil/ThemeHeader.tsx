import type { CoupDoeilThemeKey } from '@/types'

interface Props {
  themes: Record<CoupDoeilThemeKey, string>
}

// Une couleur de fond par catégorie, réutilisée par les mots et la sélection de série.
export const FOND_THEME: Record<CoupDoeilThemeKey, string> = {
  a: 'bg-bleu',
  b: 'bg-rose-pale',
  c: 'bg-jaune',
}

export function ThemeHeader({ themes }: Props) {
  return (
    <div className="flex flex-col sm:flex-row gap-2 w-full mb-4">
      {(['a', 'b', 'c'] as CoupDoeilThemeKey[]).map((key) => (
        <div
          key={key}
          className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-xl border-2 border-encre text-encre ${FOND_THEME[key]}`}
        >
          <span className="font-titre text-base w-7 h-7 shrink-0 flex items-center justify-center rounded-full bg-papier border-2 border-encre text-encre">
            {key}
          </span>
          <span className="text-base font-bold text-encre leading-tight">{themes[key]}</span>
        </div>
      ))}
    </div>
  )
}
