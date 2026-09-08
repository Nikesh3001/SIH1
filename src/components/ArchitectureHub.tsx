import React, { useState } from 'react';
import { GITHUB_REPOSITORIES, SYSTEM_RULES } from '../data/mockData';
import { GithubRepoReference } from '../types';
import { 
  Code2, 
  ExternalLink, 
  Check, 
  Copy, 
  Layers, 
  Terminal, 
  Server, 
  Shield, 
  Cpu, 
  BookOpen,
  Boxes,
  Zap
} from 'lucide-react';

export const ArchitectureHub: React.FC = () => {
  const [selectedRepo, setSelectedRepo] = useState<GithubRepoReference>(GITHUB_REPOSITORIES[0]);
  const [activeTab, setActiveTab] = useState<'repos' | 'architecture' | 'docker'>('repos');
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const dockerSnippet = `# IBVAP Edge Appliance - Docker Compose Specification
version: '3.8'

services:
  # 1. RTSP Ingestion & Decoding Worker (Hardware Accelerated)
  video-ingestion:
    image: ibvap/video-ingestion:v3.4
    restart: always
    environment:
      - RTSP_STREAMS=rtsp://10.14.88.21:554/stream1,rtsp://10.14.88.22:554/flir
      - HWACCEL=cuda
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu, video]

  # 2. AI Analytics Engine (YOLOv8 + ByteTrack + ArcFace + ANPR)
  ai-inference-engine:
    image: ibvap/inference-engine:v3.4
    restart: always
    ipc: host
    environment:
      - MODEL_OBJECT=yolov8x_border_fp16.engine
      - MODEL_TRACKER=bytetrack_v2
      - MODEL_FACE=arcface_resnet50.onnx
      - MODEL_OCR=paddleocr_anpr
      - BATCH_SIZE=4
    volumes:
      - ./weights:/opt/ibvap/weights
      - ./fences:/opt/ibvap/config/fences
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]

  # 3. Rule Evaluator & Event Dispatcher
  event-engine:
    image: ibvap/event-engine:v3.4
    restart: always
    environment:
      - DWELL_THRESHOLD=30
      - CENTRAL_C2_URL=https://c2.bordersecurity.mil/api/v1/events
      - OFFLINE_BUFFER_DIR=/var/data/offline_events
    volumes:
      - ./offline_events:/var/data/offline_events

  # 4. Redis Event Message Broker
  message-broker:
    image: redis:7.0-alpine
    ports:
      - "6379:6379"`;

  return (
    <div className="flex flex-col gap-4 h-full select-none font-mono-code text-xs overflow-y-auto">
      {/* Subnav Tabs */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('repos')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs transition-all ${
              activeTab === 'repos' 
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 font-bold' 
                : 'bg-slate-950 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-4 h-4 text-amber-400" />
            <span>RELATED GITHUB REPOSITORIES (8)</span>
          </button>

          <button
            onClick={() => setActiveTab('architecture')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs transition-all ${
              activeTab === 'architecture' 
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 font-bold' 
                : 'bg-slate-950 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4 text-blue-400" />
            <span>SYSTEM ARCHITECTURE & EVENT FLOW</span>
          </button>

          <button
            onClick={() => setActiveTab('docker')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs transition-all ${
              activeTab === 'docker' 
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 font-bold' 
                : 'bg-slate-950 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>EDGE DEPLOYMENT BLUEPRINT</span>
          </button>
        </div>

        <span className="text-slate-500 text-[11px] hidden sm:inline">
          Software-Defined CCTV Innovation
        </span>
      </div>

      {/* TAB 1: GitHub Repositories Deep Dive */}
      {activeTab === 'repos' && (
        <div className="flex flex-col lg:flex-row gap-3 flex-1 min-h-0">
          {/* Left: Repos List */}
          <div className="w-full lg:w-96 shrink-0 bg-slate-900/60 border border-slate-800 rounded-lg p-3 flex flex-col gap-2 overflow-y-auto max-h-[600px]">
            <div className="text-[11px] text-slate-400 font-bold uppercase mb-1">
              Referenced Open-Source Modules
            </div>

            {GITHUB_REPOSITORIES.map((repo, idx) => {
              const isSelected = selectedRepo.id === repo.id;
              return (
                <div
                  key={repo.id}
                  onClick={() => setSelectedRepo(repo)}
                  className={`p-3 rounded-md border cursor-pointer transition-all flex flex-col gap-1.5 ${
                    isSelected
                      ? 'bg-slate-800 border-amber-400 shadow-sm'
                      : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-amber-400 font-bold text-[11px]">#{idx + 1} {repo.category}</span>
                  </div>

                  <div className="text-slate-200 font-bold text-xs truncate">
                    {repo.fullName}
                  </div>

                  <div className="flex flex-wrap gap-1 mt-1">
                    {repo.techStack.map((tech, i) => (
                      <span key={i} className="px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 text-[9px] border border-slate-800">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Selected Repo Inspector & Integration Code */}
          <div className="flex-1 bg-slate-900/60 border border-slate-800 rounded-lg p-4 flex flex-col gap-4 overflow-y-auto">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] text-amber-400 font-bold uppercase">{selectedRepo.category}</span>
                <h3 className="text-base font-bold text-slate-100">{selectedRepo.fullName}</h3>
              </div>

              <a
                href={selectedRepo.repoUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs transition-colors"
              >
                <span>View on GitHub</span>
                <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
              </a>
            </div>

            {/* Role in IBVAP */}
            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded">
              <div className="text-[10px] text-slate-500 uppercase mb-1">Role in IBVAP Platform</div>
              <p className="text-slate-300 font-sans text-xs leading-relaxed">{selectedRepo.roleInIBVAP}</p>
            </div>

            {/* Key Components */}
            <div>
              <div className="text-[10px] text-slate-500 uppercase mb-1.5">Key Components & Features</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedRepo.keyComponents.map((comp, idx) => (
                  <div key={idx} className="p-2 rounded bg-slate-950/70 border border-slate-800 text-[11px] text-slate-300 flex items-start gap-2">
                    <span className="text-amber-400 font-bold">✓</span>
                    <span>{comp}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Integration Pipeline Code */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] text-slate-500 uppercase">IBVAP Integration Implementation Snippet</span>
                <button
                  onClick={() => handleCopy(selectedRepo.samplePipelineCode)}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-amber-300 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>
              <pre className="p-3 bg-black/90 border border-slate-800 rounded-md overflow-x-auto text-[11px] text-emerald-300 font-mono-code leading-relaxed">
                {selectedRepo.samplePipelineCode}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: System Architecture & False Alarm Reduction */}
      {activeTab === 'architecture' && (
        <div className="flex flex-col gap-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-5">
            <h3 className="text-base font-bold text-slate-100 mb-2 flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-400" />
              <span>IBVAP SOFTWARE-DEFINED ARCHITECTURAL FLOW</span>
            </h3>
            <p className="text-slate-400 font-sans text-xs leading-relaxed max-w-3xl mb-4">
              Conventional border systems require expensive proprietary smart cameras. IBVAP decouples intelligence from hardware by ingesting standard RTSP feeds from legacy IP cameras and hosting inference on edge appliances.
            </p>

            {/* ASCII Architecture Diagram Box */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg overflow-x-auto text-amber-300/90 text-xs font-mono-code leading-snug">
{`                    EXISTING CCTV INFRASTRUCTURE
         ┌──────────────┬──────────────┬──────────────┐
         │ IP Camera 1  │ IP Camera 2  │ IP Camera N  │
         └──────┬───────┴───────┬──────┴───────┬──────┘
                │ RTSP / ONVIF   │              │
                └───────────────┬┴──────────────┘
                                ▼
                   ┌────────────────────────┐
                   │ Video Ingestion Layer  │
                   │ RTSP / ONVIF / Streams │
                   └────────────┬───────────┘
                                ▼
               ┌────────────────────────────────┐
               │ AI VIDEO ANALYTICS ENGINE      │
               │                                │
               │ • Person Detection & Tracking  │
               │ • Vehicle Detection            │
               │ • Face Detection/Recognition   │
               │ • ANPR                         │
               │ • Intrusion Detection          │
               │ • Object Tracking              │
               │ • Suspicious Activity          │
               │ • Night Movement Detection     │
               └───────────────┬────────────────┘
                               ▼
                  ┌─────────────────────────┐
                  │ Event & Alert Engine    │
                  │ • Rules Correlation     │
                  │ • Severity Scoring      │
                  │ • Tamper-evident Hash   │
                  │ • Evidence Generation   │
                  └────────────┬────────────┘
                               ▼
           ┌────────────────────────────────────────┐
           │ Command & Control / Monitoring Portal  │
           │                                        │
           │ Live View | Alerts | Maps | Search     │
           │ Events | Reports | Evidence | Audit    │
           └────────────────────────────────────────┘`}
            </div>
          </div>

          {/* False Alarm Mitigation Matrix */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4">
            <h4 className="font-bold text-slate-200 text-sm mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>FALSE ALARM MITIGATION & CORRELATION RULES</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {SYSTEM_RULES.map(rule => (
                <div key={rule.id} className="bg-slate-950/80 border border-slate-800 rounded p-3 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-400">{rule.id}</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                      {rule.severity}
                    </span>
                  </div>
                  <div className="text-slate-200 font-bold text-xs">{rule.name}</div>
                  <p className="text-slate-400 font-sans text-[11px] leading-relaxed">{rule.description}</p>
                  <div className="mt-auto pt-2 border-t border-slate-800 text-[10px] text-slate-500 font-mono-code">
                    Condition: <span className="text-emerald-400">{rule.conditionDescription}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Edge Deployment Blueprint */}
      {activeTab === 'docker' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Terminal className="w-5 h-5 text-emerald-400" />
                <span>HYBRID EDGE APPLIANCE DEPLOYMENT (DOCKER COMPOSE)</span>
              </h3>
              <p className="text-slate-400 font-sans text-xs mt-0.5">
                Turn any standard x86/ARM server with an NVIDIA GPU into an autonomous border surveillance node.
              </p>
            </div>
            <button
              onClick={() => handleCopy(dockerSnippet)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied Compose File' : 'Copy compose.yaml'}</span>
            </button>
          </div>

          <pre className="p-4 bg-black border border-slate-800 rounded-lg overflow-x-auto text-xs text-blue-300 font-mono-code leading-relaxed">
            {dockerSnippet}
          </pre>
        </div>
      )}
    </div>
  );
};
