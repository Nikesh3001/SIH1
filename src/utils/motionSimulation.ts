import { Camera, VirtualFence, Detection } from '../types';

export interface SimulatedTarget {
  id: string;
  trackId: number;
  type: 'person' | 'vehicle' | 'drone' | 'animal' | 'object';
  label: string;
  confidence: number;
  // Coordinates in percentage (0..100)
  x: number;
  y: number;
  w: number;
  h: number;
  // Velocity in % per second
  vx: number;
  vy: number;
  speedKmh: number;
  heading: number; // degrees
  behavior: string;
  color: string;
  // Past breadcrumb positions
  trail: { x: number; y: number; alpha: number }[];
  // Cycle counter for walking/driving/hovering animation
  animCycle: number;
  // Path waypoints to patrol between
  waypoints: { x: number; y: number }[];
  currentWaypointIdx: number;
  // Status
  isBreaching: boolean;
  breachTimer: number;
  dwellSeconds: number;
  // Visual features
  hasHeadlights?: boolean;
  hasFlashlight?: boolean;
  thermalIntensity?: number; // 0..1 for FLIR glow
  // COCO Classification Metadata
  cocoClass?: string;
  cocoId?: number;
  isHuman?: boolean;
}

export interface CameraSimulationState {
  cameraId: string;
  targets: SimulatedTarget[];
  lastUpdate: number;
  scanlineY: number; // 0..100%
  bitrateKbps: number;
  currentFps: number;
}

