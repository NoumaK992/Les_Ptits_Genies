import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'

const navItems = [
  { to: '/accueil', label: 'Accueil', emoji: '🏠' },
  { to: '/exercices', label: 'Exercices', emoji: '📚' },
  { to: '/tableau-de-bord', label: 'Progrès', emoji: '📊' },
]

const SIDEBAR_BG = 'linear-gradient(175deg, #130d2e 0%, #2d1960 55%, #130d2e 100%)'

export default function AppShell() {
  const { currentUser, logout } = useAuthStore()
  const location = useLocation()
  const isHome = location.pathname === '/accueil'

  return (
    <div className={`min-h-screen flex flex-col md:flex-row ${isHome ? 'bg-[#1a1a2e]' : 'bg-bg'}`}>

      {/* ── Sidebar (tablet/desktop) ── */}
      <aside
        className="hidden md:flex md:flex-col md:w-64 min-h-screen p-6 relative overflow-hidden"
        style={{ background: SIDEBAR_BG }}
      >
        {/* Decorative orbs */}
        <div
          className="absolute top-0 right-0 w-52 h-52 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(124,111,247,0.25) 0%, transparent 70%)',
            transform: 'translate(30%, -30%)',
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-36 h-36 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(255,123,84,0.20) 0%, transparent 70%)',
            transform: 'translate(-30%, 30%)',
          }}
        />
        {/* Subtle dot overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />

        {/* Logo */}
        <div className="mb-8 relative z-10">
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            className="text-4xl mb-2"
          >
            🧠
          </motion.div>
          <h1 className="font-fredoka font-semibold text-white text-xl leading-snug">
            Les Ptits<br />Génies
          </h1>
          <p className="text-white/40 text-xs font-semibold mt-0.5">Apprendre, c'est super !</p>
        </div>

        {/* User card */}
        {currentUser && (
          <div className="glass rounded-2xl p-4 mb-6 relative z-10">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-base shrink-0 border-2 border-white/25"
                style={{ background: 'linear-gradient(135deg, #7C6FF7, #4a3fcc)' }}
              >
                {currentUser.username.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-black text-white text-sm truncate">{currentUser.username}</p>
                <p className="text-accent font-black text-base leading-tight">{currentUser.totalPoints} ⭐</p>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 space-y-1.5 relative z-10">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all text-sm ${
                  isActive
                    ? 'bg-white text-primary shadow-card'
                    : 'text-white/65 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <span className="text-xl">{item.emoji}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <button
          onClick={logout}
          className="mt-4 text-xs text-white/30 hover:text-white/60 transition-colors font-semibold relative z-10 text-left"
        >
          ← Se déconnecter
        </button>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 flex flex-col pb-20 md:pb-0">

        {/* Mobile header */}
        <header
          className="md:hidden flex items-center justify-between px-4 py-3 sticky top-0 z-10 shadow-md"
          style={{ background: SIDEBAR_BG }}
        >
          <div className="flex items-center gap-2">
            <span className="text-2xl">🧠</span>
            <span className="font-fredoka font-semibold text-white text-lg">Les Ptits Génies</span>
          </div>
          {currentUser && (
            <div
              className="px-3 py-1 rounded-full border border-accent/30"
              style={{ background: 'rgba(255, 209, 102, 0.15)' }}
            >
              <span className="font-black text-accent text-sm">{currentUser.totalPoints} ⭐</span>
            </div>
          )}
        </header>

        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex-1 p-4 md:p-8"
        >
          <Outlet />
        </motion.div>
      </main>

      {/* ── Bottom nav (mobile) ── */}
      <nav className={`md:hidden fixed bottom-0 left-0 right-0 z-10 shadow-lg border-t transition-colors ${
        isHome
          ? 'bg-[#12122a] border-purple-900/30'
          : 'bg-white border-gray-100'
      }`}>
        <div className="flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center py-2 gap-0.5 transition-colors relative ${
                  isActive
                    ? isHome ? 'text-[#a78bfa]' : 'text-primary'
                    : isHome ? 'text-white/30' : 'text-gray-400'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 rounded-b-full"
                      style={{ background: 'linear-gradient(90deg, #7C6FF7, #4a3fcc)' }}
                    />
                  )}
                  <span className="text-xl">{item.emoji}</span>
                  <span className="text-xs font-bold">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
