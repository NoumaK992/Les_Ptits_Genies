import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { Bouton } from '@/components/ui/Bouton'
import { Carte } from '@/components/ui/Carte'
import { Decor } from '@/components/ui/Decor'
import { cn } from '@/lib/cn'

const CLASSES_CHAMP =
  'w-full min-h-12 rounded-xl border-2 border-encre bg-papier px-4 text-base font-semibold text-encre ' +
  'placeholder:text-encre-doux focus:outline-none focus:bg-jaune/30 transition-colors'

function PasswordStrength({ password }: { password: string }) {
  const score = [
    password.length >= 6,
    password.length >= 10,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length

  const colors = ['bg-encre/10', 'bg-faux', 'bg-rose-pale', 'bg-jaune', 'bg-juste', 'bg-juste']
  const labels = ['', 'Très faible', 'Faible', 'Moyen', 'Fort', 'Très fort']

  if (!password) return null
  return (
    <div className="mt-2">
      <div className="mb-1 flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`h-2 flex-1 rounded-full border border-encre transition-colors duration-300 ${i <= score ? colors[score] : 'bg-encre/10'}`}
          />
        ))}
      </div>
      <p className="text-base font-semibold text-encre-doux">{labels[score]}</p>
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

  const motsDePasseDifferents = confirmPassword && password !== confirmPassword

  return (
    <div className="relative isolate flex min-h-screen flex-col items-center justify-center bg-sable p-4 text-encre">
      <Decor />

      {/* Logo */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0.5, duration: 0.8 }}
        className="relative z-10 mb-8 text-center"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          className="mb-3 inline-block text-7xl"
        >
          🧠
        </motion.div>
        <h1 className="font-titre text-3xl leading-tight text-encre sm:text-4xl">Les Ptits Génies</h1>
        <p className="mt-1 text-base font-semibold text-encre-doux">Apprendre, c'est super !</p>
      </motion.div>

      {/* Carte du formulaire */}
      <motion.div
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <Carte className="overflow-hidden">
          {/* Onglets */}
          <div className="flex border-b-2 border-encre">
            {(['login', 'register'] as const).map((t, i) => (
              <button
                key={t}
                type="button"
                onClick={() => handleTabChange(t)}
                aria-pressed={tab === t}
                className={`min-h-14 flex-1 text-base font-bold text-encre transition-colors ${
                  i === 0 ? 'border-r-2 border-encre' : ''
                } ${tab === t ? 'bg-jaune' : 'bg-papier hover:bg-rose-pale'}`}
              >
                {t === 'login' ? '🔑 Connexion' : '✨ Inscription'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 p-5 sm:p-6">
            {/* Nom d'utilisateur */}
            <div>
              <label className="mb-1.5 block text-base font-bold text-encre">Nom d'utilisateur</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ex: SuperGenie42"
                minLength={3}
                maxLength={20}
                required
                className={CLASSES_CHAMP}
              />
              <p className="mt-1 text-base text-encre-doux">3 à 20 caractères (lettres, chiffres, tirets)</p>
            </div>

            {/* Mot de passe */}
            <div>
              <label className="mb-1.5 block text-base font-bold text-encre">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                minLength={6}
                required
                className={CLASSES_CHAMP}
              />
              {tab === 'register' && <PasswordStrength password={password} />}
            </div>

            {/* Confirmation du mot de passe */}
            <AnimatePresence>
              {tab === 'register' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  <label className="mb-1.5 block text-base font-bold text-encre">Confirmer le mot de passe</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className={cn(CLASSES_CHAMP, motsDePasseDifferents && 'bg-faux/20')}
                  />
                  {motsDePasseDifferents && (
                    <p className="mt-1 text-base font-semibold text-faux-fonce">✗ Les mots de passe ne correspondent pas.</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Erreur */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  role="alert"
                  className="rounded-xl border-2 border-encre bg-papier px-4 py-3 text-base font-semibold text-faux-fonce"
                >
                  ⚠️ {error}
                </motion.div>
              )}
            </AnimatePresence>

            <Bouton
              type="submit"
              taille="grand"
              className="w-full"
              disabled={isLoading || (tab === 'register' && password !== confirmPassword)}
            >
              {isLoading ? '⏳ Chargement…' : tab === 'login' ? "C'est parti ! 🚀" : 'Créer mon compte 🎉'}
            </Bouton>
          </form>
        </Carte>
      </motion.div>

      <p className="relative z-10 mt-6 max-w-xs text-center text-base font-semibold text-encre-doux">
        Aucun email requis. Tes données restent sur ton appareil. 🔒
      </p>
    </div>
  )
}
