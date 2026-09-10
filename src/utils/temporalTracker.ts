// Temporal Tracking Buffer Engine
// Multi-Object Tracker (MOT) with Temporal State Buffering, Kalman-style Motion Extrapolation,
// Anti-Grouping 1-to-1 Bipartite Association, and Class-Based COCO Detection Filtering.
//
// Key Capabilities:
// 1. Guaranteed Unique Monotonic Tracking IDs (ID #101, #102, #103...)
// 2. Anti-Grouping Constraint: Strictly enforces 1-to-1 bipartite assignment. Multiple detections can NEVER share an ID.
// 3. Class-Based COCO Detection Filter: Suppresses boxes, reticles, and alerts for non-human items ('bottle', 'cup', 'backpack', 'laptop', etc.)
//    when personOnly filter is active. Only 'person' (COCO class ID: 1) triggers boxes and boundary alerts.
// 4. Temporal History Buffer: Maintains past states (up to 60 frames) per identity for trajectory reconstruction.
// 5. Coasting Extrapolation & Re-Identification: Retains person identity through temporary frame drops and occlusions.

import { SimulatedTarget } from './motionSimulation';
import { VirtualFence } from '../types';
import { CocoClassName, DetectionClassFilter, DEFAULT_DETECTION_FILTER, COCO_CLASSES } from './cocoLabels';

export interface DetectionObservation {
  x: number; // 0..100%
  y: number;
  w: number;
  h: number;
  cx: number;
  cy: number;
  mass: number;
  classification: 'person' | 'object';
  cocoClass: CocoClassName;
  cocoId: number;
  isHuman: boolean;
  confidence: number;
  hasFace: boolean;
}

export interface TrackHistoryPoint {
  timestamp: number;
  frame: number;
  x: number;
  y: number;
  w: number;
  h: number;
  cx: number;
  cy: number;
  vx: number;
  vy: number;
  confidence: number;
  classification: 'person' | 'object';
  cocoClass: CocoClassName;
  hasFace: boolean;
}

export interface TemporalTrack {
  trackId: number;
  persistentId: string;
  classification: 'person' | 'object';
  cocoClass: CocoClassName;
  cocoId: number;
  isHuman: boolean;
  label: string;
  subjectCallsign: string;
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number; // % per second
  vy: number;
  speedKmh: number;
  heading: number; // degrees
  confidence: number;
  color: string;
  isBreaching: boolean;
  firstSeen: number;
  lastSeen: number;
  totalObservations: number;
  consecutiveMisses: number;
  state: 'tentative' | 'confirmed' | 'coasting';
  // Temporal history buffer window (last 60 frames)
  history: TrackHistoryPoint[];
}

const PERSON_PALETTE = [
  '#10b981', // Tactical Emerald
  '#a855f7', // Tactical Violet
  '#f59e0b', // Tactical Amber
  '#ec4899', // Tactical Pink
  '#14b8a6', // Tactical Teal
  '#8b5cf6', // Tactical Indigo
];

const OBJECT_PALETTE = [
  '#38bdf8', // Tactical Sky Blue
  '#06b6d4', // Tactical Cyan
  '#64748b', // Slate
];

export class TemporalTrackingBuffer {
  private tracks: Map<number, TemporalTrack> = new Map();
  private nextId = 101; // Monotonically increasing ID, never reused
  private callsignCounter = 0;
  private frameCount = 0;
  private maxHistoryFrames = 60; // ~2.0s of motion history
  private maxCoastingFrames = 42; // Retain identity for up to 1.4s during occlusion/frame drop
  private lastBreachTime = 0;

  constructor() {
    this.reset();
  }

  public reset(): void {
    this.tracks.clear();
    this.nextId = 101;
    this.callsignCounter = 0;
    this.frameCount = 0;
    this.lastBreachTime = 0;
  }

