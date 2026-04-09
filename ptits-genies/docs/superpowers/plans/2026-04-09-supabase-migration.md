# Migration Supabase — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remplacer Dexie.js (IndexedDB) par Supabase pour rendre les comptes élèves accessibles depuis n'importe quel appareil.

**Architecture:** L'authentification utilise Supabase Auth avec un email synthétique invisible (`pseudo@ptitsgenies.app`). Les données (sessions, progression) sont stockées dans des tables Supabase PostgreSQL protégées par RLS. Les stores Zustand (`authStore`, `progressStore`) sont redirigés vers de nouveaux services Supabase dans `src/services/supabase/`.

**Tech Stack:** `@supabase/supabase-js` v2, Supabase Auth (email synthétique), PostgreSQL (Supabase), Zustand, React 18, TypeScript, Vite.

---

## Fichiers concernés

| Action | Fichier |
|---|---|
| Créer | `src/lib/supabase.ts` |
| Créer | `src/services/supabase/authService.ts` |
| Créer | `src/services/supabase/userService.ts` |
| Créer | `src/services/supabase/scoreService.ts` |
| Créer | `.env` |
| Créer | `.env.example` |
| Modifier | `src/store/authStore.ts` |
| Modifier | `src/store/progressStore.ts` |
| Modifier | `.gitignore` |
| Supprimer | `src/services/storage/db.ts` |
| Supprimer | `src/services/storage/userService.ts` |
| Supprimer | `src/services/storage/scoreService.ts` |
| Supprimer | `src/services/storage/IStorageService.ts` |
| Supprimer | `src/services/crypto/hashService.ts` |

---

## Tâche 1 — Ajouter la fonction SQL de vérification de pseudo

Cette fonction PostgreSQL permet de vérifier si un pseudo est disponible avant l'inscription, sans exposer tous les profils publiquement.

**Fichiers :** Aucun fichier local — opération dans le dashboard Supabase.

- [ ] **Étape 1 : Exécuter la fonction SQL dans Supabase**

Aller dans **SQL Editor** du dashboard Supabase, créer une nouvelle query, coller et exécuter :

```sql
create or replace function public.is_username_available(username_to_check text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select not exists (
    select 1 from public.profiles
    where username = lower(trim(username_to_check))
  );
$$;
```

Résultat attendu : `Success. No rows returned`

---

## Tâche 2 — Installation des dépendances et configuration

**Fichiers :**
- Modifier : `package.json` (via npm)
- Créer : `.env`
- Créer : `.env.example`
- Modifier : `.gitignore`

- [ ] **Étape 1 : Installer le client Supabase et retirer Dexie**

Dans le terminal, depuis le dossier `ptits-genies/` :

```bash
npm install @supabase/supabase-js
npm uninstall dexie
```

- [ ] **Étape 2 : Créer le fichier `.env`**

Créer `ptits-genies/.env` avec le contenu suivant (remplacer les valeurs par celles de ton dashboard Supabase → Settings → API) :

```env
VITE_SUPABASE_URL=https://sumledptvlmierdhzmjy.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1bWxlZHB0dmxtaWVyZGh6bWp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3MTQzNDQsImV4cCI6MjA5MTI5MDM0NH0.JGeFJ9KXQHhFT-V2n5tWyNWrG8QXXCP7cVhHeiPZhFY
```

- [ ] **Étape 3 : Créer `.env.example`** (ce fichier sera commité dans git comme modèle)

Créer `ptits-genies/.env.example` :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_anon_key_ici
```

- [ ] **Étape 4 : Mettre à jour `.gitignore`**

Ouvrir `ptits-genies/.gitignore` et ajouter à la fin :

```
# Variables d'environnement
.env
.env.local
```

- [ ] **Étape 5 : Vérifier que Vite démarre sans erreur**

```bash
npm run dev
```

Résultat attendu : serveur démarré sans erreur TypeScript.

- [ ] **Étape 6 : Commit**

```bash
git add .env.example .gitignore package.json package-lock.json
git commit -m "feat: installer @supabase/supabase-js, retirer dexie"
```

---

## Tâche 3 — Créer le client Supabase

**Fichiers :**
- Créer : `src/lib/supabase.ts`

- [ ] **Étape 1 : Créer `src/lib/supabase.ts`**

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

- [ ] **Étape 2 : Vérifier qu'il n'y a pas d'erreur TypeScript**

```bash
npm run build 2>&1 | head -20
```

Résultat attendu : aucune erreur sur `src/lib/supabase.ts`.

- [ ] **Étape 3 : Commit**

```bash
git add src/lib/supabase.ts
git commit -m "feat: initialiser le client Supabase"
```

---

## Tâche 4 — Créer authService (inscription / connexion / déconnexion)

**Fichiers :**
- Créer : `src/services/supabase/authService.ts`

- [ ] **Étape 1 : Créer `src/services/supabase/authService.ts`**

```typescript
import { supabase } from '@/lib/supabase'

