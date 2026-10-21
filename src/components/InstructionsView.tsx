/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Camera, Hand, Target, Zap, ShieldAlert, Cpu } from 'lucide-react';

export const InstructionsView: React.FC = () => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto py-2">
      {/* Hero Welcome */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60 border border-purple-500/30">
        <h2 className="text-2xl font-black text-white flex items-center gap-3">
          <span>📖</span> How to Play & Game Architecture
        </h2>
        <p className="text-sm text-slate-300 mt-2 leading-relaxed">
          The Hand Distance Measurement Game utilizes real-time computer vision to detect 21 coordinates on your hand. By tracking the distance between your thumb and index fingertips, it transforms touchless hand gestures into an interactive reflex arena.
        </p>
      </div>

      {/* 5-Step Guide Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-slate-900/80 border border-purple-500/20">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-lg mb-3">
            1
          </div>
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Camera className="w-4 h-4 text-purple-400" />
            Webcam Permission
          </h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Allow camera access in your browser. Position your webcam so your hand is clearly visible against a relatively clean background.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/80 border border-purple-500/20">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-lg mb-3">
            2
          </div>
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Hand className="w-4 h-4 text-cyan-400" />
            Hand Landmark Detection
          </h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Keep your hand 0.5m – 1.2m from the camera lens. The system highlights your <strong>Thumb Tip (Landmark 4)</strong> and <strong>Index Finger Tip (Landmark 8)</strong>.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/80 border border-purple-500/20">
          <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold text-lg mb-3">
            3
          </div>
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Target className="w-4 h-4 text-pink-400" />
            Hit Virtual Targets
          </h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Targets appear randomly across the screen. Move your index fingertip onto the target to score points before its countdown ring expires!
          </p>
        </div>
      </div>

      {/* Mechanics & Difficulty Rules */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-purple-500/20 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          Game Difficulty Tiers
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30">
            <div className="font-bold text-emerald-400 text-sm">🟢 Easy Mode (Green Targets)</div>
            <ul className="text-xs text-slate-400 space-y-1.5 mt-2">
              <li>• Glowing green targets (46px radius)</li>
              <li>• 4.5 seconds lifespan</li>
              <li>• Stationary position</li>
              <li>• Touch fingertip to hit</li>
            </ul>
          </div>
          <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/30">
            <div className="font-bold text-amber-400 text-sm">🟡 Medium Mode (Amber Targets)</div>
            <ul className="text-xs text-slate-400 space-y-1.5 mt-2">
              <li>• Amber gold targets (34px radius)</li>
              <li>• 3.2 seconds lifespan</li>
              <li>• Gentle floating motion</li>
              <li>• Faster reaction required</li>
            </ul>
          </div>
          <div className="p-4 rounded-xl bg-slate-950 border border-rose-500/30">
            <div className="font-bold text-rose-400 text-sm">🔴 Hard Mode (Red Targets • Pinch Required!)</div>
            <ul className="text-xs text-slate-400 space-y-1.5 mt-2">
              <li>• Crimson red targets (24px radius)</li>
              <li>• 2.0 seconds rapid lifespan</li>
              <li>• Bouncing motion</li>
              <li>• <strong>Must PINCH thumb & index together</strong> inside target</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Computer Vision Mathematics & Architecture */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-xl bg-slate-900/80 border border-purple-500/20">
          <h3 className="font-bold text-white text-sm flex items-center gap-2 mb-3">
            <Cpu className="w-4 h-4 text-purple-400" />
            Euclidean Distance Formula
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Given fingertip pixel coordinates $(x_1, y_1)$ for Thumb and $(x_2, y_2)$ for Index:
          </p>
          <div className="my-3 p-3 rounded-lg bg-slate-950 font-mono text-cyan-300 text-xs text-center border border-slate-800">
            D = √[(x₂ - x₁)² + (y₂ - y₁)²]
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            With calibration ratio R = pixels / cm, metric distance is:
          </p>
          <div className="mt-2 p-2.5 rounded-lg bg-slate-950 font-mono text-purple-300 text-xs text-center border border-slate-800">
            Distance (cm) = D_smoothed / R
          </div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/80 border border-purple-500/20">
          <h3 className="font-bold text-white text-sm flex items-center gap-2 mb-3">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            Troubleshooting & Best Practices
          </h3>
          <ul className="text-xs text-slate-400 space-y-2">
            <li>
              <strong className="text-slate-200">Bright, even lighting:</strong> Avoid strong window backlighting directly behind your head.
            </li>
            <li>
              <strong className="text-slate-200">Smoothing Factor:</strong> Adjust the slider if readings oscillate due to sensor noise.
            </li>
            <li>
              <strong className="text-slate-200">Simulator Mode:</strong> No camera? Click "Simulate Hand" in the navbar to test with your cursor!
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
