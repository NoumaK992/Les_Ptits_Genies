# Refonte graphique « Vox Collage » : plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal :** donner à toute l'app P'tits Génies le style « Vox Collage » (fond sable, Lexend, ombres noires dures) à partir d'un nuancier central et d'une boîte à outils de composants, sans changer le comportement des jeux.

**Architecture :** une palette unique (`src/theme/couleurs.js`) alimente Tailwind et le code. Sept composants dans `src/components/ui/` encapsulent le style. Chaque page est ensuite reprise une par une pour n'utiliser que ces tokens et composants ; un script de vérification sert de test « rouge/vert » par fichier.

**Tech Stack :** React 19, TypeScript 5.9, Vite 8, Tailwind CSS 3.4, Framer Motion 12, Recharts 3, Playwright (tests visuels via le skill `playwright-skill`).

**Spec :** `docs/superpowers/specs/2026-10-03-refonte-vox-design.md`

## Global Constraints

- Palette (valeurs exactes) : sable `#EFE6D2`, papier `#FBF7EE`, encre `#1A1A1A`, encre-doux `#5C574E`, jaune `#FFE14D`, rose `#E8547A`, rose-pale `#F4A3B6`, bleu `#8FA8F0`, juste `#2E9E6A`, juste-fonce `#1E6B47`, faux `#E5604A`, faux-fonce `#B23A26`.
- Aucune valeur hexadécimale, `rgb()/rgba()`, dégradé, ni classe de couleur Tailwind par défaut (`gray-*`, `purple-*`, `white`…) dans les fichiers `.tsx`. Les valeurs brutes passent par `couleurs` importé de `@/theme/couleurs`.
- Le jaune n'est jamais un grand aplat de fond de page.
- Texte posé sur un fond coloré : toujours `text-encre`. Texte coloré « juste/faux » : `text-juste-fonce` / `text-faux-fonce`.
- Juste/faux : toujours une icône ✓ / ✗ en plus de la couleur.
- Ombres : uniquement `shadow-dur-sm`, `shadow-dur`, `shadow-dur-lg`. Bordures 2px encre (3px pour les boutons).
- Polices : `font-texte` (Lexend, défaut du `body`), `font-titre` (Archivo Black).
- Cibles tactiles : 48px minimum de haut pour boutons et mots cliquables.
- Pas de nouvelle dépendance npm. Pas de modification des règles de jeu, scores, données, authentification.
- Un commit par tâche, message en français au format `style(vox): …` ou `feat(ui): …`.
- `npm run build` doit passer à la fin de chaque tâche. ESLint : pas plus de 26 problèmes (état de départ).

## Review Focus

1. **Mots longs ou nombreux dans `BoutonMot`** (Mots cachés, Phrases brouillées) : les boutons passent à la ligne sans déborder de l'écran à 375px. Test : capture Playwright mobile de chaque jeu, vérification `document.documentElement.scrollWidth <= innerWidth`.
2. **Formulaire de connexion** : le nouveau `Bouton` a `type="button"` par défaut ; le bouton d'envoi du formulaire doit recevoir `type="submit"` sinon la touche Entrée ne connecte plus. Test : Tâche 11, connexion par la touche Entrée dans Playwright.
3. **Texte posé sur le `Decor`** : à 1280px, aucune forme décorative ne recouvre une zone de texte. Test : Tâche 3, `Decor` visible seulement à partir de `xl` et contenu limité à `max-w-5xl` ; contrôle visuel en Tâche 11.
4. **Graphiques du tableau de bord** : Recharts reçoit des couleurs en props ; une couleur oubliée reste violette. Test : Tâche 9, le script de vérification interdit tout hexadécimal dans `DashboardPage.tsx`.
5. **Lecture rapide (texte qui défile)** : le restylage ne doit pas casser le défilement et le masque de texte (`TextMask`). Test : Tâche 11, partie jouée jusqu'à l'écran de fin dans Playwright.

---

## Correspondance des classes (référence pour les Tâches 3 à 9)

