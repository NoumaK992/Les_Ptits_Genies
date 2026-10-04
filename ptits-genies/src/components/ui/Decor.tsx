// Formes découpées dans les coins de l'écran, affichées à partir de xl (1280px).
// À cette largeur, la marge libre de chaque côté du contenu ne fait que 64px
// (le rem passe à 18px dès md) : les tailles sont donc en pixels fixes et les
// grandes formes sortent en partie de l'écran, pour ne jamais passer sous du texte.
export function Decor() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 hidden overflow-hidden xl:block">
      <div className="absolute -right-[120px] -top-[120px] h-[176px] w-[176px] rounded-full border-2 border-encre bg-rose-pale" />
      <div className="absolute right-[12px] top-[160px] h-[40px] w-[40px] rotate-12 border-2 border-encre bg-bleu" />
      <div className="absolute -bottom-[100px] -left-[110px] h-[140px] w-[140px] rotate-12 border-2 border-encre bg-bleu" />
      <div className="absolute bottom-[200px] left-[12px] h-[40px] w-[40px] rounded-full border-2 border-encre bg-rose-pale" />
    </div>
  )
}
