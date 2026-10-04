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
const ParcoursPage = React.lazy(() => import('@/pages/ParcoursPage'))
const VraiOuAbsurdePage = React.lazy(() => import('@/pages/VraiOuAbsurdePage'))
const ForgeronPage = React.lazy(() => import('@/pages/ForgeronPage'))
const LabyrinthePage = React.lazy(() => import('@/pages/LabyrinthePage'))
const CoupeMotsPage = React.lazy(() => import('@/pages/CoupeMotsPage'))
const RacinesPage = React.lazy(() => import('@/pages/RacinesPage'))

export default function App() {
  const { hydrate } = useAuthStore()
  const [hydrated, setHydrated] = React.useState(false)
  React.useEffect(() => {
    hydrate().finally(() => setHydrated(true))
  }, [])

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen text-2xl">⏳</div>
    )
  }

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
            <Route path="/parcours" element={<ParcoursPage />} />
            <Route path="/exercices/vrai-ou-absurde" element={<VraiOuAbsurdePage />} />
            <Route path="/exercices/forgeron" element={<ForgeronPage />} />
            <Route path="/exercices/labyrinthe" element={<LabyrinthePage />} />
            <Route path="/exercices/coupe-mots" element={<CoupeMotsPage />} />
            <Route path="/exercices/racines" element={<RacinesPage />} />
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
