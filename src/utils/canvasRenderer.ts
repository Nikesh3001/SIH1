import { Camera, VirtualFence } from '../types';
import { SimulatedTarget } from './motionSimulation';

export interface RenderOptions {
  ctx: CanvasRenderingContext2D;
  osdCtx: CanvasRenderingContext2D;
  width: number;
  height: number;
  camera: Camera;
  targets: SimulatedTarget[];
  step: number;
  scanlineY: number;
  isRecording: boolean;
  filterMode: string;
  pan: { x: number; y: number };
  zoom: number;
  showAnalytics?: boolean;
}

/**
 * Authentic Military Command & Control (C2) HUD & Tactical Overlay Renderer
 * 
 * Replaces cartoonish animations with clean, razor-sharp military sensor graphics:
 * - Crisp vector virtual tripwires and perimeter boundaries
 * - Genuine military corner-bracket target designators (┌ ┐ └ ┘)
 * - Standard CCTV / FLIR On-Screen Display (OSD) with real-time military timestamp, callsign, and grid coordinates
 */
export function renderTacticalSimulation(options: RenderOptions) {
  const { 
    ctx, 
    osdCtx, 
    width: w, 
    height: h, 
    camera, 
    targets, 
    step, 
    isRecording, 
    filterMode, 
    pan, 
    zoom,
    showAnalytics = true 
  } = options;

  // Clear HUD and OSD canvases
  ctx.clearRect(0, 0, w, h);
  osdCtx.clearRect(0, 0, w, h);

  const hasBreach = targets.some(t => t.isBreaching);

  // =========================================================================
  // 1. TACTICAL VIRTUAL TRIPWIRES & BOUNDARIES
  // =========================================================================
  if (camera.virtualFences && camera.virtualFences.length > 0) {
    camera.virtualFences.forEach((fence) => {
      if (!fence.active || fence.points.length < 2) return;

      ctx.save();
      ctx.beginPath();
      fence.points.forEach((pt, idx) => {
        const px = (pt.x / 100) * w;
        const py = (pt.y / 100) * h;
        if (idx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });

      const fenceBreached = hasBreach;

      if (fence.type === 'restricted_zone') {
        ctx.closePath();
        ctx.fillStyle = fenceBreached 
          ? (step % 30 < 15 ? 'rgba(239, 68, 68, 0.20)' : 'rgba(239, 68, 68, 0.08)')
          : 'rgba(245, 158, 11, 0.06)';
        ctx.fill();
      }

      // Clean military dashed boundary line
      ctx.strokeStyle = fenceBreached ? '#ef4444' : '#f59e0b';
      ctx.lineWidth = fenceBreached ? 2 : 1.5;
      ctx.setLineDash([6, 4]);
      ctx.stroke();

      // Tripwire boundary endpoints
      fence.points.forEach((pt) => {
        const px = (pt.x / 100) * w;
        const py = (pt.y / 100) * h;
        ctx.fillStyle = fenceBreached ? '#ef4444' : '#f59e0b';
        ctx.fillRect(px - 2.5, py - 2.5, 5, 5);
      });

      // Discrete tactical label
      const firstPt = fence.points[0];
      const lx = (firstPt.x / 100) * w;
      const ly = Math.max(14, (firstPt.y / 100) * h - 6);

      ctx.font = '600 10px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
      ctx.fillStyle = fenceBreached ? '#ef4444' : '#fbbf24';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
      ctx.shadowBlur = 4;
      ctx.fillText(
        fenceBreached ? `[BREACH] ${fence.name}` : `[BOUNDARY] ${fence.name}`,
        lx,
        ly
      );

      ctx.restore();
    });
  }

  // =========================================================================
  // 2. REALISTIC MILITARY TARGET DESIGNATORS (NO CARTOON BODIES/CARS)
  // =========================================================================
  if (showAnalytics && targets && targets.length > 0) {
    targets.forEach((target) => {
      const cx = (target.x / 100) * w;
      const cy = (target.y / 100) * h;
      const bw = (target.w / 100) * w;
      const bh = (target.h / 100) * h;

      ctx.save();

      const isBreaching = target.isBreaching;
      const strokeColor = isBreaching ? '#ef4444' : (target.color || '#10b981');

      // Temporal Trajectory Breadcrumb Trail from Temporal History Buffer
      if (target.trail && target.trail.length > 1) {
        ctx.beginPath();
        target.trail.forEach((pt, i) => {
          const px = (pt.x / 100) * w;
          const py = (pt.y / 100) * h;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.strokeStyle = isBreaching ? 'rgba(239, 68, 68, 0.5)' : (strokeColor === '#10b981' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(56, 189, 248, 0.4)');
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Authentic Military Reticle Corner Brackets (┌ ┐ └ ┘)
      const bracketLen = Math.min(10, bw * 0.3, bh * 0.3);
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = isBreaching ? 2 : 1.5;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 3;

      ctx.beginPath();
      // Top-Left
      ctx.moveTo(cx, cy + bracketLen);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx + bracketLen, cy);

      // Top-Right
      ctx.moveTo(cx + bw - bracketLen, cy);
      ctx.lineTo(cx + bw, cy);
      ctx.lineTo(cx + bw, cy + bracketLen);

      // Bottom-Left
      ctx.moveTo(cx, cy + bh - bracketLen);
      ctx.lineTo(cx, cy + bh);
      ctx.lineTo(cx + bracketLen, cy + bh);

      // Bottom-Right
      ctx.moveTo(cx + bw - bracketLen, cy + bh);
      ctx.lineTo(cx + bw, cy + bh);
      ctx.lineTo(cx + bw, cy + bh - bracketLen);
      ctx.stroke();

      // Thin faint bounding frame
      ctx.strokeStyle = isBreaching ? 'rgba(239, 68, 68, 0.5)' : (strokeColor === '#10b981' ? 'rgba(16, 185, 129, 0.35)' : 'rgba(56, 189, 248, 0.35)');
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.strokeRect(cx, cy, bw, bh);

      // Clean military callout header with distinct person track ID
      const tagText = target.label
        ? `${target.label.toUpperCase()} ${(target.confidence * 100).toFixed(0)}%`
        : `PERSON #${target.trackId || 1} ${(target.confidence * 100).toFixed(0)}%`;

      ctx.font = '600 9px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
      const textWidth = ctx.measureText(tagText).width;

      ctx.fillStyle = isBreaching ? 'rgba(185, 28, 28, 0.9)' : 'rgba(15, 23, 42, 0.9)';
      ctx.fillRect(cx, cy - 14, textWidth + 8, 13);

      ctx.strokeStyle = strokeColor;
      ctx.setLineDash([]);
      ctx.strokeRect(cx, cy - 14, textWidth + 8, 13);

      ctx.fillStyle = '#ffffff';
      ctx.fillText(tagText, cx + 4, cy - 4);

      // Center crosshair tick
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1;
      const midX = cx + bw / 2;
      const midY = cy + bh / 2;
      ctx.beginPath();
      ctx.moveTo(midX - 3, midY); ctx.lineTo(midX + 3, midY);
      ctx.moveTo(midX, midY - 3); ctx.lineTo(midX, midY + 3);
      ctx.stroke();

      ctx.restore();
    });
  }

  // =========================================================================
  // 3. CLEAN PROFESSIONAL CCTV / FLIR ON-SCREEN DISPLAY (OSD)
  // =========================================================================
  osdCtx.save();
  osdCtx.font = '600 11px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
  osdCtx.textBaseline = 'top';

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour12: false });
  const dateStr = now.toISOString().split('T')[0];
  const fullTimestamp = `${dateStr} ${timeStr} IST`;

  // Draw black text shadow for maximum legibility on any background
  const drawOsdText = (text: string, x: number, y: number, color = '#f8fafc', align: CanvasTextAlign = 'left') => {
    osdCtx.textAlign = align;
    osdCtx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    osdCtx.fillText(text, x + 1, y + 1);
    osdCtx.fillStyle = color;
    osdCtx.fillText(text, x, y);
  };

  // --- Top-Left: Camera Identity & Transmission ---
  const camTitle = `[${camera.code}] ${camera.name.toUpperCase()}`;
  const streamInfo = `1080p30 H.264 • 4.8 Mbps • BOP: ${camera.bopName.toUpperCase()}`;
  drawOsdText(camTitle, 10, 10, '#ffffff');
  osdCtx.font = '500 10px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
  drawOsdText(streamInfo, 10, 24, '#94a3b8');

  // --- Top-Right: Timestamp & Recording / Live Status ---
  osdCtx.font = '600 11px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
  drawOsdText(fullTimestamp, w - 10, 10, '#ffffff', 'right');

  if (isRecording) {
    // Red REC pulse
    const blink = step % 40 < 20;
    osdCtx.fillStyle = blink ? '#ef4444' : '#991b1b';
    osdCtx.beginPath();
    osdCtx.arc(w - 74, 28, 4, 0, Math.PI * 2);
    osdCtx.fill();

    osdCtx.font = '700 10px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
    drawOsdText('REC', w - 65, 23, '#ef4444', 'left');
  } else {
    // Quiet green LIVE indicator
    osdCtx.fillStyle = '#10b981';
    osdCtx.beginPath();
    osdCtx.arc(w - 48, 28, 3.5, 0, Math.PI * 2);
    osdCtx.fill();

    osdCtx.font = '600 10px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
    drawOsdText('LIVE', w - 40, 23, '#34d399', 'left');
  }

  // --- Bottom-Left: Grid Location Coordinates ---
  osdCtx.font = '500 10px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
  const coords = `GRID: ${camera.lat.toFixed(4)}°N ${camera.lng.toFixed(4)}°E • SECTOR: ${camera.sector.toUpperCase()}`;
  drawOsdText(coords, 10, h - 22, '#cbd5e1');

  // --- Bottom-Right: Optics Profile & Gimbal Telemetry ---
  const opticsLabel = filterMode === 'thermal_white_hot' 
    ? 'FLIR / WHITE-HOT' 
    : filterMode === 'thermal_ironbow' 
      ? 'FLIR / IRONBOW' 
      : filterMode === 'night' 
        ? 'NVG / GEN-III' 
        : 'DAY OPTICS';
  
  const ptzStatus = `OPTICS: ${opticsLabel} • ZOOM: ${zoom.toFixed(1)}x`;
  drawOsdText(ptzStatus, w - 10, h - 22, '#cbd5e1', 'right');

  osdCtx.restore();
}
