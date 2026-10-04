import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LISTES_INTRUS, IntrusData } from './data';
import { EnTete } from '@/components/ui/EnTete';
import { EcranFin } from '@/components/ui/EcranFin';
import { Carte, classesCarte } from '@/components/ui/Carte';
import { Bouton } from '@/components/ui/Bouton';
import { BoutonMot } from '@/components/ui/BoutonMot';
import { couleurs } from '@/theme/couleurs';

// ── Exercise identity ──────────────────────────────────────────────────────
const EX = {
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
  debutant: { label: 'Débutant', emoji: '🟢', time: 30, multiplier: '×1', fond: 'bg-bleu' },
  intermediaire: { label: 'Intermédiaire', emoji: '🟡', time: 15, multiplier: '×1.5', fond: 'bg-jaune' },
  professionnel: { label: 'Professionnel', emoji: '🔴', time: 8, multiplier: '×2', fond: 'bg-rose-pale' },
}

const PASTILLE = 'rounded-full border-2 border-encre bg-papier px-3 py-1 font-bold text-encre';

export const ChasseurDIntrus: React.FC = () => {
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
        <EnTete titre={`${EX.emoji} ${EX.title}`} />
        <p className="mb-6 text-lg font-semibold text-encre-doux">Trouve l'intrus parmi les mots et découvre leur point commun !</p>

        {/* Level cards */}
        <div className="space-y-4">
          {(['debutant', 'intermediaire', 'professionnel'] as Niveau[]).map((nv) => {
            const meta = NIVEAU_META[nv];
            return (
              <motion.button
                key={nv}
                type="button"
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.02, y: -2 }}
                onClick={() => startPartie(nv)}
                className={`${classesCarte} flex w-full items-center gap-4 p-5 text-left transition-[box-shadow,background-color] hover:bg-jaune/40 hover:shadow-dur-lg focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-bleu`}
              >
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-encre text-2xl ${meta.fond}`}>
                  {meta.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-0.5 flex flex-wrap items-center gap-2">
                    <p className="font-titre text-lg text-encre">{meta.label}</p>
                    <span className="rounded-full border-2 border-encre bg-sable px-2 py-0.5 text-sm font-bold text-encre">
                      {meta.multiplier}
                    </span>
                  </div>
                  <p className="text-base font-semibold text-encre-doux">
                    Chrono : {meta.time}s
                  </p>
                </div>
                <span aria-hidden="true" className="font-titre text-xl text-encre">→</span>
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
      <div className="py-6">
        <EcranFin
          titre="🎉 Partie terminée !"
          score={score}
          detail="points"
          onRejouer={() => setPhase('selection_niveau')}
          retourVers="/accueil"
        >
          <p className="mb-4 text-center text-lg font-semibold text-encre-doux">
            Niveau : <span className="font-bold text-encre">{NIVEAU_META[niveau].label}</span> {NIVEAU_META[niveau].emoji}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border-2 border-encre bg-sable p-3 text-center">
              <p className="font-titre text-2xl text-encre">{5 - erreursTotales < 0 ? 0 : 5}</p>
              <p className="text-base font-semibold text-encre-doux">Séries</p>
            </div>
            <div className="rounded-xl border-2 border-encre bg-sable p-3 text-center">
              <p className="font-titre text-2xl text-faux-fonce">
                <span aria-hidden="true">✗ </span>{erreursTotales}
              </p>
              <p className="text-base font-semibold text-encre-doux">Erreurs</p>
            </div>
          </div>
        </EcranFin>
      </div>
    );
  }

  // ── Game screen ─────────────────────────────────────────────────────────
  const isQCM = phase === 'jeu_qcm';
  const initialTimeNiveau = niveau === 'debutant' ? 30 : niveau === 'intermediaire' ? 15 : 8;
  const timerPercent = (timeLeft / initialTimeNiveau) * 100;
  const timerColor = timeLeft < 5 ? couleurs.faux : timeLeft < (initialTimeNiveau * 0.4) ? couleurs.jaune : couleurs.juste;

  return (
    <div className="max-w-2xl mx-auto">
      <EnTete
        titre={`${EX.emoji} ${EX.title}`}
        droite={
          <>
            <span className={PASTILLE}>Score : {score}</span>
            <span className={`${PASTILLE} tabular-nums ${timeLeft < 5 ? 'bg-faux' : ''}`}>⏱ {timeLeft}s</span>
          </>
        }
      />

      {/* Infos de série + barre du chrono */}
      <Carte className="mb-4 p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-base font-semibold text-encre-doux">Série {currentSerieIndex + 1} / {series.length}</p>
          <p className="text-base font-bold text-encre">
            {NIVEAU_META[niveau].label} {NIVEAU_META[niveau].emoji}
          </p>
        </div>

        {/* Timer bar */}
        <div className="h-3 overflow-hidden rounded-full border-2 border-encre bg-encre/10">
          <motion.div
            className="h-full rounded-full transition-colors duration-300"
            animate={{ width: `${timerPercent}%` }}
            transition={{ duration: 1, ease: 'linear' }}
            style={{ background: timerColor }}
          />
        </div>
      </Carte>

      {/* Progress dots */}
      <div className="flex gap-1.5 mb-4">
        {Array.from({ length: series.length }, (_, i) => (
          <div
            key={i}
            className={`h-3 flex-1 rounded-full border-2 border-encre transition-all duration-500 ${
              i < currentSerieIndex ? 'bg-juste' : i === currentSerieIndex ? 'bg-jaune' : 'bg-papier'
            }`}
          />
        ))}
      </div>

      {/* Step 1: Find the intrus */}
      <Carte className="mb-4 p-4 md:p-6">
        <h3 className={`mb-4 flex items-center gap-2 font-titre text-lg ${isQCM ? 'text-encre-doux' : 'text-encre'}`}>
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-encre text-base text-encre ${isQCM ? 'bg-sable' : 'bg-jaune'}`}
          >
            1
          </span>
          Clique sur le mot intrus
        </h3>

        <div className="flex flex-wrap gap-3 justify-center">
          {motsMelanges.map((mot) => {
            const isIntrus = mot === series[currentSerieIndex]?.intrus;
            // Pendant le QCM : l'intrus trouvé reste surligné en jaune et barré ;
            // les autres mots restent à l'état normal (texte adouci).
            const barre = isQCM && mot === motSelectionne;

            return (
              <BoutonMot
                key={mot}
                etat={barre ? 'selectionne' : 'normal'}
                onClick={() => handleClicMot(mot)}
                disabled={isQCM}
                className={`max-w-full break-words ${barre ? 'line-through decoration-2' : ''} ${isQCM && !isIntrus ? 'text-encre-doux' : ''} ${isQCM ? '' : 'cursor-pointer'}`}
              >
                {mot}
              </BoutonMot>
            );
          })}
        </div>

        <AnimatePresence>
          {erreurIntrus && !isQCM && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              role="status"
              className="mt-4 text-center text-base font-bold text-faux-fonce"
            >
              <span aria-hidden="true" className="font-titre">✗ </span>{erreurIntrus}
            </motion.div>
          )}
        </AnimatePresence>

        {mancheEchouee && (
          <div className="mt-5 text-center">
            <p className="mb-3 text-base font-bold text-faux-fonce">
              <span aria-hidden="true" className="font-titre">✗ </span>Manche échouée !
            </p>
            <Bouton onClick={passerALaSuite}>
              Passer à la suite →
            </Bouton>
          </div>
        )}
      </Carte>

      {/* Step 2: QCM */}
      <AnimatePresence>
        {isQCM && !mancheEchouee && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${classesCarte} p-4 md:p-6`}
          >
            <h3 className="mb-4 flex items-center gap-2 font-titre text-lg text-encre">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-encre bg-jaune text-base text-encre">
                2
              </span>
              Quel est le point commun des autres mots ?
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {optionsQCM.map((opt) => (
                <BoutonMot
                  key={opt}
                  onClick={() => handleClicQCM(opt)}
                  className="w-full justify-start p-4 text-left text-base font-bold"
                >
                  {opt}
                </BoutonMot>
              ))}
            </div>

            <AnimatePresence>
              {erreurQCM && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  role="status"
                  className="mt-4 text-center text-base font-bold text-faux-fonce"
                >
                  <span aria-hidden="true" className="font-titre">✗ </span>{erreurQCM}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