| Ancien | Nouveau |
|---|---|
| `bg-bg`, `bg-[#F8F7FF]`, fonds de page lavande ou sombres (`#1a1a2e`, `#12122a`…) | `bg-sable` |
| `bg-white`, `bg-gray-50`, `bg-white/xx` | `bg-papier` |
| `bg-gray-100`, `bg-gray-200` (zones neutres, pistes de barres) | `bg-sable` (ou `bg-encre/10` pour une piste de barre de progression) |
| `text-ink`, `text-gray-800/900`, `text-white` sur fond sombre | `text-encre` |
| `text-gray-400/500/600/700` | `text-encre-doux` |
| `border-gray-*`, `border` seul | `border-2 border-encre` (séparateur discret : `border-encre/20`) |
| `bg-primary`, `bg-primary/10`, état actif/sélectionné violet | `bg-jaune` (sélection) ou `bg-bleu` (info) |
| `text-primary`, `text-secondary` | `text-encre` (mettre en valeur avec `font-titre` ou une `Etiquette`) |
| `border-primary` | `border-encre` |
| `bg-secondary`, `bg-orange-*` | `bg-rose-pale` |
| `bg-accent`, `bg-yellow-*` | `bg-jaune` |
| `bg-success`, `bg-green-*` | `bg-juste` |
| `text-success`, `text-green-*` | `text-juste-fonce` |
| `border-success`, `border-green-*` | `border-encre` + fond `bg-juste` |
| `bg-error`, `bg-red-*` | `bg-faux` |
| `text-error`, `text-red-*` | `text-faux-fonce` |
| `border-error`, `border-red-*` | `border-encre` + fond `bg-faux` |
| `bg-blue-*`, `text-blue-*` | `bg-bleu` / `text-encre` |
| `shadow-card`, `shadow-card-hover`, `shadow-md/lg/xl`, `shadow-glow*` | `shadow-dur` (survol : `shadow-dur-lg`) |
| `font-fredoka` | `font-titre` |
| `font-nunito` | supprimer (Lexend est le défaut) |
| `rounded-3xl`, `rounded-4xl`, `rounded-5xl` | `rounded-2xl` |
| `style={{ background: 'linear-gradient(...)' }}`, orbes, motifs de points | supprimer ; fond uni du token adapté |
| `glass`, `gradient-text-primary` | supprimer (fond `bg-papier` / texte `text-encre`) |
| Couleur brute dans une prop JS (Recharts, style inline) | `couleurs.<nom>` importé de `@/theme/couleurs` |

