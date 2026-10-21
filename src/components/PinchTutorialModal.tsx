/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Sparkles, Hand, CheckCircle2, ArrowRight } from 'lucide-react';

interface PinchTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PinchTutorialModal: React.FC<PinchTutorialModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-purple-500/40 p-6 sm:p-7 shadow-2xl shadow-purple-950/60 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle decorative background glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          aria-label="Close tutorial"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-2.5 mb-1">
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
            Gesture Guide
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
          How to Perform the Pinch Gesture
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          Watch the animation below to see how MediaPipe measures distance between your fingertips.
        </p>

        {/* CSS Animated Pinch Demonstration Arena */}
        <div className="relative my-5 w-full h-52 rounded-xl bg-slate-950/80 border border-purple-500/30 flex flex-col items-center justify-center overflow-hidden">
          {/* Subtle grid lines */}
          <div
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(168, 85, 247, 0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(168, 85, 247, 0.4) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          {/* SVG Animated Pinch Illustration */}
          <div className="relative w-72 h-40 flex items-center justify-center">
            {/* Hand Palm Base Landmark */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
              <div className="w-3.5 h-3.5 rounded-full bg-slate-400 border border-slate-200 shadow" />
              <span className="text-[10px] font-mono text-slate-500 mt-0.5">Wrist (0)</span>
            </div>

            {/* Connecting skeleton faint bones */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {/* Palm to thumb bone */}
              <line
                x1="144"
                y1="130"
                x2="105"
                y2="95"
                stroke="rgba(148, 163, 184, 0.25)"
                strokeWidth="2"
                strokeDasharray="3 3"
              />
              {/* Palm to index bone */}
              <line
                x1="144"
                y1="130"
                x2="183"
                y2="65"
                stroke="rgba(148, 163, 184, 0.25)"
                strokeWidth="2"
                strokeDasharray="3 3"
              />
            </svg>

            {/* Contact Shockwave Burst at pinch center */}
            <div className="absolute top-[72px] left-[144px] -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <div className="w-14 h-14 rounded-full border-2 border-pink-400 animate-pinch-burst shadow-lg shadow-pink-500/50" />
            </div>

            {/* Thumb Tip (Landmark 4) with CSS Animation */}
            <div className="absolute top-[82px] left-[105px] animate-pinch-thumb -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
              <div className="relative flex items-center justify-center">
                <div className="w-7 h-7 rounded-full bg-pink-500/20 border-2 border-pink-400 flex items-center justify-center shadow-lg shadow-pink-500/40">
                  <div className="w-2.5 h-2.5 rounded-full bg-white" />
                </div>
              </div>
              <span className="text-[10px] font-bold text-pink-300 mt-1 whitespace-nowrap bg-slate-900/80 px-1 rounded border border-pink-500/30">
                Thumb (4)
              </span>
            </div>

            {/* Index Finger Tip (Landmark 8) with CSS Animation */}
            <div className="absolute top-[62px] left-[183px] animate-pinch-index -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
              <div className="relative flex items-center justify-center">
                <div className="w-7 h-7 rounded-full bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/40">
                  <div className="w-2.5 h-2.5 rounded-full bg-white" />
                </div>
              </div>
              <span className="text-[10px] font-bold text-cyan-300 mt-1 whitespace-nowrap bg-slate-900/80 px-1 rounded border border-cyan-500/30">
                Index (8)
              </span>
            </div>

            {/* Pinch Success Badge appearing on contact */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 animate-pinch-badge pointer-events-none">
              <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 border border-pink-300 text-white text-[11px] font-extrabold shadow-lg shadow-pink-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>PINCH DETECTED (&lt; 35px)</span>
              </div>
            </div>
          </div>

          {/* Real-time distance explanation pill */}
          <div className="absolute bottom-2 text-center text-[11px] text-slate-400">
            <span>Formula: </span>
            <code className="text-cyan-300 font-mono">D = √[(x₂ - x₁)² + (y₂ - y₁)²]</code>
          </div>
        </div>

        {/* 3 Step Instructions */}
        <div className="space-y-2.5 text-xs text-slate-300 mb-6">
          <div className="flex items-start space-x-2.5">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 font-bold text-[11px] shrink-0 mt-0.5">
              1
            </span>
            <p>
              <strong className="text-white">Position Your Hand:</strong> Raise your hand open facing the webcam (approx. 50cm – 1m away).
            </p>
          </div>

          <div className="flex items-start space-x-2.5">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold text-[11px] shrink-0 mt-0.5">
              2
            </span>
            <p>
              <strong className="text-white">Bring Tips Together:</strong> Touch the tip of your thumb and index finger together to pinch.
            </p>
          </div>

          <div className="flex items-start space-x-2.5">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-pink-500/20 text-pink-300 font-bold text-[11px] shrink-0 mt-0.5">
              3
            </span>
            <p>
              <strong className="text-white">Pop Hard Targets:</strong> In <span className="text-rose-400 font-bold">Hard Mode</span>, hover over targets and pinch to capture them!
            </p>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 hover:opacity-95 text-white font-bold text-sm shadow-lg shadow-purple-600/30 transition flex items-center justify-center space-x-2"
        >
          <span>Got It! Let's Play</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
