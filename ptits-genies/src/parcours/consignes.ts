// Consignes affichées (et lues à voix haute) avant de lancer un jeu du parcours.
// Phrases courtes et simples : public de collégiens en difficulté de lecture.
import type { JeuParcours } from './regles'

export const CONSIGNES: Record<JeuParcours, string[]> = {
  'lecture-rapide': [
    'Lis le texte : les mots disparaissent derrière toi.',
    'Quand tu as fini, clique sur « J\'ai fini ».',
    'Réponds ensuite à 3 questions sur le texte.',
  ],
  intrus: [
    'Dans chaque liste, un mot n\'est pas comme les autres.',
    'Clique sur l\'intrus avant la fin du temps.',
    'Il y a 10 listes.',
  ],
  'coup-doeil': [
    'Lis les colonnes de mots de haut en bas.',
    'Clique sur un mot qui appartient à un des 3 thèmes, puis choisis a, b ou c.',
    'Valide quand tu as fini.',
  ],
  'word-search': [
    'Un mot est affiché en haut.',
    'Clique sur chaque case où tu le retrouves exactement.',
    'S\'il n\'y est pas, clique sur « Il n\'y a pas le mot ».',
  ],
  'phrases-brouillees': [
    'Le texte a des trous.',
    'Glisse chaque phrase dans le bon trou.',
    'Attention : certaines phrases ne vont nulle part.',
  ],
  collection: [
    'Lis la liste de mots.',
    'Trouve le mot qui les regroupe tous : le terme générique.',
    'Choisis-le parmi les 4 réponses.',
  ],
  'ami-ennemi': [
    'Trouve le mot qui n\'a rien à voir avec les autres.',
    'Trouve ensuite le point commun des autres mots.',
    'Il y a 5 manches.',
  ],
  'vrai-absurde': [
    'Lis la phrase en entier.',
    "Si elle a du sens, clique sur « Ça tient debout ». Sinon, clique sur « C'est absurde ».",
    'Attention aux mots qui se ressemblent !',
  ],
  forgeron: [
    'Coupe le mot en syllabes : clique entre les lettres.',
    'Le mot disparaît : reconstruis-le avec les bonnes syllabes.',
    'Attention aux syllabes pièges qui se ressemblent.',
  ],
  labyrinthe: [
    'Lis le texte du début à la fin.',
    'À chaque carrefour, clique sur le mot qui va dans la phrase.',
    'À la fin, réponds à une question sur le texte.',
  ],
  'coupe-mots': [
    'Les mots de la phrase sont collés.',
    'Clique entre les lettres pour séparer les mots.',
    "Après une apostrophe, coupe juste après elle : l' | école. Puis valide.",
  ],
  racines: [
    'Des mots de la même famille partagent une racine : terre, terrain, enterrer.',
    'Clique sur tous les mots de la famille, mais pas sur les faux amis qui se ressemblent.',
    'Ensuite, coupe des mots en morceaux et trouve le sens de chaque morceau.',
  ],
}
