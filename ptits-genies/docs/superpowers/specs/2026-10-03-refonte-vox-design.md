# Refonte graphique « Vox Collage » (sous-projet E)

Date : 2026-10-03 (validée le 2026-10-04)
Statut : design validé en conversation, en attente de relecture de la spec

## Contexte

P'tits Génies est une app de fluence de lecture pour des élèves de 11-14 ans en difficulté ou dys. La refonte globale est découpée en sous-projets, dans cet ordre : **E graphisme** → B moteur de parcours → C nouveaux jeux + boss → D classement → A comptes enseignant.

Ce document couvre uniquement **E**. Objectif : donner à toute l'app existante un style unique, inspiré de Vox (variante « Collage »), et poser une boîte à outils de composants que B et C réutiliseront.

État actuel constaté :
- `tailwind.config.js` déclare un thème violet/orange (`primary #7C6FF7`, `bg #F8F7FF`, lueurs colorées).
- Une soixantaine de couleurs hexadécimales sont écrites en dur dans les pages (31 dans `DashboardPage.tsx`, 13 dans `ChasseurDIntrus.tsx`…), plus de nombreuses classes `gray-*`, `orange-*`, `green-*`, `red-*`.
- `src/components/ui/Button.tsx` et `Card.tsx` sont des copies génériques non adaptées (classes `bg-card`, `ring-ring` inexistantes), utilisées par 2 pages seulement.
- Polices Nunito et Fredoka chargées dans `src/index.css`.
- L'accueil a un mode sombre ; `AppShell` affiche une barre latérale violette.

## Périmètre

Inclus : coquille de l'app, connexion, accueil, liste des exercices, les 6 jeux (Mots cachés, Intrus, Lecture rapide, Coup d'œil, Phrases brouillées, Collection), page Ami/Ennemi (vide, restylée telle quelle), tableau de bord.

Exclus : toute modification des règles des jeux, des scores, des données, de l'authentification. Seul l'habillage change.

## Section 1 : nuancier central

Les anciennes couleurs de `tailwind.config.js` sont remplacées par des noms d'usage. Les pages utilisent ces noms (`bg-sable`, `text-encre`), jamais de code hexadécimal.

| Token | Valeur | Usage |
|---|---|---|
| `sable` | `#EFE6D2` | fond de toutes les pages |
| `papier` | `#FBF7EE` | fond des cartes |
| `encre` | `#1A1A1A` | texte, bordures, ombres |
| `jaune` | `#FFE14D` | accent : étiquettes, élément sélectionné, bouton principal |
| `rose` | `#E8547A` | formes décoratives, accents |
| `rose-pale` | `#F4A3B6` | formes décoratives, bouton secondaire au survol |
| `bleu` | `#8FA8F0` | formes décoratives, infos |
| `juste` | `#2E9E6A` | bonne réponse |
| `faux` | `#E5604A` | mauvaise réponse |

Règles :
- Le jaune n'est jamais utilisé en grand aplat de fond de page (fatigue visuelle).
- Le texte posé sur `jaune`, `juste`, `faux`, `rose-pale` ou `bleu` est en `encre`. Tout couple texte/fond doit atteindre un contraste WCAG AA (4,5:1).
- Juste/faux ne reposent jamais sur la seule couleur : icône ✓ / ✗ systématique, plus une animation (petit rebond pour juste, secousse pour faux).
- Ombres : suppression de `card`, `card-hover`, `glow*`. Une seule famille d'ombres dures noires décalées, sans flou : `dur-sm` (2px 2px), `dur` (4px 4px), `dur-lg` (6px 6px).
- Bordures : 2px `encre` par défaut, 3px pour les boutons.
- Polices : `Lexend` (famille `font-texte`, par défaut sur `body`) pour tout le texte ; `Archivo Black` (famille `font-titre`) pour les titres. Chargement Google Fonts dans `src/index.css` à la place de Nunito et Fredoka.
- Les animations existantes (`float`, `pop-in`, `wiggle`, `slide-up`, `shimmer`) sont conservées. Ajout de `secousse` pour les mauvaises réponses.

## Section 2 : boîte à outils de composants

