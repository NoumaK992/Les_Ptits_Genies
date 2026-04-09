import type { CoupDoeilSeries } from '@/types'

// ─── Série 1 : mots courts (2–5 lettres) ─────────────────────────────
// Thèmes : a) des oiseaux  b) des meubles  c) des boissons
const serie1: CoupDoeilSeries = {
  id: 1,
  label: 'Série n°1',
  themes: { a: 'des oiseaux', b: 'des meubles', c: 'des boissons' },
  columns: [
    [
      { id: 's1-0-0',  text: 'bec',      theme: null },
      { id: 's1-0-1',  text: 'pie',      theme: 'a' },
      { id: 's1-0-2',  text: 'rond',     theme: null },
      { id: 's1-0-3',  text: 'bras',     theme: null },
      { id: 's1-0-4',  text: 'très',     theme: null },
      { id: 's1-0-5',  text: 'table',    theme: 'b' },
      { id: 's1-0-6',  text: 'frère',    theme: null },
      { id: 's1-0-7',  text: 'triste',   theme: null },
      { id: 's1-0-8',  text: 'moineau',  theme: 'a' },
      { id: 's1-0-9',  text: 'du café',  theme: 'c' },
      { id: 's1-0-10', text: 'la cause', theme: null },
      { id: 's1-0-11', text: 'éclairer', theme: null },
    ],
    [
      { id: 's1-1-0',  text: 'sud',      theme: null },
      { id: 's1-1-1',  text: 'ici',      theme: null },
      { id: 's1-1-2',  text: 'lait',     theme: 'c' },
      { id: 's1-1-3',  text: 'deux',     theme: null },
      { id: 's1-1-4',  text: 'voilà',    theme: null },
      { id: 's1-1-5',  text: 'moyen',    theme: null },
      { id: 's1-1-6',  text: 'bureau',   theme: 'b' },
      { id: 's1-1-7',  text: 'le dos',   theme: null },
      { id: 's1-1-8',  text: 'million',  theme: null },
      { id: 's1-1-9',  text: 'prairie',  theme: null },
      { id: 's1-1-10', text: 'fauteuil', theme: 'b' },
      { id: 's1-1-11', text: 'mouiller', theme: null },
    ],
    [
      { id: 's1-2-0',  text: 'eau',      theme: 'c' },
      { id: 's1-2-1',  text: 'nez',      theme: null },
      { id: 's1-2-2',  text: 'bois',     theme: null },
      { id: 's1-2-3',  text: 'vite',     theme: null },
      { id: 's1-2-4',  text: 'faire',    theme: null },
      { id: 's1-2-5',  text: 'blanc',    theme: null },
      { id: 's1-2-6',  text: 'bavard',   theme: null },
      { id: 's1-2-7',  text: 'chaise',   theme: 'b' },
      { id: 's1-2-8',  text: 'la dent',  theme: null },
      { id: 's1-2-9',  text: 'échelle',  theme: null },
      { id: 's1-2-10', text: 'alouette', theme: 'a' },
      { id: 's1-2-11', text: 'au feu !', theme: null },
    ],
  ],
}

