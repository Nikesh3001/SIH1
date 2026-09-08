import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Volume2, 
  VolumeX, 
  Camera as CameraIcon, 
  Map, 
  Car, 
  FileText,
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
  onSimulateIncident,
}) => {
  const [isMuted, setIsMuted] = useState(tacticalAudio.isMuted);
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-US', { hour12: false }));
      setDateStr(now.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }));
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
    { id: 'monitoring', label: 'LIVE MONITORING', icon: CameraIcon },
    { id: 'alerts', label: 'INCIDENT ALERTS', icon: Shield },
    { id: 'map', label: 'MAP VIEW', icon: Map },
    { id: 'anpr_frs', label: 'ANPR / FRS DATABASE', icon: Car },
    { id: 'evidence', label: 'EVIDENCE', icon: FileText }
  ];

  return (
    <header className="bg-slate-950 border-b border-slate-800/80 sticky top-0 z-40 select-none">
      {/* Top Banner Status Bar */}
      <div className="bg-slate-900 border-b border-slate-800/60 px-4 py-2 flex flex-wrap items-center justify-between text-xs font-mono-code text-slate-400">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-slate-200">BORDER SECURITY VMS</span>
          </div>
          
          <div className="hidden sm:flex items-center gap-1.5 text-emerald-400 font-bold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>NETWORK: CONNECTED</span>
          </div>
          
          <div className="hidden lg:flex items-center gap-2 text-slate-300">
            <span>ACTIVE CAMERAS:</span>
            <span className="text-emerald-400 font-bold">8/8</span>
          </div>
          
          <div className="hidden lg:flex items-center gap-2 text-slate-300">
            <span>SYSTEM HEALTH:</span>
            <span className="text-emerald-400 font-bold">OPTIMAL</span>
          </div>
        </div>
        
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2 text-slate-300 font-bold tracking-wider">
            <span className="text-slate-400">{dateStr}</span>
            <span className="text-amber-400">{timeStr}</span>
          </div>
          
          <button
            onClick={toggleMute}
            className={`flex items-center gap-1 px-2 py-0.5 rounded border text-[11px] transition-colors ${
              isMuted 
                ? 'bg-red-950/40 border-red-800/60 text-red-300' 
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
          </button>
        </div>
      </div>
      
      {/* Navigation Tabs */}
      <div className="px-4 flex flex-wrap items-center justify-between gap-4 bg-slate-950 border-b border-slate-800">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-[11px] uppercase tracking-wider font-bold whitespace-nowrap transition-all border-b-2 relative ${
                  isActive
                    ? 'border-emerald-400 text-emerald-400 bg-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-900/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
        
        <button
          onClick={onSimulateIncident}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 text-[10px] uppercase font-mono-code transition-all"
        >
          <Zap className="w-3 h-3" />
          <span>Simulate Alerts</span>
        </button>
      </div>
    </header>
  );
};
