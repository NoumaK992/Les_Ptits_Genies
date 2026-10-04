import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from 'recharts'
import { useAuthStore } from '@/store/authStore'
import { useProgressStore } from '@/store/progressStore'
import { useParcoursStore } from '@/store/parcoursStore'
import { BADGES, BADGE_CATEGORIES } from '@/data/badges'
import { calcStreak } from '@/utils/streak'
import { couleurs } from '@/theme/couleurs'
import { classesCarte } from '@/components/ui/Carte'
import { Etiquette } from '@/components/ui/Etiquette'
import { cn } from '@/lib/cn'
import type { BadgeContext } from '@/types'

const EXERCISE_LABELS: Record<string, string> = {
  'word-search': '🔍 Recherche',
  'intrus': '🕵️ Intrus',
  'lecture-rapide': '⚡ Lecture',
  'coup-doeil': '👁️ Coup d\'œil',
  'phrases-brouillees': '🧩 Phrases',
  'collection': '🗂️ Collection',
  'ami-ennemi': '🎯 Ami & Ennemi',
  'vrai-absurde': '⚖️ Vrai/Absurde',
  'forgeron': '🔨 Forgeron',
  'labyrinthe': '🧭 Labyrinthe',
  'coupe-mots': '✂️ Coupe-Mots',
  'racines': '🌳 Racines',
}

// Emoji d'un exercice : premier mot de son libellé (une seule source de vérité).
function emojiDe(type: string): string {
  return EXERCISE_LABELS[type]?.split(' ')[0] ?? '🎮'
}

// Teinte de chaque exercice : même couleur dans les graphiques (valeur brute)
// et dans les pastilles / barres (classe Tailwind).
type Teinte = 'jaune' | 'rose' | 'bleu' | 'juste' | 'rose-pale' | 'encre-doux'

const EXERCISE_TEINTES: Record<string, Teinte> = {
  'word-search': 'jaune',
  'intrus': 'rose',
  'lecture-rapide': 'bleu',
  'coup-doeil': 'juste',
  'phrases-brouillees': 'rose-pale',
  'collection': 'encre-doux',
  'ami-ennemi': 'jaune',
  'vrai-absurde': 'rose',
  'forgeron': 'bleu',
  'labyrinthe': 'juste',
  'coupe-mots': 'rose-pale',
  'racines': 'juste',
}

const TEINTE_PAR_DEFAUT: Teinte = 'bleu'

const FONDS_TEINTES: Record<Teinte, string> = {
  jaune: 'bg-jaune',
  rose: 'bg-rose',
  bleu: 'bg-bleu',
  juste: 'bg-juste',
  'rose-pale': 'bg-rose-pale',
  'encre-doux': 'bg-encre-doux',
}

function teinteDe(type: string): Teinte {
  return EXERCISE_TEINTES[type] ?? TEINTE_PAR_DEFAUT
}

// Styles communs des graphiques
const TICK = { fontSize: 12, fontFamily: 'Lexend', fill: couleurs.encre }
const INFO_BULLE = {
  background: couleurs.papier,
  border: `2px solid ${couleurs.encre}`,
  borderRadius: 12,
  fontFamily: 'Lexend',
  fontSize: 13,
  color: couleurs.encre,
}

const PASTILLE = 'flex items-center justify-center shrink-0 rounded-xl border-2 border-encre text-sm'


function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }

export default function DashboardPage() {
  const { currentUser } = useAuthStore()
  const { sessions, progress, loadProgress, syncBadges } = useProgressStore()
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (currentUser) {
      loadProgress(currentUser.id).then(() => setLoaded(true))
    }
  }, [currentUser?.id])

  // État du parcours (succès « Parcours ») : chargé s'il manque ou s'il appartient à un autre compte.
  const parcoursUserId = useParcoursStore((s) => s.userId)
  const parcoursEtat = useParcoursStore((s) => s.etat)
  const parcoursCharge = useParcoursStore((s) => s.charge)
  const chargerParcours = useParcoursStore((s) => s.charger)

  useEffect(() => {
    if (currentUser && (!parcoursCharge || parcoursUserId !== currentUser.id)) {
      chargerParcours(currentUser.id)
    }
  }, [currentUser?.id])

  const parcours = currentUser && parcoursUserId === currentUser.id ? parcoursEtat : null

  const totalPoints = currentUser?.totalPoints ?? 0
  const streak = calcStreak(sessions)
  const badgeCtx: BadgeContext = { sessions, totalPoints, progress, streak, parcours }
  const earnedBadgeIds = new Set(BADGES.filter((b) => b.condition(badgeCtx)).map((b) => b.id))

  useEffect(() => {
    if (currentUser && loaded && earnedBadgeIds.size > 0) {
      syncBadges(currentUser.id, [...earnedBadgeIds])
    }
  }, [[...earnedBadgeIds].sort().join(','), loaded])

  if (!loaded) {
    return (
      <div className="flex items-center justify-center min-h-64 text-4xl animate-pulse">⏳</div>
    )
  }

  const lineData = [...sessions]
    .reverse()
    .slice(-10)
    .map((s, i) => ({
      name: formatDate(s.playedAt),
      pts: s.score,
      index: i,
    }))

  const barData = progress.map((p) => ({
    name: EXERCISE_LABELS[p.exerciseType] ?? p.exerciseType,
    avg: p.avgScore,
    best: p.bestScore,
    type: p.exerciseType,
  }))

  const statCards = [
    {
      label: 'Points totaux',
      value: totalPoints,
      emoji: '⭐',
      fond: 'bg-jaune',
    },
    {
      label: 'Sessions',
      value: sessions.length,
      emoji: '🎮',
      fond: 'bg-rose-pale',
    },
    {
      label: 'Série actuelle',
      value: `${streak}j`,
      emoji: '🔥',
      fond: 'bg-bleu',
    },
  ]

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">

        {/* Header */}
        <motion.div variants={item}>
          <h2 className="font-titre text-3xl leading-tight text-encre">📊 Mes progrès</h2>
          <p className="mt-1 font-semibold text-encre-doux">Suis ton évolution, {currentUser?.username} !</p>
        </motion.div>

        {/* Stats cards */}
        <motion.div variants={item} className="grid grid-cols-3 gap-3">
          {statCards.map((card) => (
            <div key={card.label} className={cn(classesCarte, 'flex flex-col items-center p-3 text-center sm:p-4')}>
              <div className={cn(PASTILLE, 'mb-2 h-10 w-10 text-xl', card.fond)}>{card.emoji}</div>
              <div className="font-titre text-xl text-encre">{card.value}</div>
              <div className="mt-0.5 text-sm font-semibold leading-tight text-encre-doux">{card.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Line chart */}
        {lineData.length >= 2 && (
          <motion.div variants={item} className={cn(classesCarte, 'p-5')}>
            <Etiquette className="mb-4">📈 Points par session</Etiquette>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke={couleurs['encre-doux']} strokeOpacity={0.2} />
                <XAxis dataKey="name" tick={TICK} stroke={couleurs.encre} />
                <YAxis tick={TICK} stroke={couleurs.encre} />
                <Tooltip
                  contentStyle={INFO_BULLE}
                  labelStyle={{ color: couleurs.encre, fontWeight: 700 }}
                  itemStyle={{ color: couleurs.encre }}
                  formatter={(v) => [`${v} pts`, 'Score']}
                />
                <Line
                  type="monotone" dataKey="pts" stroke={couleurs.encre} strokeWidth={3}
                  dot={{ fill: couleurs.jaune, r: 5, strokeWidth: 2, stroke: couleurs.encre }}
                  activeDot={{ r: 7, stroke: couleurs.encre, strokeWidth: 2, fill: couleurs.rose }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Bar chart */}
        {barData.length > 0 && (
          <motion.div variants={item} className={cn(classesCarte, 'p-5')}>
            <Etiquette couleur="rose-pale" className="mb-4">🎯 Score moyen par exercice</Etiquette>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={barData} barSize={36}>
                <CartesianGrid strokeDasharray="3 3" stroke={couleurs['encre-doux']} strokeOpacity={0.2} />
                <XAxis dataKey="name" tick={TICK} stroke={couleurs.encre} />
                <YAxis tick={TICK} stroke={couleurs.encre} />
                <Tooltip
                  contentStyle={INFO_BULLE}
                  labelStyle={{ color: couleurs.encre, fontWeight: 700 }}
                  itemStyle={{ color: couleurs.encre }}
                  cursor={{ fill: couleurs.jaune, fillOpacity: 0.3 }}
                  formatter={(v) => [`${v} pts`, 'Moyenne']}
                />
                <Bar dataKey="avg" radius={[8, 8, 0, 0]} stroke={couleurs.encre} strokeWidth={2}>
                  {barData.map((entry) => (
                    <Cell key={entry.type} fill={couleurs[teinteDe(entry.type)]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Progress per exercise */}
        {progress.length > 0 && (
          <motion.div variants={item} className={cn(classesCarte, 'p-5')}>
            <Etiquette couleur="bleu" className="mb-4">🏅 Par exercice</Etiquette>
            <div className="space-y-4">
              {progress.map((p) => (
                <div key={p.exerciseType} className="flex items-center gap-4">
                  <div className={cn(PASTILLE, 'h-9 w-9', FONDS_TEINTES[teinteDe(p.exerciseType)])}>
                    {emojiDe(p.exerciseType)}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap justify-between gap-x-2 text-sm font-semibold text-encre-doux">
                      <span className="font-bold text-encre">
                        {EXERCISE_LABELS[p.exerciseType]?.replace(/^[^\s]+\s/, '') ?? p.exerciseType}
                      </span>
                      <span>{p.totalSessions} session{p.totalSessions > 1 ? 's' : ''} · Meilleur : {p.bestScore} pts</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full border-2 border-encre bg-encre/10">
                      <motion.div
                        className={cn('h-full', FONDS_TEINTES[teinteDe(p.exerciseType)])}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (p.avgScore / Math.max(p.bestScore, 1)) * 100)}%` }}
                        transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Badges */}
        <motion.div variants={item} className={cn(classesCarte, 'p-5')}>
          <Etiquette>🎖️ Mes badges</Etiquette>
          <p className="mt-3 mb-4 text-sm font-semibold text-encre-doux">
            {earnedBadgeIds.size} / {BADGES.length} obtenus
          </p>
          <div className="space-y-5">
            {BADGE_CATEGORIES.map((cat) => {
              const catBadges = BADGES.filter((b) => b.category === cat.id)
              return (
                <div key={cat.id}>
                  <p className="mb-2 text-sm font-bold uppercase tracking-wider text-encre-doux">{cat.label}</p>
                  <div className="flex flex-wrap gap-3">
                    {catBadges.map((badge) => {
                      const earned = earnedBadgeIds.has(badge.id)
                      return (
                        <motion.div
                          key={badge.id}
                          whileHover={earned ? { scale: 1.08 } : { scale: 1.03 }}
                          className={cn(
                            'flex flex-col items-center gap-1 rounded-2xl border-2 px-3 py-3 transition-all',
                            earned
                              ? 'border-encre bg-jaune text-encre shadow-dur-sm'
                              : 'border-dashed border-encre-doux bg-sable text-encre-doux',
                          )}
                        >
                          <span className="text-2xl" style={earned ? {} : { filter: 'grayscale(1)', opacity: 0.4 }}>
                            {badge.emoji}
                          </span>
                          <span className="max-w-[5.5rem] text-center text-xs font-bold leading-tight">
                            {badge.label}
                          </span>
                          {!earned && (
                            <span className="max-w-[5.5rem] text-center text-xs font-semibold leading-tight">
                              {badge.description}
                            </span>
                          )}
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Recent history */}
        {sessions.length > 0 && (
          <motion.div variants={item} className={cn(classesCarte, 'p-5')}>
            <Etiquette couleur="rose-pale" className="mb-4">🕐 Historique récent</Etiquette>
            <div className="space-y-2">
              {sessions.slice(0, 10).map((s) => (
                <div key={s.id} className="flex items-center gap-3 border-b-2 border-encre/20 py-2.5 last:border-0">
                  <div className={cn(PASTILLE, 'h-9 w-9', FONDS_TEINTES[teinteDe(s.exerciseType)])}>
                    {emojiDe(s.exerciseType)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-encre">{EXERCISE_LABELS[s.exerciseType]}</p>
                    <p className="text-sm font-semibold text-encre-doux">{formatDate(s.playedAt)}</p>
                  </div>
                  <span className="shrink-0 rounded-full border-2 border-encre bg-jaune px-3 py-1 text-sm font-bold text-encre">
                    {s.score} pts
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty state */}
        {sessions.length === 0 && (
          <motion.div variants={item} className="text-center py-16">
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="text-6xl mb-4"
            >
              🌱
            </motion.div>
            <h3 className="mb-2 font-titre text-xl text-encre">Ton aventure commence ici !</h3>
            <p className="font-semibold text-encre-doux">Joue ta première session pour voir tes stats apparaître.</p>
          </motion.div>
        )}

      </motion.div>
    </div>
  )
}