// Generate realistic tailored targets for each camera context
export function createInitialCameraTargets(camera: Camera): SimulatedTarget[] {
  const code = camera.code.toUpperCase();

  switch (code) {
    case 'CAM-01': // Gate Checkpoint
      return [
        {
          id: `${camera.id}-tgt-1`,
          trackId: 104,
          type: 'person',
          label: 'SENTRY | ID #104 | 98.2%',
          confidence: 0.982,
          x: 28,
          y: 58,
          w: 4.5,
          h: 11,
          vx: 0.8,
          vy: 0,
          speedKmh: 4.6,
          heading: 90,
          behavior: 'Perimeter Sentry Patrol',
          color: '#10b981',
          trail: [],
          animCycle: 0,
          waypoints: [
            { x: 22, y: 58 },
            { x: 38, y: 58 },
          ],
          currentWaypointIdx: 1,
          isBreaching: false,
          breachTimer: 0,
          dwellSeconds: 42,
          hasFlashlight: true,
          thermalIntensity: 0.85
        },
        {
          id: `${camera.id}-tgt-2`,
          trackId: 302,
          type: 'vehicle',
          label: 'APPROACHING VEHICLE | ID #302 | 96.4%',
          confidence: 0.964,
          x: 65,
          y: 62,
          w: 12,
          h: 14,
          vx: -1.2,
          vy: -0.2,
          speedKmh: 16.5,
          heading: 260,
          behavior: 'Inbound Approach to Gate',
          color: '#38bdf8',
          trail: [],
          animCycle: 0,
          waypoints: [
            { x: 82, y: 66 },
            { x: 52, y: 60 },
            { x: 48, y: 60 }
          ],
          currentWaypointIdx: 1,
          isBreaching: false,
          breachTimer: 0,
          dwellSeconds: 15,
          hasHeadlights: true,
          thermalIntensity: 0.95
        }
      ];

    case 'CAM-02': // Perimeter Fence
      return [
        {
          id: `${camera.id}-tgt-1`,
          trackId: 102,
          type: 'person',
          label: 'SUSPECT PROWLER | ID #102 | 97.4%',
          confidence: 0.974,
          x: 42,
          y: 52,
          w: 5.5,
          h: 13,
          vx: 0.7,
          vy: 0.4,
          speedKmh: 6.2,
          heading: 120,
          behavior: 'Fence Breach Attempt',
          color: '#ef4444',
          trail: [],
          animCycle: 0,
          waypoints: [
            { x: 32, y: 46 },
            { x: 48, y: 56 },
            { x: 62, y: 54 },
            { x: 34, y: 48 }
          ],
          currentWaypointIdx: 1,
          isBreaching: true,
          breachTimer: 100,
          dwellSeconds: 28,
          thermalIntensity: 0.98
        },
        {
          id: `${camera.id}-tgt-2`,
          trackId: 109,
          type: 'person',
          label: 'QRF PATROL SENTRY | ID #109 | 99.1%',
          confidence: 0.991,
          x: 78,
          y: 58,
          w: 5.0,
          h: 12,
          vx: -0.9,
          vy: 0,
          speedKmh: 5.1,
          heading: 270,
          behavior: 'Intercepting Breach',
          color: '#10b981',
          trail: [],
          animCycle: 0,
          waypoints: [
            { x: 88, y: 58 },
            { x: 68, y: 58 }
          ],
          currentWaypointIdx: 1,
          isBreaching: false,
          breachTimer: 0,
          dwellSeconds: 6,
          hasFlashlight: true,
          thermalIntensity: 0.8
        }
      ];

    case 'CAM-03': // Border Road
      return [
        {
          id: `${camera.id}-tgt-1`,
          trackId: 402,
          type: 'vehicle',
          label: 'PATROL STRIKER | ID #402 | 99.5%',
          confidence: 0.995,
          x: 35,
          y: 65,
          w: 16,
          h: 16,
          vx: 2.2,
          vy: 0.3,
          speedKmh: 42.8,
          heading: 85,
          behavior: 'Highway Patrol Transit',
          color: '#38bdf8',
          trail: [],
          animCycle: 0,
          waypoints: [
            { x: 10, y: 62 },
            { x: 50, y: 67 },
            { x: 92, y: 72 }
          ],
          currentWaypointIdx: 1,
          isBreaching: false,
          breachTimer: 0,
          dwellSeconds: 8,
          hasHeadlights: true,
          thermalIntensity: 0.92
        }
      ];

    case 'CAM-04': // Forward BOP Lookout / Valley
      return [
        {
          id: `${camera.id}-tgt-1`,
          trackId: 901,
          type: 'drone',
          label: 'SURVEILLANCE UAV | ID #901 | 96.9%',
          confidence: 0.969,
          x: 52,
          y: 28,
          w: 8,
          h: 7,
          vx: 0.6,
          vy: -0.1,
          speedKmh: 24.5,
          heading: 95,
          behavior: 'Aerial Grid Sweep',
          color: '#a855f7',
          trail: [],
          animCycle: 0,
          waypoints: [
            { x: 30, y: 25 },
            { x: 65, y: 32 },
            { x: 75, y: 22 },
            { x: 35, y: 24 }
          ],
          currentWaypointIdx: 1,
          isBreaching: false,
          breachTimer: 0,
          dwellSeconds: 95,
          thermalIntensity: 0.75
        }
      ];

    case 'CAM-05': // Riverine Crossing
      return [
        {
          id: `${camera.id}-tgt-1`,
          trackId: 602,
          type: 'person',
          label: 'RIVERINE INFILTRATOR | ID #602 | 94.8%',
          confidence: 0.948,
          x: 46,
          y: 60,
          w: 5,
          h: 8,
          vx: 0.4,
          vy: 0.3,
          speedKmh: 3.4,
          heading: 140,
          behavior: 'Crawling/Wading River Bank',
          color: '#ef4444',
          trail: [],
          animCycle: 0,
          waypoints: [
            { x: 38, y: 52 },
            { x: 55, y: 66 },
            { x: 68, y: 62 }
          ],
          currentWaypointIdx: 1,
          isBreaching: true,
          breachTimer: 50,
          dwellSeconds: 34,
          thermalIntensity: 0.88
        }
      ];

    case 'CAM-07': // Restricted Zone / Thermal FLIR
      return [
        {
          id: `${camera.id}-tgt-1`,
          trackId: 801,
          type: 'person',
          label: 'HEAT SIGNATURE | ID #801 | 99.2%',
          confidence: 0.992,
          x: 50,
          y: 54,
          w: 6.5,
          h: 14,
          vx: -0.6,
          vy: 0.2,
          speedKmh: 4.8,
          heading: 210,
          behavior: 'Zero-Line Restricted Zone Entry',
          color: '#f59e0b',
          trail: [],
          animCycle: 0,
          waypoints: [
            { x: 68, y: 48 },
            { x: 44, y: 56 },
            { x: 30, y: 52 },
            { x: 65, y: 49 }
          ],
          currentWaypointIdx: 1,
          isBreaching: true,
          breachTimer: 90,
          dwellSeconds: 62,
          thermalIntensity: 1.0
        }
      ];

    default:
      // Generic tactical patrol or movement for any other camera
      return [
        {
          id: `${camera.id}-tgt-gen`,
          trackId: 201,
          type: 'person',
          label: 'PATROL PERSONNEL | ID #201 | 97.1%',
          confidence: 0.971,
          x: 45,
          y: 56,
          w: 5,
          h: 12,
          vx: 0.5,
          vy: 0,
          speedKmh: 4.2,
          heading: 90,
          behavior: 'Routine Patrol Walk',
          color: '#10b981',
          trail: [],
          animCycle: 0,
          waypoints: [
            { x: 30, y: 56 },
            { x: 70, y: 56 }
          ],
          currentWaypointIdx: 1,
          isBreaching: false,
          breachTimer: 0,
          dwellSeconds: 20,
          hasFlashlight: true,
          thermalIntensity: 0.8
        }
      ];
  }
}

