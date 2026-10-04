import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  JEUX_ROTATION, PARTIES_PAR_JEU, jeuDuNiveau, jeuDeLEtape, tourDuNiveau, difficulte, seuilBoss, lireCode,
  appliquerResultat, tauxReussite, lienPartie, parametresLecture, niveauAmiEnnemi, partieValide, estVerrouille, pointsLibres,
  type EtatParcours,
} from './regles.ts'

const AUJ = '2026-10-05'
const etat = (e: Partial<EtatParcours> = {}): EtatParcours => ({
  groupe: 'B', place: 1, niveau: 1, etape: 'jeu', echecsBoss: 0,
  partiesFaites: 0, niveauValideLe: null, bossApresEchec: 0, manche: 0, ...e,
})

test('Lecture rapide ne fait plus partie de la rotation', () => {
  assert.ok(!JEUX_ROTATION.includes('lecture-rapide'))
  assert.equal(JEUX_ROTATION.length, 6)
})

test('chaque élève fait chaque jeu une fois avant d en refaire un (2 jeux par séance)', () => {
  const n = JEUX_ROTATION.length
  for (let place = 1; place <= 8; place++) {
    const suite = Array.from({ length: 40 }, (_, k) => jeuDuNiveau(place, Math.floor(k / 2) + 1, (k % 2) as 0 | 1))
    for (let debut = 0; debut + n <= suite.length; debut += n) assert.equal(new Set(suite.slice(debut, debut + n)).size, n)
  }
})

test('une séance propose deux jeux différents', () => {
  for (let place = 1; place <= 8; place++)
    for (let niveau = 1; niveau <= 20; niveau++) assert.notEqual(jeuDuNiveau(place, niveau, 0), jeuDuNiveau(place, niveau, 1))
})

test('à une étape donnée, les places jouent des jeux différents (autant que de jeux disponibles)', () => {
  const n = Math.min(8, JEUX_ROTATION.length)
  for (let niveau = 1; niveau <= 20; niveau++)
    for (const manche of [0, 1] as const)
      assert.equal(new Set(Array.from({ length: n }, (_, i) => jeuDuNiveau(i + 1, niveau, manche))).size, n)
})

test('rotation : décalage d un jeu par niveau', () => {
  assert.equal(jeuDuNiveau(1, 1), JEUX_ROTATION[0])
  assert.equal(jeuDuNiveau(2, 1), JEUX_ROTATION[1])
  assert.equal(jeuDuNiveau(1, 1, 1), JEUX_ROTATION[1])
  assert.equal(jeuDuNiveau(1, 2), JEUX_ROTATION[2])
})

test('jeu de l étape : la lecture de fin de niveau est toujours Lecture rapide', () => {
  assert.equal(jeuDeLEtape(etat({ etape: 'jeu' })), jeuDuNiveau(1, 1))
  assert.equal(jeuDeLEtape(etat({ etape: 'boss' })), jeuDuNiveau(1, 1))
  assert.equal(jeuDeLEtape(etat({ etape: 'lecture' })), 'lecture-rapide')
})

test('entraînement raccourci (~5 min par jeu, deux jeux par séance)', () => {
  assert.equal(PARTIES_PAR_JEU['phrases-brouillees'], 3)
  assert.equal(PARTIES_PAR_JEU['word-search'], 1)
  assert.equal(PARTIES_PAR_JEU.intrus, 1)
  assert.equal(PARTIES_PAR_JEU.collection, 2)
})

test('tours', () => {
  assert.equal(tourDuNiveau(1), 1); assert.equal(tourDuNiveau(8), 1)
  assert.equal(tourDuNiveau(9), 2); assert.equal(tourDuNiveau(16), 2)
  assert.equal(tourDuNiveau(17), 3); assert.equal(tourDuNiveau(20), 3)
})