Règles d'usage des composants pendant la reprise :
- Bouton d'action (« Commencer », « Valider », « Rejouer »…) → `Bouton` (`principal` pour l'action principale, `secondaire` pour les autres). Un `motion.button` ou un `Link` stylé en bouton garde son élément et prend `className={classesBouton('principal')}`.
- Bloc à fond clair et bordure → `Carte` (ou `classesCarte` sur un `motion.div`).
- Titre de section en petites capitales → `Etiquette`.
- Mot cliquable dans un jeu → `BoutonMot` avec l'`etat` qui correspond à l'ancien style (sélectionné, correct, incorrect).
- Barre du haut d'un jeu (retour + titre) → `EnTete`.
- Écran de résultats en fin de partie → `EcranFin` ; un détail propre au jeu (correction, liste de mots) passe en `children`.
- Emojis : conservés (ils font partie du ton de l'app).

---

### Tâche 1 : script de vérification du style

**Files :**
- Create : `scripts/verifier-style.mjs`

**Interfaces :**
- Produces : commande `node scripts/verifier-style.mjs [fichier ou dossier…]`. Sans argument, analyse tout `src/` (fichiers `.tsx`). Code de sortie 0 si aucun problème, 1 sinon, avec une ligne `fichier:ligne  motif  extrait` par problème.

- [ ] **Étape 1 : écrire le script**

```js
#!/usr/bin/env node
// Vérifie qu'un fichier .tsx n'utilise que le nuancier « Vox Collage ».
// Usage : node scripts/verifier-style.mjs [fichiers ou dossiers…]  (défaut : src)
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const REGLES = [
  ['couleur hexadécimale', /#[0-9a-fA-F]{3,8}\b/],
  ['rgb()/rgba()', /\brgba?\(/],
  ['dégradé', /gradient/],
  ['couleur Tailwind par défaut',
    /\b(?:bg|text|border|from|via|to|ring|fill|stroke|outline|divide|decoration|placeholder|accent|caret)-(?:white|black|(?:gray|slate|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3})\b/],
  ['ancien token', /\b(?:bg|text|border|from|via|to|ring|fill|stroke|outline|divide)-(?:primary|secondary|accent|success|error|ink|bg)\b/],
  ['ancienne ombre', /\bshadow-(?:card|card-hover|glow|glow-sm|glow-orange|glow-success|sm|md|lg|xl|2xl)\b/],
  ['ancienne police', /\bfont-(?:fredoka|nunito)\b/],
  ['classe CSS supprimée', /\b(?:glass|gradient-text-primary)\b/],
]

function lister(chemin) {
  if (statSync(chemin).isDirectory()) {
    return readdirSync(chemin).flatMap((nom) => lister(join(chemin, nom)))
  }
  return chemin.endsWith('.tsx') ? [chemin] : []
}

const cibles = process.argv.slice(2)
const fichiers = (cibles.length ? cibles : ['src']).flatMap(lister)
let problemes = 0

for (const fichier of fichiers) {
  readFileSync(fichier, 'utf8').split('\n').forEach((ligne, i) => {
    for (const [nom, motif] of REGLES) {
      const trouve = ligne.match(motif)
      if (trouve) {
        problemes++
        console.log(`${relative('.', fichier)}:${i + 1}  ${nom}  ${trouve[0]}`)
      }
    }
  })
}

console.log(problemes ? `\n${problemes} problème(s) dans ${fichiers.length} fichier(s).` : `OK : ${fichiers.length} fichier(s) conformes.`)
process.exit(problemes ? 1 : 0)
```

- [ ] **Étape 2 : vérifier qu'il échoue sur l'existant**

Run : `node scripts/verifier-style.mjs src/components/layout/AppShell.tsx`
Expected : sortie 1, plusieurs lignes (`couleur hexadécimale`, `dégradé`, `ancien token`…).

- [ ] **Étape 3 : commit**

```bash
git add scripts/verifier-style.mjs
git commit -m "chore(vox): script de vérification du nuancier"
```

---

### Tâche 2 : nuancier, polices et boîte à outils de composants

**Files :**
- Create : `src/theme/couleurs.js`, `src/theme/couleurs.d.ts`, `src/lib/cn.ts`
- Create : `src/components/ui/Bouton.tsx`, `Carte.tsx`, `Etiquette.tsx`, `BoutonMot.tsx`, `EnTete.tsx`, `EcranFin.tsx`, `Decor.tsx`
- Modify : `tailwind.config.js` (couleurs, polices, ombres, animations), `src/index.css` (polices, body, sélection, barre de défilement, classe `.etoile`)
- Delete : `src/components/ui/Button.tsx`, `src/components/ui/Card.tsx` (après migration de leurs 2 usages : `CoupDOeilPage.tsx`, `IntrusPage.tsx`)

**Interfaces :**
- Produces :
  - `couleurs` : objet `{ sable, papier, encre, 'encre-doux', jaune, rose, 'rose-pale', bleu, juste, 'juste-fonce', faux, 'faux-fonce' }` de chaînes.
  - `cn(...classes: ClassValue[]): string`
  - `Bouton` (props HTML de `<button>` + `variante?: 'principal' | 'secondaire' | 'discret'`, `taille?: 'normal' | 'grand'`), `classesBouton(variante?, taille?): string`
  - `Carte` (props HTML de `<div>`), `classesCarte: string`
  - `Etiquette` (`children`, `couleur?: 'jaune' | 'rose-pale' | 'bleu'`, `className?`)
  - `BoutonMot` (`children`, `etat?: EtatMot`, `onClick?`, `disabled?`, `className?`, `'aria-label'?`), `type EtatMot = 'normal' | 'selectionne' | 'juste' | 'faux'`
  - `EnTete` (`titre: string`, `retourVers?: string` défaut `'/exercices'`, `onRetour?: () => void`, `droite?: ReactNode`)
  - `EcranFin` (`titre: string`, `score?: ReactNode`, `detail?: ReactNode`, `etoiles?: 0 | 1 | 2 | 3`, `onRejouer?: () => void`, `retourVers?: string` défaut `'/exercices'`, `children?: ReactNode`)
  - `Decor` (aucune prop)
  - Classes Tailwind : `bg-sable`… (toute la palette), `font-texte`, `font-titre`, `shadow-dur-sm|dur|dur-lg`, `animate-secousse`.

- [ ] **Étape 1 : palette partagée**

`src/theme/couleurs.js` :
```js
// Palette « Vox Collage » : source unique, utilisée par tailwind.config.js
// et par le code qui a besoin d'une valeur brute (graphiques, styles inline).
export const couleurs = {
  sable: '#EFE6D2',
  papier: '#FBF7EE',
  encre: '#1A1A1A',
  'encre-doux': '#5C574E',
  jaune: '#FFE14D',
  rose: '#E8547A',
  'rose-pale': '#F4A3B6',
  bleu: '#8FA8F0',
  juste: '#2E9E6A',
  'juste-fonce': '#1E6B47',
  faux: '#E5604A',
  'faux-fonce': '#B23A26',
}
```

`src/theme/couleurs.d.ts` :
```ts
export type NomCouleur =
  | 'sable' | 'papier' | 'encre' | 'encre-doux' | 'jaune' | 'rose'
  | 'rose-pale' | 'bleu' | 'juste' | 'juste-fonce' | 'faux' | 'faux-fonce'

export declare const couleurs: Readonly<Record<NomCouleur, string>>
```

`src/lib/cn.ts` :
```ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

- [ ] **Étape 2 : Tailwind**

Dans `tailwind.config.js`, ajouter en tête `import { couleurs } from './src/theme/couleurs.js'`, puis dans `theme.extend` :
- `colors` : `...couleurs` ajouté **à côté** des anciennes couleurs (retirées en Tâche 10).
- `fontFamily` : ajouter `texte: ['Lexend', 'sans-serif']` et `titre: ['"Archivo Black"', 'sans-serif']` (garder `nunito`/`fredoka` jusqu'à la Tâche 10).
- `boxShadow` : ajouter `'dur-sm': \`2px 2px 0 0 ${couleurs.encre}\``, `dur: \`4px 4px 0 0 ${couleurs.encre}\``, `'dur-lg': \`6px 6px 0 0 ${couleurs.encre}\``.
- `keyframes` : ajouter `secousse: { '0%, 100%': { transform: 'translateX(0)' }, '20%': { transform: 'translateX(-6px)' }, '40%': { transform: 'translateX(6px)' }, '60%': { transform: 'translateX(-4px)' }, '80%': { transform: 'translateX(4px)' } }`.
- `animation` : ajouter `secousse: 'secousse 0.4s ease-in-out'`.

`tailwind-merge` ne connaît pas `shadow-dur*` ni `font-titre` mais les traite comme classes inconnues conservées : acceptable.

- [ ] **Étape 3 : `src/index.css`**

- Remplacer l'`@import` Google Fonts par : `@import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Lexend:wght@400;500;600;700;800;900&display=swap');` (Nunito/Fredoka retirés : les classes `font-fredoka` restantes retombent sur sans-serif jusqu'à leur reprise, sans casser l'affichage).
- `body` : `font-family: 'Lexend', sans-serif; background-color: theme('colors.sable'); color: theme('colors.encre');` et suppression du motif de points.
- Barre de défilement : piste `theme('colors.sable')`, poignée `theme('colors.encre')`.
- `::selection` : fond `theme('colors.jaune')`, texte `theme('colors.encre')`.
- Ajouter :
```css
/* Étoile d'écran de fin : jaune cerclée d'encre */
.etoile { -webkit-text-stroke: 2px theme('colors.encre'); paint-order: stroke fill; }
```
- `.glass` et `.gradient-text-primary` restent jusqu'à la Tâche 10.

- [ ] **Étape 4 : les composants**

`src/components/ui/Bouton.tsx` :
```tsx
import * as React from 'react'
import { cn } from '@/lib/cn'

