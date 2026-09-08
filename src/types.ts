export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type AlertCategory = 
  | 'INTRUSION' 
  | 'VIRTUAL_FENCE' 
  | 'ANPR_WATCHLIST' 
  | 'FACE_WATCHLIST' 
  | 'LOITERING' 
  | 'NIGHT_MOVEMENT' 
  | 'UNUSUAL_GATHERING'
  | 'PERIMETER_PROWLER';

export type AlertStatus = 'NEW' | 'ACKNOWLEDGED' | 'DISPATCHED' | 'RESOLVED';

export type CameraStatus = 'online' | 'warning' | 'offline';

export type VisionFilterMode = 'day' | 'night' | 'thermal_white_hot' | 'thermal_ironbow';

export interface BoundingBox {
  x: number; // 0 to 100%
  y: number; // 0 to 100%
  w: number; // 0 to 100%
  h: number; // 0 to 100%
}

export interface Detection {
  id: string;
  type: 'person' | 'vehicle' | 'face' | 'license_plate';
  label: string;
  confidence: number;
  bbox: BoundingBox;
  trackId: number;
  speedKmh?: number;
  direction?: 'North' | 'South' | 'East' | 'West' | 'Inbound' | 'Outbound';
  timestamp: string;
  // Specialized attributes
  plateNumber?: string;
  vehicleCategory?: 'Truck' | 'Light Vehicle' | 'SUV' | 'Motorcycle' | 'Armored Patrol';
  faceMatch?: {
    name: string;
    similarity: number;
    watchlistCategory: 'WANTED' | 'SUSPECT' | 'POI' | 'FRIENDLY_FORCE';
  };
  behavior?: 'Normal Patrol' | 'Loitering' | 'Crawling/Prone' | 'Crossing Boundary' | 'Running';
  dwellSeconds?: number;
}

export interface VirtualFencePoint {
  x: number; // 0 to 100%
  y: number; // 0 to 100%
}

export interface VirtualFence {
  id: string;
  name: string;
  type: 'tripwire' | 'restricted_zone' | 'zero_line_buffer';
  direction: 'both' | 'inbound' | 'outbound';
  points: VirtualFencePoint[];
  color: string;
  active: boolean;
  alertOnCrossing: boolean;
}

export interface Camera {
  id: string;
  name: string;
  code: string;
  sector: string;
  bopName: string;
  type: 'ptz' | 'fixed' | 'thermal_ir' | 'panoramic';
  rtspUrl: string;
  onvifProfile: string;
  ipAddress: string;
  status: CameraStatus;
  resolution: string;
  fps: number;
  fovHeading: number; // degrees 0-360
  fovAngle: number; // degrees coverage
  lat: number;
  lng: number;
  altitudeMeters: number;
  nightVisionSupported: boolean;
  thermalSupported: boolean;
  virtualFences: VirtualFence[];
  activeDetections: Detection[];
}

export interface SecurityAlert {
  id: string;
  eventId: string;
  cameraId: string;
  cameraName: string;
  bopName: string;
  sector: string;
  timestamp: string;
  category: AlertCategory;
  severity: Severity;
  detectedObject: string;
  confidence: number;
  ruleTriggered: string;
  status: AlertStatus;
  details: string;
  snapshotUrl: string;
  thumbnailSvg?: string;
  coordinates: { lat: number; lng: number };
  plateNumber?: string;
  personName?: string;
  acknowledgedBy?: string;
  actionTaken?: string;
  tamperHash: string; // SHA-256 simulated evidence integrity
  videoClipDurationSecs: number;
}

export interface WatchlistSubject {
  id: string;
  name: string;
  alias?: string;
  category: 'WANTED' | 'SUSPECT' | 'PERSON_OF_INTEREST' | 'FRIENDLY_FORCE';
  threatLevel: 'CRITICAL' | 'HIGH' | 'ELEVATED' | 'LOW';
  caseRef: string;
  flagReason: string;
  photoUrl: string;
  lastKnownSector?: string;
  nationality?: string;
  biometricConfidenceThreshold: number;
}

export interface PublicCameraBookmark {
  id: string;
  name: string;
  streamUrl: string;
  location: string;
  tags: string[];
  addedDate: string;
}

export interface HotlistVehicle {
  id: string;
  plateNumber: string;
  stateCode: string;
  vehicleType: string;
  color: string;
  flagReason: string;
  riskLevel: 'HIGH' | 'CRITICAL' | 'MEDIUM';
  reportedDate: string;
  lastDetectedBOP?: string;
}

export interface EdgeNode {
  id: string;
  name: string;
  sector: string;
  bopLocation: string;
  ip: string;
  status: 'ONLINE' | 'STANDALONE_CACHE' | 'OFFLINE';
  cpuLoadPercent: number;
  gpuLoadPercent: number;
  vramUsedGb: number;
  vramTotalGb: number;
  inferenceLatencyMs: number;
  processedFps: number;
  activeStreams: number;
  modelsLoaded: string[];
  bandwidthSavingPercent: number;
  bufferedEventsCount: number;
}

export interface GithubRepoReference {
  id: string;
  name: string;
  fullName: string;
  repoUrl: string;
  category: string;
  techStack: string[];
  roleInIBVAP: string;
  description: string;
  keyComponents: string[];
  samplePipelineCode: string;
  stars?: string;
}

export interface AnalyticsRule {
  id: string;
  name: string;
  category: AlertCategory;
  description: string;
  conditionDescription: string;
  minConfidence: number;
  dwellThresholdSecs: number;
  nightOnly: boolean;
  enabled: boolean;
  severity: Severity;
}
