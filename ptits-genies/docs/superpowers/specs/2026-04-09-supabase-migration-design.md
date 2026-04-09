# Spec — Migration Supabase (Phase 2)

**Date :** 2026-04-09  
**Projet :** Les Ptits Génies  
**Statut :** Approuvé

---

## Contexte

L'app utilise actuellement Dexie.js (IndexedDB) pour stocker les comptes élèves, les sessions de jeu et la progression. Cette base de données est locale au navigateur : un élève ne peut pas se connecter depuis un autre appareil, et ses données sont perdues s'il vide son cache.

L'objectif de cette migration est de rendre les comptes et la progression accessibles depuis n'importe quel appareil, via Supabase (base de données PostgreSQL hébergée dans le cloud).

---

## Contraintes

- Les élèves ont entre 11 et 15 ans : **pas d'adresse email**, connexion par pseudo uniquement
- L'app est une SPA React sans backend serveur : la clé publique Supabase (anon key) sera dans le code — c'est l'usage prévu par Supabase
- Pas de migration de données existantes : l'app n'est pas encore publiée
- Pas de mode hors-ligne : 100% connecté accepté
- Ne pas modifier l'interface utilisateur (pages, composants, exercices)

---

## Approche retenue — Email synthétique

Supabase Auth fonctionne avec des emails. Pour contourner cela sans compromettre la sécurité, l'app génère un email invisible en coulisse :

```
pseudo saisi par l'élève : pierre
email envoyé à Supabase  : pierre@ptitsgenies.app
```

L'élève ne voit et ne sait jamais que cet email existe. Il tape uniquement son pseudo et son mot de passe. Supabase Auth gère l'authentification, les tokens JWT et le renouvellement de session automatiquement.

---

## Architecture

### Ce qui change

| Avant | Après |
|---|---|
| Dexie.js (IndexedDB) | Supabase (PostgreSQL) |
| PBKDF2 custom (hashService.ts) | Supabase Auth (bcrypt géré par Supabase) |
| sessionStorage pour la session | Token JWT géré automatiquement par Supabase |
| Données locales au navigateur | Données cloud, multi-appareils |

### Ce qui ne change pas

- Toutes les pages et composants React
- Les stores Zustand (interfaces internes)
- La logique des exercices
- Le design system et le style

---

## Schéma de la base de données Supabase

### Table `profiles`
Créée automatiquement lors de l'inscription, liée à `auth.users`.

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | uuid | PK, FK → auth.users.id |
| `username` | text | NOT NULL, UNIQUE |
| `total_points` | integer | NOT NULL, DEFAULT 0 |
| `created_at` | timestamptz | NOT NULL, DEFAULT now() |

### Table `sessions`
Historique des parties jouées par chaque élève.

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | uuid | PK, DEFAULT gen_random_uuid() |
| `user_id` | uuid | NOT NULL, FK → profiles.id |
| `exercise_type` | text | NOT NULL |
| `score` | integer | NOT NULL |
| `duration` | integer | NOT NULL (secondes) |
| `played_at` | timestamptz | NOT NULL, DEFAULT now() |
| `details` | jsonb | NOT NULL |

### Table `progress`
Meilleur score et statistiques par exercice et par élève. Une seule ligne par (user_id, exercise_type).

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | uuid | PK, DEFAULT gen_random_uuid() |
| `user_id` | uuid | NOT NULL, FK → profiles.id |
| `exercise_type` | text | NOT NULL |
| `total_sessions` | integer | NOT NULL, DEFAULT 0 |
| `best_score` | integer | NOT NULL, DEFAULT 0 |
| `avg_score` | integer | NOT NULL, DEFAULT 0 |
| `last_played` | timestamptz | NOT NULL |

Contrainte unique : `(user_id, exercise_type)`.

---

## Sécurité — Row Level Security (RLS)

Toutes les tables ont RLS activé. Les politiques garantissent qu'un élève ne peut accéder qu'à ses propres données.

### `profiles`
- SELECT : `auth.uid() = id`
- INSERT : `auth.uid() = id`
- UPDATE : `auth.uid() = id`