const DOMAIN = '@ptitsgenies.app'

function toEmail(username: string): string {
  return `${username.toLowerCase().trim()}${DOMAIN}`
}

export type RegisterResult =
  | { success: true; user: { id: string; username: string } }
  | { success: false; error: 'username_taken' | 'unknown' }

export type LoginResult =
  | { success: true; user: { id: string; username: string; totalPoints: number } }
  | { success: false; error: 'invalid_credentials' | 'unknown' }

export const authService = {
  async register(username: string, password: string): Promise<RegisterResult> {
    const cleanUsername = username.toLowerCase().trim()

    // Vérifier la disponibilité du pseudo via la fonction SQL
    const { data: available, error: rpcError } = await supabase
      .rpc('is_username_available', { username_to_check: cleanUsername })

    if (rpcError || !available) {
      return { success: false, error: 'username_taken' }
    }

    // Créer le compte Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: toEmail(cleanUsername),
      password,
    })

    if (error || !data.user) {
      return { success: false, error: 'unknown' }
    }

    // Créer le profil dans la table profiles
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({ id: data.user.id, username: cleanUsername })

    if (profileError) {
      return { success: false, error: 'unknown' }
    }

    return { success: true, user: { id: data.user.id, username: cleanUsername } }
  },

  async login(username: string, password: string): Promise<LoginResult> {
    const cleanUsername = username.toLowerCase().trim()

    const { data, error } = await supabase.auth.signInWithPassword({
      email: toEmail(cleanUsername),
      password,
    })

    if (error || !data.user) {
      return { success: false, error: 'invalid_credentials' }
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('username, total_points')
      .eq('id', data.user.id)
      .single()

    if (profileError || !profile) {
      return { success: false, error: 'unknown' }
    }

    return {
      success: true,
      user: {
        id: data.user.id,
        username: profile.username,
        totalPoints: profile.total_points,
      },
    }
  },

  async logout(): Promise<void> {
    await supabase.auth.signOut()
  },

  async getSession(): Promise<{ id: string; username: string; totalPoints: number } | null> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: profile } = await supabase
      .from('profiles')
      .select('username, total_points')
      .eq('id', user.id)
      .single()

    if (!profile) return null

    return {
      id: user.id,
      username: profile.username,
      totalPoints: profile.total_points,
    }
  },
}
```

- [ ] **Étape 2 : Vérifier qu'il n'y a pas d'erreur TypeScript**

```bash
npm run build 2>&1 | head -20
```

Résultat attendu : aucune erreur sur `src/services/supabase/authService.ts`.

- [ ] **Étape 3 : Commit**

```bash
git add src/services/supabase/authService.ts
git commit -m "feat: créer authService Supabase (register/login/logout)"
```

---

## Tâche 5 — Créer userService

**Fichiers :**
- Créer : `src/services/supabase/userService.ts`

- [ ] **Étape 1 : Créer `src/services/supabase/userService.ts`**

```typescript
import { supabase } from '@/lib/supabase'

export const userService = {
  async getProfile(userId: string): Promise<{ username: string; totalPoints: number } | null> {
    const { data } = await supabase
      .from('profiles')
      .select('username, total_points')
      .eq('id', userId)
      .single()

    if (!data) return null
    return { username: data.username, totalPoints: data.total_points }
  },

  async updatePoints(userId: string, delta: number): Promise<void> {
    const { data: profile } = await supabase
      .from('profiles')
      .select('total_points')
      .eq('id', userId)
      .single()

    if (!profile) return

    const newPoints = Math.max(0, profile.total_points + delta)
    await supabase
      .from('profiles')
      .update({ total_points: newPoints })
      .eq('id', userId)
  },
}
```

- [ ] **Étape 2 : Commit**

```bash
git add src/services/supabase/userService.ts
git commit -m "feat: créer userService Supabase (profil et points)"
```

---

## Tâche 6 — Créer scoreService

**Fichiers :**
- Créer : `src/services/supabase/scoreService.ts`

- [ ] **Étape 1 : Créer `src/services/supabase/scoreService.ts`**

```typescript
import { supabase } from '@/lib/supabase'
import type { Session, Progress, ExerciseType } from '@/types'

