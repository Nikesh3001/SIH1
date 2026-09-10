import React, { useState } from 'react';
import { Camera, StreamMode } from '../types';
import { TACTICAL_VIDEO_FEEDS } from '../data/videoStreams';
import { 
  X, 
  Video, 
  Camera as CamIcon, 
  Activity, 
  Link, 
  Check, 
  Play, 
  ShieldAlert, 
  Sliders, 
  Radio, 
  Volume2, 
  ExternalLink,
  Sparkles,
  RefreshCw
} from 'lucide-react';

interface StreamSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  camera: Camera;
  onUpdateCameraStream?: (cameraId: string, mode: StreamMode, streamUrl?: string) => void;
  onSaveStream?: (mode: StreamMode, streamUrl?: string) => void;
  currentMode?: StreamMode;
}

const CURATED_PUBLIC_STREAMS = [
  {
    name: 'Akamai Live HLS Multi-Bitrate Stream',
    url: 'https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8',
    format: 'HLS (.m3u8)',
    badge: 'Live HLS'
  },
  {
    name: 'Tactical Gate Traffic 1080p Loop',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    format: 'MP4 / RTSP',
    badge: 'Tactical HD'
  },
  {
    name: 'Border Roadway Highway ANPR Stream',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    format: 'MP4 / RTSP',
    badge: 'Vehicle Cam'
  },
  {
    name: 'Tethered UAV High-Altitude Recon',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    format: 'MP4 / RTSP',
    badge: 'UAV Sensor'
  },
  {
    name: 'Perimeter Observation Mast 360 Sweep',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    format: 'MP4 / RTSP',
    badge: 'Panoramic'
  }
];

