// Phrases brouillées : mélange des propositions avant l'affichage.
// Dans plusieurs textes, les bonnes réponses sont rangées A, B, C dans l'ordre du fichier :
// on mélange les propositions puis on renomme les lettres selon l'ordre affiché,
// pour que ni la position ni la lettre ne trahissent la solution. Fonction pure (testée par npm test).

interface Proposition {
  letter: string
  text: string
}

interface Trou {
  number: number
  answerLetter: string
}

const LETTRES = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

/**
 * Renvoie une copie de l'exercice dont les propositions sont mélangées et renommées A, B, C…
 * dans l'ordre affiché ; la lettre attendue de chaque trou suit sa proposition d'origine.
 * Le reste de l'exercice (identifiant, texte, numéros des trous) est inchangé.
 */
export function melangerPropositions<E extends { choices: readonly Proposition[]; gaps: readonly Trou[] }>(
  exercice: E,
  alea: () => number = Math.random,
): E {
  const melange = [...exercice.choices]
  for (let i = melange.length - 1; i > 0; i--) {
    const j = Math.floor(alea() * (i + 1))
    ;[melange[i], melange[j]] = [melange[j], melange[i]]
  }
  // Ancienne lettre → nouvelle lettre (au-delà de 26 propositions, on garde un nom unique).
  const nouvelle = new Map(melange.map((c, i) => [c.letter, LETTRES[i] ?? `${c.letter}${i}`]))
  return {
    ...exercice,
    choices: melange.map((c) => ({ ...c, letter: nouvelle.get(c.letter) ?? c.letter })),
    gaps: exercice.gaps.map((g) => ({ ...g, answerLetter: nouvelle.get(g.answerLetter) ?? g.answerLetter })),
  }
}
