import React, { useState } from 'react';
import { 
  INITIAL_CAMERAS, 
  INITIAL_ALERTS, 
  EDGE_NODES, 
  HOTLIST_VEHICLES, 
  WATCHLIST_SUBJECTS,
  PUBLIC_CAMERAS
} from './data/mockData';
import { 
  Camera, 
  SecurityAlert, 
  EdgeNode, 
  HotlistVehicle, 
  WatchlistSubject, 
  VirtualFence,
  PublicCameraBookmark
} from './types';
import { Header } from './components/Header';
import { CameraGrid } from './components/CameraGrid';
import { TacticalMap } from './components/TacticalMap';
import { AlertsPanel } from './components/AlertsPanel';
import { AnprFrsView } from './components/AnprFrsView';
import { EvidenceLocker } from './components/EvidenceLocker';
import { SystemHealth } from './components/SystemHealth';
import { ArchitectureHub } from './components/ArchitectureHub';
import { VirtualFenceEditor } from './components/VirtualFenceEditor';
import { tacticalAudio } from './utils/audio';
import { 
  AlertTriangle, 
  ShieldAlert, 
  X, 
  Download, 
  ExternalLink,
  Radio,
  Zap
} from 'lucide-react';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<'monitoring' | 'alerts' | 'map' | 'anpr_frs' | 'evidence' | 'system_health' | 'architecture'>('monitoring');

  // Core State
  const [cameras, setCameras] = useState<Camera[]>(INITIAL_CAMERAS);
  const [alerts, setAlerts] = useState<SecurityAlert[]>(INITIAL_ALERTS);
  const [edgeNodes, setEdgeNodes] = useState<EdgeNode[]>(EDGE_NODES);
  const [hotlistVehicles, setHotlistVehicles] = useState<HotlistVehicle[]>(HOTLIST_VEHICLES);
  const [watchlistSubjects, setWatchlistSubjects] = useState<WatchlistSubject[]>(WATCHLIST_SUBJECTS);
  const [publicCameras, setPublicCameras] = useState<PublicCameraBookmark[]>(PUBLIC_CAMERAS);
  
  // Selection
  const [selectedCameraId, setSelectedCameraId] = useState<string>(cameras[0]?.id || 'cam-bop-01');
  const [calibratingCamera, setCalibratingCamera] = useState<Camera | null>(null);

  // Snapshot Modal
  const [snapshotModalData, setSnapshotModalData] = useState<{ url: string; camera: Camera; time: string } | null>(null);

  // Simulated Alert Banner
  const [activeToastAlert, setActiveToastAlert] = useState<SecurityAlert | null>(null);

  // Unacknowledged Alert Count
  const unreadAlertCount = alerts.filter(a => a.status === 'NEW').length;

  // Handlers
  const handleSelectCamera = (camId: string) => {
    setSelectedCameraId(camId);
  };

  const handleAcknowledgeAlert = (alertId: string, officerName: string) => {
    setAlerts(prev => prev.map(a => {
      if (a.id === alertId) {
        return {
          ...a,
          status: 'ACKNOWLEDGED',
          acknowledgedBy: officerName,
          actionTaken: 'Monitored & Logged in C2 Event Journal'
        };
      }
      return a;
    }));
  };

  const handleDispatchQrf = (alertId: string, unitName: string) => {
    setAlerts(prev => prev.map(a => {
      if (a.id === alertId) {
        return {
          ...a,
          status: 'DISPATCHED',
          actionTaken: `Mobilized ${unitName} to coordinates via tactical radio.`
        };
      }
      return a;
    }));
  };

  const handleCaptureSnapshot = (dataUrl: string, camera: Camera) => {
    tacticalAudio.playSnapshotShutter();
    setSnapshotModalData({
      url: dataUrl,
      camera,
      time: new Date().toLocaleTimeString(),
    });
  };

  const handleSaveFence = (cameraId: string, newFences: VirtualFence[]) => {
    setCameras(prev => prev.map(c => {
      if (c.id === cameraId) {
        return { ...c, virtualFences: newFences };
      }
      return c;
    }));
  };

  const handleTriggerSimulatedBreach = () => {
    tacticalAudio.playAlertSound('CRITICAL');
    const newAlert: SecurityAlert = {
      id: `alert-sim-${Date.now()}`,
      eventId: `EV-${Date.now().toString().slice(-5)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      cameraId: 'cam-bop-01',
      cameraName: 'BOP-01 Alpha Tower Panoramic',
      bopName: 'BOP Alpha (Sector 4)',
      sector: 'Sector 4 Zero-Line',
      category: 'INTRUSION',
      severity: 'CRITICAL',
      detectedObject: 'Rapid Perimeter Intrusion Group (3 Targets)',
      confidence: 0.96,
      ruleTriggered: 'RULE-01: Zero-Line Breach & Directional Inbound Crossing',
      snapshotUrl: '',
      tamperHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      status: 'NEW',
      coordinates: { lat: 32.72195, lng: 74.85121 },
      details: 'SIMULATED TACTICAL INJECTION: Rapid movement detected across restricted 150m buffer zone heading toward Indian side.',
      videoClipDurationSecs: 30,
    };

    setAlerts(prev => [newAlert, ...prev]);
    setActiveToastAlert(newAlert);
    setTimeout(() => {
      setActiveToastAlert(null);
    }, 8000);
  };

  const handleImportPublicCamera = (pubCam: PublicCameraBookmark) => {
    let hostname = 'Unknown';
    try {
      hostname = new URL(pubCam.streamUrl).hostname;
    } catch {
      // Ignored
    }

    const newCam: Camera = {
      id: `cam-pub-${Date.now()}`,
      name: pubCam.name,
      code: `EXT-${pubCam.id.slice(0,4).toUpperCase()}`,
      sector: 'External Public Feeds',
      bopName: pubCam.location,
      type: 'fixed',
      rtspUrl: pubCam.streamUrl,
      onvifProfile: 'Profile S',
      ipAddress: hostname,
      status: 'online',
      resolution: '1080p',
      fps: 30,
      fovHeading: 0,
      fovAngle: 90,
      lat: 0,
      lng: 0,
      altitudeMeters: 0,
      nightVisionSupported: false,
      thermalSupported: false,
      virtualFences: [],
      activeDetections: []
    };

    setCameras(prev => [...prev, newCam]);
    setSelectedCameraId(newCam.id);
    setActiveTab('monitoring');
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Tactical App Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeAlertCount={unreadAlertCount}
        criticalCount={alerts.filter(a => a.severity === 'CRITICAL' && a.status === 'NEW').length}
        onSimulateIncident={handleTriggerSimulatedBreach}
      />

      {/* Emergency Tactical Alarm Banner (Toast) */}
      {activeToastAlert && (
        <div className="bg-red-600/90 text-white px-4 py-2 text-xs font-mono-code flex items-center justify-between animate-pulse shadow-lg z-30">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" />
            <span className="font-bold">CRITICAL PERIMETER BREACH INJECTION:</span>
            <span>{activeToastAlert.detectedObject} at {activeToastAlert.bopName}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveTab('alerts');
                setActiveToastAlert(null);
              }}
              className="px-2 py-0.5 rounded bg-white text-red-700 font-bold hover:bg-slate-100"
            >
              View in Incident Room
            </button>
            <button
              onClick={() => setActiveToastAlert(null)}
              className="p-1 hover:text-red-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Viewport Container */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {activeTab === 'monitoring' && (
          <CameraGrid
            cameras={cameras}
            alerts={alerts}
            selectedCameraId={selectedCameraId}
            onSelectCamera={handleSelectCamera}
            onCaptureSnapshot={handleCaptureSnapshot}
            onOpenFenceEditor={(cam) => setCalibratingCamera(cam)}
          />
        )}

        {activeTab === 'alerts' && (
          <AlertsPanel
            alerts={alerts}
            onAcknowledgeAlert={handleAcknowledgeAlert}
            onDispatchQrf={handleDispatchQrf}
            onExportDossier={(alert) => {
              setActiveTab('evidence');
            }}
            onSelectCameraFeed={(camId) => {
              setSelectedCameraId(camId);
              setActiveTab('monitoring');
            }}
          />
        )}

        {activeTab === 'map' && (
          <TacticalMap
            cameras={cameras}
            alerts={alerts}
            selectedCameraId={selectedCameraId}
            onSelectCamera={(camId) => {
              setSelectedCameraId(camId);
            }}
            onSelectAlert={(alert) => {
              setActiveTab('alerts');
            }}
          />
        )}

        {activeTab === 'anpr_frs' && (
          <AnprFrsView
            hotlistVehicles={hotlistVehicles}
            watchlistSubjects={watchlistSubjects}
            publicCameras={publicCameras}
            onAddHotlistVehicle={(v) => setHotlistVehicles(prev => [v, ...prev])}
            onAddWatchlistSubject={(s) => setWatchlistSubjects(prev => [s, ...prev])}
            onAddPublicCamera={(c) => setPublicCameras(prev => [c, ...prev])}
            onImportToMatrix={handleImportPublicCamera}
          />
        )}

        {activeTab === 'evidence' && (
          <EvidenceLocker
            alerts={alerts}
            onSelectAlert={(alert) => {}}
          />
        )}

        {activeTab === 'system_health' && (
          <SystemHealth
            edgeNodes={edgeNodes}
            cameras={cameras}
          />
        )}

        {activeTab === 'architecture' && (
          <ArchitectureHub />
        )}
      </main>

      {/* Virtual Fence Calibration Modal */}
      {calibratingCamera && (
        <VirtualFenceEditor
          camera={calibratingCamera}
          onSaveFence={handleSaveFence}
          onClose={() => setCalibratingCamera(null)}
        />
      )}

      {/* Forensic Snapshot Lightbox Modal */}
      {snapshotModalData && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full p-4 flex flex-col gap-3 font-mono-code text-xs shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span className="font-bold text-slate-100">
                  CCTV EVIDENCE CAPTURE: {snapshotModalData.camera.code}
                </span>
              </div>
              <button
                onClick={() => setSnapshotModalData(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="aspect-video bg-black rounded overflow-hidden border border-slate-800 flex items-center justify-center">
              <img
                src={snapshotModalData.url}
                alt="Captured Snapshot"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="bg-slate-950 p-2.5 rounded border border-slate-800 space-y-1 text-[11px] text-slate-300">
              <div>Camera: {snapshotModalData.camera.name}</div>
              <div>Captured Time: {snapshotModalData.time}</div>
              <div>Resolution: {snapshotModalData.camera.resolution}</div>
              <div className="text-emerald-400">Watermark & Cryptographic Signature: VALID</div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <a
                href={snapshotModalData.url}
                download={`EVIDENCE_${snapshotModalData.camera.code}_${Date.now()}.png`}
                className="px-4 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save Frame to Disk</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
