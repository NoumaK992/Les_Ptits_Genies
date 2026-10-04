# Moteur de parcours (sous-projet B)

Date : 2026-10-04
Statut : design validé en conversation par Manu ; spec et plan validés par avance.

## Contexte

Refonte de P'tits Génies découpée en E (graphisme, livré) → **B (parcours)** → C (nouveaux jeux + vrais boss) → D (classement) → A (comptes créés par l'enseignant).

Usage visé : groupes de 8 élèves (11-14 ans, en difficulté ou dys), 20 séances de 30 min, une par semaine, **surtout sur ordinateur**. Un niveau = un jeu puis un boss. Les élèves doivent sentir qu'ils progressent.

## Décisions de Manu

1. **Rotation calée sur le niveau de l'élève**, pas sur le numéro de séance : un absent reprend où il en était.
2. **Boss raté** : on recommence le boss seul ; il s'adoucit à chaque échec ; les points du jeu restent acquis.
3. **Le jeu du niveau est validé dès qu'il est joué jusqu'au bout**, quel que soit le score. Le boss est le seul barrage.
4. **Parcours d'abord, jeu libre en bonus** : l'accueil mène au parcours ; la liste des exercices reste accessible ; les parties libres ne font pas avancer.
5. **Place dans le groupe par code** : l'élève saisit une fois un code donné par l'enseignant (`B5` = groupe B, place 5).

## Règles

### Rotation (carré latin)

Liste fixe de 8 emplacements (`JEUX_ROTATION`) :

| Emplacement | Jeu |
|---|---|
| 1 | Lecture rapide |
| 2 | L'Intrus |
| 3 | Coup d'œil |
| 4 | Mots cachés |
| 5 | Phrases brouillées |
| 6 | Collection |
| 7 | Ami/Ennemi |
| 8 | Lecture rapide (provisoire : remplacé par le 8e jeu du sous-projet C) |

Jeu d'un élève = emplacement `((place - 1) + (niveau - 1)) mod 8 + 1`. Sur 8 niveaux consécutifs, chaque place fait chaque emplacement exactement une fois ; à un niveau donné, les 8 places font 8 emplacements différents.

### Niveaux, tours, difficulté

- 20 niveaux. Tour 1 = niveaux 1-8, tour 2 = 9-16, tour 3 = 17-20.
- Difficulté d'une partie = `tour` pour le jeu, `tour + 1` pour le boss, plafonnée au maximum du jeu.

| Jeu | Paramètre piloté | Valeurs (difficulté 1 → max) | Choix secondaire |
|---|---|---|---|
| L'Intrus | niveau | 1, 2, 3, 4 (max 4 ; le niveau 5 « Génie » reste en jeu libre) | — |
| Coup d'œil | série | 1, 2, 3, 4 | — |
| Collection | niveau | 1, 2, 3 | — |
| Phrases brouillées | niveau | 1, 2, 3 | texte tiré au hasard |
| Ami/Ennemi | niveau | débutant, intermédiaire, professionnel | — |
| Lecture rapide | longueur + vitesse | 1 : niveau 1 à 70 mpm ; 2 : niveau 2 à 70 ; 3 : niveau 2 à 100 ; 4 : niveau 2 à 140 | texte tiré au hasard |
| Mots cachés | aucun (la difficulté monte seule sur 6 grilles) | — | thème tiré au hasard |

Lecture rapide n'utilise pas le niveau 3 (750 mots) : trop long pour une séance.

### Réussite d'une partie

Chaque jeu fournit, en fin de partie, un taux de réussite entre 0 et 1 :

| Jeu | Taux |
|---|---|
| L'Intrus | listes réussies / 10 |
| Coup d'œil | mots correctement classés / mots à trouver |
| Collection | bonnes réponses / questions |
| Phrases brouillées | trous justes / trous |
| Ami/Ennemi | manches réussies / manches |
| Lecture rapide | bonnes réponses au QCM / 3 |
| Mots cachés | sélections justes / (justes + oubliés + erreurs) ; 1 si ce total vaut 0 |

### Boss

- Boss provisoire (le vrai boss arrive avec C) : même jeu que le niveau, difficulté `tour + 1`.
- Seuil de victoire selon le nombre d'échecs déjà subis sur ce boss : 0 échec → 60 %, 1 → 50 %, 2 ou plus → 40 %.
- Boss battu : +100 points au profil, passage au niveau suivant, compteur d'échecs remis à 0.
- Boss raté : compteur d'échecs + 1, l'élève reste sur le boss.
- Une partie abandonnée (retour, fermeture) n'est pas enregistrée et ne compte pas comme un échec.

