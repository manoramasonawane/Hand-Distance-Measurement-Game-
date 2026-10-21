/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface LandmarkPoint {
  x: number; // Normalized 0..1
  y: number; // Normalized 0..1
  z?: number;
}

export interface HandLandmarksData {
  landmarks: LandmarkPoint[];
  thumbTip: LandmarkPoint;
  indexTip: LandmarkPoint;
  wrist: LandmarkPoint;
  middleTip: LandmarkPoint;
  pixelDistance: number;
  smoothedDistance: number;
  cmDistance: number | null;
  midpoint: { x: number; y: number };
}

export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';

export interface DifficultyTheme {
  name: DifficultyLevel;
  primary: string; // Main target color (Green for easy, Amber for medium, Red for hard)
  secondary: string;
  glow: string;
  fill: string;
  particleColors: string[];
  label: string;
}

export interface DifficultyConfig {
  radius: number; // pixels
  lifespan: number; // seconds
  speed: number;
  points: number;
  pinchRequired: boolean;
  pinchThreshold: number; // pixels
  theme: DifficultyTheme;
}

export interface GameTarget {
  id: number;
  x: number; // relative 0..1 or absolute px
  y: number;
  radius: number;
  spawnTime: number;
  maxLifespan: number;
  vx: number;
  vy: number;
  hit: boolean;
  difficulty?: DifficultyLevel;
  theme?: DifficultyTheme;
}

export interface ParticleEffect {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  maxLife: number;
  life: number;
}

export interface HitRingEffect {
  id: number;
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  pointsText: string;
  color: string;
}

export interface GameStats {
  score: number;
  targetsHit: number;
  targetsSpawned: number;
  accuracy: number;
  currentCombo: number;
  highestCombo: number;
  avgReactionTimeMs: number;
  totalReactionTimeMs: number;
}

export interface LeaderboardEntry {
  id: string;
  player: string;
  score: number;
  difficulty: DifficultyLevel;
  duration: number;
  targetsHit: number;
  accuracy: number;
  avgReactionTimeMs: number;
  date: string;
}