export const scoreService = {
  async save(session: Session): Promise<void> {
    await supabase.from('sessions').insert({
      id: session.id,
      user_id: session.userId,
      exercise_type: session.exerciseType,
      score: session.score,
      duration: session.duration,
      played_at: session.playedAt,
      details: session.details,
    })
  },

  async getHistory(userId: string, limit = 20): Promise<Session[]> {
    const { data } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', userId)
      .order('played_at', { ascending: false })
      .limit(limit)

    if (!data) return []

    return data.map((row) => ({
      id: row.id,
      userId: row.user_id,
      exerciseType: row.exercise_type as ExerciseType,
      score: row.score,
      duration: row.duration,
      playedAt: row.played_at,
      details: row.details,
    }))
  },

  async getProgress(userId: string): Promise<Progress[]> {
    const { data } = await supabase
      .from('progress')
      .select('*')
      .eq('user_id', userId)

    if (!data) return []

    return data.map((row) => ({
      id: row.id,
      userId: row.user_id,
      exerciseType: row.exercise_type as ExerciseType,
      totalSessions: row.total_sessions,
      bestScore: row.best_score,
      avgScore: row.avg_score,
      lastPlayed: row.last_played,
    }))
  },

  async updateProgress(userId: string, exerciseType: ExerciseType, score: number): Promise<void> {
    const { data: existing } = await supabase
      .from('progress')
      .select('*')
      .eq('user_id', userId)
      .eq('exercise_type', exerciseType)
      .maybeSingle()

    if (!existing) {
      await supabase.from('progress').insert({
        user_id: userId,
        exercise_type: exerciseType,
        total_sessions: 1,
        best_score: score,
        avg_score: score,
        last_played: new Date().toISOString(),
      })
    } else {
      const newTotal = existing.total_sessions + 1
      const newAvg = Math.round(
        (existing.avg_score * existing.total_sessions + score) / newTotal
      )
      await supabase
        .from('progress')
        .update({
          total_sessions: newTotal,
          best_score: Math.max(existing.best_score, score),
          avg_score: newAvg,
          last_played: new Date().toISOString(),
        })
        .eq('id', existing.id)
    }
  },
}
```

- [ ] **Étape 2 : Commit**

```bash
git add src/services/supabase/scoreService.ts
git commit -m "feat: créer scoreService Supabase (sessions et progression)"
```

---

## Tâche 7 — Migrer authStore

**Fichiers :**
- Modifier : `src/store/authStore.ts`

- [ ] **Étape 1 : Remplacer intégralement `src/store/authStore.ts`**

```typescript
import { create } from 'zustand'
import type { AuthUser } from '@/types'
import { authService } from '@/services/supabase/authService'
import { userService } from '@/services/supabase/userService'

interface AuthState {
  currentUser: AuthUser | null
  isLoading: boolean
  error: string | null
  register: (username: string, password: string) => Promise<boolean>
  login: (username: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  hydrate: () => Promise<void>
  refreshPoints: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: null,
  isLoading: false,
  error: null,

  register: async (username, password) => {
    set({ isLoading: true, error: null })
    const result = await authService.register(username, password)
    if (!result.success) {
      const message =
        result.error === 'username_taken'
          ? "Ce nom d'utilisateur est déjà pris."
          : "Une erreur est survenue."
      set({ error: message, isLoading: false })
      return false
    }
    const authUser: AuthUser = {
      id: result.user.id,
      username: result.user.username,
      totalPoints: 0,
    }
    set({ currentUser: authUser, isLoading: false })
    return true
  },

  login: async (username, password) => {
    set({ isLoading: true, error: null })
    const result = await authService.login(username, password)
    if (!result.success) {
      const message =
        result.error === 'invalid_credentials'
          ? "Nom d'utilisateur ou mot de passe incorrect."
          : "Une erreur est survenue."
      set({ error: message, isLoading: false })
      return false
    }
    const authUser: AuthUser = {
      id: result.user.id,
      username: result.user.username,
      totalPoints: result.user.totalPoints,
    }
    set({ currentUser: authUser, isLoading: false })
    return true
  },

  logout: async () => {
    await authService.logout()
    set({ currentUser: null })
  },

  hydrate: async () => {
    const user = await authService.getSession()
    if (user) {
      set({
        currentUser: {
          id: user.id,
          username: user.username,
          totalPoints: user.totalPoints,
        },
      })
    }
  },

  refreshPoints: async () => {
    const { currentUser } = get()
    if (!currentUser) return
    const profile = await userService.getProfile(currentUser.id)
    if (!profile) return
    set({ currentUser: { ...currentUser, totalPoints: profile.totalPoints } })
  },

  clearError: () => set({ error: null }),
}))
```

- [ ] **Étape 2 : Vérifier qu'il n'y a pas d'erreur TypeScript**

```bash
npm run build 2>&1 | head -30
```

Résultat attendu : aucune erreur TypeScript.

- [ ] **Étape 3 : Commit**

```bash
git add src/store/authStore.ts
git commit -m "feat: migrer authStore vers Supabase"
```

---

## Tâche 8 — Migrer progressStore

**Fichiers :**
- Modifier : `src/store/progressStore.ts`

- [ ] **Étape 1 : Remplacer intégralement `src/store/progressStore.ts`**

```typescript
import { create } from 'zustand'
import type { Session, Progress } from '@/types'
import { scoreService } from '@/services/supabase/scoreService'
import { userService } from '@/services/supabase/userService'

