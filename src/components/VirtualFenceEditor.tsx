import React, { useState, useRef, useEffect } from 'react';
import { Camera, VirtualFence, VirtualFencePoint } from '../types';
import { 
  Sliders, 
  X, 
  Check, 
  Trash2, 
  Plus, 
  ShieldAlert, 
  Crosshair,
  RotateCcw,
  AlertTriangle
} from 'lucide-react';

interface VirtualFenceEditorProps {
  camera: Camera;
  onSaveFence: (cameraId: string, fences: VirtualFence[]) => void;
  onClose: () => void;
}

export const VirtualFenceEditor: React.FC<VirtualFenceEditorProps> = ({
  camera,
  onSaveFence,
  onClose,
}) => {
  const [fences, setFences] = useState<VirtualFence[]>(JSON.parse(JSON.stringify(camera.virtualFences || [])));
  const [selectedFenceId, setSelectedFenceId] = useState<string>(fences[0]?.id || '');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const activeFence = fences.find(f => f.id === selectedFenceId) || fences[0];

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !activeFence) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const updatedPoints = [...activeFence.points, { x: Math.round(x), y: Math.round(y) }];
    updateActiveFencePoints(updatedPoints);
  };

  const updateActiveFencePoints = (points: VirtualFencePoint[]) => {
    setFences(prev => prev.map(f => {
      if (f.id === activeFence.id) {
        return { ...f, points };
      }
      return f;
    }));
  };

  const handleResetPoints = () => {
    updateActiveFencePoints([]);
  };

  const handleAddNewFence = () => {
    const newId = `vf-${Date.now()}`;
    const newF: VirtualFence = {
      id: newId,
      name: `Perimeter Zone ${fences.length + 1}`,
      type: 'tripwire',
      direction: 'inbound',
      points: [{ x: 10, y: 70 }, { x: 90, y: 70 }],
      color: '#ef4444',
      active: true,
      alertOnCrossing: true,
    };
    setFences(prev => [...prev, newF]);
    setSelectedFenceId(newId);
  };

  const handleDeleteFence = (id: string) => {
    const remaining = fences.filter(f => f.id !== id);
    setFences(remaining);
    if (remaining.length > 0) {
      setSelectedFenceId(remaining[0].id);
    }
  };

  const handleSave = () => {
    onSaveFence(camera.id, fences);
    onClose();
  };

  // Draw on calibration canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Clear
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Reference Horizon
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, h * 0.45);
    ctx.lineTo(w, h * 0.45);
    ctx.stroke();

    // Render all fences
    fences.forEach(fence => {
      if (fence.points.length === 0) return;
      const isSelected = fence.id === activeFence?.id;

      ctx.beginPath();
      fence.points.forEach((pt, idx) => {
        const px = (pt.x / 100) * w;
        const py = (pt.y / 100) * h;
        if (idx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });

      if (fence.type === 'restricted_zone') {
        ctx.closePath();
        ctx.fillStyle = isSelected ? 'rgba(245, 158, 11, 0.25)' : 'rgba(245, 158, 11, 0.1)';
        ctx.fill();
        ctx.strokeStyle = isSelected ? '#f59e0b' : 'rgba(245, 158, 11, 0.6)';
        ctx.lineWidth = isSelected ? 3 : 2;
        ctx.setLineDash([8, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      } else {
        ctx.strokeStyle = isSelected ? '#ef4444' : 'rgba(239, 68, 68, 0.6)';
        ctx.lineWidth = isSelected ? 3.5 : 2;
        ctx.shadowColor = isSelected ? 'rgba(239, 68, 68, 0.8)' : 'transparent';
        ctx.shadowBlur = 8;
        ctx.stroke();
      }

      // Draw point control handles
      fence.points.forEach((pt, idx) => {
        const px = (pt.x / 100) * w;
        const py = (pt.y / 100) * h;
        ctx.fillStyle = isSelected ? '#ffffff' : '#94a3b8';
        ctx.beginPath();
        ctx.arc(px, py, isSelected ? 5 : 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.stroke();
      });
    });
  }, [fences, activeFence]);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-4xl w-full flex flex-col overflow-hidden shadow-2xl font-mono-code text-xs">
        {/* Header */}
        <div className="bg-slate-950 px-5 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-slate-100 text-sm">
              CALIBRATE VIRTUAL FENCE BOUNDARY: {camera.code}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col md:flex-row gap-4">
          {/* Canvas Interactive calibration surface */}
          <div className="flex-1 flex flex-col gap-2">
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden border border-slate-700">
              <canvas
                ref={canvasRef}
                width={800}
                height={450}
                onClick={handleCanvasClick}
                className="w-full h-full block cursor-crosshair"
              />
              <div className="absolute top-2 left-2 bg-slate-900/80 px-2.5 py-1 rounded text-[11px] text-slate-300 border border-slate-800">
                Click canvas to place boundary coordinate points
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Points Placed: {activeFence?.points.length || 0}</span>
              <button
                onClick={handleResetPoints}
                className="flex items-center gap-1 text-red-400 hover:text-red-300"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Points</span>
              </button>
            </div>
          </div>

          {/* Fence Configuration Controls */}
          <div className="w-full md:w-72 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-300">FENCES & ZONES</span>
              <button
                onClick={handleAddNewFence}
                className="flex items-center gap-1 px-2 py-1 rounded bg-amber-500 text-slate-950 font-bold text-[10px]"
              >
                <Plus className="w-3 h-3" />
                <span>Add Zone</span>
              </button>
            </div>

            <div className="space-y-1 max-h-36 overflow-y-auto">
              {fences.map(f => (
                <div
                  key={f.id}
                  onClick={() => setSelectedFenceId(f.id)}
                  className={`p-2 rounded border cursor-pointer flex items-center justify-between ${
                    f.id === activeFence?.id ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold' : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <span className="truncate">{f.name}</span>
                  {fences.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFence(f.id);
                      }}
                      className="text-slate-500 hover:text-red-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {activeFence && (
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2.5">
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">BOUNDARY NAME</label>
                  <input
                    type="text"
                    value={activeFence.name}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFences(prev => prev.map(f => f.id === activeFence.id ? { ...f, name: val } : f));
                    }}
                    className="w-full p-1.5 rounded bg-slate-900 border border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">BOUNDARY TYPE</label>
                  <select
                    value={activeFence.type}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      setFences(prev => prev.map(f => f.id === activeFence.id ? { ...f, type: val } : f));
                    }}
                    className="w-full p-1.5 rounded bg-slate-900 border border-slate-700 text-white"
                  >
                    <option value="tripwire">Laser Tripwire (Crossing detection)</option>
                    <option value="restricted_zone">Restricted Zone Polygon (Containment)</option>
                    <option value="zero_line_buffer">Zero-Line Border Strip</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">DIRECTIONALITY</label>
                  <select
                    value={activeFence.direction}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      setFences(prev => prev.map(f => f.id === activeFence.id ? { ...f, direction: val } : f));
                    }}
                    className="w-full p-1.5 rounded bg-slate-900 border border-slate-700 text-white"
                  >
                    <option value="inbound">Inbound (Crossing into territory)</option>
                    <option value="outbound">Outbound (Crossing outward)</option>
                    <option value="both">Bidirectional Crossing</option>
                  </select>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <span className="text-[11px] text-slate-300">Armed Alarm Trigger</span>
                  <input
                    type="checkbox"
                    checked={activeFence.alertOnCrossing}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setFences(prev => prev.map(f => f.id === activeFence.id ? { ...f, alertOnCrossing: checked } : f));
                    }}
                    className="rounded accent-amber-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-5 py-3 border-t border-slate-800 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Apply Calibration</span>
          </button>
        </div>
      </div>
    </div>
  );
};
