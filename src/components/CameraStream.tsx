import React, { useRef, useEffect, useState } from 'react';
import { Camera, VisionFilterMode } from '../types';
import { Camera as CameraIcon, Crosshair, AlertTriangle } from 'lucide-react';

interface CameraStreamProps {
  camera: Camera;
  isFocused?: boolean;
  filterMode?: VisionFilterMode;
  onFilterModeChange?: (mode: VisionFilterMode) => void;
  onCaptureSnapshot?: (dataUrl: string, camera: Camera) => void;
}

export const CameraStream: React.FC<CameraStreamProps> = ({
  camera,
  isFocused = false,
  filterMode = 'day',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ w: 0, h: 0 });

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
    if (!canvasRef.current || dimensions.w === 0 || dimensions.h === 0) return;
    
    const canvas = canvasRef.current;
    canvas.width = dimensions.w;
    canvas.height = dimensions.h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

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

      // OSD
      ctx.fillStyle = '#38bdf8';
      ctx.font = '10px monospace';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 4;
      ctx.fillText(`${camera.code} | REC`, 10, 20);
      
      const now = new Date();
      ctx.textAlign = 'right';
      ctx.fillStyle = '#fbbf24';
      ctx.fillText(`${now.toISOString().slice(11, 19)}`, w - 10, 20);

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [dimensions, camera]);

  const hasDetections = camera.activeDetections && camera.activeDetections.length > 0;

  return (
    <div 
      ref={containerRef} 
      className={`relative w-full h-full bg-slate-900 overflow-hidden border ${
        isFocused ? 'border-amber-500 shadow-lg shadow-amber-500/20' : 'border-slate-800'
      }`}
    >
      {/* Fallback pattern if no image */}
      <div className="absolute inset-0 pattern-grid-lg text-slate-800/20"></div>

      {/* Actual Footage Image */}
      <img 
        src={camera.rtspUrl} 
        alt={camera.name}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
          camera.type === 'thermal_ir' ? 'grayscale contrast-125' : ''
        }`}
      />

      {/* OSD and AI Canvas Overlay */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
      />
      
      {/* UI Accents */}
      {isFocused && (
        <div className="absolute top-0 right-0 p-1 bg-amber-500 text-slate-950 text-[10px] font-bold font-mono-code flex items-center gap-1 shadow-md z-10">
          <Crosshair className="w-3 h-3" />
          <span>FOCUSED</span>
        </div>
      )}
      
      {hasDetections && !isFocused && (
        <div className="absolute top-1 right-1">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-ping"></div>
        </div>
      )}
    </div>
  );
};
