import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'

import { useAuthStore } from '@/store/authStore'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import AppShell from '@/components/layout/AppShell'

import AuthPage from '@/pages/AuthPage'
import HomePage from '@/pages/HomePage'
import ExercisesPage from '@/pages/ExercisesPage'

// Lazy placeholders for exercise pages (will be replaced later)
const WordSearchPage = React.lazy(() => import('@/pages/WordSearchPage'))
const IntrusPage = React.lazy(() => import('@/pages/IntrusPage'))
const LectureRapidePage = React.lazy(() => import('@/pages/LectureRapidePage'))
const DashboardPage = React.lazy(() => import('@/pages/DashboardPage'))
const CoupDOeilPage = React.lazy(() => import('@/pages/CoupDOeilPage'))
const PhrasesBrouilleesPage = React.lazy(() => import('@/pages/PhrasesBrouilleesPage'))
const CollectionPage = React.lazy(() => import('@/pages/CollectionPage'))
const AmiEnnemiPage = React.lazy(() => import('@/pages/AmiEnnemiPage'))

export default function App() {
  const { hydrate } = useAuthStore()
  React.useEffect(() => { hydrate() }, [])

  return (
    <BrowserRouter>
      <React.Suspense fallback={<div className="flex items-center justify-center min-h-screen text-2xl">⏳</div>}>
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
            <Route path="/accueil" element={<HomePage />} />
            <Route path="/exercices" element={<ExercisesPage />} />
            <Route path="/exercices/recherche-mots" element={<WordSearchPage />} />
            <Route path="/exercices/intrus" element={<IntrusPage />} />
            <Route path="/exercices/lecture-rapide" element={<LectureRapidePage />} />
            <Route path="/exercices/coup-doeil" element={<CoupDOeilPage />} />
            <Route path="/exercices/phrases-brouillees" element={<PhrasesBrouilleesPage />} />
            <Route path="/exercices/collection-mots" element={<CollectionPage />} />
            <Route path="/exercices/ami-et-ennemi" element={<AmiEnnemiPage />} />
            <Route path="/tableau-de-bord" element={<DashboardPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </React.Suspense>
    </BrowserRouter>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
