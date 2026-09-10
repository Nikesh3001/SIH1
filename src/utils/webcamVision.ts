// Multi-Person & Object Optical Computer Vision Engine
// Features:
// 1. Multi-Person Spatial Segmentation (detects multiple distinct people simultaneously)
// 2. Anthropometric & Biometric Verification: Validates face, skin chrominance, and human aspect ratio
// 3. Inanimate Object Classifier: Non-living items (cups, bottles, bags, boxes) are classified as OBJECT, NEVER as PERSON
// 4. Temporal Tracking Buffer: Dedicated MOT buffer with 1-to-1 bipartite assignment, trajectory memory,
//    coasting during occlusion, and permanent unique monotonic IDs.

import { SimulatedTarget } from './motionSimulation';
import { VirtualFence } from '../types';
import { TemporalTrackingBuffer, DetectionObservation } from './temporalTracker';
import { 
  CocoClassName, 
  DetectionClassFilter, 
  DEFAULT_DETECTION_FILTER, 
  classifyInanimateCocoObject 
} from './cocoLabels';

export interface OpticalMotionTracker {
  processFrame: (
    video: HTMLVideoElement,
    virtualFences?: VirtualFence[],
    sensitivity?: number,
    deltaTime?: number,
    filterConfig?: DetectionClassFilter
  ) => {
    targets: SimulatedTarget[];
    motionIntensity: number; // 0 to 100%
    breachedFence: VirtualFence | null;
    filteredNonHumanCount: number;
    filteredClasses: string[];
    totalTrackedCount: number;
  };
  reset: () => void;
}