  /**
   * Updates the temporal tracking buffer with new frame observations.
   * Enforces 1-to-1 matching, maintains identity continuity, and applies class-based detection filtering.
   */
  public update(
    observations: DetectionObservation[],
    deltaTime: number,
    virtualFences: VirtualFence[] = [],
    filterConfig: DetectionClassFilter = DEFAULT_DETECTION_FILTER
  ): { 
    targets: SimulatedTarget[]; 
    breachedFence: VirtualFence | null;
    filteredNonHumanCount: number;
    filteredClasses: string[];
    totalTrackedCount: number;
  } {
    this.frameCount++;
    const now = Date.now();
    const dt = Math.max(0.01, Math.min(0.1, deltaTime));

    // Step 1: Predict new positions for existing tracks via linear velocity extrapolation
    for (const track of this.tracks.values()) {
      track.x += (track.vx * dt);
      track.y += (track.vy * dt);
      // Keep within bounds (0..100)
      track.x = Math.max(0, Math.min(100 - track.w, track.x));
      track.y = Math.max(0, Math.min(100 - track.h, track.y));
    }

    // Step 2: Build Cost Matrix between all existing tracks and current observations
    const trackList = Array.from(this.tracks.values()).filter(t => t.consecutiveMisses < this.maxCoastingFrames);
    const costMatrix: { trackIdx: number; obsIdx: number; cost: number }[] = [];

    for (let t = 0; t < trackList.length; t++) {
      const trk = trackList[t];
      const trkCx = trk.x + trk.w / 2;
      const trkCy = trk.y + trk.h / 2;
      const trkAspect = trk.h / Math.max(1, trk.w);

      for (let o = 0; o < observations.length; o++) {
        const obs = observations[o];
        const obsAspect = obs.h / Math.max(1, obs.w);

        // Spatial center distance (as percentage of screen)
        const dx = obs.cx - trkCx;
        const dy = obs.cy - trkCy;
        const spatialDist = Math.hypot(dx, dy);

        // Calculate Intersection over Union (IoU)
        const iou = this.calculateIoU(
          trk.x, trk.y, trk.w, trk.h,
          obs.x, obs.y, obs.w, obs.h
        );

        // Classification compatibility penalty
        const classMismatch = trk.classification !== obs.classification ? 25 : 0;

        // Aspect ratio consistency penalty
        const aspectDiff = Math.abs(trkAspect - obsAspect);

        // Comprehensive cost: Lower is better match
        const cost = (spatialDist * 0.7) + ((1 - iou) * 18) + (aspectDiff * 3) + classMismatch;

        // Gating threshold: Distance must be within reasonable proximity (<= 28% of frame)
        if (spatialDist <= 28) {
          costMatrix.push({ trackIdx: t, obsIdx: o, cost });
        }
      }
    }

    // Step 3: Optimal 1-to-1 Bipartite Association (Strict Anti-Grouping)
    costMatrix.sort((a, b) => a.cost - b.cost);

    const matchedTracks = new Set<number>();
    const matchedObs = new Set<number>();

    for (const match of costMatrix) {
      if (!matchedTracks.has(match.trackIdx) && !matchedObs.has(match.obsIdx)) {
        matchedTracks.add(match.trackIdx);
        matchedObs.add(match.obsIdx);

        // Update matched track with new observation
        const trk = trackList[match.trackIdx];
        const obs = observations[match.obsIdx];
        this.updateMatchedTrack(trk, obs, dt, now);
      }
    }

    // Step 4: Handle Unmatched Existing Tracks (Coasting / Occlusion)
    for (let t = 0; t < trackList.length; t++) {
      if (!matchedTracks.has(t)) {
        const trk = trackList[t];
        trk.consecutiveMisses++;
        trk.state = 'coasting';
        // Dampen velocity when coasting
        trk.vx *= 0.85;
        trk.vy *= 0.85;
        trk.speedKmh *= 0.85;
      }
    }

    // Step 5: Handle Unmatched Observations -> Allocate Brand-New Guaranteed Unique IDs!
    for (let o = 0; o < observations.length; o++) {
      if (!matchedObs.has(o)) {
        const obs = observations[o];
        this.createNewTrack(obs, now);
      }
    }

    // Step 6: Prune Expired Tracks (Lost longer than temporal buffer window)
    for (const [id, track] of this.tracks.entries()) {
      if (track.consecutiveMisses >= this.maxCoastingFrames) {
        this.tracks.delete(id);
      }
    }

    // Step 7: Evaluate Virtual Fence Breaches per Unique Track
    // CLASS-BASED FILTER RULE: ONLY 'person' (COCO ID: 1) triggers alerts!
    let breachedFence: VirtualFence | null = null;

    for (const track of this.tracks.values()) {
      // Only active tracks evaluate fence breaches
      if (track.consecutiveMisses > 6) continue;

      // Filter check: If person-only filter is active, non-human items NEVER trigger fence alerts!
      if (filterConfig.personOnly && !track.isHuman) {
        track.isBreaching = false;
        continue;
      }

      const tcx = track.x + track.w / 2;
      const tcy = track.y + track.h / 2;
      let isBreaching = false;

      if (virtualFences.length > 0) {
        for (const fence of virtualFences) {
          if (!fence.active || fence.points.length < 2) continue;

          for (let i = 0; i < fence.points.length - 1; i++) {
            const p1 = fence.points[i];
            const p2 = fence.points[i + 1];
            const dist = this.pointToSegmentDistance(tcx, tcy, p1.x, p1.y, p2.x, p2.y);
            if (dist < 8) {
              breachedFence = fence;
              this.lastBreachTime = now;
              isBreaching = true;
              break;
            }
          }
          if (isBreaching) break;
        }
      }

      track.isBreaching = isBreaching || (now - this.lastBreachTime < 1800);
    }

    // Step 8: Apply Class-Based Detection Filter to Target Boxes
    // CLASS-BASED FILTER RULE: Only 'person' classes are rendered with boxes and reticles
    const outputTargets: SimulatedTarget[] = [];
    let filteredNonHumanCount = 0;
    const filteredClassesSet = new Set<string>();
    const totalTrackedCount = this.tracks.size;

    for (const track of this.tracks.values()) {
      // Suppress tracks that have been lost for too long
      if (track.consecutiveMisses > 10) continue;

      // CLASS-BASED FILTERING:
      if (filterConfig.personOnly) {
        if (!track.isHuman) {
          // Suppress box for non-human items (bottles, cups, backpacks, laptops, etc.)
          filteredNonHumanCount++;
          filteredClassesSet.add(track.cocoClass);
          continue;
        }
      } else if (filterConfig.allowedClasses.length > 0) {
        if (!filterConfig.allowedClasses.includes(track.cocoClass)) {
          filteredNonHumanCount++;
          filteredClassesSet.add(track.cocoClass);
          continue;
        }
      }

      outputTargets.push(this.toSimulatedTarget(track));
    }

    // Sort by X coordinate for consistent rendering order
    outputTargets.sort((a, b) => a.x - b.x);

    return { 
      targets: outputTargets, 
      breachedFence,
      filteredNonHumanCount,
      filteredClasses: Array.from(filteredClassesSet),
      totalTrackedCount
    };
  }

