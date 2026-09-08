import React, { useState } from 'react';
import { Camera, VisionFilterMode } from '../types';
import { CameraStream } from './CameraStream';
import { 
  Grid2X2, 
  Square, 
  LayoutGrid, 
  Filter, 
  Search, 
  ChevronRight, 
  Sliders, 
  Camera as CamIcon,
  ShieldAlert,
  Flame,
  Moon,
  Move
} from 'lucide-react';

interface CameraGridProps {
  cameras: Camera[];
  selectedCameraId: string;
  onSelectCamera: (camId: string) => void;
  onCaptureSnapshot: (dataUrl: string, camera: Camera) => void;
  onOpenFenceEditor: (camera: Camera) => void;
}

export const CameraGrid: React.FC<CameraGridProps> = ({
  cameras,
  selectedCameraId,
  onSelectCamera,
  onCaptureSnapshot,
  onOpenFenceEditor,
}) => {
  const [layoutMode, setLayoutMode] = useState<'1x1' | '2x2' | 'all'>('2x2');
  const [filterType, setFilterType] = useState<'all' | 'ptz' | 'thermal_ir' | 'fixed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cameraFilterModes, setCameraFilterModes] = useState<Record<string, VisionFilterMode>>({
    'cam-bop-02': 'thermal_white_hot',
    'cam-ck-03': 'night',
  });

  const handleFilterModeChange = (camId: string, mode: VisionFilterMode) => {
    setCameraFilterModes(prev => ({
      ...prev,
      [camId]: mode
    }));
  };

  const filteredCameras = cameras.filter(cam => {
    const matchesSearch = cam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          cam.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          cam.bopName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' ? true : cam.type === filterType;
    return matchesSearch && matchesType;
  });

  const selectedCamera = cameras.find(c => c.id === selectedCameraId) || cameras[0];

  return (
    <div className="flex flex-col lg:flex-row gap-3 h-full">
      {/* Left Sidebar: Camera Tree & Controls */}
      <div className="w-full lg:w-72 shrink-0 flex flex-col gap-3 bg-slate-900/60 border border-slate-800 rounded-lg p-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search BOP, Camera, Code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/60"
          />
        </div>

        {/* Type Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] font-mono-code">
          <button
            onClick={() => setFilterType('all')}
            className={`px-2 py-1 rounded transition-colors whitespace-nowrap ${filterType === 'all' ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300 font-semibold' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}
          >
            ALL ({cameras.length})
          </button>
          <button
            onClick={() => setFilterType('ptz')}
            className={`px-2 py-1 rounded transition-colors whitespace-nowrap ${filterType === 'ptz' ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300 font-semibold' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}
          >
            PTZ
          </button>
          <button
            onClick={() => setFilterType('thermal_ir')}
            className={`px-2 py-1 rounded transition-colors whitespace-nowrap ${filterType === 'thermal_ir' ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300 font-semibold' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}
          >
            THERMAL
          </button>
        </div>

        {/* Camera List Tree */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-[340px] lg:max-h-[520px]">
          {filteredCameras.map((cam) => {
            const isSelected = cam.id === selectedCameraId;
            const hasDetections = (cam.activeDetections?.length || 0) > 0;
            const isThermal = cam.type === 'thermal_ir';
            const isPtz = cam.type === 'ptz';

            return (
              <div
                key={cam.id}
                onClick={() => onSelectCamera(cam.id)}
                className={`p-2 rounded-md border cursor-pointer transition-all flex items-start justify-between gap-2 text-xs ${
                  isSelected
                    ? 'bg-amber-500/10 border-amber-500/60 text-slate-100 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-900/50'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${cam.status === 'online' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                    <span className="font-mono-code font-bold truncate text-slate-200">
                      {cam.code}
                    </span>
                    {isThermal && <Flame className="w-3 h-3 text-orange-400 shrink-0" />}
                    {isPtz && <Move className="w-3 h-3 text-cyan-400 shrink-0" />}
                  </div>

                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {cam.name}
                  </p>

                  <div className="flex items-center gap-2 mt-1 text-[10px] font-mono-code text-slate-500">
                    <span>{cam.resolution.split(' ')[0]}</span>
                    <span>•</span>
                    <span>{cam.fps} FPS</span>
                    {hasDetections && (
                      <span className="text-amber-400 font-bold ml-auto flex items-center gap-1">
                        <ShieldAlert className="w-2.5 h-2.5" />
                        {cam.activeDetections.length} TARGETS
                      </span>
                    )}
                  </div>
                </div>

                <ChevronRight className={`w-4 h-4 mt-1 transition-transform ${isSelected ? 'text-amber-400 translate-x-0.5' : 'text-slate-600'}`} />
              </div>
            );
          })}
        </div>

        {/* Selected Camera Action Bar */}
        {selectedCamera && (
          <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-md text-xs font-mono-code">
            <div className="text-[10px] text-slate-500 uppercase">Selected Channel</div>
            <div className="text-amber-300 font-bold truncate">{selectedCamera.name}</div>
            <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-800/80">
              <button
                onClick={() => onOpenFenceEditor(selectedCamera)}
                className="flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] transition-colors"
                title="Configure Virtual Fence and Geofence Boundary for this Camera"
              >
                <Sliders className="w-3 h-3 text-amber-400" />
                <span>Calibrate V-Fence</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Center/Right: Video Matrix Viewport */}
      <div className="flex-1 flex flex-col gap-2 min-w-0">
        {/* Top Viewport Controls */}
        <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-1.5">
          <div className="flex items-center gap-3 text-xs font-mono-code">
            <span className="text-slate-400 font-semibold uppercase">MONITORING MATRIX:</span>
            <span className="text-amber-300 font-bold">
              {layoutMode === '1x1' ? `FOCUS: ${selectedCamera.code}` : `${filteredCameras.length} CHANNELS ONLINE`}
            </span>
          </div>

          {/* Grid Layout Switcher */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded border border-slate-800">
            <button
              onClick={() => setLayoutMode('1x1')}
              className={`p-1.5 rounded transition-colors ${layoutMode === '1x1' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
              title="Single Focused Feed (1x1)"
            >
              <Square className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setLayoutMode('2x2')}
              className={`p-1.5 rounded transition-colors ${layoutMode === '2x2' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
              title="Quad Grid View (2x2)"
            >
              <Grid2X2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setLayoutMode('all')}
              className={`p-1.5 rounded transition-colors ${layoutMode === 'all' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
              title="All Cameras Grid"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Video Canvas Container */}
        <div className="flex-1 min-h-0">
          {layoutMode === '1x1' ? (
            /* Single Camera Focus */
            <div className="h-full">
              <CameraStream
                camera={selectedCamera}
                isFocused={true}
                filterMode={cameraFilterModes[selectedCamera.id] || 'day'}
                onFilterModeChange={(m) => handleFilterModeChange(selectedCamera.id, m)}
                onCaptureSnapshot={onCaptureSnapshot}
              />
            </div>
          ) : layoutMode === '2x2' ? (
            /* 2x2 Quad Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {filteredCameras.slice(0, 4).map((cam) => (
                <div 
                  key={cam.id}
                  onClick={() => onSelectCamera(cam.id)}
                  className="cursor-pointer"
                >
                  <CameraStream
                    camera={cam}
                    isFocused={cam.id === selectedCameraId}
                    filterMode={cameraFilterModes[cam.id] || 'day'}
                    onFilterModeChange={(m) => handleFilterModeChange(cam.id, m)}
                    onCaptureSnapshot={onCaptureSnapshot}
                  />
                </div>
              ))}
            </div>
          ) : (
            /* All Cameras Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5">
              {filteredCameras.map((cam) => (
                <div 
                  key={cam.id}
                  onClick={() => onSelectCamera(cam.id)}
                  className="cursor-pointer"
                >
                  <CameraStream
                    camera={cam}
                    isFocused={cam.id === selectedCameraId}
                    filterMode={cameraFilterModes[cam.id] || 'day'}
                    onFilterModeChange={(m) => handleFilterModeChange(cam.id, m)}
                    onCaptureSnapshot={onCaptureSnapshot}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
