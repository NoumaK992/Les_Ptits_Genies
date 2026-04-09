import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'

function PasswordStrength({ password }: { password: string }) {
  const score = [
    password.length >= 6,
    password.length >= 10,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length

  const colors = ['bg-gray-200', 'bg-error', 'bg-secondary', 'bg-accent', 'bg-success', 'bg-success']
  const labels = ['', 'Très faible', 'Faible', 'Moyen', 'Fort', 'Très fort']

  if (!password) return null
  return (
    <div className="mt-1.5">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= score ? colors[score] : 'bg-gray-200'}`} />
        ))}
      </div>
      <p className="text-xs text-gray-500 font-semibold">{labels[score]}</p>
    </div>
  )
}

export default function AuthPage() {
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const { login, register, isLoading, error, clearError } = useAuthStore()
  const navigate = useNavigate()

  function handleTabChange(t: 'login' | 'register') {
    setTab(t)
    setUsername('')
    setPassword('')
    setConfirmPassword('')
    clearError()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    clearError()
    if (username.trim().length < 3) return
    if (tab === 'register') {
      if (password !== confirmPassword) return
      if (password.length < 6) return
      const ok = await register(username.trim(), password)
      if (ok) navigate('/accueil')
    } else {
      const ok = await login(username.trim(), password)
      if (ok) navigate('/accueil')
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #130d2e 0%, #2d1960 55%, #130d2e 100%)' }}
    >
      {/* Decorative background blobs */}
      <div
        className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(124,111,247,0.22) 0%, transparent 65%)',
          transform: 'translate(30%, -30%)',
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-80 h-80 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(255,123,84,0.18) 0%, transparent 65%)',
          transform: 'translate(-30%, 30%)',
        }}
      />
      <div
        className="absolute top-1/3 left-1/4 w-48 h-48 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(255,209,102,0.08) 0%, transparent 65%)',
        }}
      />
      {/* Dot pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.18) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Logo */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0.5, duration: 0.8 }}
        className="mb-8 text-center relative z-10"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          className="text-7xl mb-3 inline-block"
        >
          🧠
        </motion.div>
        <h1 className="text-4xl font-fredoka font-semibold text-white">Les Ptits Génies</h1>
        <p className="text-white/45 mt-1 font-semibold text-sm">Apprendre, c'est super !</p>
      </motion.div>

      {/* Card */}
      <motion.div
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden relative z-10"
      >
        {/* Tabs */}
        <div className="flex">
          {(['login', 'register'] as const).map((t) => (
            <button
              key={t}
              onClick={() => handleTabChange(t)}
              className="flex-1 py-4 font-black text-sm transition-all"
              style={
                tab === t
                  ? { background: 'linear-gradient(135deg, #7C6FF7, #4a3fcc)', color: 'white' }
                  : { background: '#f9f9ff', color: '#9ca3af' }
              }
            >
              {t === 'login' ? '🔑 Connexion' : '✨ Inscription'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Username */}
          <div>
            <label className="block text-sm font-black text-ink mb-1.5">Nom d'utilisateur</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ex: SuperGenie42"
              minLength={3}
              maxLength={20}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-primary font-semibold transition-all bg-gray-50 focus:bg-white focus:shadow-glow-sm"
            />
            <p className="text-xs text-gray-400 mt-1 font-semibold">3 à 20 caractères (lettres, chiffres, tirets)</p>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-black text-ink mb-1.5">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              minLength={6}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-primary font-semibold transition-all bg-gray-50 focus:bg-white"
            />
            {tab === 'register' && <PasswordStrength password={password} />}
          </div>

          {/* Confirm Password */}
          <AnimatePresence>
            {tab === 'register' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                <label className="block text-sm font-black text-ink mb-1.5">Confirmer le mot de passe</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className={`w-full px-4 py-3 border-2 rounded-2xl focus:outline-none font-semibold transition-all bg-gray-50 focus:bg-white ${
                    confirmPassword && password !== confirmPassword
                      ? 'border-error focus:border-error'
                      : 'border-gray-200 focus:border-primary'
                  }`}
                />
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-error mt-1 font-semibold">Les mots de passe ne correspondent pas.</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-red-50 border border-error/30 text-error text-sm font-semibold px-4 py-3 rounded-2xl"
              >
                ⚠️ {error}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={isLoading || (tab === 'register' && password !== confirmPassword)}
            className="w-full text-white font-black py-4 rounded-2xl transition-all active:scale-95 text-lg disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #7C6FF7, #4a3fcc)', boxShadow: '0 4px 24px rgba(124, 111, 247, 0.40)' }}
          >
            {isLoading ? '⏳ Chargement…' : tab === 'login' ? "C'est parti ! 🚀" : 'Créer mon compte 🎉'}
          </button>
        </form>
      </motion.div>

      <p className="mt-6 text-xs text-white/30 text-center max-w-xs relative z-10 font-semibold">
        Aucun email requis. Tes données restent sur ton appareil. 🔒
      </p>
    </div>
  )
}