export type VarianteBouton = 'principal' | 'secondaire' | 'discret'
export type TailleBouton = 'normal' | 'grand'

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-xl font-texte font-bold text-encre ' +
  'transition-[transform,box-shadow,background-color] duration-100 select-none ' +
  'focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-bleu ' +
  'disabled:opacity-50 disabled:pointer-events-none'

const VARIANTES: Record<VarianteBouton, string> = {
  principal:
    'bg-jaune border-[3px] border-encre shadow-dur hover:-translate-x-px hover:-translate-y-px hover:shadow-dur-lg ' +
    'active:translate-x-1 active:translate-y-1 active:shadow-none',
  secondaire:
    'bg-papier border-[3px] border-encre shadow-dur hover:bg-rose-pale ' +
    'active:translate-x-1 active:translate-y-1 active:shadow-none',
  discret: 'bg-transparent underline-offset-4 hover:underline',
}

const TAILLES: Record<TailleBouton, string> = {
  normal: 'min-h-12 px-5 text-base',
  grand: 'min-h-14 px-7 text-lg',
}

export function classesBouton(variante: VarianteBouton = 'principal', taille: TailleBouton = 'normal') {
  return cn(BASE, VARIANTES[variante], TAILLES[taille])
}

export interface BoutonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: VarianteBouton
  taille?: TailleBouton
}

export const Bouton = React.forwardRef<HTMLButtonElement, BoutonProps>(
  ({ variante = 'principal', taille = 'normal', type = 'button', className, ...props }, ref) => (
    <button ref={ref} type={type} className={cn(classesBouton(variante, taille), className)} {...props} />
  ),
)
Bouton.displayName = 'Bouton'
```

`src/components/ui/Carte.tsx` :
```tsx
import * as React from 'react'
import { cn } from '@/lib/cn'

export const classesCarte = 'bg-papier border-2 border-encre rounded-2xl shadow-dur'