test('difficulté : tour, +1 pour le boss, tour pour la lecture, plafonnée', () => {
  assert.equal(difficulte('intrus', 1, 'jeu'), 1)
  assert.equal(difficulte('intrus', 1, 'boss'), 2)
  assert.equal(difficulte('lecture-rapide', 9, 'lecture'), 2)
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

test('entraînement : une partie terminée compte, sans passer au boss avant la dernière', () => {
  const e = etat({ place: 4 }) // place 4, niveau 1, manche 0 → Phrases brouillées (3 parties)
  assert.equal(jeuDuNiveau(4, 1), 'phrases-brouillees')
  const r = appliquerResultat(e, 0, AUJ)
  assert.equal(r.evenement, 'partie-terminee')
  assert.deepEqual(r.etat, etat({ place: 4, partiesFaites: 1 }))
})

test('entraînement : la dernière partie ouvre le boss, quel que soit le score', () => {
  const r = appliquerResultat(etat({ place: 4, partiesFaites: 2 }), 0, AUJ)
  assert.equal(r.evenement, 'jeu-termine')
  assert.deepEqual(r.etat, etat({ place: 4, etape: 'boss', partiesFaites: 0 }))
})

test('boss de la 1re manche battu → entraînement du 2e jeu de la séance', () => {
  const r = appliquerResultat(etat({ etape: 'boss' }), 0.6, AUJ)
  assert.equal(r.evenement, 'boss-battu')
  assert.deepEqual(r.etat, etat({ etape: 'jeu', manche: 1 }))
})

test('boss de la 2e manche battu → lecture de fin de niveau', () => {
  const r = appliquerResultat(etat({ etape: 'boss', manche: 1 }), 0.6, AUJ)
  assert.equal(r.evenement, 'boss-battu')
  assert.deepEqual(r.etat, etat({ etape: 'lecture', manche: 1 }))
})

test('3 sur 5 suffit au premier essai (arrondi des flottants)', () => {
  assert.equal(appliquerResultat(etat({ etape: 'boss' }), 3 / 5, AUJ).evenement, 'boss-battu')
})

test('boss battu après un échec : compté pour la persévérance', () => {
  const r = appliquerResultat(etat({ etape: 'boss', manche: 1, echecsBoss: 2, bossApresEchec: 1 }), 0.4, AUJ)
  assert.equal(r.evenement, 'boss-battu')
  assert.deepEqual(r.etat, etat({ etape: 'lecture', manche: 1, echecsBoss: 0, bossApresEchec: 2 }))
})

test('boss raté → reste au boss, échecs + 1', () => {
  const r = appliquerResultat(etat({ etape: 'boss' }), 0.59, AUJ)
  assert.equal(r.evenement, 'boss-rate')
  assert.deepEqual(r.etat, etat({ etape: 'boss', echecsBoss: 1 }))
})

test('lecture faite → niveau suivant, daté du jour', () => {
  const r = appliquerResultat(etat({ etape: 'lecture', manche: 1 }), 0, AUJ)
  assert.equal(r.evenement, 'niveau-termine')
  assert.deepEqual(r.etat, etat({ niveau: 2, manche: 0, niveauValideLe: AUJ }))
})

test('lecture du niveau 20 → parcours terminé', () => {
  const r = appliquerResultat(etat({ niveau: 20, etape: 'lecture' }), 1, AUJ)
  assert.equal(r.evenement, 'parcours-termine')
  assert.equal(r.etat.niveau, 21)
})

test('appliquer un résultat sur un parcours terminé est refusé', () => {
  assert.throws(() => appliquerResultat(etat({ niveau: 21 }), 1, AUJ))
})

test('un niveau par jour : verrouillé le jour même, ouvert le lendemain', () => {
  const e = etat({ niveau: 2, niveauValideLe: AUJ })
  assert.equal(estVerrouille(e, AUJ), true)
  assert.equal(estVerrouille(e, '2026-10-06'), false)
  assert.equal(estVerrouille(etat({ niveau: 2, niveauValideLe: null }), AUJ), false)
  // Une fois l'entraînement commencé (autre onglet resté ouvert la veille…), on ne bloque pas en plein niveau.
  assert.equal(estVerrouille(etat({ niveau: 2, niveauValideLe: AUJ, partiesFaites: 1 }), AUJ), false)
  assert.equal(estVerrouille(etat({ niveau: 2, niveauValideLe: AUJ, manche: 1 }), AUJ), false)
  assert.equal(estVerrouille(etat({ niveau: 21, niveauValideLe: AUJ }), AUJ), false)
})

test('taux de réussite borné, 1 si rien à trouver', () => {
  assert.equal(tauxReussite(3, 4), 0.75)
  assert.equal(tauxReussite(0, 0), 1)
  assert.equal(tauxReussite(5, 4), 1)
})

test('lien de partie : jeu, boss et lecture portent le niveau', () => {
  assert.equal(lienPartie(etat({ place: 1 })), '/exercices/intrus?parcours=jeu&d=1&n=1')
  assert.equal(lienPartie(etat({ place: 1, etape: 'boss' })), '/exercices/intrus?parcours=boss&d=2&n=1')
  assert.equal(lienPartie(etat({ place: 1, etape: 'lecture', niveau: 9 })), '/exercices/lecture-rapide?parcours=lecture&d=2&n=9')
  assert.equal(lienPartie(etat({ place: 1, manche: 1 })), '/exercices/coup-doeil?parcours=jeu&d=1&n=1')
})

test('une partie ne compte que si étape, niveau et jeu correspondent à l état en base', () => {
  const e = etat({ place: 2, niveau: 3, etape: 'boss' })
  const jeu = jeuDuNiveau(2, 3)
  assert.equal(partieValide(e, { etape: 'boss', niveau: 3, jeu }), true)
  assert.equal(partieValide(e, { etape: 'jeu', niveau: 3, jeu }), false)
  assert.equal(partieValide(e, { etape: 'boss', niveau: 2, jeu }), false)
  assert.equal(partieValide(e, { etape: 'boss', niveau: 3, jeu: jeuDuNiveau(2, 2) }), false)
  assert.equal(partieValide(etat({ niveau: 3, etape: 'lecture' }), { etape: 'lecture', niveau: 3, jeu: 'lecture-rapide' }), true)
  assert.equal(partieValide(etat({ niveau: 21 }), { etape: 'jeu', niveau: 21, jeu }), false)
})

test('paramètres Lecture rapide et Ami/Ennemi', () => {
  assert.deepEqual(parametresLecture(1), { niveau: 1, vitesse: 1 })
  assert.deepEqual(parametresLecture(4), { niveau: 2, vitesse: 3 })
  assert.equal(niveauAmiEnnemi(1), 'debutant')
  assert.equal(niveauAmiEnnemi(3), 'professionnel')
})

test("entraînement libre : 20 % puis 10 % puis plus rien pour le même jeu dans la journée", () => {
  assert.equal(pointsLibres(500, 0), 100)
  assert.equal(pointsLibres(500, 1), 50)
  assert.equal(pointsLibres(500, 2), 0)
  assert.equal(pointsLibres(500, 9), 0)
  assert.equal(pointsLibres(333, 0), 67)
  assert.equal(pointsLibres(-10, 0), 0)
})
