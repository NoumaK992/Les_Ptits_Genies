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
