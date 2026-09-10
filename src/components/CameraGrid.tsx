import React, { useState } from 'react';
import { Camera, SecurityAlert, VisionFilterMode, StreamMode, VirtualFence } from '../types';
import { CameraStream } from './CameraStream';
import { StreamSourceModal } from './StreamSourceModal';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Grid2X2, 
  Square, 
  LayoutGrid, 
  ChevronRight, 
  Camera as CamIcon,
  ShieldAlert,
  Move,
  Zap,
  Server,
  Eye,
  Video,
  Play,
  Link,
  Sliders,
  Maximize2,
  Compass,
  ChevronUp,
  ChevronDown,
  ChevronLeft
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
  onTripwireBreached?: (camera: Camera, fence: VirtualFence) => void;
  onUpdateCameraStream?: (cameraId: string, mode: StreamMode, streamUrl?: string) => void;
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
  onTripwireBreached,
  onUpdateCameraStream
}) => {
  const [cameraFilterModes, setCameraFilterModes] = useState<Record<string, VisionFilterMode>>({});
  
  // Clean Stream Mode State (Default to 'video' for genuine high-definition surveillance)
  const [globalStreamMode, setGlobalStreamMode] = useState<StreamMode>('video');
  const [cameraStreamModes, setCameraStreamModes] = useState<Record<string, StreamMode>>({});
  const [streamModalCamera, setStreamModalCamera] = useState<Camera | null>(null);

  // Recording State
  const [recordingCameraId, setRecordingCameraId] = useState<string | null>(null);
  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null);

  // Alert filter state
  const [alertFilter, setAlertFilter] = useState<'all' | 'critical'>('all');

  const handleToggleRecording = () => {
    if (recordingCameraId === selectedCameraId) {
      if (onSaveRecording && recordingStartTime) {
        const duration = Math.round((Date.now() - recordingStartTime) / 1000);
        onSaveRecording(selectedCamera, duration);
      }
      setRecordingCameraId(null);
      setRecordingStartTime(null);
    } else {
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

  const handleCameraStreamModeChange = (camId: string, mode: StreamMode) => {
    setCameraStreamModes(prev => ({
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

  const filteredAlerts = alertFilter === 'critical' 
    ? alerts.filter(a => a.severity === 'CRITICAL')
    : alerts;

  return (
    <div className="flex flex-col h-full bg-slate-950 p-2 gap-2 select-none">
      <div className="flex flex-1 min-h-0 gap-2">
        
        {/* ================================================================= */}
        {/* LEFT PANEL - Forward Sector Camera Directory                      */}
        {/* ================================================================= */}
        <div className="w-64 shrink-0 flex flex-col bg-slate-900/90 border border-slate-800 rounded-lg overflow-hidden">
          <div className="p-2.5 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
            <span className="text-[11px] font-bold font-mono-code text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <CamIcon className="w-3.5 h-3.5 text-emerald-400" />
              Sensor Feeds ({cameras.length})
            </span>
            <span className="text-[10px] font-mono-code text-emerald-400 font-bold px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/60">
              8/8 ONLINE
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-1.5 space-y-1">
            {cameras.map((cam) => {
              const isSelected = cam.id === selectedCameraId;
              const hasBreach = alerts.some(a => a.cameraId === cam.id && a.severity === 'CRITICAL');
              
              return (
                <div
                  key={cam.id}
                  onClick={() => onSelectCamera(cam.id)}
                  className={`p-2 rounded border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-slate-800 border-amber-500/80 text-white shadow-sm'
                      : 'bg-slate-950/50 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex flex-col min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${
                        hasBreach 
                          ? 'bg-red-500 animate-pulse' 
                          : 'bg-emerald-400'
                      }`} />
                      <span className={`font-mono-code font-bold text-xs truncate ${isSelected ? 'text-amber-400' : 'text-slate-200'}`}>
                        {cam.code}
                      </span>
                      <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-400 font-mono-code">
                        {cam.type === 'thermal_ir' ? 'FLIR' : '1080p'}
                      </span>
                    </div>
                    <span className="text-[11px] truncate text-slate-400 mt-0.5 font-medium">
                      {cam.name}
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono-code">
                      {cam.bopName} • {cam.sector} Sector
                    </span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-amber-400' : 'text-slate-600'}`} />
                </div>
              );
            })}
          </div>

          {/* Quick Calibration / Fence Tool */}
          <div className="p-2 border-t border-slate-800 bg-slate-900/60">
            <button
              onClick={() => onOpenFenceEditor(selectedCamera)}
              className="w-full py-1.5 px-2 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-mono-code font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>Configure Tripwire Zones</span>
            </button>
          </div>
        </div>

        {/* ================================================================= */}
        {/* CENTER - Video Display Workstation                                */}
        {/* ================================================================= */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
          
          {/* Professional Military Console Bar */}
          <div className="h-10 shrink-0 bg-slate-900 border-b border-slate-800 px-3 flex items-center justify-between font-mono-code text-xs">
            {/* Left: Active Camera Identity */}
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-slate-400 font-bold hidden sm:inline">SECTOR:</span>
              <span className="text-white font-bold truncate">
                {selectedCamera.bopName.toUpperCase()} — {selectedCamera.name.toUpperCase()}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 hidden md:inline">
                {selectedCamera.code}
              </span>
            </div>

            {/* Center: Clean Stream Feed Source Switcher */}
            <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded border border-slate-800 text-[10px]">
              <button
                onClick={() => setGlobalStreamMode('video')}
                className={`px-2.5 py-1 rounded font-bold transition-colors ${
                  globalStreamMode === 'video'
                    ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Continuous 1080p surveillance video stream"
              >
                CCTV FEED (1080p)
              </button>
              <button
                onClick={() => setGlobalStreamMode('webcam')}
                className={`px-2.5 py-1 rounded font-bold transition-colors ${
                  globalStreamMode === 'webcam'
                    ? 'bg-slate-800 text-purple-400 border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Physical USB or onboard webcam sensor"
              >
                LOCAL WEBCAM
              </button>
              <button
                onClick={() => setGlobalStreamMode('simulated')}
                className={`px-2.5 py-1 rounded font-bold transition-colors ${
                  globalStreamMode === 'simulated'
                    ? 'bg-slate-800 text-sky-400 border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Autonomous radar & target simulation"
              >
                RADAR SIM
              </button>
            </div>

            {/* Right: Layout Matrix & Recording Trigger */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleRecording}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold transition-colors border ${
                  recordingCameraId === selectedCameraId
                    ? 'bg-red-500/20 text-red-400 border-red-500/50'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:text-white'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${recordingCameraId === selectedCameraId ? 'bg-red-500 animate-pulse' : 'bg-slate-400'}`} />
                <span>{recordingCameraId === selectedCameraId ? 'RECORDING' : 'RECORD'}</span>
              </button>

              <div className="flex items-center gap-0.5 bg-slate-950 p-0.5 rounded border border-slate-800">
                <button
                  onClick={() => onLayoutModeChange('1x1')}
                  className={`p-1.5 rounded transition-colors ${layoutMode === '1x1' ? 'bg-slate-800 text-amber-400' : 'text-slate-500 hover:text-slate-300'}`}
                  title="Single Focus (1x1)"
                >
                  <Square className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onLayoutModeChange('2x2')}
                  className={`p-1.5 rounded transition-colors ${layoutMode === '2x2' ? 'bg-slate-800 text-amber-400' : 'text-slate-500 hover:text-slate-300'}`}
                  title="Quad Matrix (2x2)"
                >
                  <Grid2X2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onLayoutModeChange('all')}
                  className={`p-1.5 rounded transition-colors ${layoutMode === 'all' ? 'bg-slate-800 text-amber-400' : 'text-slate-500 hover:text-slate-300'}`}
                  title="Multi-Channel (All Feeds)"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Video Feeds Grid (Maximized Viewport, Zero Waste) */}
          <div className="flex-1 p-1 bg-black overflow-hidden flex flex-col">
            <div className={`grid gap-1 flex-1 ${gridClass}`}>
              <AnimatePresence mode="popLayout">
                {displayedCameras.map((cam) => (
                  <motion.div
                    key={cam.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => onSelectCamera(cam.id)}
                    className="h-full min-h-[220px]"
                  >
                    <CameraStream
                      camera={cam}
                      isFocused={cam.id === selectedCameraId}
                      isRecording={recordingCameraId === cam.id}
                      filterMode={cameraFilterModes[cam.id] || (cam.type === 'thermal_ir' ? 'thermal_white_hot' : 'day')}
                      streamMode={cameraStreamModes[cam.id] || globalStreamMode}
                      onFilterModeChange={(m) => handleFilterModeChange(cam.id, m)}
                      onStreamModeChange={(m) => handleCameraStreamModeChange(cam.id, m)}
                      onCaptureSnapshot={onCaptureSnapshot}
                      onConfigureStream={(c) => setStreamModalCamera(c)}
                      onTripwireBreached={onTripwireBreached}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* RIGHT PANEL - Real-Time Tactical Incident Log & PTZ Console       */}
        {/* ================================================================= */}
        <div className="w-72 shrink-0 flex flex-col bg-slate-900/90 border border-slate-800 rounded-lg overflow-hidden">
          {/* Header */}
          <div className="p-2.5 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
            <span className="text-[11px] font-bold font-mono-code text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Incident Telemetry
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setAlertFilter(alertFilter === 'all' ? 'critical' : 'all')}
                className={`text-[9px] px-1.5 py-0.5 rounded font-mono-code transition-colors ${
                  alertFilter === 'critical'
                    ? 'bg-red-950 text-red-400 border border-red-800'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {alertFilter === 'critical' ? 'CRITICAL ONLY' : 'SHOW ALL'}
              </button>
            </div>
          </div>
          
          {/* Incident Feed */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {filteredAlerts.slice(0, 15).map((alert) => {
              const isCritical = alert.severity === 'CRITICAL';
              const isWarning = alert.severity === 'WARNING';
              
              return (
                <div 
                  key={alert.id} 
                  className={`p-2 rounded border text-xs font-mono-code transition-all ${
                    isCritical 
                      ? 'bg-red-950/25 border-red-800/80 text-red-200' 
                      : isWarning
                        ? 'bg-amber-950/20 border-amber-800/70 text-amber-200'
                        : 'bg-slate-950 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span>{alert.timestamp} IST</span>
                    <span className="font-bold text-slate-300">{alert.cameraName}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`px-1 py-0.2 rounded text-[9px] font-bold ${
                      isCritical 
                        ? 'bg-red-900/80 text-red-200' 
                        : isWarning 
                          ? 'bg-amber-900/80 text-amber-200' 
                          : 'bg-slate-800 text-slate-400'
                    }`}>
                      {alert.severity}
                    </span>
                    <span className="font-bold text-slate-100 truncate">
                      {alert.detectedObject}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                    <span>{alert.bopName}</span>
                    <span className="text-slate-500">{(alert.confidence * 100).toFixed(0)}% MATCH</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick PTZ Control Pad for Selected Camera */}
          <div className="p-2.5 border-t border-slate-800 bg-slate-900/90 font-mono-code">
            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-2">
              <span className="font-bold text-slate-300 flex items-center gap-1">
                <Compass className="w-3 h-3 text-amber-400" />
                PTZ GIMBAL: {selectedCamera.code}
              </span>
              <span className="text-emerald-400">ENGAGED</span>
            </div>

            <div className="grid grid-cols-3 gap-1 w-28 mx-auto mb-2">
              <div></div>
              <button className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-center flex justify-center">
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
              <div></div>
              <button className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-center flex justify-center">
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <div className="p-1 rounded bg-slate-950 text-slate-500 text-[9px] flex items-center justify-center font-bold">
                C
              </div>
              <button className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-center flex justify-center">
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <div></div>
              <button className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-center flex justify-center">
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              <div></div>
            </div>

            <div className="grid grid-cols-3 gap-1 text-[9px]">
              <button className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-center font-bold">
                PRESET 1
              </button>
              <button className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-center font-bold">
                PRESET 2
              </button>
              <button className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-center font-bold">
                HOME
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* BOTTOM C4ISR TELEMETRY STATUS BAR                                    */}
      {/* =================================================================== */}
      <div className="h-7 shrink-0 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between px-3 font-mono-code text-[10px] text-slate-400 font-semibold">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-1.5">
            <Server className="w-3 h-3 text-emerald-400" />
            <span>DEF-NET LINK: <span className="text-emerald-400">ENCRYPTED (AES-256)</span></span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5">
            <span>BANDWIDTH: <span className="text-slate-200">38.4 Mbps</span></span>
          </div>
          <div className="hidden md:flex items-center gap-1.5">
            <span>LATENCY: <span className="text-emerald-400">12 ms</span></span>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <div className="flex items-center gap-1.5">
            <Eye className="w-3 h-3 text-slate-400" />
            <span>SECTOR CHANNELS: <span className="text-slate-200">8 ACTIVE</span></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>SYSTEM STATUS: <span className="text-emerald-400">OPERATIONAL</span></span>
          </div>
        </div>
      </div>

      {/* Modal for Custom HLS/RTSP Stream Linking */}
      {streamModalCamera && (
        <StreamSourceModal
          camera={streamModalCamera}
          isOpen={true}
          currentMode={cameraStreamModes[streamModalCamera.id] || globalStreamMode || 'video'}
          onClose={() => setStreamModalCamera(null)}
          onUpdateCameraStream={(cameraId, mode, streamUrl) => {
            setCameraStreamModes(prev => ({ ...prev, [cameraId]: mode }));
            if (onUpdateCameraStream) {
              onUpdateCameraStream(cameraId, mode, streamUrl);
            }
          }}
          onSaveStream={(mode, streamUrl) => {
            setCameraStreamModes(prev => ({ ...prev, [streamModalCamera.id]: mode }));
            if (onUpdateCameraStream) {
              onUpdateCameraStream(streamModalCamera.id, mode, streamUrl);
            }
          }}
        />
      )}
    </div>
  );
};
