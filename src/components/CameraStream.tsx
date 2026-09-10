import React, { useRef, useEffect, useState } from 'react';
import { Camera, VisionFilterMode, StreamMode, VirtualFence } from '../types';
import { 
  Camera as CameraIcon, 
  Sliders, 
  RotateCcw,
  ZoomIn,
  ZoomOut,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Video,
  Play,
  Pause,
  Radio,
  Eye,
  ShieldAlert,
  Link,
  Sun,
  Flame,
  Moon,
  UserCheck,
  Filter
} from 'lucide-react';
import { createInitialCameraTargets, updateSimulationStep, SimulatedTarget } from '../utils/motionSimulation';
import { renderTacticalSimulation } from '../utils/canvasRenderer';
import { TACTICAL_VIDEO_FEEDS } from '../data/videoStreams';
import { createOpticalMotionTracker, playTacticalAlertChime } from '../utils/webcamVision';
import { DEFAULT_DETECTION_FILTER, DetectionClassFilter } from '../utils/cocoLabels';
import Hls from 'hls.js';

interface CameraStreamProps {
  camera: Camera;
  isFocused?: boolean;
  isRecording?: boolean;
  filterMode?: VisionFilterMode;
  streamMode?: StreamMode;
  onFilterModeChange?: (mode: VisionFilterMode) => void;
  onStreamModeChange?: (mode: StreamMode) => void;
  onCaptureSnapshot?: (dataUrl: string, camera: Camera) => void;
  onConfigureStream?: (camera: Camera) => void;
  onTripwireBreached?: (camera: Camera, fence: VirtualFence) => void;
}

