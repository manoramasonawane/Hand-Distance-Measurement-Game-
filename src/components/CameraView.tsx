/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { HandLandmarksData, GameTarget, ParticleEffect, HitRingEffect } from '../types';
import { Camera, RefreshCw, Eye, EyeOff, MousePointer } from 'lucide-react';

interface CameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  cameraActive: boolean;
  cameraError: string | null;
  isDemoMode: boolean;
  handData: HandLandmarksData | null;
  targets: GameTarget[];
  particles: ParticleEffect[];
  hitRings: HitRingEffect[];
  showSkeleton: boolean;
  setShowSkeleton: (val: boolean) => void;
  flipHorizontal: boolean;
  setFlipHorizontal: (val: boolean) => void;
  onSimulatorMouseMove?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onSimulatorMouseDown?: () => void;
  onSimulatorMouseUp?: () => void;
  startCamera: () => void;
  gameActive: boolean;
  targetHitEffect?: boolean;
}

// Landmark connections standard to MediaPipe
const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
  [0, 5], [5, 6], [6, 7], [7, 8], // Index
  [5, 9], [9, 10], [10, 11], [11, 12], // Middle
  [9, 13], [13, 14], [14, 15], [15, 16], // Ring
  [13, 17], [17, 18], [18, 19], [19, 20], // Pinky
  [0, 17], // Palm base
];