export const Carte = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn(classesCarte, className)} {...props} />,
)
Carte.displayName = 'Carte'
```

`src/components/ui/Etiquette.tsx` :
```tsx
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

const FONDS = { jaune: 'bg-jaune', 'rose-pale': 'bg-rose-pale', bleu: 'bg-bleu' } as const

interface EtiquetteProps {
  children: ReactNode
  couleur?: keyof typeof FONDS
  className?: string
}

export function Etiquette({ children, couleur = 'jaune', className }: EtiquetteProps) {
  return (
    <span
      className={cn(
        'inline-block -rotate-2 border-[3px] border-encre px-3 py-1 font-titre text-sm uppercase tracking-wide text-encre shadow-dur-sm',
        FONDS[couleur],
        className,
      )}
    >
      {children}
    </span>
  )
}
```

`src/components/ui/BoutonMot.tsx` :
```tsx
import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/cn'

export type EtatMot = 'normal' | 'selectionne' | 'juste' | 'faux'

const FONDS: Record<EtatMot, string> = {
  normal: 'bg-papier hover:bg-jaune/40',
  selectionne: 'bg-jaune -translate-y-0.5 shadow-dur',
  juste: 'bg-juste',
  faux: 'bg-faux',
}

const ANIMATIONS = {
  normal: { scale: 1, x: 0 },
  selectionne: { scale: 1, x: 0 },
  juste: { scale: [1, 1.12, 1], x: 0 },
  faux: { scale: 1, x: [0, -6, 6, -4, 4, 0] },
}

const ICONES: Partial<Record<EtatMot, { signe: string; lu: string }>> = {
  juste: { signe: '✓', lu: 'bonne réponse' },
  faux: { signe: '✗', lu: 'mauvaise réponse' },
}

interface BoutonMotProps {
  children: ReactNode
  etat?: EtatMot
  onClick?: () => void
  disabled?: boolean
  className?: string
  'aria-label'?: string
}

export function BoutonMot({ children, etat = 'normal', onClick, disabled, className, ...aria }: BoutonMotProps) {
  const icone = ICONES[etat]
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={etat === 'selectionne'}
      animate={ANIMATIONS[etat]}
      transition={{ duration: 0.4 }}
      className={cn(
        'inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-encre px-4 py-2',
        'font-texte text-lg font-semibold text-encre shadow-dur-sm transition-colors',
        'focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-bleu',
        'disabled:cursor-default',
        FONDS[etat],
        className,
      )}
      {...aria}
    >
      {children}
      {icone && (
        <>
          <span aria-hidden="true" className="font-titre">{icone.signe}</span>
          <span className="sr-only">({icone.lu})</span>
        </>
      )}
    </motion.button>
  )
}
```

`src/components/ui/EnTete.tsx` :
```tsx
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Bouton, classesBouton } from './Bouton'

interface EnTeteProps {
  titre: string
  retourVers?: string
  onRetour?: () => void
  droite?: ReactNode
}

export function EnTete({ titre, retourVers = '/exercices', onRetour, droite }: EnTeteProps) {
  return (
    <header className="mb-6 flex flex-wrap items-center gap-3">
      {onRetour ? (
        <Bouton variante="discret" onClick={onRetour} className="px-2">← Retour</Bouton>
      ) : (
        <Link to={retourVers} className={classesBouton('discret') + ' px-2'}>← Retour</Link>
      )}
      <h1 className="flex-1 font-titre text-2xl leading-tight text-encre md:text-3xl">{titre}</h1>
      {droite && <div className="flex items-center gap-2">{droite}</div>}
    </header>
  )
}
```

`src/components/ui/EcranFin.tsx` :
```tsx
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bouton, classesBouton } from './Bouton'
import { Carte } from './Carte'
import { Etiquette } from './Etiquette'

interface EcranFinProps {
  titre: string
  score?: ReactNode
  detail?: ReactNode
  etoiles?: 0 | 1 | 2 | 3
  onRejouer?: () => void
  retourVers?: string
  children?: ReactNode
}

