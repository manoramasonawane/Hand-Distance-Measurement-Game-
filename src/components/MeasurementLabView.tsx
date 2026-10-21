/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { HandLandmarksData } from '../types';
import { soundManager } from '../utils/audio';
import { Sliders, CheckCircle2, RotateCcw, Activity } from 'lucide-react';

interface MeasurementLabViewProps {
  handData: HandLandmarksData | null;
  smoothingAlpha: number;
  setSmoothingAlpha: (val: number) => void;
  cmRatio: number | null;
  setCmRatio: (val: number | null) => void;
}

export const MeasurementLabView: React.FC<MeasurementLabViewProps> = ({
  handData,
  smoothingAlpha,
  setSmoothingAlpha,
  cmRatio,
  setCmRatio,
}) => {
  const [knownCm, setKnownCm] = useState<number>(8.5);
  const [calibrationSuccess, setCalibrationSuccess] = useState<boolean>(false);
  const [distanceHistory, setDistanceHistory] = useState<number[]>([]);
  const [wasPinching, setWasPinching] = useState<boolean>(false);

  // Record history buffer for sparkline graph
  useEffect(() => {
    if (handData) {
      const currentVal = Math.round(handData.smoothedDistance);
      setDistanceHistory((prev) => [...prev.slice(-30), currentVal]);

      const isPinchNow = currentVal < 40;
      if (isPinchNow && !wasPinching) {
        soundManager.playPinch();
      }
      setWasPinching(isPinchNow);
    }
  }, [handData, wasPinching]);

  const handleCalibrate = () => {
    if (!handData || handData.smoothedDistance < 15) return;
    const ratio = handData.smoothedDistance / knownCm;
    setCmRatio(ratio);
    setCalibrationSuccess(true);
    setTimeout(() => setCalibrationSuccess(false), 3000);
  };

  const handleResetCalibration = () => {
    setCmRatio(null);
    setCalibrationSuccess(false);
  };

  const rawPx = handData ? Math.round(handData.pixelDistance) : 0;
  const smoothedPx = handData ? Math.round(handData.smoothedDistance) : 0;
  const cmVal = handData && cmRatio ? (smoothedPx / cmRatio).toFixed(2) : null;
  const inVal = cmVal ? (parseFloat(cmVal) / 2.54).toFixed(2) : null;

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 border border-purple-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>📏</span> Precision Distance Lab & Metric Calibration
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Measure fingertip spacing in real-time. Use an ordinary everyday object (credit card width is 8.56 cm, or spread your fingers across a ruler) to calibrate pixel distance into true metric centimetres.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {handData && handData.smoothedDistance < 40 ? (
            <span className="px-3 py-1.5 rounded-lg bg-pink-500/20 text-pink-300 border border-pink-500/40 text-xs font-bold animate-pulse">
              🤏 Pinch Active (&lt; 40px)
            </span>
          ) : (
            <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
              🖐️ Open Hand
            </span>
          )}
        </div>
      </div>

      {/* Main Measurement Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Raw Pixel Distance */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-purple-500/20">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Raw Pixel Distance ($D$)
          </div>
          <div className="mt-2 text-3xl font-extrabold text-white font-mono">
            {rawPx} <span className="text-lg font-normal text-slate-400">px</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Euclidean norm &radic;(&Delta;x&sup2; + &Delta;y&sup2;) directly from sensor coordinates.
          </p>
        </div>

        {/* Smoothed Pixel Distance */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-purple-500/20">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>EMA Smoothed Distance</span>
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="mt-2 text-3xl font-extrabold text-cyan-300 font-mono">
            {smoothedPx} <span className="text-lg font-normal text-slate-400">px</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Low-pass filtered with factor &alpha; = {smoothingAlpha.toFixed(2)} to eliminate hand tremor.
          </p>
        </div>

        {/* Real-World Calibrated Units */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-purple-500/20">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Real-World Metric
          </div>
          <div className="mt-2 text-3xl font-extrabold text-purple-300 font-mono">
            {cmVal ? (
              <>
                {cmVal} <span className="text-lg font-normal text-slate-400">cm</span>
                <span className="text-xs text-slate-400 font-normal ml-2">({inVal} in)</span>
              </>
            ) : (
              <span className="text-lg text-amber-400 font-sans font-medium">Uncalibrated</span>
            )}
          </div>
          <p className="mt-2 text-xs text-slate-400">
            {cmRatio
              ? `Calibration factor: 1 cm ≈ ${cmRatio.toFixed(1)} px`
              : 'Calibrate below using known card/ruler reference.'}
          </p>
        </div>
      </div>

      {/* Interactive Calibration Panel */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-purple-500/30">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <span>🎯</span> Physical Reference Calibration
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Hold your thumb and index fingers against an object of known width (e.g. standard payment card width = 8.56 cm).
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Known Reference Distance (cm)
            </label>
            <input
              type="number"
              min="1.0"
              max="30.0"
              step="0.1"
              value={knownCm}
              onChange={(e) => setKnownCm(parseFloat(e.target.value) || 8.5)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-purple-400"
            />
          </div>

          <div>
            <button
              onClick={handleCalibrate}
              disabled={!handData || handData.smoothedDistance < 15}
              className={`w-full py-2.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition ${
                handData && handData.smoothedDistance >= 15
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/30'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Calibrate at Current Span</span>
            </button>
          </div>

          <div>
            {cmRatio && (
              <button
                onClick={handleResetCalibration}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm flex items-center justify-center gap-2 transition border border-slate-700"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset Calibration</span>
              </button>
            )}
          </div>
        </div>

        {calibrationSuccess && (
          <div className="mt-3 p-3 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Successfully calibrated! 1 cm is now mapped to {cmRatio?.toFixed(2)} pixels.</span>
          </div>
        )}
      </div>

      {/* Smoothing Slider & Real-Time Sparkline */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Smoothing filter control */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-purple-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-purple-400" />
              Temporal Filter (&alpha;)
            </span>
            <span className="text-xs font-mono font-bold text-purple-400">
              {smoothingAlpha.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min="0.05"
            max="0.80"
            step="0.05"
            value={smoothingAlpha}
            onChange={(e) => setSmoothingAlpha(parseFloat(e.target.value))}
            className="w-full accent-purple-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>Smoother (0.05)</span>
            <span>Balanced (0.35)</span>
            <span>Faster (0.80)</span>
          </div>
          <p className="text-xs text-slate-400 mt-3 leading-relaxed">
            Exponential moving average formula: D_t = &alpha; &middot; D_sensor + (1 - &alpha;) &middot; D_(t-1).
          </p>
        </div>

        {/* Real-time distance sparkline */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-purple-500/20 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Distance History Sparkline
            </span>
            <span className="text-xs text-slate-500">Live 30 frames</span>
          </div>
          {/* SVG sparkline */}
          <div className="h-20 w-full flex items-end">
            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
              <polyline
                fill="none"
                stroke="#a855f7"
                strokeWidth="2.5"
                points={distanceHistory
                  .map((val, idx) => {
                    const maxVal = Math.max(200, ...distanceHistory);
                    const x = (idx / Math.max(1, distanceHistory.length - 1)) * 100;
                    const y = 80 - (val / maxVal) * 70;
                    return `${x}%,${y}`;
                  })
                  .join(' ')}
              />
            </svg>
          </div>
          <div className="text-[11px] text-slate-400 flex justify-between mt-2 font-mono">
            <span>0 px</span>
            <span>Current: {smoothedPx} px</span>
          </div>
        </div>
      </div>
    </div>
  );
};
