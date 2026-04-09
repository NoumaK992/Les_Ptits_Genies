import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LISTES_INTRUS, IntrusData } from './data';
import { useNavigate } from 'react-router-dom';

// ── Exercise identity ──────────────────────────────────────────────────────
const EX = {
  gradient: 'linear-gradient(135deg, #FF7B54 0%, #e8404a 100%)',
  shadow: '0 8px 28px rgba(255, 123, 84, 0.40)',
  color: '#FF7B54',
  bgLight: 'rgba(255, 123, 84, 0.10)',
  emoji: '🕵️',
  title: "Chasseur d'Intrus",
}

type Niveau = 'debutant' | 'intermediaire' | 'professionnel';
type Phase = 'selection_niveau' | 'jeu_intrus' | 'jeu_qcm' | 'bilan';

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const NIVEAU_META = {
  debutant: { label: 'Débutant', emoji: '🟢', time: 30, multiplier: '×1', gradient: 'linear-gradient(135deg, #06D6A0, #059669)' },
  intermediaire: { label: 'Intermédiaire', emoji: '🟡', time: 15, multiplier: '×1.5', gradient: 'linear-gradient(135deg, #FFD166, #f59e0b)' },
  professionnel: { label: 'Professionnel', emoji: '🔴', time: 8, multiplier: '×2', gradient: 'linear-gradient(135deg, #EF476F, #be123c)' },
}