export function EcranFin({ titre, score, detail, etoiles, onRejouer, retourVers = '/exercices', children }: EcranFinProps) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mx-auto w-full max-w-xl">
      <Carte className="p-6 text-center md:p-8">
        <Etiquette>Terminé</Etiquette>
        <h2 className="mt-4 font-titre text-3xl leading-tight text-encre md:text-4xl">{titre}</h2>
        {etoiles !== undefined && (
          <p className="mt-4 text-5xl tracking-widest" aria-label={`${etoiles} étoile${etoiles > 1 ? 's' : ''} sur 3`}>
            {[1, 2, 3].map((n) => (
              <span key={n} aria-hidden="true" className={n <= etoiles ? 'etoile text-jaune' : 'etoile text-sable'}>★</span>
            ))}
          </p>
        )}
        {score !== undefined && <p className="mt-4 font-titre text-5xl text-encre">{score}</p>}
        {detail && <p className="mt-2 text-encre-doux">{detail}</p>}
        {children && <div className="mt-6 text-left">{children}</div>}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {onRejouer && <Bouton onClick={onRejouer}>Rejouer</Bouton>}
          <Link to={retourVers} className={classesBouton('secondaire')}>Retour</Link>
        </div>
      </Carte>
    </motion.div>
  )
}
```

`src/components/ui/Decor.tsx` :
```tsx
// Formes découpées dans les coins de l'écran. Affichées seulement sur grand écran
// (xl) où le contenu, limité à max-w-5xl, laisse des marges libres : elles ne
// passent ainsi jamais sous du texte.
export function Decor() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 hidden overflow-hidden xl:block">
      <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full border-2 border-encre bg-rose-pale" />
      <div className="absolute right-16 top-40 h-12 w-12 rotate-12 border-2 border-encre bg-bleu" />
      <div className="absolute -bottom-10 -left-10 h-36 w-36 rotate-12 border-2 border-encre bg-bleu" />
      <div className="absolute bottom-48 left-10 h-10 w-10 rounded-full border-2 border-encre bg-rose-pale" />
    </div>
  )
}
```

- [ ] **Étape 5 : supprimer `Button.tsx` / `Card.tsx`**

Run : `grep -rn "components/ui/Button\|components/ui/Card" src`
Pour chaque usage (`CoupDOeilPage.tsx`, `IntrusPage.tsx`) : remplacer `Button` par `Bouton` (`variante` adaptée) et `Card…` par `Carte` (les sous-blocs `CardHeader`/`CardContent` deviennent des `div` avec `p-6`). Puis supprimer les deux fichiers.

- [ ] **Étape 6 : vérifier**

Run : `node scripts/verifier-style.mjs src/components/ui` → Expected : `OK`.
Run : `npm run build` → Expected : build réussi.
Run : `npx eslint src 2>&1 | tail -1` → Expected : ≤ 26 problèmes.

- [ ] **Étape 7 : commit**

```bash
git add -A src tailwind.config.js
git commit -m "feat(ui): nuancier Vox Collage et boîte à outils de composants"
```

---

### Tâche 3 : coquille de l'app (`AppShell`)

**Files :**
- Modify : `src/components/layout/AppShell.tsx` (réécriture complète)

**Interfaces :**
- Consumes : `Decor`, `Bouton`.

- [ ] **Étape 1 : test rouge**

Run : `node scripts/verifier-style.mjs src/components/layout/AppShell.tsx` → Expected : FAIL.

- [ ] **Étape 2 : réécrire `AppShell.tsx`**

Structure cible (garder `navItems`, `useAuthStore`, `useLocation`, l'animation de transition entre pages et l'`Outlet`) :
- Racine : `<div className="relative isolate flex min-h-screen flex-col bg-sable">` puis `<Decor />`.
- Barre du haut collante, sur toutes les tailles : `<header className="sticky top-0 z-20 border-b-2 border-encre bg-papier">` contenant, dans un conteneur `mx-auto flex max-w-5xl items-center gap-4 px-4 py-3` :
  - logo : `🧠` + `<span className="font-titre text-lg md:text-xl">Les P'tits Génies</span>` (lien vers `/accueil`) ;
  - navigation desktop `hidden md:flex gap-2` : chaque `NavLink` en `rounded-xl border-2 px-4 py-2 font-bold`, actif `border-encre bg-jaune shadow-dur-sm`, inactif `border-transparent hover:border-encre` ;
  - à droite (`ml-auto`) : points dans une pastille `rounded-full border-2 border-encre bg-jaune px-3 py-1 font-bold` (`{totalPoints} ⭐`) et, en desktop seulement, bouton `Se déconnecter` en `Bouton variante="discret"`.
- Contenu : `<main className="relative z-10 mx-auto w-full max-w-5xl flex-1 p-4 pb-24 md:p-8 md:pb-8">` contenant le `motion.div` existant et l'`Outlet`.
- Navigation mobile en bas (`md:hidden fixed bottom-0 inset-x-0 z-20 border-t-2 border-encre bg-papier`) : mêmes liens, actif `bg-jaune`, inactif `text-encre-doux` ; l'indicateur `layoutId="nav-indicator"` devient une barre `h-1 bg-encre`. Ajouter un 4e élément « Sortir » (🚪) qui appelle `logout` pour que la déconnexion reste accessible sur mobile.
- Suppression complète : `SIDEBAR_BG`, orbes, motif de points, `isHome` et toutes les variantes sombres.

