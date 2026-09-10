import React, { useState } from 'react';
import { Camera, SecurityAlert } from '../types';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { 
  Camera as CameraIcon,
  MapPin, 
  Eye, 
  Shield, 
  AlertTriangle, 
  Truck, 
  Radio, 
  Layers, 
  Compass, 
  Crosshair,
  Maximize2,
  Navigation,
  ZoomIn,
  ZoomOut
} from 'lucide-react';

interface TacticalMapProps {
  cameras: Camera[];
  alerts: SecurityAlert[];
  selectedCameraId: string;
  onSelectCamera: (camId: string) => void;
  onSelectAlert?: (alert: SecurityAlert) => void;
}

export const TacticalMap: React.FC<TacticalMapProps> = ({
  cameras,
  alerts,
  selectedCameraId,
  onSelectCamera,
  onSelectAlert,
}) => {
  const [mapLayer, setMapLayer] = useState<'tactical' | 'satellite' | 'topo'>('tactical');
  const [showFovCones, setShowFovCones] = useState(true);
  const [showVirtualFence, setShowVirtualFence] = useState(true);
  const [showQrfPatrols, setShowQrfPatrols] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [inspectedCam, setInspectedCam] = useState<Camera | null>(
    cameras.find(c => c.id === selectedCameraId) || cameras[0]
  );

  // Active alerts with coordinates
  const activeAlerts = alerts.filter(a => a.status === 'NEW' || a.status === 'DISPATCHED');

  // Simulated QRF Patrol Units
  const qrfUnits = [
    { id: 'qrf-01', name: 'QRF Team Alpha (Striker-1)', x: 42, y: 48, lat: 32.7210, lng: 74.8450, status: 'DISPATCHED TO BREACH', channel: 'VHF-04' },
    { id: 'qrf-02', name: 'QRF Team Bravo (Patrol-2)', x: 68, y: 70, lat: 32.6950, lng: 74.8620, status: 'ROUTINE PATROL', channel: 'VHF-02' },
  ];

  // Camera map positions relative to sector coordinates (0 to 100%)
  const cameraMapCoords: Record<string, { x: number; y: number }> = {
    'cam-bop-01': { x: 34, y: 38 },
    'cam-bop-02': { x: 58, y: 22 },
    'cam-cp-01': { x: 26, y: 68 },
    'cam-rd-07': { x: 65, y: 62 },
    'cam-tw-12': { x: 28, y: 28 },
    'cam-ck-03': { x: 18, y: 82 },
  };

  const handleCameraClick = (cam: Camera) => {
    setInspectedCam(cam);
    onSelectCamera(cam.id);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-3 h-full select-none">
      {/* Main Map Stage */}
      <div className="flex-1 bg-slate-950 border border-slate-800 rounded-lg overflow-hidden flex flex-col relative min-h-[500px]">
        {/* Map Header Toolbar */}
        <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between gap-2 z-10">
          <div className="flex items-center gap-2 text-xs font-mono-code">
            <Compass className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-slate-200">SECTOR ALPHA & BRAVO GIS TACTICAL OVERVIEW</span>
            <span className="text-slate-500 hidden sm:inline">|</span>
            <span className="text-emerald-400 hidden sm:inline">COORDINATES: 32.72°N, 74.85°E</span>
          </div>

          {/* Layer toggles */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded border border-slate-800 text-xs font-mono-code">
            <button
              onClick={() => setShowFovCones(!showFovCones)}
              className={`px-2 py-0.5 rounded transition-colors ${showFovCones ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40' : 'text-slate-500'}`}
            >
              FOV CONES
            </button>
            <button
              onClick={() => setShowVirtualFence(!showVirtualFence)}
              className={`px-2 py-0.5 rounded transition-colors ${showVirtualFence ? 'bg-red-500/20 text-red-300 font-semibold border border-red-500/40' : 'text-slate-500'}`}
            >
              ZERO-LINE FENCE
            </button>
            <button
              onClick={() => setShowQrfPatrols(!showQrfPatrols)}
              className={`px-2 py-0.5 rounded transition-colors ${showQrfPatrols ? 'bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/40' : 'text-slate-500'}`}
            >
              QRF PATROLS
            </button>
          </div>
        </div>

        {/* Map Visual Canvas / SVG Stage */}
        <div className="flex-1 relative overflow-hidden bg-slate-950 tactical-grid flex items-center justify-center">
          {mapLayer === 'satellite' ? (
            <APIProvider apiKey={(import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || ""}>
              <div className="absolute inset-0 w-full h-full">
                <Map 
                  mapId="DEMO_MAP_ID"
                  defaultZoom={12} 
                  defaultCenter={{ lat: 32.72, lng: 74.85 }} 
                  mapTypeId={'satellite'}
                  disableDefaultUI={true}
                  internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}
                >
                  {/* Cameras */}
                  {cameras.map((cam) => (
                    cam.lat && cam.lng && (
                      <AdvancedMarker
                        key={cam.id}
                        position={{ lat: cam.lat, lng: cam.lng }}
                        onClick={() => handleCameraClick(cam)}
                        title={cam.name}
                      >
                        <div className={`p-1.5 rounded-full border-2 shadow-lg cursor-pointer ${cam.id === selectedCameraId ? 'bg-amber-500 border-white' : 'bg-sky-600 border-white'}`}>
                          <CameraIcon className="w-4 h-4 text-white" />
                        </div>
                      </AdvancedMarker>
                    )
                  ))}

                  {/* QRF Units */}
                  {showQrfPatrols && qrfUnits.map((qrf) => (
                    <AdvancedMarker
                      key={qrf.id}
                      position={{ lat: qrf.lat, lng: qrf.lng }}
                      title={qrf.name}
                    >
                      <div className="flex items-center gap-2">
                        <div className="bg-blue-600 border-2 border-white rounded-md p-1 shadow-lg animate-pulse">
                          <Truck className="w-5 h-5 text-white" />
                        </div>
                        <div className="bg-black/80 px-2 py-0.5 rounded text-[10px] font-mono-code font-bold text-blue-300 border border-blue-500/50">
                          {qrf.name}
                        </div>
                      </div>
                    </AdvancedMarker>
                  ))}
                  
                  {/* Active Alerts */}
                  {activeAlerts.map(alert => {
                    const cam = cameras.find(c => c.id === alert.cameraId);
                    if (cam?.lat && cam?.lng) {
                      return (
                        <AdvancedMarker
                          key={`gmap-alert-${alert.id}`}
                          position={{ lat: cam.lat, lng: cam.lng }}
                          onClick={() => onSelectAlert?.(alert)}
                        >
                          <div className="relative flex items-center justify-center">
                            <div className="absolute w-12 h-12 bg-red-500/30 rounded-full animate-ping"></div>
                            <div className="bg-red-600 border-2 border-white rounded-full p-1 shadow-[0_0_15px_rgba(220,38,38,0.8)]">
                              <AlertTriangle className="w-5 h-5 text-white" />
                            </div>
                            <div className="absolute top-10 whitespace-nowrap bg-red-900/90 px-2 py-1 rounded text-xs font-bold text-white border border-red-500">
                              ⚠️ {alert.category}
                            </div>
                          </div>
                        </AdvancedMarker>
                      );
                    }
                    return null;
                  })}
                </Map>
              </div>
            </APIProvider>
          ) : (
            <svg
              viewBox="0 0 1000 700"
              className="w-full h-full object-cover"
              style={{ transform: `scale(${zoomLevel})`, transition: 'transform 0.2s ease-out' }}
            >
            {/* Background Grid & Topo Terrain Contours */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(51, 65, 85, 0.2)" strokeWidth="1" />
              </pattern>
              {/* Radial gradient for camera FOV cone */}
              <radialGradient id="fovGrad" cx="0%" cy="50%" r="100%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.02" />
              </radialGradient>
              <radialGradient id="alertGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
              </radialGradient>
            </defs>

            <rect width="1000" height="700" fill="#030712" />
            <rect width="1000" height="700" fill="url(#grid)" />

            {/* Topographic elevation contours */}
            <path
              d="M 500 0 Q 650 150, 750 250 T 950 450 L 1000 500 L 1000 0 Z"
              fill="#091424"
              opacity="0.4"
            />
            <path
              d="M 580 0 Q 700 120, 800 200 T 980 350 L 1000 400 L 1000 0 Z"
              fill="#0f2038"
              opacity="0.4"
            />
            <path
              d="M 660 0 Q 750 90, 850 150 T 1000 250 L 1000 0 Z"
              fill="#132742"
              opacity="0.4"
            />

            {/* River / Creek Delta (Sector Delta) */}
            <path
              d="M 0 540 Q 120 580, 200 620 T 350 700 L 0 700 Z"
              fill="#082f49"
              opacity="0.35"
              stroke="#0284c7"
              strokeWidth="1.5"
              strokeDasharray="4 2"
            />
            <text x="70" y="620" fill="#38bdf8" fontSize="12" fontFamily="JetBrains Mono" opacity="0.6">
              CREEK SECTOR DELTA (RIVERINE)
            </text>

            {/* Restricted 150m Buffer Zone Hatching */}
            {showVirtualFence && (
              <path
                d="M 80 100 L 920 180 L 900 260 L 60 180 Z"
                fill="rgba(245, 158, 11, 0.06)"
                stroke="rgba(245, 158, 11, 0.4)"
                strokeWidth="1.5"
                strokeDasharray="6 4"
              />
            )}

            {/* Zero Line (International Border) */}
            {showVirtualFence && (
              <g>
                <path
                  d="M 70 140 Q 300 170, 520 185 T 930 220"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="3.5"
                  strokeDasharray="12 6"
                />
                <text x="440" y="160" fill="#ef4444" fontSize="11" fontFamily="JetBrains Mono" fontWeight="bold">
                  ─── INTERNATIONAL BORDER ZERO-LINE ───
                </text>
              </g>
            )}

            {/* Strategic Patrol Roads */}
            <path
              d="M 220 680 L 320 400 L 580 250 L 820 450"
              fill="none"
              stroke="#334155"
              strokeWidth="3"
            />
            <text x="360" y="380" fill="#64748b" fontSize="10" fontFamily="JetBrains Mono">
              PATROL TRACK CHARLIE
            </text>

            {/* Camera FOV Cones */}
            {showFovCones && cameras.map((cam) => {
              const coords = cameraMapCoords[cam.id] || { x: 50, y: 50 };
              const cx = coords.x * 10;
              const cy = coords.y * 7;
              const isSelected = cam.id === selectedCameraId;
              const headingRad = ((cam.fovHeading - 90) * Math.PI) / 180;
              const halfAngleRad = ((cam.fovAngle / 2) * Math.PI) / 180;
              const dist = 140;

              const x1 = cx + Math.cos(headingRad - halfAngleRad) * dist;
              const y1 = cy + Math.sin(headingRad - halfAngleRad) * dist;
              const x2 = cx + Math.cos(headingRad + halfAngleRad) * dist;
              const y2 = cy + Math.sin(headingRad + halfAngleRad) * dist;

              return (
                <g key={`fov-${cam.id}`}>
                  <path
                    d={`M ${cx} ${cy} L ${x1} ${y1} A ${dist} ${dist} 0 0 1 ${x2} ${y2} Z`}
                    fill={isSelected ? 'rgba(245, 158, 11, 0.22)' : 'rgba(56, 189, 248, 0.12)'}
                    stroke={isSelected ? '#f59e0b' : '#38bdf8'}
                    strokeWidth={isSelected ? '1.5' : '1'}
                    strokeDasharray="4 2"
                  />
                </g>
              );
            })}

            {/* Real-time Alert Beacons */}
            {activeAlerts.map((alert) => {
              const camCoords = cameraMapCoords[alert.cameraId] || { x: 50, y: 50 };
              const ax = camCoords.x * 10 + 15;
              const ay = camCoords.y * 7 - 25;

              return (
                <g key={`alert-ping-${alert.id}`} className="cursor-pointer" onClick={() => onSelectAlert?.(alert)}>
                  {/* Pulsing ring */}
                  <circle cx={ax} cy={ay} r="28" fill="none" stroke="#ef4444" strokeWidth="2" opacity="0.6">
                    <animate attributeName="r" values="10;32" dur="1.8s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.8;0" dur="1.8s" repeatCount="indefinite" />
                  </circle>
                  <circle cx={ax} cy={ay} r="8" fill="#dc2626" stroke="#ffffff" strokeWidth="2" />
                  <text x={ax + 14} y={ay + 4} fill="#ef4444" fontSize="11" fontFamily="JetBrains Mono" fontWeight="bold">
                    ⚠️ {alert.category}
                  </text>
                </g>
              );
            })}

            {/* QRF Patrol Units */}
            {showQrfPatrols && qrfUnits.map((qrf) => (
              <g key={qrf.id} transform={`translate(${qrf.x * 10}, ${qrf.y * 7})`}>
                <rect x="-14" y="-12" width="28" height="24" rx="4" fill="#1e3a8a" stroke="#60a5fa" strokeWidth="1.5" />
                <circle cx="0" cy="0" r="3" fill="#60a5fa" />
                <text x="18" y="4" fill="#93c5fd" fontSize="10" fontFamily="JetBrains Mono" fontWeight="bold">
                  {qrf.name.split(' ')[0]} [{qrf.channel}]
                </text>
              </g>
            ))}

            {/* Camera Icons & Markers */}
            {cameras.map((cam) => {
              const coords = cameraMapCoords[cam.id] || { x: 50, y: 50 };
              const cx = coords.x * 10;
              const cy = coords.y * 7;
              const isSelected = cam.id === selectedCameraId;
              const isThermal = cam.type === 'thermal_ir';

              return (
                <g
                  key={cam.id}
                  transform={`translate(${cx}, ${cy})`}
                  className="cursor-pointer group"
                  onClick={() => handleCameraClick(cam)}
                >
                  {/* Selected halo */}
                  {isSelected && (
                    <circle cx="0" cy="0" r="22" fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 2" />
                  )}

                  {/* Marker Body */}
                  <circle
                    cx="0"
                    cy="0"
                    r="12"
                    fill={isSelected ? '#d97706' : isThermal ? '#ea580c' : '#0284c7'}
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="transition-transform group-hover:scale-125"
                  />

                  {/* Inner glyph */}
                  <circle cx="0" cy="0" r="4" fill="#ffffff" />

                  {/* Camera Label */}
                  <rect
                    x="-45"
                    y="16"
                    width="90"
                    height="18"
                    rx="3"
                    fill="rgba(15, 23, 42, 0.9)"
                    stroke={isSelected ? '#f59e0b' : '#334155'}
                    strokeWidth="1"
                  />
                  <text
                    x="0"
                    y="29"
                    textAnchor="middle"
                    fill={isSelected ? '#fde68a' : '#cbd5e1'}
                    fontSize="9"
                    fontFamily="JetBrains Mono"
                    fontWeight="bold"
                  >
                    {cam.code}
                  </text>
                </g>
              );
            })}
          </svg>
          )}

          {/* Map Compass Rose */}
          <div className="absolute top-4 right-4 bg-slate-900/90 border border-slate-800 p-2 rounded-lg text-center font-mono-code text-[11px] text-slate-400 pointer-events-none shadow-lg">
            <Navigation className="w-5 h-5 mx-auto text-amber-400 rotate-45" />
            <span className="font-bold text-slate-200">NORTH</span>
          </div>

          {/* Zoom Controls */}
          <div className="absolute bottom-4 right-4 flex flex-col gap-1 bg-slate-900/90 border border-slate-800 p-1 rounded-md shadow-lg">
            <button
              onClick={() => setZoomLevel(prev => Math.min(2.0, prev + 0.2))}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
              title="Zoom In Map"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(prev => Math.max(0.8, prev - 0.2))}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
              title="Zoom Out Map"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1 text-[10px] font-mono-code text-slate-400 hover:text-white"
              title="Reset Zoom"
            >
              100%
            </button>
          </div>
        </div>
      </div>

      {/* Right Sidebar: Selected Asset Inspector & Telemetry */}
      {inspectedCam && (
        <div className="w-full lg:w-80 shrink-0 bg-slate-900/60 border border-slate-800 rounded-lg p-4 flex flex-col gap-3 font-mono-code text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-bold text-sm text-slate-100">{inspectedCam.code}</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-blue-900/40 text-blue-300 border border-blue-700/50 text-[10px]">
              {inspectedCam.type.toUpperCase()}
            </span>
          </div>

          <div>
            <div className="text-[10px] text-slate-500 uppercase">Installation Site</div>
            <div className="text-slate-200 font-semibold">{inspectedCam.name}</div>
            <div className="text-slate-400 text-[11px] mt-0.5">{inspectedCam.bopName}</div>
          </div>

          {/* Geo Position Card */}
          <div className="bg-slate-950/80 border border-slate-800 rounded p-2.5 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-500">Latitude:</span>
              <span className="text-slate-200">{inspectedCam.lat.toFixed(5)}° N</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Longitude:</span>
              <span className="text-slate-200">{inspectedCam.lng.toFixed(5)}° E</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Elevation:</span>
              <span className="text-slate-200">{inspectedCam.altitudeMeters} m MSL</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Heading / FOV:</span>
              <span className="text-amber-400 font-semibold">{inspectedCam.fovHeading}° / {inspectedCam.fovAngle}°</span>
            </div>
          </div>

          {/* Network Ingestion Specs */}
          <div className="bg-slate-950/80 border border-slate-800 rounded p-2.5 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-500">Ingestion Protocol:</span>
              <span className="text-emerald-400">RTSP / ONVIF {inspectedCam.onvifProfile.split(' ')[1]}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">IP Endpoint:</span>
              <span className="text-slate-300">{inspectedCam.ipAddress}:554</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Resolution:</span>
              <span className="text-slate-200">{inspectedCam.resolution}</span>
            </div>
          </div>

          {/* Active Virtual Fences */}
          <div>
            <div className="text-[10px] text-slate-500 uppercase mb-1">Configured Virtual Fences</div>
            <div className="space-y-1">
              {inspectedCam.virtualFences.map(vf => (
                <div key={vf.id} className="flex items-center justify-between p-1.5 rounded bg-slate-950 border border-slate-800 text-[11px]">
                  <span className="text-slate-300 truncate">{vf.name}</span>
                  <span className="text-amber-400 font-semibold uppercase text-[10px]">{vf.type}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Switch to Live Stream Button */}
          <button
            onClick={() => onSelectCamera(inspectedCam.id)}
            className="mt-auto w-full py-2 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/10"
          >
            <Eye className="w-4 h-4" />
            <span>Engage Live Channel</span>
          </button>
        </div>
      )}
    </div>
  );
};