export const StreamSourceModal: React.FC<StreamSourceModalProps> = ({
  isOpen,
  onClose,
  camera,
  onUpdateCameraStream,
  onSaveStream,
  currentMode
}) => {
  if (!isOpen) return null;

  const [selectedMode, setSelectedMode] = useState<StreamMode>(currentMode || camera.streamMode || 'video');
  const [customUrl, setCustomUrl] = useState<string>(camera.videoStreamUrl || camera.rtspUrl || '');
  const [previewTestActive, setPreviewTestActive] = useState(false);
  const [sensitivity, setSensitivity] = useState(25);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const handleApply = () => {
    const streamUrlClean = customUrl.trim() || undefined;
    if (typeof onUpdateCameraStream === 'function') {
      onUpdateCameraStream(camera.id, selectedMode, streamUrlClean);
    }
    if (typeof onSaveStream === 'function') {
      onSaveStream(selectedMode, streamUrlClean);
    }
    onClose();
  };

  const handleSelectPreset = (url: string) => {
    setCustomUrl(url);
    setSelectedMode('video');
    setPreviewTestActive(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-2xl bg-slate-950 border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden flex flex-col font-sans max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-500/20 text-sky-400 rounded-lg border border-sky-500/30">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Configure Live Stream Source
                <span className="text-xs px-2 py-0.5 bg-slate-800 text-sky-400 rounded border border-slate-700 font-mono-code">
                  {camera.code}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {camera.name} • {camera.sector} Sector
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1 text-sm text-slate-300">
          {/* Stream Type Tabs */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
              Select Input Stream Feed
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Option 3: Webcam with CV */}
              <button
                type="button"
                onClick={() => setSelectedMode('webcam')}
                className={`p-3.5 rounded-lg border text-left flex flex-col justify-between transition-all ${
                  selectedMode === 'webcam'
                    ? 'bg-purple-950/40 border-purple-500 text-white shadow-lg shadow-purple-500/10 ring-1 ring-purple-500'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-1.5 bg-purple-500/20 rounded text-purple-400">
                    <CamIcon className="w-4 h-4" />
                  </div>
                  {selectedMode === 'webcam' && <Check className="w-4 h-4 text-purple-400" />}
                </div>
                <div>
                  <div className="font-bold text-sm text-purple-200">Option 3: Webcam</div>
                  <div className="text-[11px] text-slate-400 mt-1 leading-tight">
                    Real physical camera with browser optical flow & tripwire breach CV
                  </div>
                </div>
              </button>

              {/* Option 2: Live Video Feed / HLS */}
              <button
                type="button"
                onClick={() => setSelectedMode('video')}
                className={`p-3.5 rounded-lg border text-left flex flex-col justify-between transition-all ${
                  selectedMode === 'video'
                    ? 'bg-sky-950/40 border-sky-500 text-white shadow-lg shadow-sky-500/10 ring-1 ring-sky-500'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-1.5 bg-sky-500/20 rounded text-sky-400">
                    <Video className="w-4 h-4" />
                  </div>
                  {selectedMode === 'video' && <Check className="w-4 h-4 text-sky-400" />}
                </div>
                <div>
                  <div className="font-bold text-sm text-sky-200">Option 2: Video / HLS</div>
                  <div className="text-[11px] text-slate-400 mt-1 leading-tight">
                    Pre-recorded or live HLS (.m3u8) / MP4 tactical streaming loops
                  </div>
                </div>
              </button>

              {/* Option 1: AI Simulation */}
              <button
                type="button"
                onClick={() => setSelectedMode('simulated')}
                className={`p-3.5 rounded-lg border text-left flex flex-col justify-between transition-all ${
                  selectedMode === 'simulated'
                    ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-1.5 bg-emerald-500/20 rounded text-emerald-400">
                    <Activity className="w-4 h-4" />
                  </div>
                  {selectedMode === 'simulated' && <Check className="w-4 h-4 text-emerald-400" />}
                </div>
                <div>
                  <div className="font-bold text-sm text-emerald-200">Option 1: AI Sim</div>
                  <div className="text-[11px] text-slate-400 mt-1 leading-tight">
                    Autonomous multi-target ByteTrack physics & tactical patrol agents
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Webcam Optical Computer Vision Settings (When Option 3 is active) */}
          {selectedMode === 'webcam' && (
            <div className="p-4 bg-purple-950/20 border border-purple-900/50 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-purple-300 font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Option 3: Real-Time Optical Computer Vision Features</span>
                </div>
                <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded text-[10px] font-mono-code font-bold">
                  ACTIVE CV
                </span>
              </div>
              <p className="text-xs text-slate-400">
                The optical motion engine captures frames directly from your webcam, detects bodily movement, computes physical velocity vectors, and fires acoustic alarms when you cross on-screen virtual tripwires.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-2.5 bg-slate-900/80 rounded border border-slate-800">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-300 font-medium">Motion Sensitivity</span>
                    <span className="text-purple-400 font-mono-code font-bold">{sensitivity < 20 ? 'High' : sensitivity < 35 ? 'Balanced' : 'Low'}</span>
                  </div>
                  <input
                    type="range"
                    min={15}
                    max={45}
                    value={sensitivity}
                    onChange={(e) => setSensitivity(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                </div>
                <div className="p-2.5 bg-slate-900/80 rounded border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-300 font-medium">Tactical Siren Chime</div>
                    <div className="text-[10px] text-slate-400">Synthesizer audio ping on tripwire cross</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`p-1.5 rounded border transition-colors ${
                      soundEnabled ? 'bg-purple-500/20 border-purple-500 text-purple-300' : 'bg-slate-800 border-slate-700 text-slate-500'
                    }`}
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Custom Stream URL / Presets (When Option 2 or Custom is selected) */}
          {selectedMode === 'video' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Stream Endpoint URL (HLS .m3u8, RTSP Proxy, or MP4)
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value)}
                      placeholder="https://example.com/live/stream.m3u8"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono-code text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  {customUrl && (
                    <button
                      type="button"
                      onClick={() => setPreviewTestActive(!previewTestActive)}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
                    >
                      <Play className="w-3.5 h-3.5 text-sky-400" />
                      <span>{previewTestActive ? 'Hide Test' : 'Test Stream'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Stream Preview Player if Testing */}
              {previewTestActive && customUrl && (
                <div className="p-2 bg-black rounded-lg border border-slate-700 aspect-video relative overflow-hidden flex items-center justify-center">
                  <video
                    src={customUrl}
                    controls
                    autoPlay
                    muted
                    className="w-full h-full object-contain"
                  />
                </div>
              )}

              {/* Curated Public Feeds */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Or Select a Public Verified Surveillance Stream
                </label>
                <div className="space-y-1.5">
                  {CURATED_PUBLIC_STREAMS.map((preset, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectPreset(preset.url)}
                      className={`p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition-colors ${
                        customUrl === preset.url
                          ? 'bg-sky-950/40 border-sky-500 text-sky-200'
                          : 'bg-slate-900/50 border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Play className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                        <span className="text-xs font-medium truncate">{preset.name}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono-code">
                          {preset.badge}
                        </span>
                        {customUrl === preset.url && (
                          <Check className="w-3.5 h-3.5 text-sky-400" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Target Feed: <strong className="text-white font-mono-code">{camera.code}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-4 py-1.5 text-xs font-bold text-slate-950 bg-sky-400 hover:bg-sky-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-md shadow-sky-500/20"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply Stream Source</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
