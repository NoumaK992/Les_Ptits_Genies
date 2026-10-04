import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LISTES_INTRUS, IntrusData } from './data';
import { EnTete } from '@/components/ui/EnTete';
import { EcranFin } from '@/components/ui/EcranFin';
import { Carte, classesCarte } from '@/components/ui/Carte';
import { Bouton } from '@/components/ui/Bouton';
import { Etiquette } from '@/components/ui/Etiquette';
import { BoutonMot } from '@/components/ui/BoutonMot';
import { couleurs } from '@/theme/couleurs';
import { cn } from '@/lib/cn';
import { useAuthStore } from '@/store/authStore';
import { useProgressStore } from '@/store/progressStore';
import { useParcoursStore } from '@/store/parcoursStore';
import { useItemsVusStore } from '@/store/itemsVusStore';
import { useModeParcours } from '@/parcours/useModeParcours';
import { niveauAmiEnnemi, tauxReussite } from '@/parcours/regles';
import type { AmiEnnemiSessionDetails } from '@/types';

// ── Exercise identity ──────────────────────────────────────────────────────
const EX = {
  emoji: '🕵️',
  title: "Chasseur d'Intrus",
}

type Niveau = 'debutant' | 'intermediaire' | 'professionnel';
// `enregistrement` : partie finie, sauvegarde en cours (puis `bilan`).
type Phase = 'selection_niveau' | 'jeu_intrus' | 'jeu_qcm' | 'enregistrement' | 'bilan';

const NB_SERIES = 5;
const DUREE_NIVEAU: Record<Niveau, number> = { debutant: 30, intermediaire: 15, professionnel: 8 };

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

// Listes jamais vues d'abord, puis les moins récemment vues si le niveau est épuisé.
const tirerSeries = (nv: Niveau): IntrusData[] =>
  useItemsVusStore.getState().choisir('ami-ennemi', LISTES_INTRUS.filter((l) => l.niveau === nv), NB_SERIES);

// Mots et options mélangés d'une série (sans toucher à l'état).
const preparerSerie = (serie: IntrusData) => ({
  mots: shuffleArray(serie.mots),
  options: shuffleArray([serie.point_commun, ...serie.distracteurs_qcm].slice(0, 4)),
});