### `sessions`
- SELECT : `auth.uid() = user_id`
- INSERT : `auth.uid() = user_id`

### `progress`
- SELECT : `auth.uid() = user_id`
- INSERT : `auth.uid() = user_id`
- UPDATE : `auth.uid() = user_id`

---

## Fichiers à créer / modifier / supprimer

### Créés

| Fichier | Rôle |
|---|---|
| `src/lib/supabase.ts` | Initialisation du client Supabase (URL + anon key) |
| `src/services/supabase/authService.ts` | register(), login(), logout(), getSession() |
| `src/services/supabase/userService.ts` | getProfile(), updatePoints() |
| `src/services/supabase/scoreService.ts` | saveSession(), getHistory(), getProgress(), updateProgress() |
| `.env` | VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY |
| `.env.example` | Template sans valeurs sensibles, commité dans git |

### Modifiés

| Fichier | Modification |
|---|---|
| `src/store/authStore.ts` | Remplacer les appels Dexie par authService + userService Supabase |
| `src/store/progressStore.ts` | Remplacer les appels Dexie par scoreService Supabase |
| `package.json` | Ajouter `@supabase/supabase-js`, retirer `dexie` |
| `.gitignore` | Ajouter `.env` |

### Supprimés

| Fichier | Raison |
|---|---|
| `src/services/storage/db.ts` | Dexie remplacé par Supabase |
| `src/services/storage/userService.ts` | Remplacé par version Supabase |
| `src/services/storage/scoreService.ts` | Remplacé par version Supabase |
| `src/services/crypto/hashService.ts` | Supabase Auth gère le hashage |

Le fichier `src/services/storage/IStorageService.ts` peut être conservé comme référence ou supprimé — il n'est plus utilisé.

---

## Flux d'inscription

1. L'élève saisit un pseudo et un mot de passe dans `AuthPage`
2. `authStore.register()` appelle `authService.register(username, password)`
3. `authService` appelle `supabase.auth.signUp({ email: username + '@ptitsgenies.app', password })`
4. Si succès, `authService` insère une ligne dans `profiles` avec `id = auth.uid()` et `username`
5. `authStore` met à jour `currentUser` avec les données du profil

## Flux de connexion

1. L'élève saisit pseudo + mot de passe
2. `authStore.login()` appelle `authService.login(username, password)`
3. `authService` appelle `supabase.auth.signInWithPassword({ email: username + '@ptitsgenies.app', password })`
4. Si succès, `authService` récupère le profil depuis `profiles`
5. `authStore` met à jour `currentUser`

## Flux de sauvegarde d'une session

1. L'exercice se termine, appelle `progressStore.saveSession(session)`
2. `scoreService.save(session)` insère dans `sessions`
3. `scoreService.updateProgress(...)` fait un upsert dans `progress`
4. `userService.updatePoints(userId, delta)` met à jour `total_points` dans `profiles`

---

## Variables d'environnement

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

Ces valeurs sont visibles dans le dashboard Supabase → Settings → API. La `anon key` est publique par conception — la sécurité repose sur les politiques RLS.

---

## Étapes de configuration Supabase (à faire manuellement)

Avant de coder, ces étapes sont à réaliser dans le dashboard Supabase :

1. Créer les 3 tables avec les colonnes ci-dessus
2. Activer RLS sur chaque table
3. Créer les politiques SELECT/INSERT/UPDATE pour chaque table
4. Dans Authentication → Settings : désactiver "Confirm email" (les élèves n'ont pas d'email réel)
5. Récupérer l'URL et l'anon key dans Settings → API

---

## Critères de validation

- [ ] Un élève peut s'inscrire avec un pseudo + mot de passe
- [ ] Un élève peut se connecter depuis un autre navigateur/appareil
- [ ] Deux élèves avec le même pseudo sont refusés à l'inscription
- [ ] Un élève ne peut pas voir les scores d'un autre élève
- [ ] Les scores et la progression sont sauvegardés après chaque exercice
- [ ] La déconnexion efface bien la session
