/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Crosshair,
  Ruler,
  Trophy,
  BookOpen,
  Volume2,
  VolumeX,
  Camera,
  MousePointer,
  Sparkles,
} from 'lucide-react';
import { soundManager } from '../utils/audio';

export type ActiveTab = 'game' | 'lab' | 'leaderboard' | 'instructions';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  cameraActive: boolean;
  isDemoMode: boolean;
  handsCount: number;
  fps: number;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  toggleDemoMode: () => void;
  startCamera: () => void;
  onOpenTutorial?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  cameraActive,
  isDemoMode,
  handsCount,
  fps,
  soundEnabled,
  setSoundEnabled,
  toggleDemoMode,
  startCamera,
  onOpenTutorial,
}) => {
  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundManager.setEnabled(next);
  };

  const navItems = [
    { id: 'game', label: 'Play Target Game', icon: Crosshair },
    { id: 'lab', label: 'Distance Lab & Calibration', icon: Ruler },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'instructions', label: 'How to Play', icon: BookOpen },
  ] as const;

  return (
    <header className="border-b border-purple-500/20 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Title */}
          <div className="flex items-center space-x-3">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 p-[1px] shadow-lg shadow-purple-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                <span className="text-2xl">🖐️</span>
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                  Hand Distance Measurement Game
                </h1>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-purple-500/10 text-purple-400 border border-purple-500/30">
                  CV + MediaPipe
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Measure, Move, and Play with Computer Vision
              </p>
            </div>
          </div>

          {/* Vision Engine Status & Controls */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* FPS & Hand Count Pill */}
            <div className="hidden sm:flex items-center space-x-3 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-slate-400">FPS:</span>
                <span className="font-mono font-bold text-slate-200">{fps || 30}</span>
              </div>
              <div className="h-3 w-[1px] bg-slate-800" />
              <div className="flex items-center space-x-1.5">
                <span className="text-slate-400">Hands:</span>
                <span
                  className={`font-mono font-bold ${
                    handsCount > 0 ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {handsCount > 0 ? `${handsCount} Detected` : 'Searching...'}
                </span>
              </div>
            </div>

            {/* Input Mode Switcher: Camera vs Simulator */}
            {isDemoMode ? (
              <button
                onClick={startCamera}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 text-xs font-semibold transition"
                title="Switch from Simulator to Live Webcam"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Use Webcam</span>
              </button>
            ) : (
              <button
                onClick={toggleDemoMode}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300 hover:bg-purple-500/20 text-xs font-semibold transition"
                title="No webcam? Test with mouse/cursor simulator"
              >
                <MousePointer className="w-3.5 h-3.5" />
                <span>Simulate Hand</span>
              </button>
            )}

            {/* Gesture Guide Tutorial Button */}
            {onOpenTutorial && (
              <button
                onClick={onOpenTutorial}
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-purple-500/40 text-xs font-semibold transition"
                title="View Pinch Gesture Tutorial Guide"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden md:inline">Gesture Guide</span>
              </button>
            )}

            {/* Audio Toggle */}
            <button
              onClick={toggleSound}
              className={`p-2 rounded-lg border transition ${
                soundEnabled
                  ? 'bg-purple-950/40 border-purple-500/40 text-purple-300 hover:bg-purple-900/40'
                  : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
              }`}
              title={soundEnabled ? 'Mute SFX' : 'Enable SFX'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex space-x-1 sm:space-x-2 overflow-x-auto pb-2 scrollbar-none border-t border-slate-900/60 pt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-purple-600/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
