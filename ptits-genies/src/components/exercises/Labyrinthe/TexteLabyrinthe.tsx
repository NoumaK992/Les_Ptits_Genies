import { Fragment, useEffect, useRef, type ReactNode } from 'react'
import { BoutonMot, type EtatMot } from '@/components/ui/BoutonMot'
import { estCarrefour, type ChoixCarrefour, type ReponseCarrefour, type TexteLabyrinthe as Texte } from './logique'

interface Props {
  texte: Texte
  /** Choix mélangés de chaque carrefour. */
  choix: ChoixCarrefour[][]
  /** Réponses déjà validées (une par carrefour franchi). */
  reponses: ReponseCarrefour[]
  /** Choix qui vient d'être cliqué au carrefour actif (affiché un instant avant de continuer). */
  enAttente: ChoixCarrefour | null
  onChoisir: (choix: ChoixCarrefour) => void
}

// Lecture adaptée dys : grand texte, interligne large, lettres un peu espacées, aligné à gauche, sans italique.
export const CLASSES_LECTURE = 'font-texte text-xl md:text-2xl leading-loose tracking-wide text-encre text-left'

/** Carrefour déjà franchi : le bon mot en vert (✓), et l'erreur éventuelle en rouge (✗). */
function CarrefourFranchi({ reponse }: { reponse: ReponseCarrefour }) {
  const juste = reponse.choisi.type === 'bonne'
  return (
    <>
      <span className="inline-block whitespace-nowrap rounded-lg border-2 border-encre bg-juste px-1.5 leading-normal font-bold">
        {reponse.bonne}
        <span aria-hidden="true" className="ml-1">✓</span>
      </span>
      {!juste && (
        <span className="ml-1 inline-block whitespace-nowrap rounded-lg border-2 border-encre bg-faux px-1.5 text-lg leading-normal font-semibold">
          <span className="sr-only">(tu avais choisi </span>
          {reponse.choisi.mot}
          <span aria-hidden="true" className="ml-1">✗</span>
          <span className="sr-only">)</span>
        </span>
      )}
    </>
  )
}

export function TexteLabyrinthe({ texte, choix, reponses, enAttente, onChoisir }: Props) {
  const actifRef = useRef<HTMLSpanElement>(null)
  const indexActif = reponses.length

  // Le carrefour actif reste visible quand le texte s'allonge.
  useEffect(() => {
    if (indexActif > 0) actifRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [indexActif])

  let numero = -1
  const morceaux: ReactNode[] = []
  for (let i = 0; i < texte.segments.length; i++) {
    const s = texte.segments[i]
    if (!estCarrefour(s)) {
      morceaux.push(<Fragment key={i}>{s}</Fragment>)
      continue
    }
    numero++
    if (numero < indexActif) {
      morceaux.push(<CarrefourFranchi key={i} reponse={reponses[numero]} />)
      continue
    }
    // Carrefour actif : le texte s'arrête là jusqu'au choix de l'élève.
    const options = choix[numero]
    morceaux.push(
      <span
        key={i}
        ref={actifRef}
        role="group"
        aria-label={`Carrefour ${numero + 1} : choisis le mot qui convient`}
        className="mx-1 my-2 inline-flex flex-wrap items-center gap-3 rounded-2xl border-2 border-dashed border-encre bg-jaune/30 p-2 align-middle"
      >
        {options.map((o) => {
          let etat: EtatMot = 'normal'
          if (enAttente) {
            if (o.type === 'bonne') etat = 'juste'
            else if (o.mot === enAttente.mot) etat = 'faux'
          }
          return (
            <BoutonMot
              key={o.mot}
              etat={etat}
              disabled={enAttente !== null}
              onClick={() => onChoisir(o)}
              className="min-w-24 text-xl tracking-wide"
            >
              {o.mot}
            </BoutonMot>
          )
        })}
      </span>,
    )
    break
  }

  return <div className={CLASSES_LECTURE}>{morceaux}</div>
}