### États

`niveau` de 1 à 20, `etape` = `jeu` ou `boss`. Après le boss du niveau 20 : `niveau` = 21 = parcours terminé.

## Données (Supabase)

Nouvelle table `parcours`, une ligne par élève :

| Colonne | Type | Contraintes |
|---|---|---|
| `user_id` | uuid | clé primaire, référence `profiles(id)` on delete cascade |
| `groupe` | text | une lettre majuscule A-Z |
| `place` | smallint | 1 à 8 |
| `niveau` | smallint | 1 à 21, défaut 1 |
| `etape` | text | `jeu` ou `boss`, défaut `jeu` |
| `echecs_boss` | smallint | ≥ 0, défaut 0 |
| `updated_at` | timestamptz | défaut now() |

RLS activé : SELECT, INSERT, UPDATE limités à `auth.uid() = user_id`. Pas de DELETE côté élève.

Les parties continuent d'être enregistrées dans `sessions` comme aujourd'hui. Nouveau type d'exercice `ami-ennemi` : Ami/Ennemi enregistre désormais ses parties et ses points comme les autres jeux.

## Architecture

- `src/parcours/regles.ts` : fonctions pures (rotation, tour, difficulté, seuil, lecture du code, transition d'état). Testées avec `node --test` (aucune dépendance ajoutée ; Node 26 exécute TypeScript nativement).
- `src/services/supabase/parcoursService.ts` : lecture / création / mise à jour de la ligne `parcours`.
- `src/store/parcoursStore.ts` (zustand, comme les stores existants) : état chargé, `rejoindre(code)`, `terminerPartie(reussite)` qui applique la règle, enregistre, ajoute le bonus boss et mémorise le dernier événement à afficher.
- `src/parcours/useModeParcours.ts` : lit l'adresse `?parcours=jeu|boss&d=N`. Chaque jeu l'utilise pour démarrer directement à la bonne difficulté et appeler `terminerPartie` en fin de partie.
- `EcranFin` reçoit une prop `parcours` : à la place de « Rejouer » / « Retour », un seul bouton « Continuer mon parcours → » vers `/parcours`.
- Nouvelle page `src/pages/ParcoursPage.tsx` (route `/parcours`) : saisie du code, carte du niveau (jeu → boss), frise des 20 niveaux, bouton Jouer, annonce du résultat du boss, écran final.
- `HomePage` : bloc « Mon parcours » en tête (niveau, jeu du jour, bouton).

## Écrans et messages

- Code : « Ton code de groupe ? » ; erreur « Le code, c'est une lettre suivie d'un chiffre de 1 à 8 (exemple : B5) ».
- Carte du niveau : 🎮 jeu → 👾 boss ; étape en cours en jaune, étape faite cochée ✓.
- Avant le boss : « 👾 Boss du niveau N », objectif « X % de bonnes réponses ».
- Boss battu : « Boss vaincu ! +100 points », bouton vers le niveau suivant.
- Boss raté : « Le boss a résisté ! Il sera plus faible au prochain essai », objectif adouci affiché, bouton « Retenter ».
- Fin : « Parcours terminé 🏆 ».
- Erreur d'enregistrement : « Impossible d'enregistrer ta progression. Préviens ton professeur. » ; l'état n'avance pas.

## Corrections de jeux incluses (nécessaires à un taux de réussite juste)

- L'Intrus : le nombre de listes réussies enregistré oublie la dernière liste ; le chrono de la première liste n'est pas réinitialisé au niveau choisi.
- Ami/Ennemi : aucune partie enregistrée ; le bilan affiche toujours 5 séries réussies.

## Hors périmètre

Chrono de 15 min imposé, classement (D), écran enseignant et gestion des groupes (A), vrais boss et 8e jeu (C).

## Vérification

- `node --test src/parcours` : rotation (carré latin sur 8 niveaux et 8 places), tours, difficulté plafonnée, seuils 60/50/40, transitions jeu → boss → niveau suivant, échec, niveau 20 → terminé, lecture des codes valides et invalides.
- `npm run build` sans erreur ; `node scripts/verifier-style.mjs` OK.
- Playwright (Supabase simulé avec une table `parcours` en mémoire) : code → jeu → boss raté → seuil adouci affiché → boss réussi → niveau 2 avec le jeu suivant de la rotation ; une partie abandonnée ne change rien ; affichage ordinateur 1280 px.
