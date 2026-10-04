// Choix des exercices d'une partie : jamais deux fois le même tant que la réserve n'est pas épuisée.
// Fonctions pures (testées par npm test).

/** Générateur pseudo-aléatoire reproductible (mulberry32) : même graine, même suite. */
export function melangeGraine(graine: number): () => number {
  let a = graine >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function melanger<T>(liste: T[], alea: () => number): T[] {
  const copie = [...liste]
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(alea() * (i + 1))
    ;[copie[i], copie[j]] = [copie[j], copie[i]]
  }
  return copie
}

/**
 * Choisit `n` éléments distincts : d'abord ceux jamais vus (au hasard),
 * puis, si la réserve est épuisée, les moins récemment vus.
 * `vus` associe l'identifiant d'un élément à la date (ISO) où il a été vu pour la dernière fois.
 */
export function choisirItems<T extends { id: string }>(
  pool: readonly T[],
  vus: Readonly<Record<string, string>>,
  n: number,
  alea: () => number = Math.random,
): T[] {
  const jamaisVus = melanger(pool.filter((x) => !(x.id in vus)), alea)
  const dejaVus = pool
    .filter((x) => x.id in vus)
    .sort((x, y) => vus[x.id].localeCompare(vus[y.id]))
  return [...jamaisVus, ...dejaVus].slice(0, Math.max(0, n))
}
