import React, { useRef, useEffect, useState } from 'react';
import { Camera, VisionFilterMode } from '../types';
import { 
  Camera as CameraIcon, 
  Crosshair, 
  AlertTriangle, 
  Sliders, 
  X, 
  RotateCcw,
  Move,
  ZoomIn,
  ZoomOut,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface CameraStreamProps {
  camera: Camera;
  isFocused?: boolean;
  isRecording?: boolean;
  filterMode?: VisionFilterMode;
  onFilterModeChange?: (mode: VisionFilterMode) => void;
  onCaptureSnapshot?: (dataUrl: string, camera: Camera) => void;
}

export const CameraStream: React.FC<CameraStreamProps> = ({
  camera,
  isFocused = false,
  isRecording = false,
  filterMode = 'day',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const osdCanvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ w: 0, h: 0 });

  // Video Adjustment State
  const [showAdjustments, setShowAdjustments] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);

  // PTZ State
  const [showPTZ, setShowPTZ] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 }); // percentage

  const handleZoom = (newZoom: number) => {
    setZoom(newZoom);
    if (newZoom === 1) {
      setPan({ x: 0, y: 0 });
    } else {
      setPan(p => {
        const maxPan = ((newZoom - 1) / newZoom) * 50;
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
      const maxPan = ((zoom - 1) / zoom) * 50; 
      const newX = Math.max(-maxPan, Math.min(maxPan, p.x + dx));
      const newY = Math.max(-maxPan, Math.min(maxPan, p.y + dy));
      return { x: newX, y: newY };
    });
  };

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        const { width, height } = entries[0].contentRect;
        setDimensions({ w: width, h: height });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // AI Render loop
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

    const render = () => {
      step++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width;
      const h = canvas.height;

      // Draw Virtual Fences
      if (camera.virtualFences) {
        camera.virtualFences.forEach(fence => {
          if (!fence.active) return;
          
          ctx.save();
          ctx.beginPath();
          fence.points.forEach((pt, i) => {
            const px = (pt.x / 100) * w;
            const py = (pt.y / 100) * h;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          });
          
          if (fence.type === 'restricted_zone') {
            ctx.closePath();
            ctx.fillStyle = `${fence.color}33`;
            ctx.fill();
          }
          
          ctx.strokeStyle = fence.color;
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.stroke();

          // Fence label
          const firstPt = fence.points[0];
          ctx.fillStyle = fence.color;
          ctx.font = '10px monospace';
          ctx.fillText(fence.name, (firstPt.x / 100) * w, ((firstPt.y / 100) * h) - 5);
          ctx.restore();
        });
      }

      // Draw AI Detections
      if (camera.activeDetections) {
        camera.activeDetections.forEach(det => {
          const bx = (det.bbox.x / 100) * w;
          const by = (det.bbox.y / 100) * h;
          const bw = (det.bbox.w / 100) * w;
          const bh = (det.bbox.h / 100) * h;

          const isAlert = det.confidence > 0.95 || det.type === 'vehicle';
          const color = isAlert ? '#ef4444' : '#10b981';

          // Bounding Box
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.strokeRect(bx, by, bw, bh);

          // Corner markers
          const l = 10;
          ctx.beginPath();
          // TL
          ctx.moveTo(bx, by + l); ctx.lineTo(bx, by); ctx.lineTo(bx + l, by);
          // TR
          ctx.moveTo(bx + bw - l, by); ctx.lineTo(bx + bw, by); ctx.lineTo(bx + bw, by + l);
          // BL
          ctx.moveTo(bx, by + bh - l); ctx.lineTo(bx, by + bh); ctx.lineTo(bx + l, by + bh);
          // BR
          ctx.moveTo(bx + bw - l, by + bh); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx + bw, by + bh - l);
          ctx.stroke();

          // Label
          ctx.fillStyle = color;
          ctx.fillRect(bx, by - 20, bw, 20);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 10px monospace';
          ctx.fillText(det.label, bx + 4, by - 6);

          // Targeting crosshair
          if (step % 60 < 30 && isAlert) {
            ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
            ctx.beginPath();
            ctx.moveTo(bx + bw/2, by - 10);
            ctx.lineTo(bx + bw/2, by + bh + 10);
            ctx.moveTo(bx - 10, by + bh/2);
            ctx.lineTo(bx + bw + 10, by + bh/2);
            ctx.stroke();
          }
        });
      }

      // OSD (Drawn on separate unscaled canvas)
      osdCtx.clearRect(0, 0, osdCanvas.width, osdCanvas.height);
      osdCtx.fillStyle = '#38bdf8';
      osdCtx.font = '10px monospace';
      osdCtx.shadowColor = '#000000';
      osdCtx.shadowBlur = 4;
      osdCtx.fillText(`${camera.code} | LIVE`, 10, 20);
      
      if (isRecording) {
        if (step % 60 < 30) {
          osdCtx.fillStyle = '#ef4444';
          osdCtx.beginPath();
          osdCtx.arc(80, 16, 3, 0, Math.PI * 2);
          osdCtx.fill();
        }
        osdCtx.fillStyle = '#ef4444';
        osdCtx.fillText('REC', 88, 20);
      }
      
      const now = new Date();
      osdCtx.textAlign = 'right';
      osdCtx.fillStyle = '#fbbf24';
      osdCtx.fillText(`${now.toISOString().slice(11, 19)}`, w - 10, 20);

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [dimensions, camera, isRecording]);

  const hasDetections = camera.activeDetections && camera.activeDetections.length > 0;

  const resetAdjustments = (e: React.MouseEvent) => {
    e.stopPropagation();
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
  };

  const getFilterStyle = () => {
    let filterString = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
    if (camera.type === 'thermal_ir') {
      // Base thermal effect combined with user adjustments
      filterString = `grayscale(100%) brightness(${brightness}%) contrast(${Math.max(125, contrast)}%) saturate(${saturation}%)`;
    }
    return filterString;
  };

  return (
    <div 
      ref={containerRef} 
      className={`relative w-full h-full bg-slate-900 overflow-hidden border group ${
        isFocused ? 'border-amber-500 shadow-lg shadow-amber-500/20' : 'border-slate-800'
      }`}
    >
      {/* Fallback pattern if no image */}
      <div className="absolute inset-0 pattern-grid-lg text-slate-800/20"></div>

      // Actual Footage Image
      <div 
        className="absolute inset-0 transition-transform duration-300 origin-center"
        style={{ transform: `scale(${zoom}) translate(${pan.x}%, ${pan.y}%)` }}
      >
        <img 
          src={camera.rtspUrl} 
          alt={camera.name}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
          style={{ filter: getFilterStyle() }}
        />

        {/* AI Canvas Overlay (Scaled with PTZ) */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none"
        />
      </div>

      {/* OSD Overlay (Unscaled) */}
      <canvas
        ref={osdCanvasRef}
        className="absolute inset-0 pointer-events-none z-10"
      />

      {/* Settings Button (visible on hover or focus) */}
      <div className="absolute bottom-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowPTZ(!showPTZ);
            setShowAdjustments(false);
          }}
          className={`p-1.5 rounded-md backdrop-blur border transition-colors ${
            showPTZ 
              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' 
              : 'bg-slate-900/60 border-slate-700/50 text-slate-300 hover:bg-slate-800/80 hover:text-white'
          }`}
          title="PTZ Controls"
        >
          <Move className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowAdjustments(!showAdjustments);
            setShowPTZ(false);
          }}
          className={`p-1.5 rounded-md backdrop-blur border transition-colors ${
            showAdjustments 
              ? 'bg-amber-500/20 border-amber-500/50 text-amber-400' 
              : 'bg-slate-900/60 border-slate-700/50 text-slate-300 hover:bg-slate-800/80 hover:text-white'
          }`}
          title="Adjust Video Feed"
        >
          <Sliders className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* PTZ Overlay */}
      {showPTZ && (
        <div 
          className="absolute bottom-10 right-2 z-30 w-48 bg-slate-950/90 backdrop-blur border border-slate-700 rounded shadow-2xl p-2 font-sans"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider font-mono-code flex items-center gap-1.5">
              <Move className="w-3 h-3 text-emerald-400" />
              PTZ Control
            </span>
            <div className="flex items-center gap-1">
              <button onClick={() => { handleZoom(1); }} className="p-0.5 text-slate-500 hover:text-slate-300 transition-colors" title="Reset">
                <RotateCcw className="w-3 h-3" />
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPTZ(false);
                }} 
                className="p-0.5 text-slate-500 hover:text-red-400 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-2 py-1">
            {/* Zoom Controls */}
            <div className="flex items-center justify-between w-full bg-slate-900/80 rounded border border-slate-800 p-1">
              <button 
                onClick={(e) => { e.stopPropagation(); handleZoom(Math.max(1, zoom - 0.5)); }} 
                disabled={zoom === 1} 
                className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono-code font-bold text-emerald-400 w-10 text-center">{zoom.toFixed(1)}x</span>
              <button 
                onClick={(e) => { e.stopPropagation(); handleZoom(Math.min(4, zoom + 0.5)); }} 
                disabled={zoom === 4} 
                className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
            
            {/* D-Pad */}
            <div className="grid grid-cols-3 gap-1 mt-1">
              <div />
              <button 
                onClick={(e) => { e.stopPropagation(); handlePan(0, 5); }} 
                disabled={zoom === 1} 
                className="p-2 bg-slate-800/80 hover:bg-slate-700 rounded transition-colors disabled:opacity-30 disabled:hover:bg-slate-800/80 shadow-sm"
              >
                <ChevronUp className="w-4 h-4 text-slate-300" />
              </button>
              <div />
              
              <button 
                onClick={(e) => { e.stopPropagation(); handlePan(5, 0); }} 
                disabled={zoom === 1} 
                className="p-2 bg-slate-800/80 hover:bg-slate-700 rounded transition-colors disabled:opacity-30 disabled:hover:bg-slate-800/80 shadow-sm"
              >
                <ChevronLeft className="w-4 h-4 text-slate-300" />
              </button>
              <div className="flex items-center justify-center">
                <div className={`w-2 h-2 rounded-full ${zoom > 1 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-700'}`}></div>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); handlePan(-5, 0); }} 
                disabled={zoom === 1} 
                className="p-2 bg-slate-800/80 hover:bg-slate-700 rounded transition-colors disabled:opacity-30 disabled:hover:bg-slate-800/80 shadow-sm"
              >
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </button>
              
              <div />
              <button 
                onClick={(e) => { e.stopPropagation(); handlePan(0, -5); }} 
                disabled={zoom === 1} 
                className="p-2 bg-slate-800/80 hover:bg-slate-700 rounded transition-colors disabled:opacity-30 disabled:hover:bg-slate-800/80 shadow-sm"
              >
                <ChevronDown className="w-4 h-4 text-slate-300" />
              </button>
              <div />
            </div>
          </div>
        </div>
      )}

      {/* Video Adjustment Overlay */}
      {showAdjustments && (
        <div 
          className="absolute bottom-10 right-2 z-30 w-48 bg-slate-950/90 backdrop-blur border border-slate-700 rounded shadow-2xl p-2 font-sans"
          onClick={(e) => e.stopPropagation()} // Prevent selecting the camera while interacting
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider font-mono-code flex items-center gap-1.5">
              <Sliders className="w-3 h-3 text-amber-400" />
              Adjust Feed
            </span>
            <div className="flex items-center gap-1">
              <button onClick={resetAdjustments} className="p-0.5 text-slate-500 hover:text-slate-300 transition-colors" title="Reset">
                <RotateCcw className="w-3 h-3" />
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAdjustments(false);
                }} 
                className="p-0.5 text-slate-500 hover:text-red-400 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          
          <div className="space-y-3">
            {/* Brightness */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono-code text-slate-400">
                <span>BRT</span>
                <span>{brightness}%</span>
              </div>
              <input 
                type="range" min="20" max="200" value={brightness} 
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500" 
              />
            </div>
            {/* Contrast */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono-code text-slate-400">
                <span>CON</span>
                <span>{contrast}%</span>
              </div>
              <input 
                type="range" min="20" max="250" value={contrast} 
                onChange={(e) => setContrast(Number(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500" 
              />
            </div>
            {/* Saturation */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono-code text-slate-400">
                <span>SAT</span>
                <span>{saturation}%</span>
              </div>
              <input 
                type="range" min="0" max="300" value={saturation} 
                onChange={(e) => setSaturation(Number(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500" 
              />
            </div>
          </div>
        </div>
      )}
      
      {/* UI Accents */}
      {isFocused && !showAdjustments && (
        <div className="absolute top-0 right-0 p-1 bg-amber-500 text-slate-950 text-[10px] font-bold font-mono-code flex items-center gap-1 shadow-md z-10">
          <Crosshair className="w-3 h-3" />
          <span>FOCUSED</span>
        </div>
      )}
      
      {hasDetections && !isFocused && !showAdjustments && (
        <div className="absolute top-1 right-1">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-ping"></div>
        </div>
      )}
    </div>
  );
};