// ─── Série 2 : syntagmes courants ─────────────────────────────────────
// Thèmes : a) un jeu  b) une discipline scolaire  c) se rapportant au temps qu'il fait
const serie2: CoupDoeilSeries = {
  id: 2,
  label: 'Série n°2',
  themes: { a: 'un jeu', b: 'une discipline scolaire', c: 'se rapportant au temps qu\'il fait' },
  columns: [
    [
      { id: 's2-0-0',  text: 'un regard vif',     theme: null },
      { id: 's2-0-1',  text: 'en caoutchouc',     theme: null },
      { id: 's2-0-2',  text: 'une balançoire',    theme: 'a' },
      { id: 's2-0-3',  text: 'quel courage !',    theme: null },
      { id: 's2-0-4',  text: 'chute de pierres',  theme: null },
      { id: 's2-0-5',  text: 'vive la liberté',   theme: null },
      { id: 's2-0-6',  text: 'passage interdit',  theme: null },
      { id: 's2-0-7',  text: 'un client pressé',  theme: null },
      { id: 's2-0-8',  text: 'propriété privée',  theme: null },
      { id: 's2-0-9',  text: 'le guide du musée', theme: null },
      { id: 's2-0-10', text: 'il était une fois', theme: null },
      { id: 's2-0-11', text: 'les mathématiques', theme: 'b' },
    ],
    [
      { id: 's2-1-0',  text: 'n\'importe qui',     theme: null },
      { id: 's2-1-1',  text: 'la géographie',      theme: 'b' },
      { id: 's2-1-2',  text: 'tempête en mer',     theme: 'c' },
      { id: 's2-1-3',  text: 'un cerf-volant',     theme: 'a' },
      { id: 's2-1-4',  text: 'le gouvernement',    theme: null },
      { id: 's2-1-5',  text: 'choisir sa voie',    theme: null },
      { id: 's2-1-6',  text: 'un orage violent',   theme: 'c' },
      { id: 's2-1-7',  text: 'une forte fièvre',   theme: null },
      { id: 's2-1-8',  text: 'loin de chez moi',   theme: null },
      { id: 's2-1-9',  text: 'l\'agent de police', theme: null },
      { id: 's2-1-10', text: 'une neige épaisse',  theme: 'c' },
      { id: 's2-1-11', text: 'un vase de fleurs',  theme: null },
    ],
    [
      { id: 's2-2-0',  text: 'avec ascenseur',    theme: null },
      { id: 's2-2-1',  text: 'monter la côte',    theme: null },
      { id: 's2-2-2',  text: 'il va pleuvoir',    theme: 'c' },
      { id: 's2-2-3',  text: 'un long voyage',    theme: null },
      { id: 's2-2-4',  text: 'sans résistance',   theme: null },
      { id: 's2-2-5',  text: 'un rêve étonnant',  theme: null },
      { id: 's2-2-6',  text: 'défense d\'entrer', theme: null },
      { id: 's2-2-7',  text: 'le trafic aérien',  theme: null },
      { id: 's2-2-8',  text: 'toute la semaine',  theme: null },
      { id: 's2-2-9',  text: 'une partie de dés', theme: 'a' },
      { id: 's2-2-10', text: 'un nid d\'abeilles',theme: null },
      { id: 's2-2-11', text: 'cours de biologie', theme: 'b' },
    ],
  ],
}

// ─── Série 3 : syntagmes plus longs ──────────────────────────────────
// Thèmes : a) un cours ou étendue d'eau  b) des objets qui servent à écrire  c) un bruit
const serie3: CoupDoeilSeries = {
  id: 3,
  label: 'Série n°3',
  themes: { a: 'un cours ou étendue d\'eau', b: 'des objets qui servent à écrire', c: 'un bruit' },
  columns: [
    [
      { id: 's3-0-0',  text: 'sans succès',       theme: null },
      { id: 's3-0-1',  text: 'un ruisseau',        theme: 'a' },
      { id: 's3-0-2',  text: 'au secours !',       theme: null },
      { id: 's3-0-3',  text: 'les vacances',       theme: null },
      { id: 's3-0-4',  text: 'indispensable',      theme: null },
      { id: 's3-0-5',  text: 'un grincement',      theme: 'c' },
      { id: 's3-0-6',  text: 'un faux numéro',     theme: null },
      { id: 's3-0-7',  text: 'un feutre vert',     theme: 'b' },
      { id: 's3-0-8',  text: 'réparer un pneu',    theme: null },
      { id: 's3-0-9',  text: 'un inconvénient',    theme: null },
      { id: 's3-0-10', text: 'traverser la rue',   theme: null },
      { id: 's3-0-11', text: 'un terrain vague',   theme: null },
    ],
    [
      { id: 's3-1-0',  text: 'par exemple',        theme: null },
      { id: 's3-1-1',  text: 'demande-lui',        theme: null },
      { id: 's3-1-2',  text: 'le téléphone',       theme: null },
      { id: 's3-1-3',  text: 'en équilibre',       theme: null },
      { id: 's3-1-4',  text: 'quel tapage !',      theme: 'c' },
      { id: 's3-1-5',  text: 'le lac est gelé',    theme: 'a' },
      { id: 's3-1-6',  text: 'un rendez-vous',     theme: null },
      { id: 's3-1-7',  text: 'un crayon noir',     theme: 'b' },
      { id: 's3-1-8',  text: 'un été pluvieux',    theme: null },
      { id: 's3-1-9',  text: 'un étang vaseux',    theme: 'a' },
      { id: 's3-1-10', text: 'zéro de conduite',   theme: null },
      { id: 's3-1-11', text: 'âgé de douze ans',   theme: null },
    ],
    [
      { id: 's3-2-0',  text: 'du brouhaha',        theme: 'c' },
      { id: 's3-2-1',  text: 'de la craie',        theme: 'b' },
      { id: 's3-2-2',  text: 'automatique',        theme: null },
      { id: 's3-2-3',  text: 'le passeport',       theme: null },
      { id: 's3-2-4',  text: 'un craquement',      theme: 'c' },
      { id: 's3-2-5',  text: 'professionnel',      theme: null },
      { id: 's3-2-6',  text: 'un stylo-bille',     theme: 'b' },
      { id: 's3-2-7',  text: 'un téléphone',       theme: null },
      { id: 's3-2-8',  text: 'gare ta voiture',    theme: null },
      { id: 's3-2-9',  text: 'un dictionnaire',    theme: null },
      { id: 's3-2-10', text: 'virage dangereux',   theme: null },
      { id: 's3-2-11', text: 'deux nouveau-nés',   theme: null },
    ],
  ],
}

