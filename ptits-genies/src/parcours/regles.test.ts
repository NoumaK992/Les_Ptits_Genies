import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  JEUX_ROTATION, jeuDuNiveau, tourDuNiveau, difficulte, seuilBoss, lireCode,
  appliquerResultat, tauxReussite, lienPartie, parametresLecture, niveauAmiEnnemi, partieValide,
  type EtatParcours,
} from './regles.ts'

const etat = (e: Partial<EtatParcours> = {}): EtatParcours =>
  ({ groupe: 'B', place: 1, niveau: 1, etape: 'jeu', echecsBoss: 0, ...e })

test('carré latin : sur 8 niveaux consécutifs, chaque place fait chaque emplacement une fois', () => {
  for (let place = 1; place <= 8; place++) {
    for (const debut of [1, 9]) {
      const emplacements = new Set<number>()
      for (let niveau = debut; niveau < debut + 8; niveau++) emplacements.add(((place - 1) + (niveau - 1)) % 8)
      assert.equal(emplacements.size, 8)
    }
  }
})

test('à un niveau donné, les 8 places jouent les 8 emplacements', () => {
  for (let niveau = 1; niveau <= 20; niveau++) {
    const jeux = Array.from({ length: 8 }, (_, i) => jeuDuNiveau(i + 1, niveau))
    assert.deepEqual([...jeux].sort(), [...JEUX_ROTATION].sort())
  }
})

test('rotation : décalage d un emplacement par niveau', () => {
  assert.equal(jeuDuNiveau(1, 1), JEUX_ROTATION[0])
  assert.equal(jeuDuNiveau(2, 1), JEUX_ROTATION[1])
  assert.equal(jeuDuNiveau(1, 2), JEUX_ROTATION[1])
  assert.equal(jeuDuNiveau(8, 2), JEUX_ROTATION[0])
})

test('tours', () => {
  assert.equal(tourDuNiveau(1), 1); assert.equal(tourDuNiveau(8), 1)
  assert.equal(tourDuNiveau(9), 2); assert.equal(tourDuNiveau(16), 2)
  assert.equal(tourDuNiveau(17), 3); assert.equal(tourDuNiveau(20), 3)
})

test('difficulté : tour, +1 pour le boss, plafonnée', () => {
  assert.equal(difficulte('intrus', 1, 'jeu'), 1)
  assert.equal(difficulte('intrus', 1, 'boss'), 2)
  assert.equal(difficulte('intrus', 20, 'boss'), 4)
  assert.equal(difficulte('collection', 20, 'boss'), 3)
  assert.equal(difficulte('word-search', 20, 'boss'), 1)
})

test('seuils du boss : 60 %, 50 %, puis 40 %', () => {
  assert.equal(seuilBoss(0), 0.6); assert.equal(seuilBoss(1), 0.5)
  assert.equal(seuilBoss(2), 0.4); assert.equal(seuilBoss(7), 0.4)
})

test('lecture des codes', () => {
  assert.deepEqual(lireCode('B5'), { groupe: 'B', place: 5 })
  assert.deepEqual(lireCode(' b5 '), { groupe: 'B', place: 5 })
  for (const mauvais of ['', 'B', '5', 'B9', 'B0', 'BB5', 'B55', '5B', 'é5']) assert.equal(lireCode(mauvais), null, mauvais)
})

test('jeu terminé → boss, quel que soit le score', () => {
  const r = appliquerResultat(etat(), 0)
  assert.equal(r.evenement, 'jeu-termine')
  assert.deepEqual(r.etat, etat({ etape: 'boss' }))
})

test('boss battu au seuil → niveau suivant, échecs remis à 0', () => {
  const r = appliquerResultat(etat({ etape: 'boss', echecsBoss: 1 }), 0.5)
  assert.equal(r.evenement, 'boss-battu')
  assert.deepEqual(r.etat, etat({ niveau: 2, etape: 'jeu', echecsBoss: 0 }))
})

test('3 sur 5 suffit au premier essai (arrondi des flottants)', () => {
  assert.equal(appliquerResultat(etat({ etape: 'boss' }), 3 / 5).evenement, 'boss-battu')
})

test('boss raté → reste au boss, échecs + 1', () => {
  const r = appliquerResultat(etat({ etape: 'boss' }), 0.59)
  assert.equal(r.evenement, 'boss-rate')
  assert.deepEqual(r.etat, etat({ etape: 'boss', echecsBoss: 1 }))
})

test('boss du niveau 20 battu → parcours terminé', () => {
  const r = appliquerResultat(etat({ niveau: 20, etape: 'boss' }), 1)
  assert.equal(r.evenement, 'parcours-termine')
  assert.equal(r.etat.niveau, 21)
})

test('appliquer un résultat sur un parcours terminé est refusé', () => {
  assert.throws(() => appliquerResultat(etat({ niveau: 21 }), 1))
})

test('taux de réussite borné, 1 si rien à trouver', () => {
  assert.equal(tauxReussite(3, 4), 0.75)
  assert.equal(tauxReussite(0, 0), 1)
  assert.equal(tauxReussite(5, 4), 1)
})

test('lien de partie', () => {
  assert.equal(lienPartie(etat({ place: 2 })), '/exercices/intrus?parcours=jeu&d=1&n=1')
  assert.equal(lienPartie(etat({ place: 2, etape: 'boss' })), '/exercices/intrus?parcours=boss&d=2&n=1')
})

test('paramètres Lecture rapide et Ami/Ennemi', () => {
  assert.deepEqual(parametresLecture(1), { niveau: 1, vitesse: 1 })
  assert.deepEqual(parametresLecture(4), { niveau: 2, vitesse: 3 })
  assert.equal(niveauAmiEnnemi(1), 'debutant')
  assert.equal(niveauAmiEnnemi(3), 'professionnel')
})

test("le lien de partie porte le niveau", () => {
  assert.equal(lienPartie(etat({ place: 2, niveau: 3 })), "/exercices/recherche-mots?parcours=jeu&d=1&n=3")
})

test("une partie ne compte que si étape, niveau et jeu correspondent à l état en base", () => {
  const e = etat({ place: 2, niveau: 3, etape: "boss" })
  const jeu = jeuDuNiveau(2, 3)
  assert.equal(partieValide(e, { etape: "boss", niveau: 3, jeu }), true)
  assert.equal(partieValide(e, { etape: "jeu", niveau: 3, jeu }), false)
  assert.equal(partieValide(e, { etape: "boss", niveau: 2, jeu }), false)
  assert.equal(partieValide(e, { etape: "boss", niveau: 3, jeu: jeuDuNiveau(2, 2) }), false)
  assert.equal(partieValide(etat({ niveau: 21 }), { etape: "jeu", niveau: 21, jeu }), false)
})
