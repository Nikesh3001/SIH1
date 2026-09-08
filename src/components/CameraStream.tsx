import React, { useRef, useEffect, useState } from 'react';
import { 
  Camera, 
  Detection, 
  VisionFilterMode 
} from '../types';
import { 
  Maximize2, 
  Minimize2, 
  Camera as SnapshotIcon, 
  Eye, 
  EyeOff, 
  Crosshair, 
  Moon, 
  Sun, 
  Flame, 
  Compass, 
  AlertCircle,
  Video,
  Upload,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Move
} from 'lucide-react';

interface CameraStreamProps {
  camera: Camera;
  onCaptureSnapshot?: (dataUrl: string, camera: Camera) => void;
  onFenceBreachDetected?: (camera: Camera, detection: Detection) => void;
  filterMode?: VisionFilterMode;
  onFilterModeChange?: (mode: VisionFilterMode) => void;
  isFocused?: boolean;
}

export const CameraStream: React.FC<CameraStreamProps> = ({
  camera,
  onCaptureSnapshot,
  onFenceBreachDetected,
  filterMode: propFilterMode,
  onFilterModeChange,
  isFocused = false
}) => {
  const filterMode: VisionFilterMode = (propFilterMode as VisionFilterMode) || 'day';
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [showAiOverlay, setShowAiOverlay] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [ptzZoom, setPtzZoom] = useState(1);
  const [ptzPan, setPtzPan] = useState({ x: 0, y: 0 });
  const [customVideoSrc, setCustomVideoSrc] = useState<string | null>(null);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const [flashAlarm, setFlashAlarm] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Animation frame state for moving targets
  const simStateRef = useRef({
    step: 0,
    targets: [
      { id: 1042, x: 32, y: 56, vx: 0.12, vy: 0.05, label: 'Person (Suspect)', type: 'person' as const, trackId: 1042, history: [] as {x: number, y: number}[] },
      { id: 2011, x: 62, y: 58, vx: -0.06, vy: 0.02, label: 'Person (Prone/Crawling)', type: 'person' as const, trackId: 2011, history: [] as {x: number, y: number}[] },
      { id: 3089, x: 38, y: 45, vx: 0.2, vy: 0.18, label: 'Vehicle (SUV)', type: 'vehicle' as const, trackId: 3089, history: [] as {x: number, y: number}[] }
    ]
  });

  // Handle local video upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomVideoSrc(url);
      setIsWebcamActive(false);
    }
  };

  // Handle WebCam toggle
  const toggleWebcam = async () => {
    if (isWebcamActive) {
      if (videoElementRef.current && videoElementRef.current.srcObject) {
        const stream = videoElementRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(t => t.stop());
        videoElementRef.current.srcObject = null;
      }
      setIsWebcamActive(false);
      setCustomVideoSrc(null);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
        if (videoElementRef.current) {
          videoElementRef.current.srcObject = stream;
          videoElementRef.current.play();
        }
        setIsWebcamActive(true);
        setCustomVideoSrc(null);
      } catch {
        alert('WebCam access declined or unavailable in current environment.');
      }
    }
  };

  // PTZ adjustments
  const handlePtzZoom = (delta: number) => {
    setPtzZoom(prev => Math.min(3, Math.max(1, prev + delta)));
  };

  const handlePtzPan = (dx: number, dy: number) => {
    setPtzPan(prev => ({
      x: Math.min(60, Math.max(-60, prev.x + dx)),
      y: Math.min(40, Math.max(-40, prev.y + dy))
    }));
  };

  const resetPtz = () => {
    setPtzZoom(1);
    setPtzPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (ptzZoom > 1 || camera.type === 'ptz') {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    // Sensitivity of panning
    const sensitivity = 0.2 / ptzZoom;
    const dx = (e.clientX - dragStart.x) * sensitivity;
    const dy = (e.clientY - dragStart.y) * sensitivity;
    
    // We invert the sign so that dragging left moves the view right (like a map)
    handlePtzPan(-dx, -dy);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (camera.type === 'ptz' || ptzZoom > 1 || e.deltaY < 0) {
      // Small increments for wheel zoom
      handlePtzZoom(e.deltaY < 0 ? 0.1 : -0.1);
    }
  };

  // Trigger Snapshot
  const triggerSnapshot = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.92);
    if (onCaptureSnapshot) {
      onCaptureSnapshot(dataUrl, camera);
    } else {
      // Direct download fallback
      const link = document.createElement('a');
      link.download = `IBVAP_Snapshot_${camera.code}_${Date.now()}.jpg`;
      link.href = dataUrl;
      link.click();
    }
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Main Canvas Rendering Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const sim = simStateRef.current;
      sim.step += 1;

      // Clear canvas before drawing
      ctx.clearRect(0, 0, width, height);

      // --- APPLY GLOBAL PTZ TRANSLATION ---
      ctx.save();
      if (ptzZoom > 1 || ptzPan.x !== 0 || ptzPan.y !== 0) {
        ctx.translate(width / 2, height / 2);
        ctx.scale(ptzZoom, ptzZoom);
        ctx.translate(-width / 2 + ptzPan.x, -height / 2 + ptzPan.y);
      }

      // 1. Draw Background: Either real video stream or simulated tactical CCTV environment
      if ((customVideoSrc || isWebcamActive) && videoElementRef.current && videoElementRef.current.readyState >= 2) {
        ctx.drawImage(videoElementRef.current, 0, 0, width, height);
      } else {
        // Procedural realistic surveillance scene based on camera sector
        renderProceduralScene(ctx, width, height, camera, filterMode, sim.step);
      }

      // 2. Apply Thermal / Night Vision Color Transformations if needed
      applySensorFilters(ctx, width, height, filterMode);

      // 3. Render Virtual Fences & Geofences
      let fenceAlarmActive = false;
      if (showAiOverlay && camera.virtualFences) {
        camera.virtualFences.forEach((fence) => {
          if (!fence.active) return;
          ctx.save();
          ctx.beginPath();
          fence.points.forEach((pt, idx) => {
            const x = (pt.x / 100) * width;
            const y = (pt.y / 100) * height;
            if (idx === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          });

          if (fence.type === 'restricted_zone') {
            ctx.closePath();
            ctx.fillStyle = 'rgba(245, 158, 11, 0.12)';
            ctx.fill();
            ctx.strokeStyle = 'rgba(245, 158, 11, 0.8)';
            ctx.lineWidth = 2.5;
            ctx.setLineDash([8, 4]);
            ctx.stroke();
          } else {
            // Tripwire / Zero Line
            const isZeroLine = fence.type === 'zero_line_buffer';
            ctx.strokeStyle = isZeroLine ? '#ef4444' : (fence.color || '#ef4444');
            ctx.lineWidth = isZeroLine ? 3 : 2;
            ctx.shadowColor = isZeroLine ? 'rgba(239, 68, 68, 0.8)' : 'rgba(245, 158, 11, 0.8)';
            ctx.shadowBlur = 8;
            ctx.stroke();
          }

          // Draw label on fence
          if (fence.points.length > 0) {
            const firstPt = fence.points[0];
            const lx = (firstPt.x / 100) * width;
            const ly = (firstPt.y / 100) * height;
            ctx.font = '10px "JetBrains Mono", monospace';
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = '#000000';
            ctx.shadowBlur = 4;
            ctx.fillText(`⚡ [V-FENCE]: ${fence.name.toUpperCase()}`, lx + 8, ly - 6);
          }
          ctx.restore();
        });
      }

      // 4. Update and Render Moving AI Detections
      if (showAiOverlay) {
        const detections = camera.activeDetections || [];
        
        detections.forEach((det, idx) => {
          // Add slight natural jitter/movement for live tracking feel
          const wobbleX = Math.sin(sim.step * 0.05 + idx) * 0.8;
          const wobbleY = Math.cos(sim.step * 0.04 + idx) * 0.5;

          const bx = ((det.bbox.x + wobbleX) / 100) * width;
          const by = ((det.bbox.y + wobbleY) / 100) * height;
          const bw = (det.bbox.w / 100) * width;
          const bh = (det.bbox.h / 100) * height;

          // Check if intersecting fence line (around 65% Y)
          const isBreaching = (by + bh) > height * 0.62 && (by + bh) < height * 0.72;
          if (isBreaching && det.type === 'person') {
            fenceAlarmActive = true;
          }

          // Choose box color by classification
          let boxColor = '#10b981'; // green standard
          if (det.faceMatch?.watchlistCategory === 'WANTED' || det.plateNumber === 'JK-02-AB-4821' || isBreaching) {
            boxColor = '#ef4444'; // red critical
          } else if (det.behavior === 'Crawling/Prone' || det.behavior === 'Loitering') {
            boxColor = '#f59e0b'; // amber warning
          }

          // Draw Bounding Box with tactical corner reticles
          ctx.save();
          ctx.strokeStyle = boxColor;
          ctx.lineWidth = 2;
          ctx.strokeRect(bx, by, bw, bh);

          // Tactical corners
          const cornerLen = Math.min(10, bw / 3, bh / 3);
          ctx.lineWidth = 3;
          // Top Left
          ctx.beginPath();
          ctx.moveTo(bx, by + cornerLen);
          ctx.lineTo(bx, by);
          ctx.lineTo(bx + cornerLen, by);
          ctx.stroke();
          // Top Right
          ctx.beginPath();
          ctx.moveTo(bx + bw - cornerLen, by);
          ctx.lineTo(bx + bw, by);
          ctx.lineTo(bx + bw, by + cornerLen);
          ctx.stroke();
          // Bottom Left
          ctx.beginPath();
          ctx.moveTo(bx, by + bh - cornerLen);
          ctx.lineTo(bx, by + bh);
          ctx.lineTo(bx + cornerLen, by + bh);
          ctx.stroke();
          // Bottom Right
          ctx.beginPath();
          ctx.moveTo(bx + bw - cornerLen, by + bh);
          ctx.lineTo(bx + bw, by + bh);
          ctx.lineTo(bx + bw, by + bh - cornerLen);
          ctx.stroke();

          // Header tag background
          const tagHeight = 18;
          ctx.fillStyle = boxColor;
          ctx.fillRect(bx, by - tagHeight, bw, tagHeight);

          // Header text: Class, Track ID, Confidence
          ctx.font = 'bold 9px "JetBrains Mono", monospace';
          ctx.fillStyle = '#0f172a';
          ctx.fillText(
            `#${det.trackId} ${det.label.slice(0, 16)} ${(det.confidence * 100).toFixed(0)}%`,
            bx + 4,
            by - 5
          );

          // Sub-attributes (Speed, Direction, ANPR plate, Face match)
          let subText = '';
          if (det.speedKmh) subText += `${det.speedKmh} km/h • `;
          if (det.direction) subText += `${det.direction} • `;
          if (det.plateNumber) subText += `PLATE: ${det.plateNumber}`;
          if (det.faceMatch) subText += `MATCH: ${det.faceMatch.name}`;

          if (subText) {
            ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
            ctx.fillRect(bx, by + bh, bw, 15);
            ctx.fillStyle = '#f8fafc';
            ctx.font = '8px "JetBrains Mono", monospace';
            ctx.fillText(subText.slice(0, 32), bx + 4, by + bh + 11);
          }

          // Trajectory breadcrumbs
          ctx.fillStyle = boxColor;
          ctx.beginPath();
          ctx.arc(bx + bw / 2, by + bh, 3, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        });
      }

      // --- RESTORE GLOBAL PTZ TRANSLATION ---
      ctx.restore();

      setFlashAlarm(fenceAlarmActive);

      // 5. Tactical OSD (On-Screen Display: Camera ID, Timestamp, FPS, Codec, Compass)
      renderOsdOverlay(ctx, width, height, camera, filterMode, sim.step, ptzZoom);

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [camera, filterMode, showAiOverlay, ptzZoom, ptzPan, customVideoSrc, isWebcamActive]);

  return (
    <div 
      ref={containerRef}
      className={`relative bg-slate-950 rounded-lg overflow-hidden border transition-all select-none group ${
        isFocused 
          ? 'border-amber-500 shadow-lg shadow-amber-500/10' 
          : flashAlarm 
            ? 'border-red-500 shadow-lg shadow-red-500/30' 
            : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Hidden video element for local stream ingestion */}
      <video 
        ref={videoElementRef} 
        src={customVideoSrc || undefined}
        className="hidden" 
        playsInline 
        muted 
        loop 
        autoPlay 
      />

      {/* Main Canvas Viewport */}
      <div 
        className={`relative w-full aspect-video bg-black overflow-hidden ${isDragging ? 'cursor-grabbing' : 'cursor-crosshair'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        onWheel={handleWheel}
      >
        <canvas
          ref={canvasRef}
          width={800}
          height={450}
          className="w-full h-full object-contain block scanline pointer-events-none"
        />

        {/* Breach Alert Flasher */}
        {flashAlarm && (
          <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-600/90 text-white text-xs font-mono-code font-bold animate-pulse shadow-md">
            <AlertCircle className="w-4 h-4" />
            <span>BREACH IN PROGRESS</span>
          </div>
        )}

        {/* Tactical Corner Crosshairs */}
        <div className="absolute top-2 left-2 pointer-events-none opacity-40">
          <Crosshair className="w-5 h-5 text-amber-400" />
        </div>
        <div className="absolute bottom-2 right-2 pointer-events-none opacity-40">
          <Crosshair className="w-5 h-5 text-amber-400" />
        </div>

        {/* Hover / In-View Interactive Action Bar */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/95 via-slate-950/70 to-transparent p-2 flex items-center justify-between opacity-90 group-hover:opacity-100 transition-opacity">
          {/* Left: Camera Code & Health */}
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-mono-code font-bold text-slate-100">
              {camera.code}
            </span>
            <span className="text-[10px] font-mono-code text-slate-400 hidden sm:inline">
              [{camera.type.toUpperCase()}]
            </span>
          </div>

          {/* Center: Vision Modes (Day, Night NVG, Thermal White-Hot, Thermal Ironbow) */}
          <div className="flex items-center gap-1 bg-slate-900/80 p-0.5 rounded border border-slate-700/80">
            <button
              onClick={() => onFilterModeChange?.('day')}
              className={`p-1 rounded text-xs transition-colors ${filterMode === 'day' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
              title="Daylight Optical Mode"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onFilterModeChange?.('night')}
              className={`p-1 rounded text-xs transition-colors ${filterMode === 'night' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
              title="Night Vision Mode (NVG Green Phosphor)"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onFilterModeChange?.('thermal_white_hot')}
              className={`p-1 rounded text-xs transition-colors ${filterMode === 'thermal_white_hot' ? 'bg-slate-200 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
              title="Thermal FLIR White-Hot"
            >
              <Flame className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onFilterModeChange?.('thermal_ironbow')}
              className={`p-1 rounded text-xs transition-colors ${filterMode === 'thermal_ironbow' ? 'bg-purple-500 text-white font-bold' : 'text-slate-400 hover:text-slate-200'}`}
              title="Thermal Ironbow Heat Spectrum"
            >
              <Compass className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Right: AI Overlay, PTZ Controls, Snapshot, Ingestion & Fullscreen */}
          <div className="flex items-center gap-1.5">
            {/* AI Overlay toggle */}
            <button
              onClick={() => setShowAiOverlay(!showAiOverlay)}
              className={`p-1 rounded border text-xs transition-colors ${
                showAiOverlay 
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300' 
                  : 'bg-slate-800/80 border-slate-700 text-slate-400'
              }`}
              title={showAiOverlay ? 'Hide AI Detection Bounding Boxes' : 'Show AI Detection Bounding Boxes'}
            >
              {showAiOverlay ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>

            {/* PTZ Zoom Buttons */}
            {camera.type === 'ptz' && (
              <div className="hidden sm:flex items-center gap-0.5 bg-slate-900/80 p-0.5 rounded border border-slate-800">
                <button 
                  onClick={() => handlePtzZoom(0.25)} 
                  className="p-1 text-slate-300 hover:text-white"
                  title="PTZ Zoom In"
                >
                  <ZoomIn className="w-3 h-3" />
                </button>
                <button 
                  onClick={() => handlePtzZoom(-0.25)} 
                  className="p-1 text-slate-300 hover:text-white"
                  title="PTZ Zoom Out"
                >
                  <ZoomOut className="w-3 h-3" />
                </button>
                <button 
                  onClick={resetPtz} 
                  className="p-1 text-slate-400 hover:text-slate-200 text-[9px] font-mono-code"
                  title="Reset PTZ Preset"
                >
                  1x
                </button>
              </div>
            )}

            {/* Snapshot Evidence Capture */}
            <button
              onClick={triggerSnapshot}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 transition-colors"
              title="Capture Evidence Snapshot"
            >
              <SnapshotIcon className="w-3.5 h-3.5" />
            </button>

            {/* WebCam / Local Stream input */}
            <button
              onClick={toggleWebcam}
              className={`p-1 rounded border text-xs transition-colors ${
                isWebcamActive 
                  ? 'bg-red-500/20 border-red-500 text-red-300' 
                  : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
              title={isWebcamActive ? 'Disconnect Webcam' : 'Ingest Local Webcam Feed for AI Testing'}
            >
              <Video className="w-3.5 h-3.5" />
            </button>

            {/* File Upload for custom video */}
            <label className="p-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-slate-200 cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <input 
                type="file" 
                accept="video/*" 
                onChange={handleFileUpload} 
                className="hidden" 
                title="Upload local surveillance video clip"
              />
            </label>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-slate-200"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Procedural Canvas Scene Painter for Realistic Tactical Footage ---
function renderProceduralScene(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  camera: Camera,
  mode: VisionFilterMode,
  step: number
) {
  ctx.save();
  // 1. Sky & Horizon Gradient
  const isNightOrThermal = mode !== 'day';
  const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.45);
  if (isNightOrThermal) {
    skyGrad.addColorStop(0, '#020617');
    skyGrad.addColorStop(1, '#0f172a');
  } else {
    skyGrad.addColorStop(0, '#334155');
    skyGrad.addColorStop(1, '#64748b');
  }
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, h * 0.45);

  // 2. Distant Mountains / Ridge Silhouettes
  ctx.fillStyle = isNightOrThermal ? '#090d16' : '#475569';
  ctx.beginPath();
  ctx.moveTo(0, h * 0.45);
  ctx.lineTo(w * 0.2, h * 0.35);
  ctx.lineTo(w * 0.45, h * 0.42);
  ctx.lineTo(w * 0.7, h * 0.32);
  ctx.lineTo(w, h * 0.45);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();

  // 3. Terrain / Ground Plane
  const groundGrad = ctx.createLinearGradient(0, h * 0.45, 0, h);
  if (isNightOrThermal) {
    groundGrad.addColorStop(0, '#090d16');
    groundGrad.addColorStop(1, '#030712');
  } else {
    groundGrad.addColorStop(0, '#334155');
    groundGrad.addColorStop(0.5, '#1e293b');
    groundGrad.addColorStop(1, '#0f172a');
  }
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, h * 0.45, w, h * 0.55);

  // 4. Sector-Specific Features:
  if (camera.code.includes('HW') || camera.code.includes('CP')) {
    // Highway Transit Gate Scene with road lanes and barrier
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(w * 0.2, h);
    ctx.lineTo(w * 0.4, h * 0.45);
    ctx.lineTo(w * 0.6, h * 0.45);
    ctx.lineTo(w * 0.8, h);
    ctx.closePath();
    ctx.fill();

    // Road dashed line
    ctx.strokeStyle = '#94a3b8';
    ctx.setLineDash([12, 10]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(w * 0.5, h * 0.45);
    ctx.lineTo(w * 0.5, h);
    ctx.stroke();
    ctx.setLineDash([]);

    // Checkpost Canopy Pillar
    ctx.fillStyle = '#475569';
    ctx.fillRect(w * 0.15, h * 0.3, 14, h * 0.7);
    ctx.fillRect(w * 0.82, h * 0.3, 14, h * 0.7);
    ctx.fillRect(w * 0.12, h * 0.28, w * 0.75, 12);
  } else if (camera.code.includes('RV') || camera.code.includes('CK')) {
    // Riverine Waterfront Scene
    const waterGrad = ctx.createLinearGradient(0, h * 0.55, 0, h);
    waterGrad.addColorStop(0, '#0f172a');
    waterGrad.addColorStop(1, '#1e293b');
    ctx.fillStyle = waterGrad;
    ctx.fillRect(0, h * 0.55, w, h * 0.45);

    // Water ripple lines
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
    ctx.lineWidth = 1;
    for (let r = 0; r < 5; r++) {
      const ry = h * (0.6 + r * 0.08);
      ctx.beginPath();
      ctx.moveTo(0, ry + Math.sin(step * 0.04 + r) * 3);
      ctx.bezierCurveTo(w * 0.3, ry - 3, w * 0.7, ry + 3, w, ry);
      ctx.stroke();
    }
  } else {
    // Standard Border Fence Line with Concertina Wire & Fence Posts
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;

    // Fence Posts
    const postCount = 9;
    for (let i = 0; i <= postCount; i++) {
      const px = (w * i) / postCount;
      ctx.beginPath();
      ctx.moveTo(px, h * 0.48);
      ctx.lineTo(px, h * 0.85);
      ctx.stroke();

      // Concertina wire coil loop
      ctx.beginPath();
      ctx.arc(px, h * 0.54, 8, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Horizontal barbed wire strands
    for (let strand = 0; strand < 4; strand++) {
      const sy = h * (0.52 + strand * 0.08);
      ctx.beginPath();
      ctx.moveTo(0, sy);
      ctx.lineTo(w, sy);
      ctx.stroke();
    }
  }

  // Draw procedural subjects in the background
  // Subject 1: Human walking towards boundary
  drawSubjectFigure(ctx, w * 0.42, h * 0.62, 28, 60, mode, step);

  // Subject 2: Distant Watchtower or vehicle if applicable
  if (camera.code.includes('TW') || camera.code.includes('PF')) {
    ctx.fillStyle = '#334155';
    ctx.fillRect(w * 0.72, h * 0.42, 45, 25);
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(w * 0.75, h * 0.55, 6, 0, Math.PI * 2);
    ctx.arc(w * 0.81, h * 0.55, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// Procedural human body silhouette
function drawSubjectFigure(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  mode: VisionFilterMode,
  step: number
) {
  ctx.save();
  ctx.fillStyle = mode === 'thermal_white_hot' ? '#ffffff' : mode === 'night' ? '#86efac' : '#1e293b';

  // Head
  const headRadius = w * 0.22;
  ctx.beginPath();
  ctx.arc(x + w * 0.5, y + headRadius, headRadius, 0, Math.PI * 2);
  ctx.fill();

  // Torso
  ctx.fillRect(x + w * 0.25, y + headRadius * 2, w * 0.5, h * 0.45);

  // Legs with walking cycle
  const legSwing = Math.sin(step * 0.08) * (w * 0.2);
  ctx.lineWidth = w * 0.18;
  ctx.strokeStyle = ctx.fillStyle;

  // Left leg
  ctx.beginPath();
  ctx.moveTo(x + w * 0.35, y + headRadius * 2 + h * 0.45);
  ctx.lineTo(x + w * 0.35 - legSwing, y + h);
  ctx.stroke();

  // Right leg
  ctx.beginPath();
  ctx.moveTo(x + w * 0.65, y + headRadius * 2 + h * 0.45);
  ctx.lineTo(x + w * 0.65 + legSwing, y + h);
  ctx.stroke();

  ctx.restore();
}

// Sensor post-filters: Night Vision phosphor, FLIR White-Hot, Ironbow
function applySensorFilters(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  mode: VisionFilterMode
) {
  if (mode === 'day') return;

  ctx.save();
  if (mode === 'night') {
    // Green phosphor night vision overlay
    ctx.globalCompositeOperation = 'color';
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(0, 0, w, h);

    // Subtle noise & vignette
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = 'rgba(34, 197, 94, 0.25)';
    ctx.fillRect(0, 0, w, h);
  } else if (mode === 'thermal_white_hot') {
    // High contrast black & white thermal FLIR
    ctx.globalCompositeOperation = 'color';
    ctx.fillStyle = '#64748b';
    ctx.fillRect(0, 0, w, h);
  } else if (mode === 'thermal_ironbow') {
    // Ironbow heat spectrum (deep purple to orange/yellow)
    ctx.globalCompositeOperation = 'color';
    const ironGrad = ctx.createLinearGradient(0, 0, w, h);
    ironGrad.addColorStop(0, '#581c87');
    ironGrad.addColorStop(0.5, '#c2410c');
    ironGrad.addColorStop(1, '#fde047');
    ctx.fillStyle = ironGrad;
    ctx.fillRect(0, 0, w, h);
  }
  ctx.restore();
}

// Tactical On-Screen Display (OSD)
function renderOsdOverlay(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  camera: Camera,
  mode: VisionFilterMode,
  step: number,
  zoom: number
) {
  ctx.save();
  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.fillStyle = '#38bdf8';
  ctx.shadowColor = '#000000';
  ctx.shadowBlur = 4;

  // Top Left: Camera code, sector, resolution, FPS
  ctx.fillText(`CAM: ${camera.code} [${camera.resolution}]`, 12, 20);
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(`LOC: ${camera.bopName} (${camera.lat.toFixed(4)}°N, ${camera.lng.toFixed(4)}°E)`, 12, 34);

  // Top Right: Live Clock & Protocol
  const now = new Date();
  const time = now.toLocaleTimeString('en-US', { hour12: false });
  const ms = Math.floor((now.getMilliseconds() / 1000) * 100);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#fbbf24';
  ctx.fillText(`LIVE: ${time}:${ms < 10 ? '0' + ms : ms} UTC`, w - 12, 20);
  ctx.fillStyle = '#34d399';
  ctx.fillText(`RTSP/H.264 • ${camera.fps} FPS • PTZ: ${zoom.toFixed(1)}x`, w - 12, 34);

  // Bottom Left: Compass Heading & Altitude
  ctx.textAlign = 'left';
  ctx.fillStyle = '#e2e8f0';
  ctx.fillText(`HDG: ${camera.fovHeading}° [NW] • FOV: ${camera.fovAngle}° • ALT: ${camera.altitudeMeters}m`, 12, h - 32);

  // Bottom Center: Mode indicator
  ctx.textAlign = 'center';
  ctx.fillStyle = mode === 'day' ? '#38bdf8' : mode === 'night' ? '#4ade80' : '#f97316';
  ctx.fillText(`SENSOR MODE: ${mode.toUpperCase()}`, w / 2, h - 32);

  ctx.restore();
}