export const ChasseurDIntrus: React.FC = () => {
  const modeParcours = useModeParcours();
  const { currentUser, refreshPoints } = useAuthStore();
  const { saveSession } = useProgressStore();
  const { terminerPartie } = useParcoursStore();

  // En mode parcours, la partie est tirée dès le premier rendu : l'écran de
  // choix du niveau ne s'affiche jamais, même un instant (StrictMode compris).
  const [depart] = useState(() => {
    if (!modeParcours) return null;
    const nv = niveauAmiEnnemi(modeParcours.difficulte);
    const tirees = tirerSeries(nv);
    return { niveau: nv, series: tirees, ...preparerSerie(tirees[0]) };
  });

  const [phase, setPhase] = useState<Phase>(depart ? 'jeu_intrus' : 'selection_niveau');
  const [niveau, setNiveau] = useState<Niveau>(depart?.niveau ?? 'debutant');
  const [series, setSeries] = useState<IntrusData[]>(depart?.series ?? []);
  const [currentSerieIndex, setCurrentSerieIndex] = useState(0);
  const [motsMelanges, setMotsMelanges] = useState<string[]>(depart?.mots ?? []);
  const [motSelectionne, setMotSelectionne] = useState<string | null>(null);
  const [erreurIntrus, setErreurIntrus] = useState<string | null>(null);
  const [optionsQCM, setOptionsQCM] = useState<string[]>(depart?.options ?? []);
  const [erreurQCM, setErreurQCM] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [erreursTotales, setErreursTotales] = useState(0);
  const [manchesReussies, setManchesReussies] = useState(0);
  const [timeLeft, setTimeLeft] = useState(depart ? DUREE_NIVEAU[depart.niveau] : 30);
  const [mancheEchouee, setMancheEchouee] = useState(false);
  // Manche gagnée : bloque les clics et le chrono pendant la petite pause avant la suivante.
  const [mancheGagnee, setMancheGagnee] = useState(false);

  // Début réel de la partie (durée enregistrée) et garde « une seule sauvegarde par partie ».
  const debutPartie = useRef(0);
  const partieEnregistree = useRef(false);

  useEffect(() => {
    if (depart && debutPartie.current === 0) debutPartie.current = Date.now();
  }, [depart]);

  const startPartie = (selectedNiveau: Niveau) => {
    setNiveau(selectedNiveau);
    const selectedSeries = tirerSeries(selectedNiveau);
    setSeries(selectedSeries);
    setCurrentSerieIndex(0);
    setScore(0);
    setErreursTotales(0);
    setManchesReussies(0);
    debutPartie.current = Date.now();
    partieEnregistree.current = false;
    loadSerie(selectedSeries[0], selectedNiveau);
  };

  const loadSerie = (serie: IntrusData, currentNiveau: Niveau) => {
    const { mots, options } = preparerSerie(serie);
    setMotsMelanges(mots);
    setMotSelectionne(null);
    setErreurIntrus(null);
    setErreurQCM(null);
    setMancheEchouee(false);
    setMancheGagnee(false);
    setOptionsQCM(options);
    setTimeLeft(DUREE_NIVEAU[currentNiveau]);
    setPhase('jeu_intrus');
  };

  useEffect(() => {
    if ((phase === 'jeu_intrus' || phase === 'jeu_qcm') && timeLeft > 0 && !mancheEchouee && !mancheGagnee) {
      const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && (phase === 'jeu_intrus' || phase === 'jeu_qcm') && !mancheEchouee && !mancheGagnee) {
      handleErreur('Temps écoulé !');
      setMancheEchouee(true);
    }
  }, [timeLeft, phase, mancheEchouee, mancheGagnee]);

  // Fin de partie : enregistrement (une seule fois), puis parcours, puis bilan.
  useEffect(() => {
    if (phase !== 'enregistrement' || partieEnregistree.current) return;
    partieEnregistree.current = true;
    const enregistrer = async () => {
      if (currentUser) {
        void useItemsVusStore.getState().marquer(currentUser.id, 'ami-ennemi', series.map((s) => s.id));
        const duree = debutPartie.current > 0 ? Math.round((Date.now() - debutPartie.current) / 1000) : 0;
        const details: AmiEnnemiSessionDetails = {
          type: 'ami-ennemi', niveau, manches: series.length, manchesReussies, erreurs: erreursTotales,
        };
        const reussite = tauxReussite(manchesReussies, series.length);
        try {
          await saveSession({ id: `${Date.now()}-ami`, userId: currentUser.id, exerciseType: 'ami-ennemi', score, duration: duree, playedAt: new Date().toISOString(), details: { ...details, reussite } }, { parcours: !!modeParcours });
          await refreshPoints();
        } catch {
          // Échec réseau : le bilan s'affiche quand même.
        }
        if (modeParcours) {
          await terminerPartie(currentUser.id, modeParcours, reussite);
        }
      }
      setPhase('bilan');
    };
    void enregistrer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const passerALaSuite = () => {
    if (currentSerieIndex < series.length - 1) {
      setCurrentSerieIndex((prev) => prev + 1);
      loadSerie(series[currentSerieIndex + 1], niveau);
    } else {
      setPhase('enregistrement');
    }
  };

  const handleErreur = (msg: string) => {
    setErreursTotales((prev) => prev + 1);
    if (phase === 'jeu_intrus') setErreurIntrus(msg);
    if (phase === 'jeu_qcm') setErreurQCM(msg);
  };

  const handleClicMot = (mot: string) => {
    if (phase !== 'jeu_intrus' || mancheEchouee || mancheGagnee) return;
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
    if (phase !== 'jeu_qcm' || mancheEchouee || mancheGagnee) return;
    const currentSerie = series[currentSerieIndex];
    if (option === currentSerie.point_commun) {
      setMancheGagnee(true);
      setManchesReussies((prev) => prev + 1);
      let pointsGagnes = 100;
      if (timeLeft > 0) pointsGagnes += timeLeft * 10;
      const multiplicateur = niveau === 'debutant' ? 1 : niveau === 'intermediaire' ? 1.5 : 2;
      setScore((prev) => prev + Math.floor(pointsGagnes * multiplicateur));
      if (currentSerieIndex < series.length - 1) {
        setTimeout(passerALaSuite, 1200);
      } else {
        setPhase('enregistrement');
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

  // ── Enregistrement de la partie ─────────────────────────────────────────
  if (phase === 'enregistrement') {
    return (
      <div className="py-16 text-center text-4xl" role="status" aria-label="Enregistrement de la partie">
        <span aria-hidden="true">⏳</span>
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
          parcours={!!modeParcours}
        >
          <p className="mb-4 text-center text-lg font-semibold text-encre-doux">
            Niveau : <span className="font-bold text-encre">{NIVEAU_META[niveau].label}</span> {NIVEAU_META[niveau].emoji}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border-2 border-encre bg-sable p-3 text-center">
              <p className="font-titre text-2xl text-encre">{manchesReussies} / {series.length}</p>
              <p className="text-base font-semibold text-encre-doux">Séries réussies</p>
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
  const initialTimeNiveau = DUREE_NIVEAU[niveau];
  const timerPercent = (timeLeft / initialTimeNiveau) * 100;
  const timerColor = timeLeft < 5 ? couleurs.faux : timeLeft < (initialTimeNiveau * 0.4) ? couleurs.jaune : couleurs.juste;

  return (
    <div className="max-w-2xl mx-auto">
      <EnTete
        titre={`${EX.emoji} ${EX.title}`}
        retourVers={modeParcours ? '/parcours' : undefined}
        droite={
          <>
            <span className={PASTILLE}>Score : {score}</span>
            <span className={cn(PASTILLE, 'tabular-nums', timeLeft < 5 && 'bg-faux')}>⏱ {timeLeft}s</span>
          </>
        }
      />

      {modeParcours?.etape === 'boss' && (
        <Etiquette couleur="rose-pale" className="mb-4">👾 Boss du niveau</Etiquette>
      )}

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