- [ ] **Étape 3 : vérifier**

Run : `node scripts/verifier-style.mjs src/components/layout/AppShell.tsx` → PASS.
Run : `npm run build` → PASS.

- [ ] **Étape 4 : commit** — `git commit -am "style(vox): coquille de l'app (barre du haut, sans barre latérale)"`

---

### Tâche 4 : connexion, accueil, liste des exercices

**Files :**
- Modify : `src/pages/AuthPage.tsx`, `src/pages/HomePage.tsx`, `src/pages/ExercisesPage.tsx`

- [ ] **Étape 1 : test rouge** — `node scripts/verifier-style.mjs src/pages/AuthPage.tsx src/pages/HomePage.tsx src/pages/ExercisesPage.tsx` → FAIL.

- [ ] **Étape 2 : `AuthPage`** (hors `AppShell`) : racine `relative isolate min-h-screen bg-sable` + `<Decor />` ; formulaire dans une `Carte` ; titre `font-titre` ; champs `rounded-xl border-2 border-encre bg-papier px-4 min-h-12 text-encre focus:outline-none focus:bg-jaune/30` ; onglets connexion/inscription : actif `bg-jaune`, inactif `bg-papier`, tous `border-2 border-encre` ; bouton d'envoi `<Bouton type="submit" taille="grand" className="w-full">` (**`type="submit"` obligatoire**, voir Review Focus 2) ; message d'erreur `text-faux-fonce` avec `⚠️`. Appliquer la table de correspondance au reste.

- [ ] **Étape 3 : `HomePage`** : supprimer tout le thème sombre (fonds `#1a1a2e`, textes blancs, dégradés, orbes) ; appliquer la table ; titres de section en `Etiquette` ; cartes en `Carte` ou `classesCarte` ; boutons/liens d'action en `Bouton` / `classesBouton`.

- [ ] **Étape 4 : `ExercisesPage`** : chaque exercice est une `Carte` (ou `classesCarte` sur le `Link`/`motion` existant) avec `hover:-translate-y-0.5 hover:shadow-dur-lg transition`, titre `font-titre`, description `text-encre-doux` ; les couleurs propres à chaque exercice (dégradés) sont remplacées par une pastille d'emoji sur fond alterné `bg-jaune` / `bg-rose-pale` / `bg-bleu` (tableau `['bg-jaune', 'bg-rose-pale', 'bg-bleu']` indexé par position). Exercice vide (Ami/Ennemi) : garder son état actuel (badge « bientôt » le cas échéant) en `Etiquette couleur="bleu"`.

- [ ] **Étape 5 : vérifier** — script → PASS ; `npm run build` → PASS.

- [ ] **Étape 6 : commit** — `git commit -am "style(vox): connexion, accueil et liste des exercices"`

---

### Tâches 5 à 8 : les jeux

Pour **chaque** jeu, dans cet ordre et avec un commit par jeu (`style(vox): <nom du jeu>`), les mêmes étapes :

- [ ] **Étape 1 : test rouge** — `node scripts/verifier-style.mjs <fichiers du jeu>` → FAIL (sauf composants déjà conformes).
- [ ] **Étape 2 : lire entièrement les fichiers du jeu** et repérer : barre du haut, écran de démarrage, zone de jeu, mots cliquables et leurs états, écran de fin.
- [ ] **Étape 3 : reprendre** : `EnTete` pour la barre du haut (le chrono/score passe dans `droite`, en pastille `rounded-full border-2 border-encre bg-papier px-3 py-1 font-bold`) ; écran de démarrage et zone de jeu en `Carte` ; mots cliquables en `BoutonMot` (correspondance : sélectionné → `selectionne`, trouvé/correct → `juste`, erreur → `faux`) ; écran de fin en `EcranFin` (score, étoiles si le jeu en calcule, `onRejouer` branché sur la fonction de relance existante, correction ou détail en `children`) ; table de correspondance pour le reste.
- [ ] **Étape 4 : ne rien changer à la logique** : états, minuteurs, calcul des points, appels Supabase restent identiques. Seuls JSX et classes changent.
- [ ] **Étape 5 : vérifier** — script → PASS ; `npm run build` → PASS.
- [ ] **Étape 6 : commit.**