// Check intersection of target point with virtual fence lines
function checkFenceBreach(target: SimulatedTarget, fences?: VirtualFence[]): boolean {
  if (!fences || fences.length === 0) return false;
  const tx = target.x + target.w / 2;
  const ty = target.y + target.h; // feet level

  for (const fence of fences) {
    if (!fence.active) continue;
    
    // For tripwires or zones, check proximity to fence line segments
    for (let i = 0; i < fence.points.length - 1; i++) {
      const p1 = fence.points[i];
      const p2 = fence.points[i + 1];
      
      // Distance from point to line segment
      const l2 = (p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2;
      if (l2 === 0) continue;
      const t = Math.max(0, Math.min(1, ((tx - p1.x) * (p2.x - p1.x) + (ty - p1.y) * (p2.y - p1.y)) / l2));
      const projX = p1.x + t * (p2.x - p1.x);
      const projY = p1.y + t * (p2.y - p1.y);
      const dist = Math.sqrt((tx - projX) ** 2 + (ty - projY) ** 2);
      
      // If within 5% distance, trigger breach flag
      if (dist < 5.0) {
        return true;
      }
    }
  }
  return false;
}

// Update target coordinates, waypoints, and physics
export function updateSimulationStep(
  targets: SimulatedTarget[],
  deltaTimeSec: number,
  fences?: VirtualFence[]
): SimulatedTarget[] {
  return targets.map(target => {
    const next = { ...target };
    next.animCycle += deltaTimeSec * 5;
    next.dwellSeconds += deltaTimeSec;

    // Move toward current waypoint
    const currentWp = next.waypoints[next.currentWaypointIdx];
    if (currentWp) {
      const dx = currentWp.x - next.x;
      const dy = currentWp.y - next.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 1.5) {
        // Switch to next waypoint (looping)
        next.currentWaypointIdx = (next.currentWaypointIdx + 1) % next.waypoints.length;
      } else {
        const speed = (next.speedKmh / 3.6) * 0.45 * deltaTimeSec; // scale to canvas %
        const moveDist = Math.min(dist, speed);
        const dirX = dx / dist;
        const dirY = dy / dist;

        next.vx = dirX * (next.speedKmh / 3.6);
        next.vy = dirY * (next.speedKmh / 3.6);
        next.x += dirX * moveDist;
        next.y += dirY * moveDist;
        next.heading = (Math.atan2(dy, dx) * 180) / Math.PI;
      }
    }

    // Add to breadcrumb trail every few frames
    if (!next.trail) next.trail = [];
    if (Math.random() < 0.35) {
      next.trail.push({
        x: next.x + next.w / 2,
        y: next.y + next.h / 2,
        alpha: 1.0
      });
      // Keep maximum 20 trail points
      if (next.trail.length > 20) {
        next.trail.shift();
      }
    }

    // Decay trail alpha
    next.trail = next.trail
      .map(pt => ({ ...pt, alpha: pt.alpha - deltaTimeSec * 0.18 }))
      .filter(pt => pt.alpha > 0.05);

    // Dynamic confidence micro-fluctuation (0.94 - 0.99)
    next.confidence = Math.min(0.995, Math.max(0.92, next.confidence + (Math.random() - 0.5) * 0.004));

    // Check virtual fence breach
    const breached = checkFenceBreach(next, fences);
    if (breached) {
      next.isBreaching = true;
      next.color = '#ef4444'; // turn red on breach
    }

    return next;
  });
}