Tous dans `src/components/ui/`. Chaque composant a un seul rôle, accepte `className` pour les ajustements, et n'utilise que les tokens. Pas de nouvelle dépendance : Tailwind, `clsx`, `tailwind-merge` et Framer Motion sont déjà présents. La fonction utilitaire `cn` (aujourd'hui dupliquée dans Button et Card) est déplacée dans `src/lib/cn.ts`.

1. **`Bouton`** : bordure 3px encre, ombre `dur`. Au clic, translation de 4px vers le bas-droite et ombre supprimée (effet « enfoncé »). Variantes : `principal` (fond jaune), `secondaire` (fond papier), `discret` (sans bordure ni ombre, pour « Retour »). Hauteur minimale 48px (cible tactile). État désactivé : opacité réduite, pas d'effet de clic. Remplace `Button.tsx`.
2. **`Carte`** : fond papier, bordure 2px encre, ombre `dur`, coins légèrement arrondis. Remplace `Card.tsx` (les sous-composants inutilisés sont supprimés).
3. **`Etiquette`** : autocollant jaune, texte Archivo Black en majuscules, bordure encre, légère rotation (-2°). Pour les titres de section.
4. **`BoutonMot`** : mot cliquable des jeux. Prop `etat` : `normal` (papier), `selectionne` (jaune), `juste` (vert + ✓ + rebond), `faux` (rouge + ✗ + secousse). Texte en Lexend, taille confortable.
5. **`EnTete`** : barre du haut des jeux. Bouton retour (variante discrète), titre Archivo Black, emplacement libre à droite (score, chrono).
6. **`EcranFin`** : écran de fin commun aux jeux. Props : titre, score, nombre d'étoiles (0 à 3), actions « Rejouer » et « Retour ». Réutilisé plus tard par B pour « Boss battu ».
7. **`Decor`** : formes découpées rose-pâle et bleu en position fixe dans les coins de la page, derrière le contenu (`z-index` inférieur, `pointer-events: none`), jamais sous une zone de texte. Masqué ou réduit sur mobile si les formes gênent la lecture.

Hors périmètre (YAGNI) : modales, menus déroulants, onglets, tant qu'aucune page n'en a besoin.

## Section 3 : ordre de reprise

Un commit par étape, pour pouvoir annuler une page seule.

1. Nuancier, polices, déplacement de `cn`, création des 7 composants. Les anciens tokens restent provisoirement pour ne rien casser.
2. `AppShell` : suppression de la barre latérale violette, barre du haut simple sur fond sable, `Decor` intégré.
3. `AuthPage`, puis `HomePage` (suppression du mode sombre), puis `ExercisesPage`.
4. Les jeux, du plus simple au plus complexe : Coup d'œil, Intrus (dont `ChasseurDIntrus`), Phrases brouillées, Lecture rapide, Collection, Ami/Ennemi, Mots cachés. Chaque jeu adopte `EnTete`, `BoutonMot` quand il a des mots cliquables, et `EcranFin`.
5. `DashboardPage`.
6. Ménage : suppression des anciens tokens (`primary`, `secondary`, `accent`, `bg`, `success`, `error`, `ink`, ombres `glow*`) et des polices Nunito/Fredoka. Toute référence restante est corrigée. Recherche finale : aucun code hexadécimal ni classe `gray-*`, `purple-*`, `orange-*` etc. dans `src/**/*.tsx`.

## Section 4 : vérification

- `npm run build` sans erreur de type à chaque étape.
- Les tests existants passent.
- Test Playwright final (skill `playwright-skill`) sur trois largeurs : mobile (375px), tablette (768px), ordinateur (1280px), pour chaque page :
  - pas de défilement horizontal ni de débordement ;
  - formes décoratives jamais au-dessus ou derrière du texte ;
  - chaque jeu jouable jusqu'à son `EcranFin` ;
  - captures d'écran conservées pour comparaison.
- Contraste vérifié pour chaque couple texte/fond du nuancier (AA).
- Contrôle visuel par Manu sur les captures avant de clore E.

## Critères de réussite

- Toutes les pages listées dans le périmètre utilisent le fond sable, Lexend, Archivo Black et les composants de la boîte à outils.
- Aucune couleur écrite en dur dans les composants React.
- Le comportement des jeux, scores et données est identique à avant.
- Un nouveau jeu peut être construit uniquement avec `EnTete`, `Carte`, `BoutonMot`, `Bouton` et `EcranFin`.
