export type NomCouleur =
  | 'sable' | 'papier' | 'encre' | 'encre-doux' | 'jaune' | 'rose'
  | 'rose-pale' | 'bleu' | 'juste' | 'juste-fonce' | 'faux' | 'faux-fonce'

export declare const couleurs: Readonly<Record<NomCouleur, string>>
