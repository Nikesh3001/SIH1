import React from 'react';
import { EdgeNode, Camera } from '../types';
import { 
  Activity, 
  Cpu, 
  HardDrive, 
  Zap, 
  Wifi, 
  WifiOff, 
  ShieldCheck, 
  Server, 
  Clock, 
  Layers, 
  BarChart3,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

interface SystemHealthProps {
  edgeNodes: EdgeNode[];
  cameras: Camera[];
}

export const SystemHealth: React.FC<SystemHealthProps> = ({
  edgeNodes,
  cameras,
}) => {
  const onlineCams = cameras.filter(c => c.status === 'online').length;
  const warningCams = cameras.filter(c => c.status === 'warning').length;

  return (
    <div className="flex flex-col gap-4 h-full select-none font-mono-code text-xs overflow-y-auto">
      {/* Top Banner KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-500 uppercase">CCTV Camera Ingestion</div>
            <div className="text-xl font-bold text-slate-100 mt-1">
              {onlineCams} / {cameras.length}
            </div>
            <div className="text-[10px] text-emerald-400 mt-0.5">
              100% RTSP / ONVIF Synced
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Server className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-500 uppercase">Avg Inference Latency</div>
            <div className="text-xl font-bold text-amber-400 mt-1">
              14.2 ms
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              TensorRT FP16 Accelerated
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Zap className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-500 uppercase">Edge Bandwidth Reduction</div>
            <div className="text-xl font-bold text-blue-400 mt-1">
              94.8 %
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Metadata & Events Only Transmitted
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400">
            <BarChart3 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-500 uppercase">Intermittent Network Cache</div>
            <div className="text-xl font-bold text-emerald-400 mt-1">
              ACTIVE
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Zero Data Loss Buffer Armed
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Edge Appliance Hardware Telemetry */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-100">
            <Activity className="w-4 h-4 text-amber-400" />
            <span>DEPLOYED BORDER EDGE APPLIANCES & GPU TELEMETRY</span>
          </div>
          <span className="text-[11px] text-slate-500">Live Polling: 1000ms</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {edgeNodes.map(node => (
            <div key={node.id} className="bg-slate-950/80 border border-slate-800 rounded-lg p-3.5 flex flex-col gap-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div>
                  <div className="font-bold text-slate-200 text-xs">{node.name}</div>
                  <div className="text-[10px] text-slate-500">{node.bopLocation} • {node.ip}</div>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                  ● {node.status}
                </span>
              </div>

              {/* Load Bars */}
              <div className="space-y-2 text-[11px]">
                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Edge GPU Load (NVIDIA Orin/RTX):</span>
                    <span className="text-amber-400 font-bold">{node.gpuLoadPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: `${node.gpuLoadPercent}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Host CPU Load:</span>
                    <span className="text-blue-400 font-bold">{node.cpuLoadPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: `${node.cpuLoadPercent}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>VRAM Allocated:</span>
                    <span className="text-slate-300 font-bold">{node.vramUsedGb} GB / {node.vramTotalGb} GB</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(node.vramUsedGb / node.vramTotalGb) * 100}%` }}></div>
                  </div>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 gap-2 bg-slate-900/60 p-2 rounded text-[10px] border border-slate-800/80">
                <div>
                  <span className="text-slate-500 block">Latency</span>
                  <span className="text-emerald-400 font-bold">{node.inferenceLatencyMs} ms</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Processed FPS</span>
                  <span className="text-slate-200 font-bold">{node.processedFps} FPS</span>
                </div>
              </div>

              {/* Models Loaded */}
              <div>
                <div className="text-[10px] text-slate-500 uppercase mb-1">Inference Models Loaded in VRAM</div>
                <div className="flex flex-wrap gap-1">
                  {node.modelsLoaded.map((m, idx) => (
                    <span key={idx} className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800 text-[9px]">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Network Resiliency & Ingestion Pipeline Spec */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4">
        <h4 className="font-bold text-slate-200 text-sm mb-2 flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-400" />
          <span>EDGE-TO-COMMAND DATA SYNC & FAILSAFE BUFFERING</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-slate-400 leading-relaxed text-[11px] font-sans">
          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded">
            <div className="text-amber-400 font-bold font-mono-code mb-1">1. Local Edge Inference</div>
            <p>RTSP streams are processed directly on-site at the BOP/Check Post. Full-rate video never clogs low-bandwidth border satellite or wireless mesh links.</p>
          </div>
          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded">
            <div className="text-amber-400 font-bold font-mono-code mb-1">2. Event & Clip Sync</div>
            <p>Only structured event metadata, cryptographic SHA-256 integrity hashes, and short high-resolution evidence clips (15-30s) are dispatched to the C2 center.</p>
          </div>
          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded">
            <div className="text-amber-400 font-bold font-mono-code mb-1">3. Offline Resiliency</div>
            <p>If satellite or WAN connectivity drops, the edge node automatically buffers up to 7 days of event history in local NVMe storage and flushes on reconnection.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
