import React, { useState } from 'react';
import { Camera, SecurityAlert, VisionFilterMode } from '../types';
import { CameraStream } from './CameraStream';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Grid2X2, 
  Square, 
  LayoutGrid, 
  ChevronRight, 
  Camera as CamIcon,
  ShieldAlert,
  Flame,
  Move,
  Info,
  AlertTriangle,
  Zap,
  Activity,
  Server,
  Eye,
  Video
} from 'lucide-react';

interface CameraGridProps {
  cameras: Camera[];
  alerts: SecurityAlert[];
  selectedCameraId: string;
  layoutMode: '1x1' | '2x2' | 'all';
  onLayoutModeChange: (mode: '1x1' | '2x2' | 'all') => void;
  onSelectCamera: (camId: string) => void;
  onCaptureSnapshot: (dataUrl: string, camera: Camera) => void;
  onOpenFenceEditor: (camera: Camera) => void;
  onSaveRecording?: (camera: Camera, durationSecs: number) => void;
}

export const CameraGrid: React.FC<CameraGridProps> = ({
  cameras,
  alerts,
  selectedCameraId,
  layoutMode,
  onLayoutModeChange,
  onSelectCamera,
  onCaptureSnapshot,
  onOpenFenceEditor,
  onSaveRecording,
}) => {
  const [cameraFilterModes, setCameraFilterModes] = useState<Record<string, VisionFilterMode>>({});
  
  // Recording State
  const [recordingCameraId, setRecordingCameraId] = useState<string | null>(null);
  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null);

  const handleToggleRecording = () => {
    if (recordingCameraId === selectedCameraId) {
      // Stop recording
      if (onSaveRecording && recordingStartTime) {
        const duration = Math.round((Date.now() - recordingStartTime) / 1000);
        onSaveRecording(selectedCamera, duration);
      }
      setRecordingCameraId(null);
      setRecordingStartTime(null);
    } else {
      // Start recording
      setRecordingCameraId(selectedCameraId);
      setRecordingStartTime(Date.now());
    }
  };

  const handleFilterModeChange = (camId: string, mode: VisionFilterMode) => {
    setCameraFilterModes(prev => ({
      ...prev,
      [camId]: mode
    }));
  };

  const selectedCamera = cameras.find(c => c.id === selectedCameraId) || cameras[0];

  const displayedCameras = layoutMode === '1x1' 
    ? [selectedCamera]
    : layoutMode === '2x2' 
      ? cameras.slice(0, 4)
      : cameras;

  const gridClass = layoutMode === '1x1' 
    ? 'grid-cols-1' 
    : layoutMode === '2x2' 
      ? 'grid-cols-1 md:grid-cols-2'
      : 'grid-cols-2 xl:grid-cols-4 auto-rows-fr';

  return (
    <div className="flex flex-col h-full bg-slate-950 p-2 gap-2">
      <div className="flex flex-1 min-h-0 gap-2">
        {/* LEFT PANEL - Camera List */}
        <div className="w-64 shrink-0 flex flex-col bg-slate-900 border border-slate-800 rounded-lg">
          <div className="p-3 border-b border-slate-800 bg-slate-900/80 rounded-t-lg">
            <h2 className="text-xs font-bold font-mono-code text-slate-300 uppercase tracking-widest flex items-center gap-2">
              <CamIcon className="w-3.5 h-3.5 text-slate-400" />
              Camera Feeds
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {cameras.map((cam) => {
              const isSelected = cam.id === selectedCameraId;
              const isWarning = cam.status === 'warning';
              
              return (
                <div
                  key={cam.id}
                  onClick={() => onSelectCamera(cam.id)}
                  className={`p-2 rounded border cursor-pointer transition-colors flex items-center justify-between group ${
                    isSelected
                      ? 'bg-emerald-900/20 border-emerald-500/50 text-slate-100 shadow-inner'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-600 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full shadow-sm ${
                        isWarning ? 'bg-amber-400 shadow-amber-400/50 animate-pulse' : 'bg-emerald-400 shadow-emerald-400/50'
                      }`} />
                      <span className={`font-mono-code font-bold text-xs ${isSelected ? 'text-emerald-400' : 'text-slate-300'}`}>
                        {cam.code}
                      </span>
                    </div>
                    <span className="text-[10px] truncate mt-1 text-slate-500 group-hover:text-slate-400 transition-colors">
                      {cam.name}
                    </span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'text-emerald-400 translate-x-0.5' : 'text-slate-600'}`} />
                </div>
              );
            })}
          </div>
        </div>

        {/* CENTER - Video Matrix */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-900 border border-slate-800 rounded-lg overflow-hidden relative">
          <div className="absolute top-0 inset-x-0 h-10 bg-gradient-to-b from-black/60 to-transparent z-10 pointer-events-none"></div>
          
          <div className="flex-1 p-1 bg-black overflow-hidden flex flex-col">
            <div className={`grid gap-1 flex-1 ${gridClass}`}>
              <AnimatePresence mode="popLayout">
                {displayedCameras.map((cam) => (
                  <motion.div
                    key={cam.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, type: 'spring', bounce: 0.15 }}
                    onClick={() => onSelectCamera(cam.id)}
                    className="h-full min-h-[200px]"
                  >
                    <CameraStream
                      camera={cam}
                      isFocused={cam.id === selectedCameraId}
                      isRecording={recordingCameraId === cam.id}
                      filterMode={cameraFilterModes[cam.id] || 'day'}
                      onFilterModeChange={(m) => handleFilterModeChange(cam.id, m)}
                      onCaptureSnapshot={onCaptureSnapshot}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
          
          <div className="absolute top-2 right-2 z-10 flex items-center gap-2">
            <button
              onClick={handleToggleRecording}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-bold font-mono-code transition-colors border backdrop-blur-sm shadow-lg ${
                recordingCameraId === selectedCameraId
                  ? 'bg-red-500/20 text-red-400 border-red-500/50 hover:bg-red-500/30 shadow-red-500/20'
                  : 'bg-black/60 text-slate-300 border-slate-700/50 hover:text-white hover:bg-black/80'
              }`}
            >
              {recordingCameraId === selectedCameraId ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                  STOP REC
                </>
              ) : (
                <>
                  <Video className="w-3.5 h-3.5" />
                  START REC
                </>
              )}
            </button>
            <div className="flex items-center gap-1 bg-black/60 backdrop-blur-sm p-1 rounded border border-slate-700/50">
              <button
                onClick={() => onLayoutModeChange('1x1')}
                className={`p-1.5 rounded transition-colors ${layoutMode === '1x1' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <Square className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onLayoutModeChange('2x2')}
                className={`p-1.5 rounded transition-colors ${layoutMode === '2x2' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <Grid2X2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onLayoutModeChange('all')}
                className={`p-1.5 rounded transition-colors ${layoutMode === 'all' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - Alerts */}
        <div className="w-72 shrink-0 flex flex-col bg-slate-900 border border-slate-800 rounded-lg">
          <div className="p-3 border-b border-slate-800 bg-slate-900/80 rounded-t-lg flex items-center justify-between">
            <h2 className="text-xs font-bold font-mono-code text-slate-300 uppercase tracking-widest flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Real-Time Events
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {alerts.slice(0, 10).map((alert) => {
              const isCritical = alert.severity === 'CRITICAL';
              const isWarning = alert.severity === 'WARNING';
              
              return (
                <div key={alert.id} className="p-2.5 rounded bg-slate-950 border border-slate-800 flex flex-col gap-1.5 font-mono-code">
                  <div className="text-[10px] text-slate-500">
                    {alert.timestamp} — {alert.bopName}
                  </div>
                  <div className="flex items-start gap-2">
                    {isCritical ? (
                      <span className="px-1.5 py-0.5 rounded-sm bg-red-950 text-red-400 border border-red-900/50 text-[9px] font-bold mt-0.5">CRITICAL</span>
                    ) : isWarning ? (
                      <span className="px-1.5 py-0.5 rounded-sm bg-amber-950 text-amber-400 border border-amber-900/50 text-[9px] font-bold mt-0.5">WARNING</span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded-sm bg-slate-800 text-slate-300 border border-slate-700/50 text-[9px] font-bold mt-0.5">INFO</span>
                    )}
                    <div className="text-xs text-slate-200 font-semibold leading-tight">
                      {alert.detectedObject}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* BOTTOM STATUS BAR */}
      <div className="h-8 shrink-0 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between px-4 font-mono-code text-[10px] font-bold tracking-wider text-slate-400">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <CamIcon className="w-3.5 h-3.5 text-slate-500" />
            <span>CAMERAS ONLINE: <span className="text-emerald-400">8/8</span></span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-3.5 h-3.5 text-slate-500" />
            <span>ACTIVE ALERTS: <span className="text-amber-400">03</span></span>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>OBJECTS TRACKED: <span className="text-emerald-400">17</span></span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Server className="w-3.5 h-3.5 text-slate-500" />
            <span>NETWORK: <span className="text-emerald-400">CONNECTED</span></span>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-slate-500" />
            <span>AI ENGINE: <span className="text-emerald-400">RUNNING</span></span>
          </div>
          <div className="flex items-center gap-2">
            <Video className={`w-3.5 h-3.5 ${recordingCameraId ? 'text-red-500 animate-pulse' : 'text-slate-500'}`} />
            <span className="text-slate-300">RECORDING: <span className={recordingCameraId ? 'text-red-500' : 'text-slate-500'}>{recordingCameraId ? 'ACTIVE' : 'IDLE'}</span></span>
          </div>
        </div>
      </div>
    </div>
  );
};
