import { test } from "node:test"
import assert from "node:assert/strict"
import { melangerPropositions } from "./melangePropositions.ts"
import { melangeGraine } from "./selection.ts"

const exercice = {
  id: "pb-test",
  choices: [
    { letter: "A", text: "phrase 1" },
    { letter: "B", text: "phrase 2" },
    { letter: "C", text: "phrase 3" },
    { letter: "D", text: "piège 1" },
    { letter: "E", text: "piège 2" },
  ],
  gaps: [
    { number: 1, answerLetter: "A" },
    { number: 2, answerLetter: "B" },
    { number: 3, answerLetter: "C" },
  ],
}

test("les lettres affichées suivent l'ordre A, B, C… après mélange", () => {
  const m = melangerPropositions(exercice, melangeGraine(7))
  assert.deepEqual(m.choices.map((c) => c.letter), ["A", "B", "C", "D", "E"])
  assert.deepEqual(m.choices.map((c) => c.text).sort(), exercice.choices.map((c) => c.text).sort())
})

test("chaque trou attend toujours le même texte qu'avant le mélange", () => {
  for (let graine = 0; graine < 50; graine++) {
    const m = melangerPropositions(exercice, melangeGraine(graine))
    for (const g of m.gaps) {
      const texteAttendu = exercice.choices.find((c) => c.letter === exercice.gaps.find((o) => o.number === g.number)!.answerLetter)!.text
      assert.equal(m.choices.find((c) => c.letter === g.answerLetter)!.text, texteAttendu)
    }
  }
})

test("l'ordre change selon le tirage et l'original n'est pas modifié", () => {
  const ordres = new Set<string>()
  for (let graine = 0; graine < 30; graine++) {
    ordres.add(melangerPropositions(exercice, melangeGraine(graine)).choices.map((c) => c.text).join("|"))
  }
  assert.ok(ordres.size > 5)
  assert.equal(exercice.choices[0].letter, "A")
  assert.equal(exercice.gaps[1].answerLetter, "B")
  assert.equal(melangerPropositions(exercice).id, "pb-test")
})
