import { Outlet, NavLink, Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { Bouton } from '@/components/ui/Bouton'
import { Decor } from '@/components/ui/Decor'

const navItems = [
  { to: '/accueil', label: 'Accueil', emoji: '🏠' },
  { to: '/exercices', label: 'Exercices', emoji: '📚' },
  { to: '/tableau-de-bord', label: 'Progrès', emoji: '📊' },
]

export default function AppShell() {
  const { currentUser, logout } = useAuthStore()
  const location = useLocation()

  return (
    <div className="relative isolate flex min-h-screen flex-col bg-sable">
      <Decor />

      {/* ── Barre du haut ── */}
      <header className="sticky top-0 z-20 border-b-2 border-encre bg-papier">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3">
          <Link to="/accueil" className="flex items-center gap-2">
            <span className="text-2xl">🧠</span>
            <span className="font-titre text-lg text-encre md:text-xl">Les P'tits Génies</span>
          </Link>

          <nav className="hidden gap-2 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-xl border-2 px-4 py-2 text-sm font-bold text-encre transition-colors ${
                    isActive ? 'border-encre bg-jaune shadow-dur-sm' : 'border-transparent hover:border-encre'
                  }`
                }
              >
                <span>{item.emoji}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            {currentUser && (
              <span className="rounded-full border-2 border-encre bg-jaune px-3 py-1 text-sm font-bold text-encre">
                {currentUser.totalPoints} ⭐
              </span>
            )}
            <Bouton variante="discret" onClick={logout} className="hidden text-sm md:inline-flex">
              Se déconnecter
            </Bouton>
          </div>
        </div>
      </header>

      {/* ── Contenu ── */}
      <main className="relative z-10 mx-auto w-full max-w-5xl flex-1 p-4 pb-24 md:p-8 md:pb-8">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <Outlet />
        </motion.div>
      </main>

      {/* ── Navigation du bas (mobile) ── */}
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t-2 border-encre bg-papier md:hidden">
        <div className="flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `relative flex flex-1 flex-col items-center gap-0.5 py-2 transition-colors ${
                  isActive ? 'bg-jaune text-encre' : 'text-encre-doux'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div layoutId="nav-indicator" className="absolute inset-x-0 top-0 h-1 bg-encre" />
                  )}
                  <span className="text-xl">{item.emoji}</span>
                  <span className="text-xs font-bold">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
          <button
            type="button"
            onClick={logout}
            className="flex flex-1 flex-col items-center gap-0.5 py-2 text-encre-doux"
          >
            <span className="text-xl">🚪</span>
            <span className="text-xs font-bold">Sortir</span>
          </button>
        </div>
      </nav>
    </div>
  )
}