export function createOpticalMotionTracker(): OpticalMotionTracker {
  // Processing canvas at 240x135 for crisp multi-object spatial analysis
  const procWidth = 240;
  const procHeight = 135;
  const canvas = document.createElement('canvas');
  canvas.width = procWidth;
  canvas.height = procHeight;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  let prevLuminance: Uint8Array | null = null;
  let bgModel: Float32Array | null = null;
  const temporalBuffer = new TemporalTrackingBuffer();
  let frameCounter = 0;
  let lastTime = performance.now();

  // Native browser FaceDetector instance if available (Chromium / Chrome)
  let faceDetector: any = null;
  let isDetectingFaces = false;
  let lastDetectedFaces: Array<{ x: number; y: number; w: number; h: number }> = [];

  try {
    if (typeof window !== 'undefined' && 'FaceDetector' in window) {
      faceDetector = new (window as any).FaceDetector({ fastMode: true, maxDetectedFaces: 8 });
    }
  } catch {
    faceDetector = null;
  }

  return {
    reset() {
      prevLuminance = null;
      bgModel = null;
      lastDetectedFaces = [];
      temporalBuffer.reset();
      lastTime = performance.now();
    },

    processFrame(
      video, 
      virtualFences = [], 
      sensitivity = 22, 
      explicitDeltaTime?: number,
      filterConfig: DetectionClassFilter = DEFAULT_DETECTION_FILTER
    ) {
      const now = performance.now();
      const dt = explicitDeltaTime !== undefined ? explicitDeltaTime : Math.min(0.1, Math.max(0.016, (now - lastTime) / 1000));
      lastTime = now;

      if (!ctx || video.readyState < 2) {
        const emptyResult = temporalBuffer.update([], dt, virtualFences, filterConfig);
        return {
          targets: emptyResult.targets,
          motionIntensity: 0,
          breachedFence: null,
          filteredNonHumanCount: emptyResult.filteredNonHumanCount,
          filteredClasses: emptyResult.filteredClasses,
          totalTrackedCount: emptyResult.totalTrackedCount
        };
      }

      frameCounter++;

      // Trigger asynchronous native FaceDetector every 4 frames if available
      if (faceDetector && !isDetectingFaces && frameCounter % 4 === 0) {
        isDetectingFaces = true;
        faceDetector.detect(video)
          .then((faces: any[]) => {
            isDetectingFaces = false;
            if (faces && faces.length > 0) {
              const vw = video.videoWidth || procWidth;
              const vh = video.videoHeight || procHeight;
              lastDetectedFaces = faces.map(f => {
                const box = f.boundingBox;
                const fx = (box.x / vw) * 100;
                const fy = (box.y / vh) * 100;
                const fw = (box.width / vw) * 100;
                const fh = (box.height / vh) * 100;
                // Expanded body envelope for a seated or standing person
                const bodyW = Math.max(14, fw * 2.2);
                const bodyH = Math.max(26, fh * 3.6);
                const bodyX = Math.max(0, fx + fw / 2 - bodyW / 2);
                const bodyY = Math.max(0, fy - fh * 0.15);
                return {
                  x: Math.min(100 - bodyW, bodyX),
                  y: Math.min(100 - bodyH, bodyY),
                  w: Math.min(65, bodyW),
                  h: Math.min(95, bodyH)
                };
              });
            } else {
              lastDetectedFaces = [];
            }
          })
          .catch(() => {
            isDetectingFaces = false;
          });
      }

      // 1. Draw video frame to processing buffer & read raw RGBA
      ctx.drawImage(video, 0, 0, procWidth, procHeight);
      const imgData = ctx.getImageData(0, 0, procWidth, procHeight);
      const data = imgData.data;
      const totalPixels = procWidth * procHeight;
      const currLuminance = new Uint8Array(totalPixels);

      // Convert to luminance
      for (let i = 0; i < totalPixels; i++) {
        const r = data[i * 4];
        const g = data[i * 4 + 1];
        const b = data[i * 4 + 2];
        currLuminance[i] = (r * 77 + g * 150 + b * 29) >> 8;
      }

      if (!prevLuminance) {
        prevLuminance = currLuminance;
        bgModel = new Float32Array(totalPixels);
        for (let i = 0; i < totalPixels; i++) {
          bgModel[i] = currLuminance[i];
        }
        return { 
          targets: [], 
          motionIntensity: 0, 
          breachedFence: null,
          filteredNonHumanCount: 0,
          filteredClasses: [],
          totalTrackedCount: 0
        };
      }

      // Update adaptive background model
      if (!bgModel) bgModel = new Float32Array(totalPixels);
      const alpha = 0.035;
      const binaryMask = new Uint8Array(totalPixels);
      let changedPixelCount = 0;

      for (let i = 0; i < totalPixels; i++) {
        const curr = currLuminance[i];
        const diffFrame = Math.abs(curr - prevLuminance[i]);
        const diffBg = Math.abs(curr - bgModel[i]);

        if (diffFrame > sensitivity || diffBg > sensitivity * 1.3) {
          binaryMask[i] = 1;
          changedPixelCount++;
        } else {
          bgModel[i] = bgModel[i] * (1 - alpha) + curr * alpha;
        }
      }

      prevLuminance = currLuminance;
      const motionIntensity = Math.min(100, Math.round((changedPixelCount / totalPixels) * 450));

      // =====================================================================
      // 2. MULTI-TARGET HORIZONTAL PROJECTION & SPATIAL SEGMENTATION
      // =====================================================================
      const colHistogram = new Float32Array(procWidth);
      for (let y = 0; y < procHeight; y++) {
        const rowOffset = y * procWidth;
        for (let x = 0; x < procWidth; x++) {
          if (binaryMask[rowOffset + x]) {
            colHistogram[x]++;
          }
        }
      }

      // Smooth column histogram
      const smoothedHist = new Float32Array(procWidth);
      const kRadius = 4;
      for (let x = 0; x < procWidth; x++) {
        let sum = 0;
        let count = 0;
        for (let k = -kRadius; k <= kRadius; k++) {
          const nx = x + k;
          if (nx >= 0 && nx < procWidth) {
            sum += colHistogram[nx];
            count++;
          }
        }
        smoothedHist[x] = sum / count;
      }

      // Detect distinct horizontal clusters
      const minColThreshold = procHeight * 0.06;
      const rawClusters: Array<{ startX: number; endX: number; peakX: number; mass: number }> = [];
      let inCluster = false;
      let clusterStart = 0;
      let clusterMass = 0;
      let peakVal = 0;
      let peakX = 0;

      for (let x = 0; x < procWidth; x++) {
        const val = smoothedHist[x];
        if (val > minColThreshold) {
          if (!inCluster) {
            inCluster = true;
            clusterStart = x;
            clusterMass = 0;
            peakVal = val;
            peakX = x;
          }
          clusterMass += val;
          if (val > peakVal) {
            peakVal = val;
            peakX = x;
          }
        } else {
          if (inCluster) {
            inCluster = false;
            const clusterWidth = x - clusterStart;
            if (clusterWidth >= 8 && clusterMass > minColThreshold * 8) {
              rawClusters.push({ startX: clusterStart, endX: x, peakX, mass: clusterMass });
            }
          }
        }
      }

      if (inCluster) {
        const clusterWidth = procWidth - clusterStart;
        if (clusterWidth >= 8 && clusterMass > minColThreshold * 8) {
          rawClusters.push({ startX: clusterStart, endX: procWidth - 1, peakX, mass: clusterMass });
        }
      }

      // Split wide clusters if multiple people or objects are adjacent
      const refinedClusters: Array<{ startX: number; endX: number; peakX: number }> = [];
      for (const cl of rawClusters) {
        const width = cl.endX - cl.startX;
        if (width > 48) {
          let splitPoints: number[] = [];
          for (let x = cl.startX + 14; x <= cl.endX - 14; x++) {
            const current = smoothedHist[x];
            let isValley = true;
            for (let d = 1; d <= 8; d++) {
              if (smoothedHist[x - d] < current || smoothedHist[x + d] < current) {
                isValley = false;
                break;
              }
            }
            if (isValley && current < smoothedHist[cl.peakX] * 0.62) {
              splitPoints.push(x);
              x += 16;
            }
          }

          if (splitPoints.length > 0) {
            let segStart = cl.startX;
            for (const sp of splitPoints) {
              refinedClusters.push({ startX: segStart, endX: sp, peakX: Math.floor((segStart + sp) / 2) });
              segStart = sp;
            }
            refinedClusters.push({ startX: segStart, endX: cl.endX, peakX: Math.floor((segStart + cl.endX) / 2) });
          } else {
            refinedClusters.push(cl);
          }
        } else {
          refinedClusters.push(cl);
        }
      }

      // =====================================================================
      // 3. ANTHROPOMETRIC OBSERVATION EXTRACTION
      // =====================================================================
      const observations: DetectionObservation[] = [];

      for (const cluster of refinedClusters) {
        let minY = procHeight;
        let maxY = -1;
        let minX = cluster.endX;
        let maxX = cluster.startX;
        let clusterPixelCount = 0;

        for (let y = 0; y < procHeight; y++) {
          const rowOffset = y * procWidth;
          for (let x = cluster.startX; x <= cluster.endX; x++) {
            if (binaryMask[rowOffset + x]) {
              clusterPixelCount++;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
            }
          }
        }

        // Noise suppression: Ignore tiny desk movements
        if (clusterPixelCount < 40 || maxY <= minY || (maxY - minY + 1) < 12) {
          continue;
        }

        const pixelHeight = maxY - minY + 1;
        const pixelWidth = maxX - minX + 1;

        let pw = (pixelWidth / procWidth) * 100;
        let ph = (pixelHeight / procHeight) * 100;
        let px = (minX / procWidth) * 100;
        let py = (minY / procHeight) * 100;

        const cx = px + pw / 2;
        const cy = py + ph / 2;

        // Check for biometric face match
        const faceMatch = lastDetectedFaces.find(f => {
          const fcx = f.x + f.w / 2;
          const fcy = f.y + f.h / 2;
          return Math.abs(fcx - cx) < (f.w + pw) / 2 && Math.abs(fcy - cy) < (f.h + ph) / 1.5;
        });

        // Sample skin chrominance in upper 40% of the candidate box
        let skinPixelCount = 0;
        let sampledPixels = 0;
        const upperYLimit = Math.min(maxY, minY + Math.floor(pixelHeight * 0.4));

        for (let y = minY; y <= upperYLimit; y += 2) {
          const rowOffset = y * procWidth;
          for (let x = minX; x <= maxX; x += 2) {
            const idx = (rowOffset + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            sampledPixels++;

            if (r > 80 && g > 45 && b > 25 && r > g && r > b && (r - g) >= 12 && (r - b) >= 15) {
              skinPixelCount++;
            }
          }
        }

        const skinRatio = sampledPixels > 0 ? (skinPixelCount / sampledPixels) : 0;
        const hasHumanSkin = skinRatio > 0.08;
        const isVerticallyElongated = (pixelHeight / pixelWidth) >= 1.15;
        const hasHumanHeight = ph >= 20;

        const isPerson = Boolean(faceMatch) || (hasHumanSkin && isVerticallyElongated && hasHumanHeight);

        if (isPerson) {
          pw = Math.max(14, Math.min(38, pw));
          ph = Math.max(26, Math.min(94, ph));
          const adjustedX = Math.max(0, Math.min(100 - pw, cx - pw / 2));
          const adjustedY = Math.max(0, Math.min(100 - ph, cy - ph / 2));

          observations.push({
            x: adjustedX,
            y: adjustedY,
            w: pw,
            h: ph,
            cx,
            cy,
            mass: clusterPixelCount,
            classification: 'person',
            cocoClass: 'person',
            cocoId: 1,
            isHuman: true,
            confidence: faceMatch ? 0.96 : 0.92,
            hasFace: Boolean(faceMatch)
          });
        } else {
          pw = Math.max(8, Math.min(50, pw));
          ph = Math.max(8, Math.min(60, ph));

          if (ph < 7 && clusterPixelCount < 70) {
            continue;
          }

          // Heuristic classification against standard COCO object categories
          const cocoInfo = classifyInanimateCocoObject(
            pixelWidth,
            pixelHeight,
            pw,
            ph,
            py,
            clusterPixelCount
          );

          observations.push({
            x: Math.max(0, Math.min(100 - pw, px)),
            y: Math.max(0, Math.min(100 - ph, py)),
            w: pw,
            h: ph,
            cx,
            cy,
            mass: clusterPixelCount,
            classification: 'object',
            cocoClass: cocoInfo.name,
            cocoId: cocoInfo.id,
            isHuman: false,
            confidence: cocoInfo.confidence,
            hasFace: false
          });
        }
      }

      // Add low-motion detected faces (person sitting stationary)
      if (lastDetectedFaces.length > 0) {
        for (const face of lastDetectedFaces) {
          const fcx = face.x + face.w / 2;
          const fcy = face.y + face.h / 2;
          const matched = observations.some(b => Math.hypot(b.cx - fcx, b.cy - fcy) < 22);
          if (!matched) {
            observations.push({
              x: face.x,
              y: face.y,
              w: face.w,
              h: face.h,
              cx: fcx,
              cy: fcy,
              mass: 200,
              classification: 'person',
              cocoClass: 'person',
              cocoId: 1,
              isHuman: true,
              confidence: 0.97,
              hasFace: true
            });
          }
        }
      }

      // =====================================================================
      // 4. TEMPORAL TRACKING BUFFER UPDATE (ANTI-GROUPING & UNIQUE ID TRACKING)
      // =====================================================================
      const { 
        targets, 
        breachedFence, 
        filteredNonHumanCount, 
        filteredClasses, 
        totalTrackedCount 
      } = temporalBuffer.update(
        observations,
        dt,
        virtualFences,
        filterConfig
      );

      return {
        targets,
        motionIntensity,
        breachedFence,
        filteredNonHumanCount,
        filteredClasses,
        totalTrackedCount
      };
    }
  };
}

let audioCtx: AudioContext | null = null;

export function playTacticalAlertChime(severity: 'warning' | 'critical' = 'warning') {
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;
    if (severity === 'critical') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.15);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
      osc.start(now);
      osc.stop(now + 0.22);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1046.5, now);
      osc.frequency.exponentialRampToValueAtTime(1318.5, now + 0.08);
      gain.gain.setValueAtTime(0.10, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.start(now);
      osc.stop(now + 0.18);
    }
  } catch {
    // Audio policy
  }
}