export const ChasseurDIntrus: React.FC = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('selection_niveau');
  const [niveau, setNiveau] = useState<Niveau>('debutant');
  const [series, setSeries] = useState<IntrusData[]>([]);
  const [currentSerieIndex, setCurrentSerieIndex] = useState(0);
  const [motsMelanges, setMotsMelanges] = useState<string[]>([]);
  const [motSelectionne, setMotSelectionne] = useState<string | null>(null);
  const [erreurIntrus, setErreurIntrus] = useState<string | null>(null);
  const [optionsQCM, setOptionsQCM] = useState<string[]>([]);
  const [erreurQCM, setErreurQCM] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [erreursTotales, setErreursTotales] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [mancheEchouee, setMancheEchouee] = useState(false);

  const startPartie = (selectedNiveau: Niveau) => {
    setNiveau(selectedNiveau);
    const listesNiveau = LISTES_INTRUS.filter((l) => l.niveau === selectedNiveau);
    const selectedSeries = shuffleArray(listesNiveau).slice(0, 5);
    setSeries(selectedSeries);
    setCurrentSerieIndex(0);
    setScore(0);
    setErreursTotales(0);
    loadSerie(selectedSeries[0], selectedNiveau);
  };

  const loadSerie = (serie: IntrusData, currentNiveau: Niveau) => {
    setMotsMelanges(shuffleArray(serie.mots));
    setMotSelectionne(null);
    setErreurIntrus(null);
    setErreurQCM(null);
    setMancheEchouee(false);
    const allOptions = [serie.point_commun, ...serie.distracteurs_qcm];
    setOptionsQCM(shuffleArray(allOptions.slice(0, 4)));
    const initialTime = currentNiveau === 'debutant' ? 30 : currentNiveau === 'intermediaire' ? 15 : 8;
    setTimeLeft(initialTime);
    setPhase('jeu_intrus');
  };

  useEffect(() => {
    if ((phase === 'jeu_intrus' || phase === 'jeu_qcm') && timeLeft > 0 && !mancheEchouee) {
      const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && (phase === 'jeu_intrus' || phase === 'jeu_qcm') && !mancheEchouee) {
      handleErreur('Temps écoulé !');
      setMancheEchouee(true);
    }
  }, [timeLeft, phase, mancheEchouee]);

  const passerALaSuite = () => {
    if (currentSerieIndex < series.length - 1) {
      setCurrentSerieIndex((prev) => prev + 1);
      loadSerie(series[currentSerieIndex + 1], niveau);
    } else {
      setPhase('bilan');
    }
  };

  const handleErreur = (msg: string) => {
    setErreursTotales((prev) => prev + 1);
    if (phase === 'jeu_intrus') setErreurIntrus(msg);
    if (phase === 'jeu_qcm') setErreurQCM(msg);
  };

  const handleClicMot = (mot: string) => {
    if (phase !== 'jeu_intrus' || mancheEchouee) return;
    const currentSerie = series[currentSerieIndex];
    if (mot === currentSerie.intrus) {
      setMotSelectionne(mot);
      setErreurIntrus(null);
      setPhase('jeu_qcm');
    } else {
      setErreurIntrus(`Raté ! "${mot}" n'est pas l'intrus.`);
      setErreursTotales((prev) => prev + 1);
      setMancheEchouee(true);
    }
  };

  const handleClicQCM = (option: string) => {
    if (phase !== 'jeu_qcm' || mancheEchouee) return;
    const currentSerie = series[currentSerieIndex];
    if (option === currentSerie.point_commun) {
      let pointsGagnes = 100;
      if (timeLeft > 0) pointsGagnes += timeLeft * 10;
      const multiplicateur = niveau === 'debutant' ? 1 : niveau === 'intermediaire' ? 1.5 : 2;
      setScore((prev) => prev + Math.floor(pointsGagnes * multiplicateur));
      if (currentSerieIndex < series.length - 1) {
        setTimeout(passerALaSuite, 1200);
      } else {
        setPhase('bilan');
      }
    } else {
      setErreurQCM('Faux ! Ce n\'est pas le bon point commun.');
      setErreursTotales((prev) => prev + 1);
      setScore((prev) => Math.max(0, prev - 50));
      setMancheEchouee(true);
    }
  };

  // ── Level select ────────────────────────────────────────────────────────
  if (phase === 'selection_niveau') {
    return (
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            animate={{ y: [0, -7, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-24 h-24 mx-auto rounded-3xl flex items-center justify-center text-5xl mb-5"
            style={{ background: EX.gradient, boxShadow: EX.shadow }}
          >
            {EX.emoji}
          </motion.div>
          <h2 className="text-3xl font-fredoka font-semibold text-ink mb-2">{EX.title}</h2>
          <p className="text-gray-500 font-semibold">Trouve l'intrus parmi les mots et découvre leur point commun !</p>
        </div>

        {/* Level cards */}
        <div className="space-y-3">
          {(['debutant', 'intermediaire', 'professionnel'] as Niveau[]).map((nv) => {
            const meta = NIVEAU_META[nv];
            return (
              <motion.button
                key={nv}
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.02, y: -2 }}
                onClick={() => startPartie(nv)}
                className="w-full text-left rounded-2xl overflow-hidden transition-all"
                style={{ boxShadow: '0 4px 16px rgba(45,45,58,0.10)' }}
              >
                <div className="flex items-center gap-4 p-5 bg-white" style={{ borderLeft: `5px solid` }}>
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                    style={{ background: meta.gradient }}
                  >
                    {meta.emoji}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-black text-ink">{meta.label}</p>
                      <span
                        className="text-xs font-black px-2 py-0.5 rounded-full"
                        style={{ background: EX.bgLight, color: EX.color }}
                      >
                        {meta.multiplier}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 font-semibold">
                      Chrono : {meta.time}s
                    </p>
                  </div>
                  <span className="font-black text-gray-300 text-lg">→</span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Bilan ───────────────────────────────────────────────────────────────
  if (phase === 'bilan') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto text-center py-12"
      >
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', bounce: 0.6, delay: 0.1 }}
          className="text-7xl mb-4"
        >
          🎉
        </motion.div>
        <h2 className="text-3xl font-fredoka font-semibold text-ink mb-2">Partie terminée !</h2>
        <p className="text-gray-500 font-semibold mb-6">
          Niveau : <span className="font-black capitalize">{NIVEAU_META[niveau].label}</span> {NIVEAU_META[niveau].emoji}
        </p>
        <div className="bg-white rounded-3xl p-8 shadow-card mb-6 space-y-4">
          <div>
            <p
              className="text-6xl font-fredoka font-bold score-reveal"
              style={{ background: EX.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
            >
              {score}
            </p>
            <p className="text-gray-400 font-semibold mt-1">points</p>
          </div>
          <div className="border-t pt-3 grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-2xl font-black text-ink">{5 - erreursTotales < 0 ? 0 : 5}</p>
              <p className="text-xs text-gray-400 font-semibold">Séries</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-2xl font-black text-error">{erreursTotales}</p>
              <p className="text-xs text-gray-400 font-semibold">Erreurs</p>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/accueil')}
            className="flex-1 bg-gray-100 text-ink font-bold py-3 rounded-2xl hover:bg-gray-200 transition-colors"
          >
            Accueil
          </button>
          <button
            onClick={() => setPhase('selection_niveau')}
            className="flex-1 text-white font-bold py-3 rounded-2xl active:scale-95 transition-all"
            style={{ background: EX.gradient, boxShadow: EX.shadow }}
          >
            Rejouer
          </button>
        </div>
      </motion.div>
    );
  }

  // ── Game screen ─────────────────────────────────────────────────────────
  const isQCM = phase === 'jeu_qcm';
  const initialTimeNiveau = niveau === 'debutant' ? 30 : niveau === 'intermediaire' ? 15 : 8;
  const timerPercent = (timeLeft / initialTimeNiveau) * 100;
  const timerColor = timeLeft < 5 ? '#EF476F' : timeLeft < (initialTimeNiveau * 0.4) ? '#FFD166' : '#06D6A0';

  return (
    <div className="max-w-2xl mx-auto">
      {/* Game header */}
      <div className="bg-white rounded-2xl p-4 shadow-card mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
              style={{ background: EX.gradient }}
            >
              {EX.emoji}
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold">Série {currentSerieIndex + 1} / {series.length}</p>
              <p className="font-black text-sm text-ink" style={{ color: EX.color }}>
                {NIVEAU_META[niveau].label} {NIVEAU_META[niveau].emoji}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl text-center" style={{ background: EX.bgLight }}>
              <p className="text-xs font-semibold" style={{ color: 'rgba(255,123,84,0.7)' }}>Score</p>
              <p className="font-black text-sm" style={{ color: EX.color }}>{score}</p>
            </div>
            <div className="px-3 py-1.5 rounded-xl text-center" style={{
              background: timeLeft < 5 ? 'rgba(239,71,111,0.12)' : 'rgba(45,45,58,0.06)'
            }}>
              <p className="text-xs font-semibold text-gray-400">Temps</p>
              <p className="font-black text-lg tabular-nums" style={{ color: timerColor }}>{timeLeft}s</p>
            </div>
          </div>
        </div>

        {/* Timer bar */}
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full transition-colors duration-300"
            animate={{ width: `${timerPercent}%` }}
            transition={{ duration: 1, ease: 'linear' }}
            style={{ background: timerColor }}
          />
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1.5 mb-4">
        {Array.from({ length: series.length }, (_, i) => (
          <div
            key={i}
            className="flex-1 h-2.5 rounded-full transition-all duration-500"
            style={{
              background: i < currentSerieIndex ? '#06D6A0' : i === currentSerieIndex ? EX.gradient : '#e5e7eb',
            }}
          />
        ))}
      </div>

      {/* Step 1: Find the intrus */}
      <div className="bg-white rounded-3xl p-6 shadow-card mb-4">
        <h3
          className="text-lg font-fredoka font-semibold mb-4 flex items-center gap-2"
          style={{ color: isQCM ? '#9ca3af' : EX.color }}
        >
          <span
            className="w-7 h-7 rounded-full text-sm flex items-center justify-center text-white"
            style={{ background: isQCM ? '#d1d5db' : EX.gradient }}
          >
            1
          </span>
          Clique sur le mot intrus
        </h3>

        <div className="flex flex-wrap gap-3 justify-center">
          {motsMelanges.map((mot) => {
            const isIntrus = mot === series[currentSerieIndex]?.intrus;
            const isSelected = mot === motSelectionne;
            let style: React.CSSProperties = {};
            let className = 'px-5 py-2.5 rounded-2xl text-base font-bold transition-all duration-200 ';

            if (isQCM) {
              if (isIntrus) {
                className += 'line-through ';
                style = { background: 'rgba(239,71,111,0.12)', border: '2px solid #EF476F', color: '#EF476F' };
              } else {
                style = { background: 'rgba(6,214,160,0.08)', border: '2px solid rgba(6,214,160,0.3)', color: '#059669' };
              }
            } else {
              style = { background: '#f9f9ff', border: '2px solid #e5e7eb', color: '#2D2D3A' };
              className += 'hover:border-primary hover:bg-primary/5 cursor-pointer ';
            }

            return (
              <motion.button
                key={mot}
                whileTap={!isQCM ? { scale: 0.95 } : {}}
                onClick={() => handleClicMot(mot)}
                disabled={isQCM}
                className={className}
                style={style}
              >
                {mot}
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence>
          {erreurIntrus && !isQCM && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 text-sm font-bold text-error text-center"
            >
              ⚠️ {erreurIntrus}
            </motion.div>
          )}
        </AnimatePresence>

        {mancheEchouee && (
          <div className="mt-5 text-center">
            <p className="text-error font-bold mb-3">Manche échouée !</p>
            <button
              onClick={passerALaSuite}
              className="text-white font-black px-6 py-2.5 rounded-2xl active:scale-95 transition-all"
              style={{ background: EX.gradient, boxShadow: EX.shadow }}
            >
              Passer à la suite →
            </button>
          </div>
        )}
      </div>

      {/* Step 2: QCM */}
      <AnimatePresence>
        {isQCM && !mancheEchouee && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-6 shadow-card"
          >
            <h3
              className="text-lg font-fredoka font-semibold mb-4 flex items-center gap-2"
              style={{ color: EX.color }}
            >
              <span
                className="w-7 h-7 rounded-full text-sm flex items-center justify-center text-white"
                style={{ background: EX.gradient }}
              >
                2
              </span>
              Quel est le point commun des autres mots ?
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {optionsQCM.map((opt) => (
                <motion.button
                  key={opt}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleClicQCM(opt)}
                  className="p-4 rounded-2xl text-ink font-bold text-left transition-all border-2 border-gray-100 hover:border-primary hover:bg-primary/5"
                  style={{ background: '#f9f9ff' }}
                >
                  {opt}
                </motion.button>
              ))}
            </div>

            <AnimatePresence>
              {erreurQCM && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 text-sm font-bold text-error text-center"
                >
                  ⚠️ {erreurQCM}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
