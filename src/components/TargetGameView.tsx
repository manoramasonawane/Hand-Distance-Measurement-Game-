/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  DifficultyLevel,
  DifficultyConfig,
  GameTarget,
  GameStats,
  HandLandmarksData,
  ParticleEffect,
  HitRingEffect,
  LeaderboardEntry,
} from '../types';
import { soundManager } from '../utils/audio';
import { Play, Square, Flame, Timer, Target, Award, RotateCcw } from 'lucide-react';

interface TargetGameViewProps {
  handData: HandLandmarksData | null;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  targets: GameTarget[];
  setTargets: React.Dispatch<React.SetStateAction<GameTarget[]>>;
  setParticles: React.Dispatch<React.SetStateAction<ParticleEffect[]>>;
  setHitRings: React.Dispatch<React.SetStateAction<HitRingEffect[]>>;
  isGameActive: boolean;
  setIsGameActive: (val: boolean) => void;
  onSaveScore: (entry: Omit<LeaderboardEntry, 'id' | 'date'>) => void;
  onOpenTutorial?: () => void;
}

const DIFFICULTY_CONFIGS: Record<DifficultyLevel, DifficultyConfig> = {
  Easy: {
    radius: 46,
    lifespan: 4.5,
    speed: 0.0,
    points: 100,
    pinchRequired: false,
    pinchThreshold: 45,
    theme: {
      name: 'Easy',
      primary: '#10b981', // Vibrant Green for Easy
      secondary: '#34d399',
      glow: '#059669',
      fill: 'rgba(16, 185, 129, 0.28)',
      particleColors: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#ffffff'],
      label: 'EASY',
    },
  },
  Medium: {
    radius: 34,
    lifespan: 3.2,
    speed: 0.003,
    points: 150,
    pinchRequired: false,
    pinchThreshold: 38,
    theme: {
      name: 'Medium',
      primary: '#f59e0b', // Amber / Gold for Medium
      secondary: '#fbbf24',
      glow: '#d97706',
      fill: 'rgba(245, 158, 11, 0.28)',
      particleColors: ['#f59e0b', '#fbbf24', '#fcd34d', '#fde68a', '#ffffff'],
      label: 'MEDIUM',
    },
  },
  Hard: {
    radius: 24,
    lifespan: 2.0,
    speed: 0.007,
    points: 250,
    pinchRequired: true,
    pinchThreshold: 32,
    theme: {
      name: 'Hard',
      primary: '#ef4444', // Red for Hard
      secondary: '#f87171',
      glow: '#dc2626',
      fill: 'rgba(239, 68, 68, 0.35)',
      particleColors: ['#ef4444', '#f87171', '#fca5a5', '#fb7185', '#ffffff'],
      label: 'HARD (PINCH)',
    },
  },
};

