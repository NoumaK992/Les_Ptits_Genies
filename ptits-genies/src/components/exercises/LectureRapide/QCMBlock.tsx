import { useState } from 'react'
import { motion } from 'framer-motion'
import type { QCMQuestion } from '@/types'

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
      <h3 className="text-xl font-black text-ink text-center">Questions de compréhension</h3>
      {questions.map((q, qi) => (
        <div key={qi} className="bg-white rounded-2xl p-5 shadow">
          <p className="font-bold text-ink mb-3">{qi + 1}. {q.question}</p>
          <div className="space-y-2">
            {q.options.map((opt, ai) => {
              const isSelected = answers[qi] === ai
              const isCorrect = q.correctIndex === ai
              let style = 'border-2 border-gray-200 bg-white hover:border-primary'
              if (submitted) {
                if (isCorrect) style = 'border-2 border-success bg-success/10'
                else if (isSelected && !isCorrect) style = 'border-2 border-error bg-error/10'
                else style = 'border-2 border-gray-200 bg-white opacity-60'
              } else if (isSelected) {
                style = 'border-2 border-primary bg-primary/10'
              }
              return (
                <button
                  key={ai}
                  onClick={() => handleAnswer(qi, ai)}
                  disabled={submitted}
                  className={`w-full text-left px-4 py-3 rounded-xl font-semibold text-sm transition-all ${style}`}
                >
                  {String.fromCharCode(65 + ai)}. {opt}
                  {submitted && isCorrect && ' ✅'}
                  {submitted && isSelected && !isCorrect && ' ❌'}
                </button>
              )
            })}
          </div>
        </div>
      ))}
      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={answers.some((a) => a === null)}
          className="w-full bg-primary text-white font-black py-4 rounded-2xl text-lg shadow-lg disabled:opacity-40 active:scale-95 transition-transform"
        >
          Valider mes réponses ✓
        </button>
      )}
    </motion.div>
  )
}