// ─── Série 4 : locutions longues ──────────────────────────────────────
// Thèmes : a) un sentiment  b) une partie du corps  c) se rapportant à la mer
const serie4: CoupDoeilSeries = {
  id: 4,
  label: 'Série n°4',
  themes: { a: 'un sentiment', b: 'une partie du corps', c: 'se rapportant à la mer' },
  columns: [
    [
      { id: 's4-0-0',  text: 'voie sans issue',     theme: null },
      { id: 's4-0-1',  text: 'oubliez l\'heure',    theme: null },
      { id: 's4-0-2',  text: 'un parc ombragé',     theme: null },
      { id: 's4-0-3',  text: 'au premier étage',    theme: null },
      { id: 's4-0-4',  text: 'une grosse vague',    theme: 'c' },
      { id: 's4-0-5',  text: 'la mise en scène',    theme: null },
      { id: 's4-0-6',  text: 'un message secret',   theme: null },
      { id: 's4-0-7',  text: 'quel est ton nom ?',  theme: null },
      { id: 's4-0-8',  text: 'attention au chien',  theme: null },
      { id: 's4-0-9',  text: 'un profond chagrin',  theme: 'a' },
      { id: 's4-0-10', text: 'de grandes oreilles', theme: 'b' },
      { id: 's4-0-11', text: 'une pile électrique', theme: null },
    ],
    [
      { id: 's4-1-0',  text: 'un arrêt de bus',      theme: null },
      { id: 's4-1-1',  text: 'un visage ovale',      theme: 'b' },
      { id: 's4-1-2',  text: 'vitesse limitée',      theme: null },
      { id: 's4-1-3',  text: 'un volcan éteint',     theme: null },
      { id: 's4-1-4',  text: 'il saute de joie',     theme: null },
      { id: 's4-1-5',  text: 'un climat humide',     theme: null },
      { id: 's4-1-6',  text: 'une fête réussie',     theme: null },
      { id: 's4-1-7',  text: 'avez-vous réussi ?',   theme: null },
      { id: 's4-1-8',  text: 'le prince charmant',   theme: null },
      { id: 's4-1-9',  text: 'un appartement vide',  theme: null },
      { id: 's4-1-10', text: 's\'écorcher le coude', theme: 'b' },
      { id: 's4-1-11', text: 'un acteur de cinéma',  theme: null },
    ],
    [
      { id: 's4-2-0',  text: 'la fin du livre',     theme: null },
      { id: 's4-2-1',  text: 'des coquillages',     theme: 'c' },
      { id: 's4-2-2',  text: 'preuve à l\'appui',   theme: null },
      { id: 's4-2-3',  text: 'château de sable',    theme: 'c' },
      { id: 's4-2-4',  text: 'masculin pluriel',    theme: null },
      { id: 's4-2-5',  text: 'une page blanche',    theme: null },
      { id: 's4-2-6',  text: 'de grande taille',    theme: null },
      { id: 's4-2-7',  text: 'une douche glacée',   theme: null },
      { id: 's4-2-8',  text: 'un bonheur intense',  theme: 'a' },
      { id: 's4-2-9',  text: 'une étoile filante',  theme: null },
      { id: 's4-2-10', text: 'la sécurité sociale', theme: null },
      { id: 's4-2-11', text: 'ils meurent de peur', theme: 'a' },
    ],
  ],
}

export const SERIES_LIST: CoupDoeilSeries[] = [serie1, serie2, serie3, serie4]

export function getSeriesById(id: number): CoupDoeilSeries | undefined {
  return SERIES_LIST.find((s) => s.id === id)
}
