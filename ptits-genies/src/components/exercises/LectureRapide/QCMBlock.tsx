import { useState } from 'react'
import { motion } from 'framer-motion'
import type { QCMQuestion } from '@/types'
import { Bouton } from '@/components/ui/Bouton'
import { BoutonMot, type EtatMot } from '@/components/ui/BoutonMot'
import { Carte } from '@/components/ui/Carte'

interface Props {
  questions: QCMQuestion[]
  onSubmit: (correctCount: number) => void
}

export function QCMBlock({ questions, onSubmit }: Props) {
  const [answers, setAnswers] = useState<(number | null)[]>([null, null, null])
  const [submitted, setSubmitted] = useState(false)

  function handleAnswer(qIndex: number, aIndex: number) {
    if (submitted) return
    setAnswers((prev) => prev.map((a, i) => i === qIndex ? aIndex : a))
  }

  function handleSubmit() {
    if (answers.some((a) => a === null)) return
    setSubmitted(true)
    const correct = answers.filter((a, i) => a === questions[i].correctIndex).length
    setTimeout(() => onSubmit(correct), 1500)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <h3 className="text-xl font-titre text-encre text-center">Questions de compréhension</h3>
      {questions.map((q, qi) => (
        <Carte key={qi} className="p-5">
          <p className="font-bold text-lg text-encre mb-3">{qi + 1}. {q.question}</p>
          <div className="space-y-2">
            {q.options.map((opt, ai) => {
              const isSelected = answers[qi] === ai
              const isCorrect = q.correctIndex === ai
              let etat: EtatMot = 'normal'
              if (submitted) {
                if (isCorrect) etat = 'juste'
                else if (isSelected && !isCorrect) etat = 'faux'
              } else if (isSelected) {
                etat = 'selectionne'
              }
              return (
                <BoutonMot
                  key={ai}
                  etat={etat}
                  onClick={() => handleAnswer(qi, ai)}
                  disabled={submitted}
                  className="w-full justify-between text-left text-base"
                >
                  <span>{String.fromCharCode(65 + ai)}. {opt}</span>
                </BoutonMot>
              )
            })}
          </div>
        </Carte>
      ))}
      {!submitted && (
        <Bouton
          taille="grand"
          onClick={handleSubmit}
          disabled={answers.some((a) => a === null)}
          className="w-full"
        >
          Valider mes réponses ✓
        </Bouton>
      )}
    </motion.div>
  )
}
