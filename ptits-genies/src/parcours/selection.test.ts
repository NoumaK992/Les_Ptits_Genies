import { test } from "node:test"
import assert from "node:assert/strict"
import { choisirItems, melangeGraine } from "./selection.ts"

const pool = ["a", "b", "c", "d", "e"].map((id) => ({ id }))

test("prend d abord des éléments jamais vus", () => {
  const vus = { a: "2026-10-01T10:00:00Z", b: "2026-10-02T10:00:00Z" }
  const choix = choisirItems(pool, vus, 3)
  assert.equal(choix.length, 3)
  assert.deepEqual(choix.map((x) => x.id).sort(), ["c", "d", "e"])
})

test("réserve épuisée : complète avec les moins récemment vus", () => {
  const vus = { a: "2026-10-03T10:00:00Z", b: "2026-10-01T10:00:00Z", c: "2026-10-02T10:00:00Z", d: "2026-10-04T10:00:00Z" }
  const choix = choisirItems(pool, vus, 3).map((x) => x.id)
  assert.equal(choix[0], "e")
  assert.deepEqual(choix.slice(1), ["b", "c"])
})

test("jamais de doublon, même si on demande plus que la réserve", () => {
  const choix = choisirItems(pool, {}, 10).map((x) => x.id)
  assert.equal(choix.length, 5)
  assert.equal(new Set(choix).size, 5)
})

test("sans historique, l ordre dépend du hasard fourni", () => {
  const a = choisirItems(pool, {}, 5, melangeGraine(1)).map((x) => x.id).join("")
  const b = choisirItems(pool, {}, 5, melangeGraine(1)).map((x) => x.id).join("")
  const c = choisirItems(pool, {}, 5, melangeGraine(2)).map((x) => x.id).join("")
  assert.equal(a, b)
  assert.notEqual(a, c)
})