export const TargetGameView: React.FC<TargetGameViewProps> = ({
  handData,
  canvasRef,
  targets,
  setTargets,
  setParticles,
  setHitRings,
  isGameActive,
  setIsGameActive,
  onSaveScore,
  onOpenTutorial,
}) => {
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Medium');
  const [duration, setDuration] = useState<number>(30);

  const [countdown, setCountdown] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [playerName, setPlayerName] = useState<string>('HandMaster');
  const [scoreSaved, setScoreSaved] = useState<boolean>(false);

  const [stats, setStats] = useState<GameStats>({
    score: 0,
    targetsHit: 0,
    targetsSpawned: 0,
    accuracy: 0,
    currentCombo: 0,
    highestCombo: 0,
    avgReactionTimeMs: 0,
    totalReactionTimeMs: 0,
  });

  const targetCounterRef = useRef<number>(0);
  const gameStartTimeRef = useRef<number>(0);
  const statsRef = useRef<GameStats>(stats);
  statsRef.current = stats;

  const currentCfg = DIFFICULTY_CONFIGS[difficulty];

  // Spawn a target at random location within safe normalized margins (0.15 to 0.85)
  const spawnTarget = useCallback(() => {
    const margin = 0.15;
    const x = margin + Math.random() * (1 - margin * 2);
    const y = margin + Math.random() * (1 - margin * 2);

    targetCounterRef.current += 1;
    const newId = targetCounterRef.current;

    const angle = Math.random() * Math.PI * 2;
    const spd = currentCfg.speed;
    const vx = Math.cos(angle) * spd;
    const vy = Math.sin(angle) * spd;

    const newTarget: GameTarget = {
      id: newId,
      x,
      y,
      radius: currentCfg.radius,
      spawnTime: Date.now(),
      maxLifespan: currentCfg.lifespan,
      vx,
      vy,
      hit: false,
      difficulty,
      theme: currentCfg.theme,
    };

    setTargets([newTarget]);
    setStats((prev) => ({
      ...prev,
      targetsSpawned: prev.targetsSpawned + 1,
    }));
  }, [currentCfg, setTargets]);

  // Start Countdown Sequence (3, 2, 1, GO)
  const initiateGame = () => {
    setGameOver(false);
    setScoreSaved(false);
    targetCounterRef.current = 0;
    setStats({
      score: 0,
      targetsHit: 0,
      targetsSpawned: 0,
      accuracy: 0,
      currentCombo: 0,
      highestCombo: 0,
      avgReactionTimeMs: 0,
      totalReactionTimeMs: 0,
    });
    setCountdown(3);
    soundManager.playCountdown(false);
  };

  // Countdown timer effect
  useEffect(() => {
    if (countdown === null) return;

    if (countdown > 1) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
        soundManager.playCountdown(false);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 1) {
      const timer = setTimeout(() => {
        setCountdown(0); // "GO!"
        soundManager.playCountdown(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      const timer = setTimeout(() => {
        setCountdown(null);
        // Game officially begins
        setIsGameActive(true);
        gameStartTimeRef.current = Date.now();
        setTimeLeft(duration);
        spawnTarget();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [countdown, duration, setIsGameActive, spawnTarget]);

  // Main Game Clock Effect
  useEffect(() => {
    if (!isGameActive) return;

    const interval = setInterval(() => {
      const elapsed = (Date.now() - gameStartTimeRef.current) / 1000;
      const remaining = Math.max(0, duration - elapsed);
      setTimeLeft(Math.ceil(remaining));

      if (remaining <= 0) {
        clearInterval(interval);
        endGame();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isGameActive, duration]);

  // End Game
  const endGame = useCallback(() => {
    setIsGameActive(false);
    setGameOver(true);
    setTargets([]);
    soundManager.playGameOver();

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }
  }, [setIsGameActive, setTargets]);

  // Target Lifespan and Collision Physics Loop
  useEffect(() => {
    if (!isGameActive || targets.length === 0) return;

    const canvas = canvasRef.current;
    const w = canvas ? canvas.width : 640;
    const h = canvas ? canvas.height : 480;

    const interval = setInterval(() => {
      const now = Date.now();
      const currentTarget = targets[0];
      if (!currentTarget || currentTarget.hit) return;

      // 1. Check expiration
      const ageSec = (now - currentTarget.spawnTime) / 1000;
      if (ageSec >= currentTarget.maxLifespan) {
        // Expired without hit - drop combo
        setStats((prev) => ({ ...prev, currentCombo: 0 }));
        spawnTarget();
        return;
      }

      // 2. Target motion
      if (currentTarget.vx !== 0 || currentTarget.vy !== 0) {
        let nx = currentTarget.x + currentTarget.vx;
        let ny = currentTarget.y + currentTarget.vy;
        let nvx = currentTarget.vx;
        let nvy = currentTarget.vy;

        const margin = 0.12;
        if (nx <= margin || nx >= 1 - margin) nvx *= -1;
        if (ny <= margin || ny >= 1 - margin) nvy *= -1;

        currentTarget.x = nx;
        currentTarget.y = ny;
        currentTarget.vx = nvx;
        currentTarget.vy = nvy;
      }

      // 3. Collision Check against Hand Landmark 8 (Index Tip)
      if (handData && handData.indexTip) {
        const txPx = currentTarget.x * w;
        const tyPx = currentTarget.y * h;
        const ixPx = handData.indexTip.x * w;
        const iyPx = handData.indexTip.y * h;

        const distToCenter = Math.hypot(ixPx - txPx, iyPx - tyPx);
        const inside = distToCenter <= currentTarget.radius;

        // Check pinch rule if required by difficulty
        let pinchValid = true;
        if (currentCfg.pinchRequired) {
          pinchValid =
            handData.smoothedDistance !== null &&
            handData.smoothedDistance <= currentCfg.pinchThreshold;
        }

        if (inside && pinchValid) {
          // HIT!
          const reactionMs = Math.round(now - currentTarget.spawnTime);
          currentTarget.hit = true;

          // Sound effect
          soundManager.playHit(statsRef.current.currentCombo + 1);

          // Calculate points with speed and combo multiplier
          const speedBonus = Math.max(0, Math.floor((currentTarget.maxLifespan - ageSec) * 35));
          const comboBonus = Math.min(250, statsRef.current.currentCombo * 25);
          const earned = currentCfg.points + speedBonus + comboBonus;

          // Particle burst explosion themed to current difficulty
          const newParticles: ParticleEffect[] = [];
          const themeColors = currentCfg.theme.particleColors;
          for (let i = 0; i < 22; i++) {
            const pAngle = Math.random() * Math.PI * 2;
            const pSpeed = 2 + Math.random() * 5.5;
            newParticles.push({
              id: Math.random(),
              x: currentTarget.x,
              y: currentTarget.y,
              vx: (Math.cos(pAngle) * pSpeed) / w,
              vy: (Math.sin(pAngle) * pSpeed) / h,
              radius: 2 + Math.random() * 3.5,
              color: themeColors[Math.floor(Math.random() * themeColors.length)],
              alpha: 1.0,
              maxLife: 35,
              life: 35,
            });
          }

          setParticles((prev) => [...prev, ...newParticles]);

          // Shockwave ring + floating point text themed to difficulty
          setHitRings((prev) => [
            ...prev,
            {
              id: Math.random(),
              x: currentTarget.x,
              y: currentTarget.y,
              radius: currentTarget.radius,
              maxRadius: currentTarget.radius + 40,
              alpha: 1.0,
              pointsText: `+${earned}`,
              color: currentCfg.theme.secondary,
            },
          ]);

          // Update stats
          setStats((prev) => {
            const newHits = prev.targetsHit + 1;
            const newCombo = prev.currentCombo + 1;
            const newHighest = Math.max(prev.highestCombo, newCombo);
            const newTotalRx = prev.totalReactionTimeMs + reactionMs;
            const newAvgRx = Math.round(newTotalRx / newHits);
            const newAccuracy = Math.round((newHits / Math.max(1, prev.targetsSpawned)) * 100);

            return {
              ...prev,
              score: prev.score + earned,
              targetsHit: newHits,
              currentCombo: newCombo,
              highestCombo: newHighest,
              totalReactionTimeMs: newTotalRx,
              avgReactionTimeMs: newAvgRx,
              accuracy: newAccuracy,
            };
          });

          // Spawn next target
          spawnTarget();
        }
      }
    }, 30);

    return () => clearInterval(interval);
  }, [isGameActive, targets, handData, currentCfg, canvasRef, setParticles, setHitRings, spawnTarget]);

  // Particle physics decay tick
  useEffect(() => {
    const pTimer = setInterval(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            life: p.life - 1,
            alpha: p.life / p.maxLife,
          }))
          .filter((p) => p.life > 0)
      );

      setHitRings((prev) =>
        prev
          .map((r) => ({
            ...r,
            radius: r.radius + 2,
            alpha: r.alpha - 0.05,
          }))
          .filter((r) => r.alpha > 0)
      );
    }, 25);

    return () => clearInterval(pTimer);
  }, [setParticles, setHitRings]);

  // Performance ranking calculation
  const getRank = (score: number) => {
    if (score >= 2500) return { title: 'S - Cyber Ninja', color: 'text-amber-400' };
    if (score >= 1600) return { title: 'A - Reflex Master', color: 'text-purple-400' };
    if (score >= 900) return { title: 'B - Fast Tracker', color: 'text-cyan-400' };
    return { title: 'C - Hand Trainee', color: 'text-slate-400' };
  };

  const handleSaveScore = () => {
    if (scoreSaved) return;
    onSaveScore({
      player: playerName.trim() || 'Player 1',
      score: stats.score,
      difficulty,
      duration,
      targetsHit: stats.targetsHit,
      accuracy: stats.accuracy,
      avgReactionTimeMs: stats.avgReactionTimeMs,
    });
    setScoreSaved(true);
  };

  return (
    <div className="space-y-6">
      {/* Pre-Game Countdown Overlay */}
      {countdown !== null && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xl flex flex-col items-center justify-center animate-in fade-in">
          <div className="relative flex items-center justify-center">
            <span className="text-8xl sm:text-9xl font-black bg-gradient-to-br from-yellow-300 via-pink-500 to-purple-600 bg-clip-text text-transparent animate-ping">
              {countdown === 0 ? 'GO!' : countdown}
            </span>
          </div>
          <p className="mt-6 text-slate-300 text-lg font-medium">
            Get your hand ready in the camera frame!
          </p>
        </div>
      )}

      {/* Top HUD Cards (Score, Time, Combo, Accuracy) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Score Card */}
        <div className="relative overflow-hidden rounded-xl bg-slate-900/80 border border-purple-500/20 p-4 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Score
            </span>
            <Target className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            {stats.score}
          </div>
          <div className="mt-1 text-[11px] text-slate-400 flex items-center gap-1">
            <span>Hits: {stats.targetsHit}</span>
          </div>
        </div>

        {/* Time Remaining */}
        <div className="relative overflow-hidden rounded-xl bg-slate-900/80 border border-purple-500/20 p-4 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Time Left
            </span>
            <Timer className="w-4 h-4 text-cyan-400" />
          </div>
          <div
            className={`mt-2 text-2xl sm:text-3xl font-extrabold ${
              timeLeft <= 5 ? 'text-rose-400 animate-pulse' : 'text-cyan-300'
            }`}
          >
            {timeLeft}s
          </div>
          <div className="mt-1.5 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-500 to-purple-500 h-1.5 rounded-full transition-all duration-200"
              style={{ width: `${(timeLeft / duration) * 100}%` }}
            />
          </div>
        </div>

        {/* Combo Multiplier */}
        <div className="relative overflow-hidden rounded-xl bg-slate-900/80 border border-purple-500/20 p-4 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Combo Streak
            </span>
            <Flame
              className={`w-4 h-4 ${
                stats.currentCombo > 2 ? 'text-amber-400 animate-bounce' : 'text-slate-500'
              }`}
            />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-amber-400">
            x{stats.currentCombo}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Highest: <span className="text-amber-300 font-bold">x{stats.highestCombo}</span>
          </div>
        </div>

        {/* Accuracy & Reaction */}
        <div className="relative overflow-hidden rounded-xl bg-slate-900/80 border border-purple-500/20 p-4 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Accuracy
            </span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-emerald-400">
            {stats.accuracy}%
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Avg: <span className="font-mono text-emerald-300">{stats.avgReactionTimeMs}ms</span>
          </div>
        </div>
      </div>

      {/* Game Config Controls Bar */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-purple-500/20 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Difficulty selector with instant color feedback */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-400 uppercase">Difficulty:</span>
            {(['Easy', 'Medium', 'Hard'] as DifficultyLevel[]).map((level) => {
              const isSelected = difficulty === level;
              const colorClasses =
                level === 'Easy'
                  ? isSelected
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/40 border border-emerald-400'
                    : 'bg-slate-800 text-emerald-400/80 hover:text-emerald-300 hover:bg-slate-700/80'
                  : level === 'Medium'
                  ? isSelected
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/40 border border-amber-400'
                    : 'bg-slate-800 text-amber-400/80 hover:text-amber-300 hover:bg-slate-700/80'
                  : isSelected
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/40 border border-rose-400'
                  : 'bg-slate-800 text-rose-400/80 hover:text-rose-300 hover:bg-slate-700/80';

              const dotColor =
                level === 'Easy' ? 'bg-emerald-400' : level === 'Medium' ? 'bg-amber-400' : 'bg-rose-400';

              return (
                <button
                  key={level}
                  disabled={isGameActive}
                  onClick={() => {
                    setDifficulty(level);
                    const newCfg = DIFFICULTY_CONFIGS[level];
                    setTargets((prev) =>
                      prev.map((t) => ({
                        ...t,
                        radius: newCfg.radius,
                        difficulty: level,
                        theme: newCfg.theme,
                      }))
                    );
                  }}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${colorClasses} ${
                    isGameActive ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  title={`${level} Mode: ${level === 'Easy' ? 'Green targets' : level === 'Medium' ? 'Amber targets' : 'Red targets'}`}
                >
                  <span className={`w-2 h-2 rounded-full ${dotColor} ${isSelected ? 'animate-pulse' : ''}`} />
                  <span>{level}</span>
                </button>
              );
            })}
          </div>

          <div className="h-4 w-[1px] bg-slate-800 hidden sm:block" />

          {/* Duration selector */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-400 uppercase">Duration:</span>
            {[30, 60, 90].map((sec) => (
              <button
                key={sec}
                disabled={isGameActive}
                onClick={() => {
                  setDuration(sec);
                  setTimeLeft(sec);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  duration === sec
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                } ${isGameActive ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {sec}s
              </button>
            ))}
          </div>
        </div>

        {/* Start / Stop Game Button */}
        <div>
          {isGameActive ? (
            <button
              onClick={endGame}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-lg shadow-rose-600/30 transition"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>Stop Game</span>
            </button>
          ) : (
            <button
              onClick={initiateGame}
              className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 hover:opacity-90 text-white font-bold text-sm shadow-lg shadow-purple-600/40 transition hover:scale-[1.02]"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start 3-2-1 Challenge</span>
            </button>
          )}
        </div>
      </div>

      {/* Gesture Guide Quick Tip Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-purple-950/30 border border-purple-500/20 text-xs">
        <div className="flex items-center space-x-2 text-slate-300">
          <span className="text-purple-400 font-bold">💡 Tip:</span>
          <span>
            {difficulty === 'Hard'
              ? 'Hard mode requires bringing thumb & index tips together to pinch targets.'
              : 'Move your index fingertip over targets to pop them!'}
          </span>
        </div>
        {onOpenTutorial && (
          <button
            onClick={onOpenTutorial}
            className="text-purple-400 hover:text-purple-300 font-bold underline underline-offset-2 ml-2 transition whitespace-nowrap"
          >
            Watch Pinch Demo
          </button>
        )}
      </div>

      {/* Game Over Results Modal */}
      {gameOver && (
        <div className="rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-purple-500/40 p-6 sm:p-8 shadow-2xl relative">
          <div className="flex flex-col sm:flex-row items-center justify-between border-b border-purple-500/20 pb-6 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Game Completed
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {difficulty} • {duration}s
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                Final Score: <span className="text-yellow-400">{stats.score}</span>
              </h2>
              <p className={`text-sm font-bold mt-1 ${getRank(stats.score).color}`}>
                Rank: {getRank(stats.score).title}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={initiateGame}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-lg shadow-purple-600/30 transition"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Play Again</span>
              </button>
            </div>
          </div>

          {/* Breakdown Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-6">
            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400">Targets Hit</div>
              <div className="text-xl font-bold text-white mt-1">
                {stats.targetsHit} / {stats.targetsSpawned}
              </div>
            </div>
            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400">Accuracy</div>
              <div className="text-xl font-bold text-emerald-400 mt-1">{stats.accuracy}%</div>
            </div>
            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400">Avg Reaction Time</div>
              <div className="text-xl font-bold text-cyan-400 mt-1">
                {stats.avgReactionTimeMs} ms
              </div>
            </div>
            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400">Highest Streak</div>
              <div className="text-xl font-bold text-amber-400 mt-1">x{stats.highestCombo}</div>
            </div>
          </div>

          {/* Save to Leaderboard form */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter Player Name"
              maxLength={20}
              className="w-full sm:w-64 px-4 py-2.5 rounded-xl bg-slate-950 border border-purple-500/30 text-white text-sm focus:outline-none focus:border-purple-400"
            />
            <button
              onClick={handleSaveScore}
              disabled={scoreSaved}
              className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-sm transition ${
                scoreSaved
                  ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 cursor-default'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
              }`}
            >
              {scoreSaved ? '✓ Saved to Leaderboard' : 'Save Score to Leaderboard'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
