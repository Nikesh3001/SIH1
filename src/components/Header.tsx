import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Volume2, 
  VolumeX, 
  Camera as CameraIcon, 
  Map, 
  Car, 
  FileText,
  Zap,
  Radio,
  Lock
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
  const [istTime, setIstTime] = useState('');
  const [utcTime, setUtcTime] = useState('');
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setIstTime(now.toLocaleTimeString('en-US', { hour12: false }));
      setUtcTime(now.toUTCString().slice(17, 25) + ' UTC');
      setDateStr(now.toISOString().slice(0, 10));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleMute = () => {
    tacticalAudio.isMuted = !tacticalAudio.isMuted;
    setIsMuted(tacticalAudio.isMuted);
  };

  const navItems = [
    { id: 'monitoring', label: 'LIVE SURVEILLANCE', icon: CameraIcon },
    { id: 'alerts', label: 'INCIDENT LOG', icon: Shield, badge: activeAlertCount },
    { id: 'map', label: 'TACTICAL GIS MAP', icon: Map },
    { id: 'anpr_frs', label: 'ANPR & VEHICLE DATABASE', icon: Car },
    { id: 'evidence', label: 'FORENSIC EVIDENCE', icon: FileText }
  ];

  return (
    <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-40 select-none">
      {/* Upper Defense Telemetry Banner */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-1.5 flex flex-wrap items-center justify-between text-xs font-mono-code text-slate-300">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white tracking-wider">
                IBMS • INTEGRATED BORDER MANAGEMENT SYSTEM
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700 hidden md:inline">
                SUTLEJ CORPS HQ
              </span>
            </div>
          </div>
          
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span>DEF-NET SECURE (AES-256)</span>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-[11px] text-slate-400">
            <span>SENSORS:</span>
            <span className="text-emerald-400 font-bold">8/8 ONLINE</span>
          </div>
        </div>
        
        {/* Real Military Dual Clock: IST & UTC */}
        <div className="flex items-center gap-4 text-xs font-mono-code">
          <div className="hidden sm:flex items-center gap-2 text-slate-300">
            <span className="text-slate-400">{dateStr}</span>
            <span className="text-amber-400 font-bold">{istTime} IST</span>
            <span className="text-slate-500 text-[10px]">({utcTime})</span>
          </div>
          
          <button
            onClick={toggleMute}
            className={`flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-bold transition-colors ${
              isMuted 
                ? 'bg-red-950/40 border-red-800/60 text-red-400' 
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
            title={isMuted ? "Unmute Tactical Chimes" : "Mute Tactical Chimes"}
          >
            {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
            <span>{isMuted ? 'MUTED' : 'AUDIO ON'}</span>
          </button>
        </div>
      </div>
      
      {/* Lower Navigation Strip */}
      <div className="px-4 flex flex-wrap items-center justify-between gap-4 bg-slate-950 border-b border-slate-800">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-4 py-2 text-[11px] uppercase tracking-wider font-bold whitespace-nowrap transition-all border-b-2 relative ${
                  isActive
                    ? 'border-amber-400 text-amber-400 bg-slate-900/90'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
                {Boolean(item.badge && item.badge > 0) && (
                  <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[9px] font-mono-code font-bold ${
                    criticalCount > 0 ? 'bg-red-500 text-white' : 'bg-amber-500 text-slate-950'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        
        <button
          onClick={onSimulateIncident}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-700 text-[10px] font-mono-code font-bold transition-all"
          title="Trigger a test perimeter breach event for sensor verification"
        >
          <Zap className="w-3 h-3 text-amber-400" />
          <span>RUN SECTOR TEST DRILL</span>
        </button>
      </div>
    </header>
  );
};
