/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { HandLandmarksData, LandmarkPoint } from '../types';

interface UseHandDetectionProps {
  smoothingAlpha: number;
  cmRatio: number | null;
  flipHorizontal?: boolean;
}

export function useHandDetection({
  smoothingAlpha,
  cmRatio,
  flipHorizontal = true,
}: UseHandDetectionProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [isLoadingModel, setIsLoadingModel] = useState<boolean>(true);
  const [modelError, setModelError] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraPermissionError, setCameraPermissionError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);

  const [handData, setHandData] = useState<HandLandmarksData | null>(null);
  const [handsCount, setHandsCount] = useState<number>(0);
  const [fps, setFps] = useState<number>(0);

  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const requestAnimationRef = useRef<number | null>(null);
  const smoothedDistRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const lastFpsUpdateRef = useRef<number>(performance.now());

  // Demo / Simulated hand state for fallback testing without a camera
  const demoPosRef = useRef<{ x: number; y: number; isPinching: boolean }>({
    x: 0.5,
    y: 0.5,
    isPinching: false,
  });

  // Initialize MediaPipe HandLandmarker
  useEffect(() => {
    let isCancelled = false;

    async function initMediaPipe() {
      try {
        setIsLoadingModel(true);
        setModelError(null);

        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );

        if (isCancelled) return;

        const handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numHands: 1,
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        if (isCancelled) {
          handLandmarker.close();
          return;
        }

        landmarkerRef.current = handLandmarker;
        setIsLoadingModel(false);
      } catch (err: unknown) {
        console.warn('MediaPipe initialization fallback to simulator:', err);
        if (!isCancelled) {
          setModelError('MediaPipe Vision assets loading failed. Enabling interactive simulator mode.');
          setIsLoadingModel(false);
          setIsDemoMode(true);
        }
      }
    }

    initMediaPipe();

    return () => {
      isCancelled = true;
      if (landmarkerRef.current) {
        try {
          landmarkerRef.current.close();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  // Start webcam
  const startCamera = useCallback(async () => {
    setCameraPermissionError(null);
    try {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
        setIsDemoMode(false);
      }
    } catch (err: unknown) {
      console.warn('Camera access denied or unavailable:', err);
      const msg = err instanceof Error ? err.message : 'Webcam permission denied or unavailable';
      setCameraPermissionError(msg);
      setCameraActive(false);
      // Auto-enable demo mode if user cannot use camera
      setIsDemoMode(true);
    }
  }, []);

  // Stop webcam
  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  // Toggle Demo / Simulator mode
  const toggleDemoMode = useCallback(() => {
    setIsDemoMode((prev) => {
      const next = !prev;
      if (next) {
        stopCamera();
      } else {
        startCamera();
      }
      return next;
    });
  }, [startCamera, stopCamera]);

  // Main tracking animation loop
  useEffect(() => {
    let active = true;

    const processFrame = () => {
      if (!active) return;

      const now = performance.now();
      frameCountRef.current++;
      if (now - lastFpsUpdateRef.current >= 1000) {
        setFps(Math.round((frameCountRef.current * 1000) / (now - lastFpsUpdateRef.current)));
        frameCountRef.current = 0;
        lastFpsUpdateRef.current = now;
      }

      const canvas = canvasRef.current;
      const video = videoRef.current;
      const width = canvas ? canvas.width : 640;
      const height = canvas ? canvas.height : 480;

      if (isDemoMode) {
        // Generate simulated hand based on mouse position
        const { x: mx, y: my, isPinching } = demoPosRef.current;
        const pinchSpan = isPinching ? 0.03 : 0.12;

        const thumbTip: LandmarkPoint = {
          x: Math.max(0.05, Math.min(0.95, mx - pinchSpan * 0.7)),
          y: Math.max(0.05, Math.min(0.95, my + pinchSpan * 0.3)),
        };
        const indexTip: LandmarkPoint = {
          x: Math.max(0.05, Math.min(0.95, mx + pinchSpan * 0.3)),
          y: Math.max(0.05, Math.min(0.95, my - pinchSpan * 0.7)),
        };
        const wrist: LandmarkPoint = {
          x: Math.max(0.05, Math.min(0.95, mx - 0.05)),
          y: Math.min(0.98, my + 0.28),
        };
        const middleTip: LandmarkPoint = {
          x: Math.max(0.05, Math.min(0.95, indexTip.x + 0.04)),
          y: Math.max(0.05, Math.min(0.95, indexTip.y - 0.02)),
        };

        const rawPx = Math.hypot(
          (indexTip.x - thumbTip.x) * width,
          (indexTip.y - thumbTip.y) * height
        );

        if (smoothedDistRef.current === null) {
          smoothedDistRef.current = rawPx;
        } else {
          smoothedDistRef.current =
            smoothingAlpha * rawPx + (1 - smoothingAlpha) * smoothedDistRef.current;
        }

        const mid = {
          x: ((thumbTip.x + indexTip.x) / 2) * width,
          y: ((thumbTip.y + indexTip.y) / 2) * height,
        };

        const cm = cmRatio ? Number((smoothedDistRef.current / cmRatio).toFixed(1)) : null;

        // Dummy landmarks array
        const dummyLms: LandmarkPoint[] = [
          wrist,
          { x: wrist.x - 0.03, y: wrist.y - 0.08 },
          { x: wrist.x - 0.06, y: wrist.y - 0.15 },
          { x: thumbTip.x - 0.02, y: thumbTip.y + 0.02 },
          thumbTip,
          { x: wrist.x + 0.01, y: wrist.y - 0.18 },
          { x: indexTip.x - 0.02, y: indexTip.y + 0.1 },
          { x: indexTip.x - 0.01, y: indexTip.y + 0.05 },
          indexTip,
          { x: wrist.x + 0.04, y: wrist.y - 0.18 },
          { x: middleTip.x - 0.01, y: middleTip.y + 0.1 },
          { x: middleTip.x, y: middleTip.y + 0.05 },
          middleTip,
        ];

        setHandsCount(1);
        setHandData({
          landmarks: dummyLms,
          thumbTip,
          indexTip,
          wrist,
          middleTip,
          pixelDistance: rawPx,
          smoothedDistance: smoothedDistRef.current,
          cmDistance: cm,
          midpoint: mid,
        });

        requestAnimationRef.current = requestAnimationFrame(processFrame);
        return;
      }

      // Real camera frame detection via MediaPipe
      if (
        video &&
        video.readyState >= 2 &&
        landmarkerRef.current &&
        !video.paused &&
        !video.ended
      ) {
        try {
          const timestamp = performance.now();
          if (timestamp > lastTimeRef.current) {
            lastTimeRef.current = timestamp;
            const detections = landmarkerRef.current.detectForVideo(video, timestamp);

            if (detections && detections.landmarks && detections.landmarks.length > 0) {
              const rawLms = detections.landmarks[0];
              setHandsCount(detections.landmarks.length);

              // Normalize coordinates with mirror flip if enabled
              const normalizedLms: LandmarkPoint[] = rawLms.map((lm) => ({
                x: flipHorizontal ? 1.0 - lm.x : lm.x,
                y: lm.y,
                z: lm.z,
              }));

              const thumbTip = normalizedLms[4] || { x: 0, y: 0 };
              const indexTip = normalizedLms[8] || { x: 0, y: 0 };
              const wrist = normalizedLms[0] || { x: 0, y: 0 };
              const middleTip = normalizedLms[12] || { x: 0, y: 0 };

              const dx = (indexTip.x - thumbTip.x) * width;
              const dy = (indexTip.y - thumbTip.y) * height;
              const rawPxDist = Math.hypot(dx, dy);

              if (smoothedDistRef.current === null) {
                smoothedDistRef.current = rawPxDist;
              } else {
                smoothedDistRef.current =
                  smoothingAlpha * rawPxDist + (1 - smoothingAlpha) * smoothedDistRef.current;
              }

              const mid = {
                x: ((thumbTip.x + indexTip.x) / 2) * width,
                y: ((thumbTip.y + indexTip.y) / 2) * height,
              };

              const cm = cmRatio ? Number((smoothedDistRef.current / cmRatio).toFixed(1)) : null;

              setHandData({
                landmarks: normalizedLms,
                thumbTip,
                indexTip,
                wrist,
                middleTip,
                pixelDistance: rawPxDist,
                smoothedDistance: smoothedDistRef.current,
                cmDistance: cm,
                midpoint: mid,
              });
            } else {
              setHandsCount(0);
              setHandData(null);
            }
          }
        } catch (e) {
          console.error('HandLandmarker execution error:', e);
        }
      }

      requestAnimationRef.current = requestAnimationFrame(processFrame);
    };

    requestAnimationRef.current = requestAnimationFrame(processFrame);

    return () => {
      active = false;
      if (requestAnimationRef.current) {
        cancelAnimationFrame(requestAnimationRef.current);
      }
    };
  }, [isDemoMode, smoothingAlpha, cmRatio, flipHorizontal]);

  // Handle simulated mouse controls
  const handleSimulatorMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDemoMode) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0.05, Math.min(0.95, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0.05, Math.min(0.95, (e.clientY - rect.top) / rect.height));
    demoPosRef.current.x = x;
    demoPosRef.current.y = y;
  };

  const handleSimulatorMouseDown = () => {
    if (!isDemoMode) return;
    demoPosRef.current.isPinching = true;
  };

  const handleSimulatorMouseUp = () => {
    if (!isDemoMode) return;
    demoPosRef.current.isPinching = false;
  };

  return {
    videoRef,
    canvasRef,
    isLoadingModel,
    modelError,
    cameraActive,
    cameraPermissionError,
    isDemoMode,
    handData,
    handsCount,
    fps,
    startCamera,
    stopCamera,
    toggleDemoMode,
    handleSimulatorMouseMove,
    handleSimulatorMouseDown,
    handleSimulatorMouseUp,
  };
}