Fichiers par jeu :
- **Tâche 5, Coup d'œil** : `src/pages/CoupDOeilPage.tsx`, `src/components/exercises/CoupDoeil/*.tsx`
- **Tâche 6, Intrus** : `src/pages/IntrusPage.tsx`, `src/components/exercises/Intrus/*.tsx`, `src/components/exercices/intrus/ChasseurDIntrus.tsx`
- **Tâche 6 bis, Phrases brouillées** : `src/pages/PhrasesBrouilleesPage.tsx`
- **Tâche 7, Lecture rapide** : `src/pages/LectureRapidePage.tsx`, `src/components/exercises/LectureRapide/*.tsx` (attention au masque `TextMask` et au défilement : ne toucher qu'aux couleurs, pas aux tailles ni aux positions calculées)
- **Tâche 7 bis, Collection et Ami/Ennemi** : `src/pages/CollectionPage.tsx`, `src/pages/AmiEnnemiPage.tsx`
- **Tâche 8, Mots cachés** : `src/pages/WordSearchPage.tsx`, `src/components/exercises/WordSearch/*.tsx` (grille : cases `bg-papier border border-encre/30`, case sélectionnée `bg-jaune`, mot trouvé `bg-juste`)

---

### Tâche 9 : tableau de bord

**Files :**
- Modify : `src/pages/DashboardPage.tsx`

- [ ] **Étape 1 : test rouge** — script sur le fichier → FAIL (≈ 45 problèmes).
- [ ] **Étape 2 : graphiques Recharts** : `import { couleurs } from '@/theme/couleurs'` ; toutes les props de couleur (`stroke`, `fill`, `stopColor`, couleurs de barres par exercice) utilisent `couleurs.*` ; série principale `couleurs.encre`, aires `couleurs.jaune`, séries secondaires `couleurs.rose`, `couleurs.bleu`, `couleurs.juste` ; grilles `couleurs['encre-doux']` avec `strokeOpacity={0.2}` ; les `<linearGradient>` sont supprimés au profit d'un `fill` uni avec `fillOpacity`. Info-bulles : `contentStyle={{ background: couleurs.papier, border: \`2px solid ${couleurs.encre}\`, borderRadius: 12 }}`.
- [ ] **Étape 3 : reste de la page** : table de correspondance ; blocs en `Carte` ; titres en `Etiquette` ; badges obtenus `bg-jaune`, non obtenus `bg-sable text-encre-doux`.
- [ ] **Étape 4 : vérifier** — script → PASS ; `npm run build` → PASS.
- [ ] **Étape 5 : commit** — `style(vox): tableau de bord`

---

### Tâche 10 : ménage

**Files :**
- Modify : `tailwind.config.js`, `src/index.css`, `index.html` si une police y est chargée

- [ ] **Étape 1 : test global** — `node scripts/verifier-style.mjs` (tout `src`) → doit déjà passer ; corriger tout reste.
- [ ] **Étape 2 : retirer les anciens tokens** de `tailwind.config.js` : couleurs `primary, secondary, accent, bg, success, error, ink`, polices `nunito, fredoka`, ombres `card, card-hover, glow*` ; retirer `.glass` et `.gradient-text-primary` de `index.css` ; retirer le lien Google Fonts Nunito de `index.html` s'il existe (remplacé par Lexend + Archivo Black, avec `preconnect` conservé).
- [ ] **Étape 3 : vérifier** — `npm run build` → PASS ; `grep -rnE "primary|fredoka|nunito|glass" src --include=*.tsx` → aucun résultat de classe.
- [ ] **Étape 4 : commit** — `chore(vox): suppression des anciens tokens`

---

### Tâche 11 : vérification visuelle et fonctionnelle (Playwright)

**Files :**
- Create (dossier temporaire, hors projet) : script Playwright de captures.

- [ ] **Étape 1 :** lancer `npm run dev` en arrière-plan.
- [ ] **Étape 2 :** avec le skill `playwright-skill`, se connecter avec un compte de test (en créer un via l'onglet inscription si besoin, nom `test_vox`), en validant le formulaire par la touche Entrée (Review Focus 2).
- [ ] **Étape 3 :** pour chaque route (`/`, `/accueil`, `/exercices`, les 7 jeux, `/tableau-de-bord`) et chaque largeur (375, 768, 1280) : capture pleine page ; vérifier `document.documentElement.scrollWidth <= window.innerWidth` ; relever les erreurs console.
- [ ] **Étape 4 :** jouer au moins Coup d'œil, Intrus et Lecture rapide jusqu'à `EcranFin` (Review Focus 5).
- [ ] **Étape 5 :** à 1280px, vérifier visuellement qu'aucune forme du `Decor` ne touche du texte (Review Focus 3).
- [ ] **Étape 6 :** corriger les défauts trouvés (un commit par correction), puis rapport à Manu avec les captures.