interface ProgressState {
  sessions: Session[]
  progress: Progress[]
  loadProgress: (userId: string) => Promise<void>
  saveSession: (session: Session) => Promise<void>
}

export const useProgressStore = create<ProgressState>((set) => ({
  sessions: [],
  progress: [],

  loadProgress: async (userId) => {
    const [sessions, progress] = await Promise.all([
      scoreService.getHistory(userId),
      scoreService.getProgress(userId),
    ])
    set({ sessions, progress })
  },

  saveSession: async (session) => {
    await scoreService.save(session)
    await scoreService.updateProgress(session.userId, session.exerciseType, session.score)
    await userService.updatePoints(session.userId, session.score)
    set((state) => ({
      sessions: [session, ...state.sessions].slice(0, 20),
    }))
  },
}))
```

- [ ] **Étape 2 : Vérifier qu'il n'y a pas d'erreur TypeScript**

```bash
npm run build 2>&1 | head -30
```

Résultat attendu : aucune erreur TypeScript.

- [ ] **Étape 3 : Commit**

```bash
git add src/store/progressStore.ts
git commit -m "feat: migrer progressStore vers Supabase"
```

---

## Tâche 9 — Supprimer les anciens fichiers Dexie

**Fichiers :**
- Supprimer : `src/services/storage/db.ts`
- Supprimer : `src/services/storage/userService.ts`
- Supprimer : `src/services/storage/scoreService.ts`
- Supprimer : `src/services/storage/IStorageService.ts`
- Supprimer : `src/services/crypto/hashService.ts`

- [ ] **Étape 1 : Supprimer les fichiers**

```bash
rm src/services/storage/db.ts
rm src/services/storage/userService.ts
rm src/services/storage/scoreService.ts
rm src/services/storage/IStorageService.ts
rm src/services/crypto/hashService.ts
```

- [ ] **Étape 2 : Vérifier qu'il n'y a pas d'erreur TypeScript après suppression**

```bash
npm run build 2>&1 | head -30
```

Résultat attendu : aucune erreur (aucun fichier restant n'importe les modules supprimés).

- [ ] **Étape 3 : Commit**

```bash
git add -A
git commit -m "chore: supprimer les anciens fichiers Dexie et hashService"
```

---

## Tâche 10 — Vérification end-to-end

- [ ] **Étape 1 : Lancer le serveur de dev**

```bash
npm run dev
```

Ouvrir l'app dans le navigateur.

- [ ] **Étape 2 : Tester l'inscription**

- Créer un compte avec un pseudo (ex: `testuser`) et un mot de passe
- Résultat attendu : l'app redirige vers l'accueil et affiche le pseudo

- [ ] **Étape 3 : Vérifier dans Supabase**

Dans le dashboard Supabase → **Authentication → Users** : l'utilisateur `testuser@ptitsgenies.app` doit apparaître.
Dans **Table Editor → profiles** : une ligne avec `username = testuser` doit exister.

- [ ] **Étape 4 : Tester la connexion multi-appareils**

- Ouvrir un autre navigateur (ou fenêtre privée)
- Se connecter avec le même pseudo et mot de passe
- Résultat attendu : connexion réussie, même compte

- [ ] **Étape 5 : Tester un pseudo déjà pris**

- Essayer de créer un compte avec le même pseudo `testuser`
- Résultat attendu : message d'erreur "Ce nom d'utilisateur est déjà pris."

- [ ] **Étape 6 : Jouer un exercice et vérifier la sauvegarde**

- Jouer un exercice jusqu'à la fin
- Résultat attendu : le score apparaît sur la HomePage
- Dans Supabase → **Table Editor → sessions** : une ligne de session doit exister
- Dans Supabase → **Table Editor → progress** : une ligne de progression doit exister

- [ ] **Étape 7 : Commit final**

```bash
git add -A
git commit -m "feat: migration Supabase complète — comptes multi-appareils"
```
