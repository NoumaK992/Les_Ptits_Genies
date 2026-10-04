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