  private updateMatchedTrack(
    track: TemporalTrack,
    obs: DetectionObservation,
    dt: number,
    now: number
  ): void {
    const prevCx = track.x + track.w / 2;
    const prevCy = track.y + track.h / 2;

    // Smooth position and dimensions with exponential moving average
    const alphaPos = 0.65;
    const alphaDim = 0.75;

    track.x = track.x * (1 - alphaPos) + obs.x * alphaPos;
    track.y = track.y * (1 - alphaPos) + obs.y * alphaPos;
    track.w = track.w * (1 - alphaDim) + obs.w * alphaDim;
    track.h = track.h * (1 - alphaDim) + obs.h * alphaDim;

    const currCx = track.x + track.w / 2;
    const currCy = track.y + track.h / 2;

    // Instantaneous velocity (% per second)
    const instVx = (currCx - prevCx) / dt;
    const instVy = (currCy - prevCy) / dt;

    track.vx = track.vx * 0.6 + instVx * 0.4;
    track.vy = track.vy * 0.6 + instVy * 0.4;

    const speedPerSec = Math.hypot(track.vx, track.vy);
    track.speedKmh = Math.min(22, track.speedKmh * 0.7 + (speedPerSec * 1.6) * 0.3);

    if (speedPerSec > 0.4) {
      track.heading = Math.atan2(track.vy, track.vx) * (180 / Math.PI);
    }

    track.confidence = track.confidence * 0.7 + obs.confidence * 0.3;
    track.lastSeen = now;
    track.totalObservations++;
    track.consecutiveMisses = 0;
    track.state = 'confirmed';

    // Upgrade classification if high-confidence biometric face is confirmed
    if (obs.hasFace && !track.isHuman) {
      track.classification = 'person';
      track.cocoClass = 'person';
      track.cocoId = 1;
      track.isHuman = true;
      track.color = PERSON_PALETTE[(track.trackId) % PERSON_PALETTE.length];
      track.label = `ID: #${track.trackId} | PERSON [${track.subjectCallsign}] (COCO-1)`;
    } else if (!track.isHuman && obs.cocoClass) {
      track.cocoClass = obs.cocoClass;
      track.cocoId = obs.cocoId;
    }

    // Append to temporal history buffer
    track.history.push({
      timestamp: now,
      frame: this.frameCount,
      x: track.x,
      y: track.y,
      w: track.w,
      h: track.h,
      cx: currCx,
      cy: currCy,
      vx: track.vx,
      vy: track.vy,
      confidence: track.confidence,
      classification: track.classification,
      cocoClass: track.cocoClass,
      hasFace: obs.hasFace
    });

    if (track.history.length > this.maxHistoryFrames) {
      track.history.shift();
    }
  }

