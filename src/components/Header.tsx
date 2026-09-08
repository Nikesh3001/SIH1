import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Radio, 
  Volume2, 
  VolumeX, 
  BellRing, 
  Camera as CameraIcon, 
  Map, 
  Car, 
  FileText, 
  Activity, 
  Code2, 
  AlertTriangle,
  Zap
} from 'lucide-react';
import { tacticalAudio } from '../utils/audio';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeAlertCount: number;
  criticalCount: number;
  onSimulateIncident: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  activeAlertCount,
  criticalCount,
  onSimulateIncident,
}) => {
  const [isMuted, setIsMuted] = useState(tacticalAudio.isMuted);
  const [timeStr, setTimeStr] = useState('');
  const [utcStr, setUtcStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-US', { hour12: false }));
      setUtcStr(now.toISOString().slice(11, 19) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleMute = () => {
    tacticalAudio.isMuted = !tacticalAudio.isMuted;
    setIsMuted(tacticalAudio.isMuted);
    if (!tacticalAudio.isMuted) {
      tacticalAudio.playRadioChirp();
    }
  };

  const navItems = [
    { id: 'live', label: 'Live Feeds & C2', icon: CameraIcon },
    { id: 'map', label: 'Tactical GIS Map', icon: Map },
    { id: 'anpr_frs', label: 'ANPR & Face Intel', icon: Car },
    { id: 'evidence', label: 'Evidence & Audit', icon: FileText },
    { id: 'health', label: 'Edge Telemetry', icon: Activity },
    { id: 'architecture', label: 'Architecture & Repos', icon: Code2 },
  ];

  return (
    <header className="bg-slate-950 border-b border-slate-800/80 sticky top-0 z-40 select-none">
      {/* Top Banner Status Bar */}
      <div className="bg-slate-900/90 border-b border-slate-800/60 px-4 py-1.5 flex flex-wrap items-center justify-between text-xs font-mono-code text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold tracking-wider">NETWORK: SECURE (EDGE INGESTION ACTIVE)</span>
          </div>

          <span className="hidden md:inline text-slate-600">|</span>

          <div className="hidden sm:flex items-center gap-2">
            <span className="text-slate-400">DEFCON:</span>
            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40 text-[11px]">
              LEVEL 2 - ELEVATED BORDER VIGILANCE
            </span>
          </div>

          <span className="hidden lg:inline text-slate-600">|</span>

          <div className="hidden lg:flex items-center gap-2 text-slate-400">
            <span>RTSP GATEWAY:</span>
            <span className="text-emerald-400">6/6 STREAMS SYNCED</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="text-slate-500">TACTICAL TIME:</span>
            <span className="text-amber-400 font-bold tracking-wider">{timeStr}</span>
            <span className="text-slate-500 text-[10px]">({utcStr})</span>
          </div>

          <button
            onClick={toggleMute}
            className={`flex items-center gap-1 px-2 py-0.5 rounded border text-[11px] transition-colors ${
              isMuted 
                ? 'bg-red-950/40 border-red-800/60 text-red-300 hover:bg-red-900/50' 
                : 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300 hover:bg-emerald-900/50'
            }`}
            title={isMuted ? 'Unmute tactical alert siren' : 'Mute tactical alert siren'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 animate-pulse" />}
            <span>{isMuted ? 'AUDIO MUTED' : 'AUDIO ON'}</span>
          </button>
        </div>
      </div>

      {/* Main Command Bar */}
      <div className="px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <div className="relative p-2 rounded-lg bg-gradient-to-br from-slate-900 via-slate-800 to-amber-950/40 border border-amber-500/30 shadow-lg shadow-amber-500/5">
            <Shield className="w-6 h-6 text-amber-400" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold font-display tracking-wider text-slate-100 uppercase">
                IBVAP <span className="text-amber-400 font-mono-code font-normal text-sm">v3.4-PRO</span>
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono-code bg-blue-900/30 text-blue-300 border border-blue-700/50 uppercase">
                Software-Defined AI CCTV
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans truncate max-w-sm md:max-w-md">
              Intelligent Border Video Analytics Platform • Multi-Sector Command
            </p>
          </div>
        </div>

        {/* Quick Simulation & Alert Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onSimulateIncident}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-mono-code transition-all shadow-sm active:scale-95"
            title="Inject simulated border intrusion incident into the AI pipeline"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
            <span className="font-semibold">Simulate Intrusion</span>
          </button>

          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <div 
              onClick={() => setActiveTab('live')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md cursor-pointer border transition-all ${
                criticalCount > 0 
                  ? 'bg-red-500/20 border-red-500 text-red-300 shadow-md shadow-red-500/20 animate-pulse'
                  : 'bg-slate-900 border-slate-700 text-slate-300'
              }`}
            >
              <BellRing className={`w-4 h-4 ${criticalCount > 0 ? 'text-red-400' : 'text-slate-400'}`} />
              <div className="text-xs font-mono-code">
                <span className="font-bold text-sm text-red-400">{activeAlertCount}</span>
                <span className="text-slate-400 ml-1 text-[11px]">ALERTS</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="px-4 flex items-center gap-1 overflow-x-auto border-t border-slate-800/80 bg-slate-950/80 scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium whitespace-nowrap transition-all border-b-2 relative ${
                isActive
                  ? 'border-amber-400 text-amber-300 bg-amber-500/5 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
              <span>{item.label}</span>
              {item.id === 'live' && criticalCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping ml-0.5"></span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