export const CameraView: React.FC<CameraViewProps> = ({
  videoRef,
  canvasRef,
  cameraActive,
  cameraError,
  isDemoMode,
  handData,
  targets,
  particles,
  hitRings,
  showSkeleton,
  setShowSkeleton,
  flipHorizontal,
  setFlipHorizontal,
  onSimulatorMouseMove,
  onSimulatorMouseDown,
  onSimulatorMouseUp,
  startCamera,
  gameActive,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Sync canvas dimensions
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const width = Math.min(800, Math.floor(rect.width));
        const height = Math.floor(width * (3 / 4)); // 4:3 standard aspect ratio
        canvasRef.current.width = width;
        canvasRef.current.height = height;
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [canvasRef]);

  // Main canvas render frame
  useEffect(() => {
    let animId: number;

    const render = () => {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;

      // 1. Draw video background or simulated sci-fi grid
      if (cameraActive && video && video.readyState >= 2) {
        ctx.save();
        if (flipHorizontal) {
          ctx.translate(w, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, w, h);
        ctx.restore();

        // Dark gradient vignette overlay for improved contrast
        ctx.fillStyle = 'rgba(7, 10, 20, 0.25)';
        ctx.fillRect(0, 0, w, h);
      } else {
        // High-tech dark grid backdrop
        ctx.fillStyle = '#090d1a';
        ctx.fillRect(0, 0, w, h);

        ctx.strokeStyle = 'rgba(139, 92, 246, 0.08)';
        ctx.lineWidth = 1;
        const gridSize = 40;
        for (let x = 0; x <= w; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
          ctx.stroke();
        }
        for (let y = 0; y <= h; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
        }
      }

      // 2. Draw Hand Landmarks & Skeleton if detected
      if (handData && handData.landmarks && handData.landmarks.length > 0) {
        const lms = handData.landmarks;

        // Skeleton connections
        if (showSkeleton) {
          ctx.lineWidth = 3;
          ctx.lineCap = 'round';
          HAND_CONNECTIONS.forEach(([i, j]) => {
            if (lms[i] && lms[j]) {
              const x1 = lms[i].x * w;
              const y1 = lms[i].y * h;
              const x2 = lms[j].x * w;
              const y2 = lms[j].y * h;

              const grad = ctx.createLinearGradient(x1, y1, x2, y2);
              grad.addColorStop(0, 'rgba(168, 85, 247, 0.7)');
              grad.addColorStop(1, 'rgba(56, 189, 248, 0.7)');
              ctx.strokeStyle = grad;

              ctx.beginPath();
              ctx.moveTo(x1, y1);
              ctx.lineTo(x2, y2);
              ctx.stroke();
            }
          });

          // Draw joint points
          lms.forEach((p, idx) => {
            const px = p.x * w;
            const py = p.y * h;
            ctx.fillStyle = idx === 4 || idx === 8 ? '#f43f5e' : '#38bdf8';
            ctx.beginPath();
            ctx.arc(px, py, idx === 4 || idx === 8 ? 6 : 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5;
            ctx.stroke();
          });
        }

        // 3. Highlight Thumb (4) and Index (8) & Euclidean Distance Line
        const tx = handData.thumbTip.x * w;
        const ty = handData.thumbTip.y * h;
        const ix = handData.indexTip.x * w;
        const iy = handData.indexTip.y * h;

        // Connecting neon laser line
        ctx.save();
        ctx.shadowColor = '#ec4899';
        ctx.shadowBlur = 12;
        ctx.strokeStyle = '#ec4899';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(ix, iy);
        ctx.stroke();
        ctx.restore();

        // Pulsing rings on endpoints
        [
          { x: tx, y: ty, color: '#ec4899', label: 'Thumb (4)' },
          { x: ix, y: iy, color: '#38bdf8', label: 'Index (8)' },
        ].forEach((pt) => {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 11, 0, Math.PI * 2);
          ctx.strokeStyle = pt.color;
          ctx.lineWidth = 2.5;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        });

        // Midpoint measurement bubble
        const mx = (tx + ix) / 2;
        const my = (ty + iy) / 2;

        const pxVal = Math.round(handData.smoothedDistance);
        let distText = `${pxVal} px`;
        if (handData.cmDistance !== null) {
          distText += ` • ${handData.cmDistance} cm`;
        }

        ctx.font = 'bold 13px Inter, system-ui, sans-serif';
        const textMetrics = ctx.measureText(distText);
        const padX = 10;
        const padY = 6;
        const boxW = textMetrics.width + padX * 2;
        const boxH = 24;
        const boxX = mx - boxW / 2;
        const boxY = my - 28;

        // Bubble background
        ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxW, boxH, 6);
        ctx.fill();

        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#f8fafc';
        ctx.fillText(distText, boxX + padX, boxY + 16);
      }

      // 4. Render Active Targets for Game Mode
      if (gameActive && targets && targets.length > 0) {
        const now = Date.now();
        targets.forEach((target) => {
          if (target.hit) return;
          const tx = target.x * w;
          const ty = target.y * h;
          const tr = target.radius;
          const age = (now - target.spawnTime) / 1000;
          const remainingPct = Math.max(0, 1 - age / target.maxLifespan);

          // Get difficulty theme colors (Green for Easy, Amber for Medium, Red for Hard)
          const theme = target.theme || {
            name: 'Medium',
            primary: '#f59e0b',
            secondary: '#fbbf24',
            glow: '#d97706',
            fill: 'rgba(245, 158, 11, 0.28)',
            particleColors: ['#f59e0b', '#fbbf24'],
            label: 'MEDIUM',
          };

          // Outer glowing pulse using difficulty color
          ctx.save();
          ctx.shadowColor = theme.glow;
          ctx.shadowBlur = 18;

          // Target outer circle with difficulty tint
          ctx.fillStyle = theme.fill;
          ctx.beginPath();
          ctx.arc(tx, ty, tr, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = theme.primary;
          ctx.lineWidth = 3;
          ctx.stroke();
          ctx.restore();

          // Bullseye middle dark ring
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(tx, ty, tr * 0.55, 0, Math.PI * 2);
          ctx.fill();

          // Bullseye inner core with difficulty secondary color
          ctx.fillStyle = theme.secondary;
          ctx.beginPath();
          ctx.arc(tx, ty, tr * 0.28, 0, Math.PI * 2);
          ctx.fill();

          // Circular countdown arc showing time remaining before expiry
          ctx.strokeStyle = theme.primary;
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(
            tx,
            ty,
            tr + 6,
            -Math.PI / 2,
            -Math.PI / 2 + Math.PI * 2 * remainingPct,
            false
          );
          ctx.stroke();

          // Difficulty Label & Target ID badge
          const badgeText = `${theme.label} • #${target.id}`;
          ctx.font = 'bold 10px Inter, system-ui, sans-serif';
          const textMetrics = ctx.measureText(badgeText);
          const badgeW = textMetrics.width + 12;
          const badgeH = 18;
          const badgeX = tx - badgeW / 2;
          const badgeY = ty + tr + 12;

          ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
          ctx.beginPath();
          ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 4);
          ctx.fill();

          ctx.strokeStyle = theme.primary;
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.fillText(badgeText, tx, badgeY + 13);
          ctx.textAlign = 'left';
        });
      }

      // 5. Render Hit Shockwaves & Floating Points
      hitRings.forEach((ring) => {
        ctx.save();
        ctx.strokeStyle = ring.color;
        ctx.lineWidth = 2.5;
        ctx.globalAlpha = Math.max(0, ring.alpha);
        ctx.beginPath();
        ctx.arc(ring.x * w, ring.y * h, ring.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Floating points
        ctx.font = 'bold 18px Inter, sans-serif';
        ctx.fillStyle = '#facc15';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 4;
        ctx.fillText(ring.pointsText, ring.x * w - 18, ring.y * h - ring.radius - 8);
        ctx.restore();
      });

      // 6. Render Particles
      particles.forEach((p) => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [
    cameraActive,
    handData,
    targets,
    particles,
    hitRings,
    showSkeleton,
    flipHorizontal,
    gameActive,
    videoRef,
    canvasRef,
  ]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-purple-500/30 bg-slate-950 shadow-2xl">
      {/* Hidden processing video */}
      <video
        ref={videoRef}
        playsInline
        muted
        className="hidden"
      />

      {/* Interactive Arena Canvas */}
      <div
        ref={containerRef}
        onMouseMove={onSimulatorMouseMove}
        onMouseDown={onSimulatorMouseDown}
        onMouseUp={onSimulatorMouseUp}
        className={`relative w-full flex items-center justify-center aspect-[4/3] max-h-[580px] ${
          isDemoMode ? 'cursor-crosshair' : ''
        }`}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain block"
        />

        {/* Simulator mode banner */}
        {isDemoMode && (
          <div className="absolute top-4 left-4 flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs shadow-lg backdrop-blur-md">
            <MousePointer className="w-4 h-4 text-cyan-400 animate-bounce" />
            <div>
              <span className="font-bold">Simulator Active:</span> Move cursor to move hand. Click/hold to pinch!
            </div>
          </div>
        )}

        {/* Camera Permission Error Overlay */}
        {cameraError && !isDemoMode && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mb-4">
              <Camera className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Webcam Permission Needed</h3>
            <p className="text-sm text-slate-300 max-w-md mb-5 leading-relaxed">
              To track your hand in real-time, please allow camera access in your browser settings.
              You can also use the interactive hand simulator right now!
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={startCamera}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition shadow-lg shadow-purple-600/30"
              >
                Retry Camera Access
              </button>
            </div>
          </div>
        )}

        {/* Interactive Floating Canvas Toolbar */}
        <div className="absolute bottom-3 right-3 flex items-center space-x-2 z-10 bg-slate-950/70 backdrop-blur-md p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setShowSkeleton(!showSkeleton)}
            className={`p-1.5 rounded-lg text-xs flex items-center space-x-1.5 transition ${
              showSkeleton
                ? 'bg-purple-600/30 text-purple-300 border border-purple-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Skeleton Connections"
          >
            {showSkeleton ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Skeleton</span>
          </button>

          <button
            onClick={() => setFlipHorizontal(!flipHorizontal)}
            className={`p-1.5 rounded-lg text-xs flex items-center space-x-1.5 transition ${
              flipHorizontal
                ? 'bg-purple-600/30 text-purple-300 border border-purple-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Mirror Camera Feed"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mirror</span>
          </button>
        </div>
      </div>
    </div>
  );
};