  private createNewTrack(obs: DetectionObservation, now: number): void {
    const id = this.nextId++;
    const isPerson = obs.isHuman;

    // Assign permanent callsign
    let callsign = '';
    if (isPerson) {
      const letter = String.fromCharCode(65 + (this.callsignCounter % 26));
      this.callsignCounter++;
      callsign = `SUBJ-${letter}`;
    } else {
      const cocoUpper = obs.cocoClass.toUpperCase().replace(/\s+/g, '_');
      callsign = `${cocoUpper}-${id}`;
    }

    const color = isPerson
      ? PERSON_PALETTE[(id) % PERSON_PALETTE.length]
      : OBJECT_PALETTE[(id) % OBJECT_PALETTE.length];

    const label = isPerson
      ? `ID: #${id} | PERSON [${callsign}] (COCO-1)`
      : `ID: #${id} | ${obs.cocoClass.toUpperCase()} (COCO-${obs.cocoId})`;

    const newTrack: TemporalTrack = {
      trackId: id,
      persistentId: isPerson ? `PER-${id}` : `OBJ-${id}`,
      classification: obs.classification,
      cocoClass: obs.cocoClass,
      cocoId: obs.cocoId,
      isHuman: obs.isHuman,
      label,
      subjectCallsign: callsign,
      x: obs.x,
      y: obs.y,
      w: obs.w,
      h: obs.h,
      vx: 0,
      vy: 0,
      speedKmh: isPerson ? 2.8 : 0,
      heading: 90,
      confidence: obs.confidence,
      color,
      isBreaching: false,
      firstSeen: now,
      lastSeen: now,
      totalObservations: 1,
      consecutiveMisses: 0,
      state: 'confirmed',
      history: [{
        timestamp: now,
        frame: this.frameCount,
        x: obs.x,
        y: obs.y,
        w: obs.w,
        h: obs.h,
        cx: obs.cx,
        cy: obs.cy,
        vx: 0,
        vy: 0,
        confidence: obs.confidence,
        classification: obs.classification,
        cocoClass: obs.cocoClass,
        hasFace: obs.hasFace
      }]
    };

    this.tracks.set(id, newTrack);
  }

  private toSimulatedTarget(track: TemporalTrack): SimulatedTarget {
    // Generate visual breadcrumb trail from temporal history buffer
    const trailPoints = track.history
      .filter((_, idx) => idx % 2 === 0)
      .map((h, i, arr) => ({
        x: h.cx,
        y: h.cy,
        alpha: Math.max(0.15, (i + 1) / arr.length)
      }));

    return {
      id: track.persistentId,
      trackId: track.trackId,
      type: track.classification,
      cocoClass: track.cocoClass,
      cocoId: track.cocoId,
      isHuman: track.isHuman,
      label: track.label,
      confidence: track.confidence,
      x: track.x,
      y: track.y,
      w: track.w,
      h: track.h,
      vx: track.vx,
      vy: track.vy,
      speedKmh: Math.max(0, track.speedKmh),
      heading: track.heading,
      color: track.isBreaching ? '#ef4444' : track.color,
      behavior: track.isBreaching 
        ? 'BREACHING' 
        : (track.isHuman ? 'Tracked Identity' : `Non-Human Item [${track.cocoClass}]`),
      dwellSeconds: Math.max(0.1, (track.lastSeen - track.firstSeen) / 1000),
      isBreaching: track.isBreaching,
      breachTimer: 0,
      waypoints: [],
      currentWaypointIdx: 0,
      animCycle: 0,
      trail: trailPoints
    };
  }

  private calculateIoU(
    x1: number, y1: number, w1: number, h1: number,
    x2: number, y2: number, w2: number, h2: number
  ): number {
    const left = Math.max(x1, x2);
    const top = Math.max(y1, y2);
    const right = Math.min(x1 + w1, x2 + w2);
    const bottom = Math.min(y1 + h1, y2 + h2);

    if (right < left || bottom < top) return 0;
    const intersection = (right - left) * (bottom - top);
    const union = (w1 * h1) + (w2 * h2) - intersection;
    return union <= 0 ? 0 : intersection / union;
  }

  private pointToSegmentDistance(
    px: number, py: number,
    x1: number, y1: number,
    x2: number, y2: number
  ): number {
    const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
    if (l2 === 0) return Math.hypot(px - x1, py - y1);
    let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
  }
}
