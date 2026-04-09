import type { CoupDoeilThemeKey } from '@/types'

interface Props {
  themes: Record<CoupDoeilThemeKey, string>
}

const THEME_STYLES: Record<CoupDoeilThemeKey, { bg: string; border: string; text: string; label: string }> = {
  a: { bg: 'bg-blue-100',   border: 'border-blue-300',   text: 'text-blue-700',   label: 'a' },
  b: { bg: 'bg-green-100',  border: 'border-green-300',  text: 'text-green-700',  label: 'b' },
  c: { bg: 'bg-orange-100', border: 'border-orange-300', text: 'text-orange-700', label: 'c' },
}

export function ThemeHeader({ themes }: Props) {
  return (
    <div className="flex flex-col sm:flex-row gap-2 w-full mb-4">
      {(['a', 'b', 'c'] as CoupDoeilThemeKey[]).map((key) => {
        const s = THEME_STYLES[key]
        return (
          <div
            key={key}
            className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-xl border-2 ${s.bg} ${s.border}`}
          >
            <span className={`font-black text-sm w-5 h-5 flex items-center justify-center rounded-full bg-white border-2 ${s.border} ${s.text}`}>
              {s.label}
            </span>
            <span className={`text-sm font-bold ${s.text} leading-tight`}>{themes[key]}</span>
          </div>
        )
      })}
    </div>
  )
}