export const CameraStream: React.FC<CameraStreamProps> = ({
  camera,
  isFocused = false,
  isRecording = false,
  filterMode = 'day',
  streamMode: externalStreamMode,
  onFilterModeChange,
  onStreamModeChange,
  onCaptureSnapshot,
  onConfigureStream,
  onTripwireBreached
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const osdCanvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [dimensions, setDimensions] = useState({ w: 0, h: 0 });

  // Stream Mode state (Default to 'video' for real surveillance footage)
  const [streamMode, setStreamMode] = useState<StreamMode>(externalStreamMode || camera.streamMode || 'video');
  const [showStreamMenu, setShowStreamMenu] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [webcamActive, setWebcamActive] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const webcamStreamRef = useRef<MediaStream | null>(null);

  // Optical Computer Vision Tracking Engine
  const opticalTrackerRef = useRef(createOpticalMotionTracker());
  const [activeBreachAlert, setActiveBreachAlert] = useState<string | null>(null);
  const lastBreachAlertThrottleRef = useRef<number>(0);

  // Class-Based Detection Filter State (Default: Person Only, COCO Class ID: 1)
  const [filterPersonOnly, setFilterPersonOnly] = useState<boolean>(true);
  const [filteredTelemetry, setFilteredTelemetry] = useState<{
    nonHumanCount: number;
    classes: string[];
    totalTracked: number;
  }>({ nonHumanCount: 0, classes: [], totalTracked: 0 });

  // Digital PTZ State
  const [showPTZ, setShowPTZ] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // Simulated dynamic targets ref
  const targetsRef = useRef<SimulatedTarget[]>(createInitialCameraTargets(camera));

  useEffect(() => {
    if (externalStreamMode) {
      setStreamMode(externalStreamMode);
    }
  }, [externalStreamMode]);

  const handleSelectStreamMode = (mode: StreamMode) => {
    setStreamMode(mode);
    setShowStreamMenu(false);
    if (onStreamModeChange) onStreamModeChange(mode);
  };

  // Video feed resolution from config
  const feedConfig = TACTICAL_VIDEO_FEEDS[camera.id] || TACTICAL_VIDEO_FEEDS['cam-01'];
  const primaryVideoUrl = camera.videoStreamUrl || feedConfig?.videoUrl;
  const backupVideoUrl = camera.backupVideoUrl || feedConfig?.backupVideoUrl;
  const activeVideoUrl = videoError ? backupVideoUrl : primaryVideoUrl;

  // Setup Real Webcam or Video Stream
  useEffect(() => {
    if (streamMode === 'webcam') {
      let isMounted = true;
      navigator.mediaDevices?.getUserMedia({ video: { width: 1280, height: 720 }, audio: false })
        .then(stream => {
          if (!isMounted) {
            stream.getTracks().forEach(t => t.stop());
            return;
          }
          webcamStreamRef.current = stream;
          setWebcamActive(true);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(() => {});
          }
        })
        .catch(err => {
          console.warn("Webcam access error:", err);
          if (isMounted) {
            setStreamMode('video');
          }
        });

      return () => {
        isMounted = false;
        if (webcamStreamRef.current) {
          webcamStreamRef.current.getTracks().forEach(t => t.stop());
          webcamStreamRef.current = null;
        }
        setWebcamActive(false);
      };
    } else {
      // Release webcam if active
      if (webcamStreamRef.current) {
        webcamStreamRef.current.getTracks().forEach(t => t.stop());
        webcamStreamRef.current = null;
        setWebcamActive(false);
      }

      // Handle HLS vs MP4 video loop
      if (streamMode === 'video' && videoRef.current && activeVideoUrl) {
        if (activeVideoUrl.endsWith('.m3u8') && Hls.isSupported()) {
          const hls = new Hls();
          hls.loadSource(activeVideoUrl);
          hls.attachMedia(videoRef.current);
          return () => hls.destroy();
        } else {
          videoRef.current.src = activeVideoUrl;
          videoRef.current.play().catch(() => {});
        }
      }
    }
  }, [streamMode, activeVideoUrl]);

  // Digital PTZ Handlers
  const handleZoom = (newZoom: number) => {
    const clamped = Math.max(1, Math.min(4, newZoom));
    setZoom(clamped);
    if (clamped === 1) {
      setPan({ x: 0, y: 0 });
    } else {
      setPan(p => {
        const maxPan = ((clamped - 1) / clamped) * 45;
        return {
          x: Math.max(-maxPan, Math.min(maxPan, p.x)),
          y: Math.max(-maxPan, Math.min(maxPan, p.y))
        };
      });
    }
  };

  const handlePan = (dx: number, dy: number) => {
    if (zoom === 1) return;
    setPan(p => {
      const maxPan = ((zoom - 1) / zoom) * 45; 
      return {
        x: Math.max(-maxPan, Math.min(maxPan, p.x + dx)),
        y: Math.max(-maxPan, Math.min(maxPan, p.y + dy))
      };
    });
  };

  // ResizeObserver for canvas pixel-matching
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        const { width, height } = entries[0].contentRect;
        setDimensions({ w: Math.floor(width), h: Math.floor(height) });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Clean Military C2 Render loop (No cartoon figures, only genuine military OSD & tripwires)
  useEffect(() => {
    if (!canvasRef.current || !osdCanvasRef.current || dimensions.w === 0 || dimensions.h === 0) return;
    
    const canvas = canvasRef.current;
    canvas.width = dimensions.w;
    canvas.height = dimensions.h;
    const ctx = canvas.getContext('2d');
    
    const osdCanvas = osdCanvasRef.current;
    osdCanvas.width = dimensions.w;
    osdCanvas.height = dimensions.h;
    const osdCtx = osdCanvas.getContext('2d');
    
    if (!ctx || !osdCtx) return;

    let animationId: number;
    let step = 0;
    let lastTime = performance.now();

    const render = (time: number) => {
      const deltaTime = Math.min(0.06, Math.max(0.005, (time - lastTime) / 1000));
      lastTime = time;
      step++;

      let currentTargets = targetsRef.current;

      // Computer Vision motion evaluation on live video/webcam
      if ((streamMode === 'webcam' || streamMode === 'video') && videoRef.current && videoRef.current.readyState >= 2) {
        try {
          const cvResult = opticalTrackerRef.current.processFrame(
            videoRef.current,
            camera.virtualFences,
            24,
            deltaTime,
            {
              personOnly: filterPersonOnly,
              allowedClasses: filterPersonOnly ? ['person'] : []
            }
          );

          if (cvResult.breachedFence) {
            const now = Date.now();
            if (now - lastBreachAlertThrottleRef.current > 4000) {
              lastBreachAlertThrottleRef.current = now;
              playTacticalAlertChime('warning');
              setActiveBreachAlert(cvResult.breachedFence.name);
              setTimeout(() => setActiveBreachAlert(null), 3500);
              if (onTripwireBreached) {
                onTripwireBreached(camera, cvResult.breachedFence);
              }
            }
          }

          if (streamMode === 'webcam') {
            currentTargets = cvResult.targets;
            targetsRef.current = cvResult.targets;
            if (cvResult.filteredNonHumanCount !== undefined) {
              setFilteredTelemetry({
                nonHumanCount: cvResult.filteredNonHumanCount,
                classes: cvResult.filteredClasses,
                totalTracked: cvResult.totalTrackedCount
              });
            }
          } else {
            targetsRef.current = updateSimulationStep(targetsRef.current, deltaTime, camera.virtualFences);
            currentTargets = targetsRef.current;
          }
        } catch {
          if (streamMode === 'webcam') {
            currentTargets = [];
            targetsRef.current = [];
          } else {
            targetsRef.current = updateSimulationStep(targetsRef.current, deltaTime, camera.virtualFences);
            currentTargets = targetsRef.current;
          }
        }
      } else {
        targetsRef.current = updateSimulationStep(targetsRef.current, deltaTime, camera.virtualFences);
        currentTargets = targetsRef.current;
      }

      // Render clean C2 military overlay
      renderTacticalSimulation({
        ctx,
        osdCtx,
        width: canvas.width,
        height: canvas.height,
        camera,
        targets: currentTargets,
        step,
        scanlineY: 0,
        isRecording,
        filterMode,
        pan,
        zoom,
        showAnalytics: true
      });

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [dimensions, camera, isRecording, filterMode, pan, zoom, streamMode, filterPersonOnly]);

  // Video Filter Shaders (Thermal, NVG, Day)
  const getFilterStyle = () => {
    if (camera.type === 'thermal_ir' || filterMode === 'thermal_white_hot') {
      return 'grayscale(100%) contrast(160%) brightness(110%) invert(100%)';
    } else if (filterMode === 'thermal_ironbow') {
      return 'contrast(170%) hue-rotate(190deg) saturate(180%)';
    } else if (filterMode === 'night') {
      return 'grayscale(80%) sepia(40%) hue-rotate(80deg) brightness(90%) contrast(130%)';
    }
    return 'none';
  };

  // High-Resolution Snapshot Capture
  const handleCapture = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onCaptureSnapshot) return;

    const offscreen = document.createElement('canvas');
    offscreen.width = dimensions.w || 1280;
    offscreen.height = dimensions.h || 720;
    const offCtx = offscreen.getContext('2d');
    if (!offCtx) return;

    if (videoRef.current && videoRef.current.readyState >= 2) {
      offCtx.drawImage(videoRef.current, 0, 0, offscreen.width, offscreen.height);
      if (canvasRef.current) offCtx.drawImage(canvasRef.current, 0, 0);
      if (osdCanvasRef.current) offCtx.drawImage(osdCanvasRef.current, 0, 0);
      onCaptureSnapshot(offscreen.toDataURL('image/jpeg', 0.95), camera);
    } else {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = camera.rtspUrl;
      img.onload = () => {
        offCtx.drawImage(img, 0, 0, offscreen.width, offscreen.height);
        if (canvasRef.current) offCtx.drawImage(canvasRef.current, 0, 0);
        if (osdCanvasRef.current) offCtx.drawImage(osdCanvasRef.current, 0, 0);
        onCaptureSnapshot(offscreen.toDataURL('image/jpeg', 0.95), camera);
      };
    }
  };

  return (
    <div 
      ref={containerRef} 
      className={`relative w-full h-full bg-slate-950 overflow-hidden border group select-none transition-all ${
        isFocused ? 'border-amber-500/90 ring-1 ring-amber-500/40' : 'border-slate-800/80 hover:border-slate-700'
      }`}
    >
      {/* Real Live Video Stream (Full Hardware Accelerated Playback) */}
      <div 
        className="absolute inset-0 transition-transform duration-200 origin-center bg-black"
        style={{ transform: `scale(${zoom}) translate(${pan.x}%, ${pan.y}%)` }}
      >
        {streamMode === 'video' || streamMode === 'webcam' ? (
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            crossOrigin="anonymous"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: getFilterStyle() }}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onError={() => setVideoError(true)}
          />
        ) : (
          <img 
            src={camera.rtspUrl} 
            alt={camera.name}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: getFilterStyle() }}
          />
        )}

        {/* Tactical HUD Overlay (Tripwires & Target Designators) */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none"
        />
      </div>

      {/* Military OSD Overlay (Fixed, Unscaled HUD) */}
      <canvas
        ref={osdCanvasRef}
        className="absolute inset-0 pointer-events-none z-10"
      />

      {/* Discrete Perimeter Breach Alert Notification */}
      {activeBreachAlert && (
        <div className="absolute top-2 inset-x-4 z-30 flex items-center justify-center pointer-events-none">
          <div className="px-3 py-1 bg-red-600/90 text-white font-mono-code text-[11px] font-bold rounded shadow-lg border border-red-400 flex items-center gap-2">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-300" />
            <span>SECURITY BREACH: {activeBreachAlert}</span>
          </div>
        </div>
      )}

      {/* COCO Standard Detection Class Filter Status Pill */}
      {streamMode === 'webcam' && (
        <div className="absolute top-2 left-2 z-20 flex items-center gap-1.5 pointer-events-none">
          <div className={`px-2 py-0.5 rounded text-[10px] font-mono-code flex items-center gap-1.5 border shadow-md backdrop-blur-md ${
            filterPersonOnly 
              ? 'bg-slate-950/85 text-emerald-400 border-emerald-500/40' 
              : 'bg-slate-950/85 text-amber-400 border-amber-500/40'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${filterPersonOnly ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className="font-bold">{filterPersonOnly ? 'COCO: PERSON ONLY (CLASS 01)' : 'COCO: ALL OBJECTS'}</span>
            {filterPersonOnly && filteredTelemetry.nonHumanCount > 0 && (
              <span className="text-slate-400 border-l border-slate-700 pl-1.5">
                FILTERED: {filteredTelemetry.nonHumanCount} [{filteredTelemetry.classes.map(c => c.toUpperCase()).join(', ')}]
              </span>
            )}
          </div>
        </div>
      )}

      {/* Stream Source Mode Indicator (Subtle Top Center) */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="px-2 py-0.5 rounded bg-slate-950/80 border border-slate-800 text-[10px] font-mono-code text-slate-400">
          SOURCE: {streamMode === 'webcam' ? 'LOCAL WEBCAM' : streamMode === 'video' ? 'TACTICAL FEED' : 'SIMULATION'}
        </span>
      </div>

      {/* Clean Military Tactical Control Bar (Appears on Hover or Focused) */}
      <div className="absolute bottom-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 bg-slate-950/90 backdrop-blur-md border border-slate-700/80 rounded-md p-1 shadow-xl">
        {/* COCO Standard Detection Filter Switcher */}
        <div className="flex items-center border-r border-slate-800 pr-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setFilterPersonOnly(!filterPersonOnly);
            }}
            className={`px-1.5 py-1 rounded text-[10px] font-mono-code font-bold flex items-center gap-1 transition-colors ${
              filterPersonOnly 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
            }`}
            title={filterPersonOnly 
              ? "COCO Filter: Active. Only 'person' triggers boxes and alerts. Inanimate objects (bottles, cups, laptops, etc.) are suppressed. Click to toggle." 
              : "COCO Filter: Inactive. All object classes displayed. Click to restrict to 'person' only."
            }
          >
            <UserCheck className="w-3 h-3" />
            <span>{filterPersonOnly ? 'PERSON ONLY' : 'ALL OBJECTS'}</span>
          </button>
        </div>

        {/* Optics Filter Switcher */}
        <div className="flex items-center gap-0.5 border-r border-slate-800 pr-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFilterModeChange && onFilterModeChange('day');
            }}
            className={`px-1.5 py-1 rounded text-[10px] font-mono-code font-bold transition-colors ${
              filterMode === 'day' 
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Day Optics"
          >
            DAY
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFilterModeChange && onFilterModeChange('thermal_white_hot');
            }}
            className={`px-1.5 py-1 rounded text-[10px] font-mono-code font-bold transition-colors ${
              filterMode === 'thermal_white_hot' 
                ? 'bg-red-500/20 text-red-400 border border-red-500/40' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Thermal White-Hot"
          >
            FLIR
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFilterModeChange && onFilterModeChange('night');
            }}
            className={`px-1.5 py-1 rounded text-[10px] font-mono-code font-bold transition-colors ${
              filterMode === 'night' 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Night Vision (NVG)"
          >
            NVG
          </button>
        </div>

        {/* Digital PTZ Zoom Controls */}
        <div className="flex items-center gap-0.5 border-r border-slate-800 pr-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleZoom(zoom - 0.5);
            }}
            disabled={zoom <= 1}
            className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] font-mono-code text-slate-300 w-8 text-center">
            {zoom.toFixed(1)}x
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleZoom(zoom + 0.5);
            }}
            disabled={zoom >= 4}
            className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          {zoom > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleZoom(1);
              }}
              className="p-1 rounded text-amber-400 hover:text-amber-300"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Snapshot Capture */}
        <button
          onClick={handleCapture}
          className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          title="Capture Forensic Snapshot"
        >
          <CameraIcon className="w-3.5 h-3.5" />
        </button>

        {/* Stream Source Selector Menu */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowStreamMenu(!showStreamMenu);
            }}
            className={`p-1 rounded transition-colors ${
              streamMode === 'webcam' 
                ? 'bg-purple-500/20 text-purple-300' 
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="Change Video Feed Source"
          >
            <Video className="w-3.5 h-3.5" />
          </button>

          {showStreamMenu && (
            <div 
              className="absolute bottom-8 right-0 w-52 bg-slate-950 border border-slate-700 rounded shadow-2xl p-1 z-50 text-xs font-mono-code"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-2 py-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                Stream Input Feed
              </div>
              <button
                onClick={() => handleSelectStreamMode('video')}
                className={`w-full text-left px-2 py-1.5 rounded flex items-center justify-between transition-colors ${
                  streamMode === 'video' ? 'bg-slate-800 text-emerald-400 font-bold' : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <span>Live Tactical Feed (1080p)</span>
                <span className="text-[9px] text-slate-500">Loop</span>
              </button>
              <button
                onClick={() => handleSelectStreamMode('webcam')}
                className={`w-full text-left px-2 py-1.5 rounded flex items-center justify-between transition-colors ${
                  streamMode === 'webcam' ? 'bg-slate-800 text-purple-400 font-bold' : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <span>Local Sentry Camera (Webcam)</span>
                <span className="text-[9px] text-slate-500">USB/Cam</span>
              </button>
              <button
                onClick={() => handleSelectStreamMode('simulated')}
                className={`w-full text-left px-2 py-1.5 rounded flex items-center justify-between transition-colors ${
                  streamMode === 'simulated' ? 'bg-slate-800 text-sky-400 font-bold' : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <span>Autonomous Patrol Sim</span>
                <span className="text-[9px] text-slate-500">AI</span>
              </button>
              {onConfigureStream && (
                <>
                  <div className="my-1 border-t border-slate-800"></div>
                  <button
                    onClick={() => {
                      setShowStreamMenu(false);
                      onConfigureStream(camera);
                    }}
                    className="w-full text-left px-2 py-1.5 rounded text-sky-400 hover:bg-slate-900 transition-colors flex items-center gap-1.5"
                  >
                    <Link className="w-3 h-3" />
                    <span>Configure HLS / URL...</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
