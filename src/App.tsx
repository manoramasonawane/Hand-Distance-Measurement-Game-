/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { useHandDetection } from './hooks/useHandDetection';
import { Header, ActiveTab } from './components/Header';
import { CameraView } from './components/CameraView';
import { TargetGameView } from './components/TargetGameView';
import { MeasurementLabView } from './components/MeasurementLabView';
import { InstructionsView } from './components/InstructionsView';
import { LeaderboardView } from './components/LeaderboardView';
import { PinchTutorialModal } from './components/PinchTutorialModal';
import {
  GameTarget,
  ParticleEffect,
  HitRingEffect,
  LeaderboardEntry,
} from './types';

const INITIAL_LEADERBOARD: LeaderboardEntry[] = [
  {
    id: '1',
    player: 'Alex Chen',
    score: 2850,
    difficulty: 'Hard',
    duration: 60,
    targetsHit: 22,
    accuracy: 91.6,
    avgReactionTimeMs: 420,
    date: '2026-10-20',
  },
  {
    id: '2',
    player: 'Sarah Connor',
    score: 2150,
    difficulty: 'Medium',
    duration: 60,
    targetsHit: 18,
    accuracy: 88.0,
    avgReactionTimeMs: 495,
    date: '2026-10-19',
  },
  {
    id: '3',
    player: 'Neo Walker',
    score: 1650,
    difficulty: 'Medium',
    duration: 30,
    targetsHit: 14,
    accuracy: 93.3,
    avgReactionTimeMs: 510,
    date: '2026-10-18',
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('game');
  const [smoothingAlpha, setSmoothingAlpha] = useState<number>(0.35);
  const [cmRatio, setCmRatio] = useState<number | null>(() => {
    const saved = localStorage.getItem('hand_game_cm_ratio');
    return saved ? parseFloat(saved) : null;
  });
  const [flipHorizontal, setFlipHorizontal] = useState<boolean>(true);
  const [showSkeleton, setShowSkeleton] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Targets and visual effects
  const [targets, setTargets] = useState<GameTarget[]>([]);
  const [particles, setParticles] = useState<ParticleEffect[]>([]);
  const [hitRings, setHitRings] = useState<HitRingEffect[]>([]);
  const [isGameActive, setIsGameActive] = useState<boolean>(false);

  // Leaderboard entries
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() => {
    try {
      const saved = localStorage.getItem('hand_game_leaderboard');
      return saved ? JSON.parse(saved) : INITIAL_LEADERBOARD;
    } catch {
      return INITIAL_LEADERBOARD;
    }
  });

  // Save cmRatio to localStorage
  useEffect(() => {
    if (cmRatio) {
      localStorage.setItem('hand_game_cm_ratio', cmRatio.toString());
    } else {
      localStorage.removeItem('hand_game_cm_ratio');
    }
  }, [cmRatio]);

  // Save leaderboard to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('hand_game_leaderboard', JSON.stringify(leaderboard));
    } catch {
      // ignore
    }
  }, [leaderboard]);

  // Tutorial modal state (appears only when user visits 'game' tab for the first time)
  const [showPinchTutorial, setShowPinchTutorial] = useState<boolean>(false);

  useEffect(() => {
    if (activeTab === 'game') {
      const hasSeen = localStorage.getItem('hand_game_pinch_tutorial_seen');
      if (!hasSeen) {
        setShowPinchTutorial(true);
      }
    }
  }, [activeTab]);

  const handleCloseTutorial = () => {
    setShowPinchTutorial(false);
    localStorage.setItem('hand_game_pinch_tutorial_seen', 'true');
  };

  // Hand detection hook with MediaPipe and simulator fallback
  const {
    videoRef,
    canvasRef,
    isLoadingModel,
    cameraActive,
    cameraPermissionError,
    isDemoMode,
    handData,
    handsCount,
    fps,
    startCamera,
    toggleDemoMode,
    handleSimulatorMouseMove,
    handleSimulatorMouseDown,
    handleSimulatorMouseUp,
  } = useHandDetection({
    smoothingAlpha,
    cmRatio,
    flipHorizontal,
  });

  // Automatically request camera on mount
  useEffect(() => {
    startCamera();
  }, [startCamera]);

  const handleSaveScore = (entry: Omit<LeaderboardEntry, 'id' | 'date'>) => {
    const newEntry: LeaderboardEntry = {
      ...entry,
      id: Math.random().toString(36).substring(2, 9),
      date: new Date().toISOString().split('T')[0],
    };
    setLeaderboard((prev) =>
      [newEntry, ...prev].sort((a, b) => b.score - a.score).slice(0, 20)
    );
  };

  const handleClearLeaderboard = () => {
    setLeaderboard([]);
    localStorage.removeItem('hand_game_leaderboard');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cameraActive={cameraActive}
        isDemoMode={isDemoMode}
        handsCount={handsCount}
        fps={fps}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        toggleDemoMode={toggleDemoMode}
        startCamera={startCamera}
        onOpenTutorial={() => setShowPinchTutorial(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Loading Indicator */}
        {isLoadingModel && (
          <div className="mb-6 p-4 rounded-xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-between text-xs sm:text-sm text-purple-200 animate-pulse">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-ping" />
              <span>Initializing MediaPipe Computer Vision Model & Hand Landmark Graph...</span>
            </div>
            <span className="text-purple-400 font-mono">Loading assets</span>
          </div>
        )}

        {/* Dynamic Tab Switcher */}
        {activeTab === 'game' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Live Arena Canvas */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-4">
              <CameraView
                videoRef={videoRef}
                canvasRef={canvasRef}
                cameraActive={cameraActive}
                cameraError={cameraPermissionError}
                isDemoMode={isDemoMode}
                handData={handData}
                targets={targets}
                particles={particles}
                hitRings={hitRings}
                showSkeleton={showSkeleton}
                setShowSkeleton={setShowSkeleton}
                flipHorizontal={flipHorizontal}
                setFlipHorizontal={setFlipHorizontal}
                onSimulatorMouseMove={handleSimulatorMouseMove}
                onSimulatorMouseDown={handleSimulatorMouseDown}
                onSimulatorMouseUp={handleSimulatorMouseUp}
                startCamera={startCamera}
                gameActive={isGameActive}
              />
            </div>

            {/* Right Column: Game Controls, Stats & Results */}
            <div className="lg:col-span-5 xl:col-span-4">
              <TargetGameView
                handData={handData}
                canvasRef={canvasRef}
                targets={targets}
                setTargets={setTargets}
                setParticles={setParticles}
                setHitRings={setHitRings}
                isGameActive={isGameActive}
                setIsGameActive={setIsGameActive}
                onSaveScore={handleSaveScore}
                onOpenTutorial={() => setShowPinchTutorial(true)}
              />
            </div>
          </div>
        )}

        {activeTab === 'lab' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Camera View */}
            <div className="lg:col-span-6 xl:col-span-7 space-y-4">
              <CameraView
                videoRef={videoRef}
                canvasRef={canvasRef}
                cameraActive={cameraActive}
                cameraError={cameraPermissionError}
                isDemoMode={isDemoMode}
                handData={handData}
                targets={[]}
                particles={[]}
                hitRings={[]}
                showSkeleton={showSkeleton}
                setShowSkeleton={setShowSkeleton}
                flipHorizontal={flipHorizontal}
                setFlipHorizontal={setFlipHorizontal}
                onSimulatorMouseMove={handleSimulatorMouseMove}
                onSimulatorMouseDown={handleSimulatorMouseDown}
                onSimulatorMouseUp={handleSimulatorMouseUp}
                startCamera={startCamera}
                gameActive={false}
              />
            </div>

            {/* Calibration & Precision Controls */}
            <div className="lg:col-span-6 xl:col-span-5">
              <MeasurementLabView
                handData={handData}
                smoothingAlpha={smoothingAlpha}
                setSmoothingAlpha={setSmoothingAlpha}
                cmRatio={cmRatio}
                setCmRatio={setCmRatio}
              />
            </div>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <LeaderboardView
            entries={leaderboard}
            onClear={handleClearLeaderboard}
            onPlayAgain={() => setActiveTab('game')}
          />
        )}

        {activeTab === 'instructions' && <InstructionsView />}
      </main>

      {/* Footer */}
      <footer className="border-t border-purple-500/10 bg-slate-950/80 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div>
            Hand Distance Measurement Game • Real-Time Computer Vision & Hand Landmark Tracking
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('instructions')}
              className="hover:text-purple-400 transition"
            >
              How to Play
            </button>
          </div>
        </div>
      </footer>

      {/* First-Time Pinch Gesture Guide Overlay Modal */}
      <PinchTutorialModal
        isOpen={showPinchTutorial}
        onClose={handleCloseTutorial}
      />
    </div>
  );
}
