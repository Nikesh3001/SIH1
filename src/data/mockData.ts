import { Camera, SecurityAlert, WatchlistSubject, HotlistVehicle, EdgeNode, AnalyticsRule, GithubRepoReference } from '../types';

export const INITIAL_CAMERAS: Camera[] = [
  {
    id: 'cam-bop-01',
    name: 'BOP Forward Alpha - Primary Fence Line',
    code: 'BOP-01-PF',
    sector: 'Sector Alpha (Western Frontier)',
    bopName: 'Border Out Post 01 - Alpha',
    type: 'ptz',
    rtspUrl: 'rtsp://10.14.88.21:554/stream1',
    onvifProfile: 'Profile S (2.4)',
    ipAddress: '10.14.88.21',
    status: 'online',
    resolution: '1080p @ 30 FPS',
    fps: 30,
    fovHeading: 285,
    fovAngle: 75,
    lat: 32.7266,
    lng: 74.8570,
    altitudeMeters: 412,
    nightVisionSupported: true,
    thermalSupported: false,
    virtualFences: [
      {
        id: 'vf-01',
        name: 'Zero-Line Primary Tripwire',
        type: 'tripwire',
        direction: 'inbound',
        points: [{ x: 10, y: 70 }, { x: 50, y: 65 }, { x: 90, y: 68 }],
        color: '#ef4444',
        active: true,
        alertOnCrossing: true
      },
      {
        id: 'vf-02',
        name: 'Restricted Buffer Zone',
        type: 'restricted_zone',
        direction: 'both',
        points: [{ x: 15, y: 40 }, { x: 85, y: 38 }, { x: 90, y: 65 }, { x: 10, y: 68 }],
        color: '#f59e0b',
        active: true,
        alertOnCrossing: true
      }
    ],
    activeDetections: [
      {
        id: 'det-01',
        type: 'person',
        label: 'Person (Intruder)',
        confidence: 0.94,
        bbox: { x: 38, y: 52, w: 9, h: 22 },
        trackId: 1042,
        speedKmh: 6.2,
        direction: 'Inbound',
        timestamp: '13:42:08',
        behavior: 'Crossing Boundary',
        dwellSeconds: 24
      },
      {
        id: 'det-02',
        type: 'face',
        label: 'Face Detected',
        confidence: 0.89,
        bbox: { x: 40.5, y: 53, w: 4, h: 6 },
        trackId: 1042,
        timestamp: '13:42:08',
        faceMatch: {
          name: 'Tariq A. (Red Notice #891)',
          similarity: 0.918,
          watchlistCategory: 'WANTED'
        }
      }
    ]
  },
  {
    id: 'cam-bop-02',
    name: 'BOP Bravo - North Ridge Thermal IR',
    code: 'BOP-02-NR',
    sector: 'Sector Bravo (Mountain Ridge)',
    bopName: 'Border Out Post 02 - Bravo',
    type: 'thermal_ir',
    rtspUrl: 'rtsp://10.14.88.22:554/flir_thermal',
    onvifProfile: 'Profile T (3.1)',
    ipAddress: '10.14.88.22',
    status: 'online',
    resolution: '720p Thermal @ 25 FPS',
    fps: 25,
    fovHeading: 310,
    fovAngle: 60,
    lat: 32.7480,
    lng: 74.8820,
    altitudeMeters: 890,
    nightVisionSupported: true,
    thermalSupported: true,
    virtualFences: [
      {
        id: 'vf-03',
        name: 'Ridge Crest Perimeter',
        type: 'tripwire',
        direction: 'inbound',
        points: [{ x: 5, y: 55 }, { x: 95, y: 58 }],
        color: '#ef4444',
        active: true,
        alertOnCrossing: true
      }
    ],
    activeDetections: [
      {
        id: 'det-03',
        type: 'person',
        label: 'Thermal Heat Signature (Crawling)',
        confidence: 0.91,
        bbox: { x: 62, y: 58, w: 14, h: 9 },
        trackId: 2011,
        speedKmh: 1.4,
        direction: 'Inbound',
        timestamp: '13:41:50',
        behavior: 'Crawling/Prone',
        dwellSeconds: 58
      }
    ]
  },
  {
    id: 'cam-cp-01',
    name: 'Check Post 01 - Border Highway Transit Gate',
    code: 'CP-01-HW',
    sector: 'Sector Alpha (Transit Corridor)',
    bopName: 'Check Post 01 - Transit',
    type: 'fixed',
    rtspUrl: 'rtsp://10.14.88.35:554/anpr_lane',
    onvifProfile: 'Profile S (2.2)',
    ipAddress: '10.14.88.35',
    status: 'online',
    resolution: '4K @ 30 FPS',
    fps: 30,
    fovHeading: 180,
    fovAngle: 85,
    lat: 32.7150,
    lng: 74.8420,
    altitudeMeters: 380,
    nightVisionSupported: true,
    thermalSupported: false,
    virtualFences: [
      {
        id: 'vf-04',
        name: 'ANPR Trigger Optical Beam',
        type: 'tripwire',
        direction: 'both',
        points: [{ x: 5, y: 72 }, { x: 95, y: 72 }],
        color: '#06b6d4',
        active: true,
        alertOnCrossing: false
      }
    ],
    activeDetections: [
      {
        id: 'det-04',
        type: 'vehicle',
        label: 'Vehicle (SUV - Mahindra Scorpio)',
        confidence: 0.96,
        bbox: { x: 28, y: 35, w: 34, h: 42 },
        trackId: 3089,
        speedKmh: 24.5,
        direction: 'Inbound',
        timestamp: '13:42:15',
        vehicleCategory: 'SUV',
        plateNumber: 'JK-02-AB-4821'
      },
      {
        id: 'det-05',
        type: 'license_plate',
        label: 'Plate: JK-02-AB-4821 (HOTLIST MATCH)',
        confidence: 0.98,
        bbox: { x: 41, y: 64, w: 10, h: 5 },
        trackId: 3089,
        timestamp: '13:42:15',
        plateNumber: 'JK-02-AB-4821'
      }
    ]
  },
  {
    id: 'cam-rd-07',
    name: 'Road-07 Patrol Route Charlie Junction',
    code: 'RD-07-PR',
    sector: 'Sector Charlie (Interior Road)',
    bopName: 'Patrol Base Charlie',
    type: 'fixed',
    rtspUrl: 'rtsp://10.14.88.42:554/h264',
    onvifProfile: 'Profile S (2.0)',
    ipAddress: '10.14.88.42',
    status: 'online',
    resolution: '1080p @ 30 FPS',
    fps: 30,
    fovHeading: 90,
    fovAngle: 80,
    lat: 32.7050,
    lng: 74.8710,
    altitudeMeters: 395,
    nightVisionSupported: true,
    thermalSupported: false,
    virtualFences: [
      {
        id: 'vf-05',
        name: 'No-Stopping Zone',
        type: 'restricted_zone',
        direction: 'both',
        points: [{ x: 20, y: 50 }, { x: 80, y: 50 }, { x: 85, y: 80 }, { x: 15, y: 80 }],
        color: '#f59e0b',
        active: true,
        alertOnCrossing: true
      }
    ],
    activeDetections: [
      {
        id: 'det-06',
        type: 'person',
        label: 'Border Security Patrol (Friendly)',
        confidence: 0.97,
        bbox: { x: 22, y: 52, w: 8, h: 26 },
        trackId: 4102,
        speedKmh: 4.1,
        direction: 'East',
        timestamp: '13:42:12',
        behavior: 'Normal Patrol'
      }
    ]
  },
  {
    id: 'cam-tw-12',
    name: 'Tower-12 High Mast Pan-Tilt Long Range',
    code: 'TW-12-HM',
    sector: 'Sector Alpha (Zero Line Horizon)',
    bopName: 'Observation Post Tower 12',
    type: 'ptz',
    rtspUrl: 'rtsp://10.14.88.50:554/ptz_main',
    onvifProfile: 'Profile S/T (PTZ)',
    ipAddress: '10.14.88.50',
    status: 'online',
    resolution: '4K Optical 30x Zoom',
    fps: 30,
    fovHeading: 260,
    fovAngle: 45,
    lat: 32.7310,
    lng: 74.8390,
    altitudeMeters: 460,
    nightVisionSupported: true,
    thermalSupported: true,
    virtualFences: [
      {
        id: 'vf-06',
        name: 'International Border Zero-Line',
        type: 'zero_line_buffer',
        direction: 'inbound',
        points: [{ x: 5, y: 48 }, { x: 95, y: 52 }],
        color: '#dc2626',
        active: true,
        alertOnCrossing: true
      }
    ],
    activeDetections: [
      {
        id: 'det-07',
        type: 'vehicle',
        label: 'Concealed Truck / Suspect Transporter',
        confidence: 0.88,
        bbox: { x: 70, y: 45, w: 22, h: 16 },
        trackId: 5120,
        speedKmh: 0,
        direction: 'North',
        timestamp: '13:41:40',
        vehicleCategory: 'Truck',
        behavior: 'Loitering',
        dwellSeconds: 72
      }
    ]
  },
  {
    id: 'cam-ck-03',
    name: 'Creek Sector Delta - Riverine Cam',
    code: 'CK-03-RV',
    sector: 'Sector Delta (Riverine Creek)',
    bopName: 'Waterwing Outpost Delta',
    type: 'thermal_ir',
    rtspUrl: 'rtsp://10.14.88.63:554/riverine',
    onvifProfile: 'Profile G (Waterfront)',
    ipAddress: '10.14.88.63',
    status: 'warning',
    resolution: '1080p Thermal IR @ 20 FPS',
    fps: 20,
    fovHeading: 220,
    fovAngle: 90,
    lat: 32.6910,
    lng: 74.8190,
    altitudeMeters: 340,
    nightVisionSupported: true,
    thermalSupported: true,
    virtualFences: [
      {
        id: 'vf-07',
        name: 'River Midstream Boundary',
        type: 'tripwire',
        direction: 'inbound',
        points: [{ x: 10, y: 60 }, { x: 90, y: 64 }],
        color: '#ef4444',
        active: true,
        alertOnCrossing: true
      }
    ],
    activeDetections: []
  }
];

export const INITIAL_ALERTS: SecurityAlert[] = [
  {
    id: 'alt-001',
    eventId: 'EVT-2026-0908-01',
    cameraId: 'cam-bop-01',
    cameraName: 'BOP Forward Alpha - Primary Fence Line',
    bopName: 'BOP-01 Alpha',
    sector: 'Sector Alpha (Western Frontier)',
    timestamp: '13:42:08',
    category: 'VIRTUAL_FENCE',
    severity: 'CRITICAL',
    detectedObject: 'Person crossing Zero-Line Primary Tripwire',
    confidence: 0.94,
    ruleTriggered: 'RULE-01: Inbound Boundary Crossing with Dwell > 15s',
    status: 'NEW',
    details: 'Subject breached virtual tripwire coordinate (X: 38%, Y: 67%) moving inbound at 6.2 km/h. Face match algorithm identified suspect similarity 91.8%.',
    snapshotUrl: '',
    coordinates: { lat: 32.7266, lng: 74.8570 },
    personName: 'Tariq A. (Red Notice #891)',
    tamperHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    videoClipDurationSecs: 18
  },
  {
    id: 'alt-002',
    eventId: 'EVT-2026-0908-02',
    cameraId: 'cam-cp-01',
    cameraName: 'Check Post 01 - Transit Gate',
    bopName: 'Check Post 01',
    sector: 'Sector Alpha (Transit Corridor)',
    timestamp: '13:42:15',
    category: 'ANPR_WATCHLIST',
    severity: 'HIGH',
    detectedObject: 'Black SUV - Mahindra Scorpio',
    confidence: 0.98,
    ruleTriggered: 'RULE-04: Stolen/Flagged License Plate Detection',
    status: 'NEW',
    details: 'Recognized plate "JK-02-AB-4821" matched with National Stolen Vehicle Registry & Border Intelligence Hotlist (FIR #4412/2026). Vehicle stopped at transit gate.',
    snapshotUrl: '',
    coordinates: { lat: 32.7150, lng: 74.8420 },
    plateNumber: 'JK-02-AB-4821',
    tamperHash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
    videoClipDurationSecs: 22
  },
  {
    id: 'alt-003',
    eventId: 'EVT-2026-0908-03',
    cameraId: 'cam-bop-02',
    cameraName: 'BOP Bravo - North Ridge Thermal IR',
    bopName: 'BOP-02 Bravo',
    sector: 'Sector Bravo (Mountain Ridge)',
    timestamp: '13:41:50',
    category: 'NIGHT_MOVEMENT',
    severity: 'HIGH',
    detectedObject: 'Crawling/Prone Thermal Signature',
    confidence: 0.91,
    ruleTriggered: 'RULE-06: Prone Posture Movement in High-Altitude Restricted Zone',
    status: 'ACKNOWLEDGED',
    details: 'Thermal IR sensor detected low-profile crawling movement (1.4 km/h) approaching ridge crest perimeter. Persistence time: 58 seconds.',
    snapshotUrl: '',
    coordinates: { lat: 32.7480, lng: 74.8820 },
    acknowledgedBy: 'Duty Officer Capt. R. Sharma',
    actionTaken: 'Spotlight directed; Sector 2 QRF team alerted on VHF channel 4',
    tamperHash: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    videoClipDurationSecs: 30
  },
  {
    id: 'alt-004',
    eventId: 'EVT-2026-0908-04',
    cameraId: 'cam-tw-12',
    cameraName: 'Tower-12 High Mast PTZ',
    bopName: 'Tower 12',
    sector: 'Sector Alpha (Zero Line Horizon)',
    timestamp: '13:38:20',
    category: 'LOITERING',
    severity: 'MEDIUM',
    detectedObject: 'Commercial Truck (Stationary)',
    confidence: 0.88,
    ruleTriggered: 'RULE-03: Perimeter Stationary Vehicle Loitering > 60s',
    status: 'DISPATCHED',
    details: 'Vehicle stopped in designated unpaved shoulder buffer for 72 seconds without official clearance. QRF intercept dispatched.',
    snapshotUrl: '',
    coordinates: { lat: 32.7310, lng: 74.8390 },
    acknowledgedBy: 'Sub-Inspector M. Khan',
    actionTaken: 'QRF Patrol Bravo-1 dispatched to interrogate vehicle',
    tamperHash: '4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e',
    videoClipDurationSecs: 15
  },
  {
    id: 'alt-005',
    eventId: 'EVT-2026-0908-05',
    cameraId: 'cam-bop-01',
    cameraName: 'BOP Forward Alpha',
    bopName: 'BOP-01 Alpha',
    sector: 'Sector Alpha',
    timestamp: '13:30:10',
    category: 'FACE_WATCHLIST',
    severity: 'CRITICAL',
    detectedObject: 'Face Match: Red Notice Watchlist',
    confidence: 0.92,
    ruleTriggered: 'RULE-05: High-Confidence Biometric Watchlist Positive',
    status: 'RESOLVED',
    details: 'Biometric vector extracted by ArcFace model matched national fugitive dossier with 91.8% similarity. Target apprehended by forward checkpoint team.',
    snapshotUrl: '',
    coordinates: { lat: 32.7266, lng: 74.8570 },
    personName: 'Tariq A.',
    acknowledgedBy: 'Border Security HQ Ops',
    actionTaken: 'Detained at BOP-01 Holding Cell. Case logged with intelligence bureau.',
    tamperHash: '7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c',
    videoClipDurationSecs: 24
  }
];

export const WATCHLIST_SUBJECTS: WatchlistSubject[] = [
  {
    id: 'w-01',
    name: 'Tariq Ahmed',
    alias: 'The Courier',
    category: 'WANTED',
    threatLevel: 'CRITICAL',
    caseRef: 'NIA/OPS/2026/891',
    flagReason: 'Active Interpol Red Notice; Suspected cross-border contraband courier and infiltration guide',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    lastKnownSector: 'Sector Alpha (Western Frontier)',
    nationality: 'Regional',
    biometricConfidenceThreshold: 0.85
  },
  {
    id: 'w-02',
    name: 'Rashid K. Bilal',
    alias: 'Abu Hamza',
    category: 'WANTED',
    threatLevel: 'CRITICAL',
    caseRef: 'BIA/SURV/4021',
    flagReason: 'Wanted for drone payload reception and weapons drops across border sectors',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    lastKnownSector: 'Sector Bravo Ridge',
    nationality: 'Regional',
    biometricConfidenceThreshold: 0.88
  },
  {
    id: 'w-03',
    name: 'Vikram Singh',
    alias: 'Border Informant V-4',
    category: 'FRIENDLY_FORCE',
    threatLevel: 'LOW',
    caseRef: 'BSF/INT/REC-12',
    flagReason: 'Authorized intelligence liaison & forward scout. Allow unhindered transit.',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    lastKnownSector: 'Patrol Base Charlie',
    nationality: 'Domestic',
    biometricConfidenceThreshold: 0.80
  },
  {
    id: 'w-04',
    name: 'Davinder "Kaka" Paul',
    alias: 'Trucker Dave',
    category: 'PERSON_OF_INTEREST',
    threatLevel: 'HIGH',
    caseRef: 'CUSTOMS/NAR/2025/319',
    flagReason: 'Repeat illegal border crossing near transit dry-ports. Driver of suspect tanker vehicles.',
    photoUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&auto=format&fit=crop&q=80',
    lastKnownSector: 'Check Post 01 Transit Gate',
    nationality: 'Domestic',
    biometricConfidenceThreshold: 0.82
  }
];

export const HOTLIST_VEHICLES: HotlistVehicle[] = [
  {
    id: 'v-01',
    plateNumber: 'JK-02-AB-4821',
    stateCode: 'JK',
    vehicleType: 'Mahindra Scorpio (Black SUV)',
    color: 'Midnight Black',
    flagReason: 'Stolen vehicle reported in armed border breach reconnaissance; false transit plates',
    riskLevel: 'CRITICAL',
    reportedDate: '2026-09-02',
    lastDetectedBOP: 'Check Post 01 (Gate 2)'
  },
  {
    id: 'v-02',
    plateNumber: 'PB-08-X-9012',
    stateCode: 'PB',
    vehicleType: 'Tata 407 Light Commercial Truck',
    color: 'Navy Blue / Yellow Canvas',
    flagReason: 'Suspected modification with concealed bottom cavity for contraband smuggling',
    riskLevel: 'HIGH',
    reportedDate: '2026-08-28',
    lastDetectedBOP: 'Road-07 Patrol Junction'
  },
  {
    id: 'v-03',
    plateNumber: 'DL-01-C-3388',
    stateCode: 'DL',
    vehicleType: 'Toyota Fortuner',
    color: 'Pearl White',
    flagReason: 'Evaded border patrol checkpoint signals at BOP-04 three days ago',
    riskLevel: 'HIGH',
    reportedDate: '2026-09-05',
    lastDetectedBOP: 'Sector Alpha Highway'
  },
  {
    id: 'v-04',
    plateNumber: 'HR-26-DQ-5110',
    stateCode: 'HR',
    vehicleType: 'Royal Enfield Himalayan (Motorcycle)',
    color: 'Matte Olive Green',
    flagReason: 'Night movement near zero-line without headlight clearance',
    riskLevel: 'MEDIUM',
    reportedDate: '2026-09-07',
    lastDetectedBOP: 'Tower-12 Perimeter'
  }
];

export const EDGE_NODES: EdgeNode[] = [
  {
    id: 'edge-01',
    name: 'Edge AI Appliance - Alpha Sector',
    sector: 'Sector Alpha',
    bopLocation: 'BOP Forward Alpha Bunker',
    ip: '10.14.88.10',
    status: 'ONLINE',
    cpuLoadPercent: 42,
    gpuLoadPercent: 78,
    vramUsedGb: 11.4,
    vramTotalGb: 16.0,
    inferenceLatencyMs: 14.2,
    processedFps: 120, // 4 streams @ 30 fps
    activeStreams: 4,
    modelsLoaded: ['YOLOv8x-Custom-Border', 'ByteTrack-V2', 'ArcFace-ResNet50', 'PaddleOCR-ANPR'],
    bandwidthSavingPercent: 94.8,
    bufferedEventsCount: 0
  },
  {
    id: 'edge-02',
    name: 'Edge AI Appliance - Bravo Ridge',
    sector: 'Sector Bravo',
    bopLocation: 'BOP Bravo Fortified Post',
    ip: '10.14.88.12',
    status: 'ONLINE',
    cpuLoadPercent: 38,
    gpuLoadPercent: 64,
    vramUsedGb: 9.8,
    vramTotalGb: 16.0,
    inferenceLatencyMs: 11.5,
    processedFps: 90,
    activeStreams: 3,
    modelsLoaded: ['Thermal-YOLOv8m', 'ByteTrack-IR', 'Loitering-Anomaly-RNN'],
    bandwidthSavingPercent: 96.2,
    bufferedEventsCount: 0
  },
  {
    id: 'edge-03',
    name: 'Edge AI Appliance - Transit Gate 01',
    sector: 'Transit Corridor',
    bopLocation: 'Check Post 01 Ops Room',
    ip: '10.14.88.15',
    status: 'ONLINE',
    cpuLoadPercent: 48,
    gpuLoadPercent: 82,
    vramUsedGb: 13.2,
    vramTotalGb: 16.0,
    inferenceLatencyMs: 16.8,
    processedFps: 150,
    activeStreams: 5,
    modelsLoaded: ['YOLOv8-Plate-Detect', 'EasyOCR-IndianPlates', 'Vehicle-Classifier-12Class'],
    bandwidthSavingPercent: 92.5,
    bufferedEventsCount: 0
  }
];

export const SYSTEM_RULES: AnalyticsRule[] = [
  {
    id: 'RULE-01',
    name: 'Virtual Fence Zero-Line Breach',
    category: 'VIRTUAL_FENCE',
    description: 'Triggers critical alarm when person or vehicle trajectory crosses the virtual border demarcation line in inbound direction.',
    conditionDescription: 'Target = Person/Vehicle AND Crossing = Inbound AND Boundary = Zero_Line',
    minConfidence: 0.85,
    dwellThresholdSecs: 0,
    nightOnly: false,
    enabled: true,
    severity: 'CRITICAL'
  },
  {
    id: 'RULE-02',
    name: 'Restricted Buffer Zone Intrusion',
    category: 'INTRUSION',
    description: 'Generates alert when unauthorized entity is detected inside 150-meter buffer strip between fence and zero line.',
    conditionDescription: 'Target = Person AND Inside(Zone = Restricted_Buffer) AND Dwell > 10s',
    minConfidence: 0.80,
    dwellThresholdSecs: 10,
    nightOnly: false,
    enabled: true,
    severity: 'HIGH'
  },
  {
    id: 'RULE-03',
    name: 'Perimeter Loitering Detection',
    category: 'LOITERING',
    description: 'Filters out normal transit patrols and triggers when a subject remains within 15 meters of fence perimeter for > 30 seconds.',
    conditionDescription: 'Displacement < 5m AND DwellTime > 30s AND Zone = Fence_Perimeter',
    minConfidence: 0.75,
    dwellThresholdSecs: 30,
    nightOnly: false,
    enabled: true,
    severity: 'MEDIUM'
  },
  {
    id: 'RULE-04',
    name: 'ANPR Hotlist / Stolen Plate Match',
    category: 'ANPR_WATCHLIST',
    description: 'Instant high-priority interception alert when recognized license plate matches stolen, contraband, or surveillance hotlist.',
    conditionDescription: 'ANPR_Plate MATCH HotlistDatabase (Levenshtein Distance <= 1)',
    minConfidence: 0.90,
    dwellThresholdSecs: 0,
    nightOnly: false,
    enabled: true,
    severity: 'HIGH'
  },
  {
    id: 'RULE-05',
    name: 'Biometric Face Recognition Watchlist',
    category: 'FACE_WATCHLIST',
    description: 'Compares cropped facial embeddings against designated criminal, terrorist, or unauthorized personnel databases.',
    conditionDescription: 'CosineSimilarity(ArcFace_Embedding, Watchlist) >= 0.85',
    minConfidence: 0.85,
    dwellThresholdSecs: 0,
    nightOnly: false,
    enabled: true,
    severity: 'CRITICAL'
  },
  {
    id: 'RULE-06',
    name: 'Night-Time Movement in Prohibited Sector',
    category: 'NIGHT_MOVEMENT',
    description: 'Thermal IR & low-light luminescence motion scoring during border curfew hours (21:00 to 05:00).',
    conditionDescription: 'Time IN (21:00-05:00) AND MotionEnergy > Threshold AND Posture != Standing',
    minConfidence: 0.78,
    dwellThresholdSecs: 5,
    nightOnly: true,
    enabled: true,
    severity: 'HIGH'
  }
];

export const GITHUB_REPOSITORIES: GithubRepoReference[] = [
  {
    id: 'repo-01',
    name: 'virtual-fencing-system',
    fullName: 'spartny/virtual-fencing-system',
    repoUrl: 'https://github.com/spartny/virtual-fencing-system',
    category: 'Virtual Fence / Intrusion Detection',
    techStack: ['Python', 'YOLOv8', 'OpenCV', 'Shapely', 'RTSP Stream'],
    roleInIBVAP: 'Core implementation for dynamic virtual polyline & polygon boundary crossing detection using vector geometry against tracked object centroids.',
    description: 'Uses YOLOv8 + computer vision to detect persons/vehicles and determine whether their trajectory intersects predefined virtual fences.',
    keyComponents: [
      'Line crossing detection using Shapely LineString intersection',
      'Directional vector calculation (Inbound vs Outbound traversal)',
      'Multi-zone polygon containment verification',
      'Configurable fence coordinates via UI calibration tool'
    ],
    samplePipelineCode: `# Virtual Fence Crossing Logic (IBVAP Integration)
from shapely.geometry import LineString, Point

def check_fence_breach(track_history, fence_line_coords):
    if len(track_history) < 2:
        return False, None
    prev_pt = Point(track_history[-2])
    curr_pt = Point(track_history[-1])
    movement_vector = LineString([prev_pt, curr_pt])
    boundary = LineString(fence_line_coords)
    
    if movement_vector.intersects(boundary):
        # Calculate directional normal vector
        direction = "INBOUND" if curr_pt.y > prev_pt.y else "OUTBOUND"
        return True, direction
    return False, None`
  },
  {
    id: 'repo-02',
    name: 'TraceAI-Intelligent-Missing-Person-Suspect-Tracking-System',
    fullName: 'ArnavPundir22/TraceAI-Intelligent-Missing-Person-Suspect-Tracking-System',
    repoUrl: 'https://github.com/ArnavPundir22/TraceAI-Intelligent-Missing-Person-Suspect-Tracking-System',
    category: 'Multi-Camera Surveillance / Person Tracking',
    techStack: ['Python', 'YOLOv8', 'ByteTrack', 'ArcFace / InsightFace', 'FastAPI', 'WebSockets'],
    roleInIBVAP: 'End-to-end multi-camera person re-identification (ReID), ByteTrack trajectory association across border sector cameras, and facial biometric watchlist matching.',
    description: 'Combines CCTV/video sources, YOLOv8 person detection, ArcFace face recognition, ByteTrack tracking, and real-time security alerts into an integrated surveillance architecture.',
    keyComponents: [
      'ByteTrack multi-object association across occlusion',
      '512-dimension ArcFace embedding extraction for low-resolution CCTV faces',
      'Cosine similarity lookup against criminal watchlist database',
      'Multi-camera handover matching (Camera A -> Camera B trajectory)'
    ],
    samplePipelineCode: `# Cross-Camera Re-ID & Face Verification
import torch
import numpy as np

def verify_watchlist_suspect(face_crop, watchlist_embeddings, threshold=0.85):
    # Extract 512-d biometric embedding
    face_embedding = arcface_model(face_crop)
    face_embedding = face_embedding / np.linalg.norm(face_embedding)
    
    # Cosine similarity matrix multiplication
    similarities = np.dot(watchlist_embeddings, face_embedding)
    best_match_idx = np.argmax(similarities)
    best_score = similarities[best_match_idx]
    
    if best_score >= threshold:
        return True, best_match_idx, float(best_score)
    return False, None, float(best_score)`
  },
  {
    id: 'repo-03',
    name: 'ANPR-System',
    fullName: 'Tkvmaster/ANPR-System',
    repoUrl: 'https://github.com/Tkvmaster/ANPR-System',
    category: 'ANPR + Tracking Pipeline',
    techStack: ['Python', 'YOLOv8-Plate', 'PaddleOCR', 'SORT / ByteTrack', 'OpenCV'],
    roleInIBVAP: 'Combines license plate detection, tracking across video frames to pick the sharpest crop, and PaddleOCR text extraction for border transit check posts.',
    description: 'High-accuracy real-time video ANPR pipeline that tracks vehicles and plate boxes over consecutive frames, running OCR on the optimal sharpness frame.',
    keyComponents: [
      'License plate bounding box localization using YOLOv8-plate weights',
      'Temporal frame pooling to avoid redundant OCR on duplicate frames',
      'Laplacian variance sharpness scoring for optical OCR accuracy',
      'Plate string sanitization and state code parsing'
    ],
    samplePipelineCode: `# Multi-Frame ANPR with Sharpness Quality Scoring
import cv2

def select_best_plate_crop(plate_crops_buffer):
    best_crop = None
    max_sharpness = -1.0
    for crop in plate_crops_buffer:
        gray = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
        sharpness = cv2.Laplacian(gray, cv2.CV_64F).var()
        if sharpness > max_sharpness:
            max_sharpness = sharpness
            best_crop = crop
    # Run PaddleOCR / EasyOCR on cleanest crop
    ocr_result = ocr_engine.ocr(best_crop, cls=True)
    return parse_license_plate(ocr_result)`
  },
  {
    id: 'repo-04',
    name: 'ANPR Indian Plates',
    fullName: 'sid0312/ANPR',
    repoUrl: 'https://github.com/sid0312/ANPR',
    category: 'Indian Number Plate ANPR',
    techStack: ['Python', 'YOLO', 'Pytesseract', 'OpenCV Preprocessing'],
    roleInIBVAP: 'Specialized optical character filters and regex patterns tailored for Indian national and state vehicle license plate formats.',
    description: 'ANPR system specifically targeting Indian number plates, using YOLO for plate localization, morphological contour transformations, and OCR.',
    keyComponents: [
      'Bilateral filtering and adaptive thresholding for dusty/weathered plates',
      'Character segmentation with aspect ratio constraint verification',
      'Indian RTO format regex validation: ^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$',
      'Plate color differentiation (Yellow commercial vs White private vs Military upward arrow)'
    ],
    samplePipelineCode: `# Indian Number Plate Regex & Normalization
import re

INDIAN_PLATE_PATTERN = r'^[A-Z]{2}[ -]?[0-9]{2}[ -]?[A-Z]{1,3}[ -]?[0-9]{4}$'

def validate_indian_plate(raw_text):
    clean = re.sub(r'[^A-Z0-9]', '', raw_text.upper())
    # Correct common OCR confusions (e.g. O -> 0, I -> 1 in digit slots)
    sanitized = apply_border_rto_heuristic(clean)
    is_valid = bool(re.match(r'^[A-Z]{2}[0-9]{2}[A-Z]{1,3}[0-9]{4}$', sanitized))
    return is_valid, sanitized`
  },
  {
    id: 'repo-05',
    name: 'Automatic-Number-Plate-Recognition--ANPR-',
    fullName: 'AarohiSingla/Automatic-Number-Plate-Recognition--ANPR-',
    repoUrl: 'https://github.com/AarohiSingla/Automatic-Number-Plate-Recognition--ANPR-',
    category: 'YOLOv8 + EasyOCR Pipeline',
    techStack: ['Python', 'YOLOv8', 'EasyOCR', 'PyTorch', 'Streamlit'],
    roleInIBVAP: 'Provides a modular reference for training custom YOLOv8 plate detectors and running EasyOCR with GPU acceleration on live RTSP feeds.',
    description: 'Modern ANPR reference integrating YOLOv8 model weights with EasyOCR inference, real-time bounding box annotations, and database storage.',
    keyComponents: [
      'YOLOv8n-plate model inference via ONNX Runtime / TensorRT',
      'EasyOCR multilingual recognition engine with GPU batching',
      'Real-time CSV and SQLite event recording',
      'Fast video frame inference with sub-20ms latency'
    ],
    samplePipelineCode: `# YOLOv8 + EasyOCR Ingestion
from ultralytics import YOLO
import easyocr

plate_model = YOLO("weights/yolov8_plate.pt")
reader = easyocr.Reader(['en'], gpu=True)

def process_frame(frame):
    results = plate_model(frame, conf=0.5)
    for box in results[0].boxes:
        x1, y1, x2, y2 = map(int, box.xyxy[0])
        plate_crop = frame[y1:y2, x1:x2]
        ocr_out = reader.readtext(plate_crop)
        # Process OCR output and log alert
        yield ocr_out`
  },
  {
    id: 'repo-06',
    name: 'smart-security-cam',
    fullName: 'IRFAN18727/smart-security-cam',
    repoUrl: 'https://github.com/IRFAN18727/smart-security-cam',
    category: 'AI Security Camera Architecture',
    techStack: ['Python', 'YOLOv8', 'ByteTrack', 'FaceNet', 'Twilio / Telegram Alerts', 'SQLite'],
    roleInIBVAP: 'Serves as an architectural template uniting person detection, ByteTrack multi-person tracking, face recognition, event logging, and automated alert notification dispatch.',
    description: 'A complete end-to-end security camera pipeline combining YOLOv8 + ByteTrack + face recognition + automated alert dispatch and incident logging.',
    keyComponents: [
      'Multi-person persistent track ID assignment',
      'Event trigger correlation engine',
      'Snapshot cropping and cryptographic hashing',
      'Real-time alert dispatch to command operator consoles'
    ],
    samplePipelineCode: `# Alert Dispatch & Incident Snapshot Capture
import hashlib, time

def generate_evidence_record(event_type, camera_id, bbox, frame):
    timestamp = time.strftime('%Y-%m-%d %H:%M:%S')
    # Generate cryptographic tamper-evident hash
    evidence_hash = hashlib.sha256(frame.tobytes()).hexdigest()
    
    return {
        "event_id": f"IBVAP-{int(time.time())}",
        "camera_id": camera_id,
        "event_type": event_type,
        "timestamp": timestamp,
        "tamper_hash": evidence_hash,
        "bbox": bbox
    }`
  },
  {
    id: 'repo-07',
    name: 'anomaly-yolo-face-surveillance',
    fullName: 'giacomobettas/anomaly-yolo-face-surveillance',
    repoUrl: 'https://github.com/giacomobettas/anomaly-yolo-face-surveillance',
    category: 'CCTV Anomaly & Suspicious Activity Detection',
    techStack: ['Python', 'YOLO', 'OpenCV', 'Optical Flow', 'Motion Heatmaps'],
    roleInIBVAP: 'Suspicious behavioral analytics including perimeter loitering, crawling/prone postures, sudden directional shifts, and optical flow motion anomaly scoring.',
    description: 'Combines YOLO person detection with face identification and optical flow motion scoring to spot anomalies, loitering, and unusual movements in CCTV surveillance.',
    keyComponents: [
      'Dense Farneback optical flow for anomalous movement velocity detection',
      'Bounding box aspect ratio analysis for crawling/prone posture detection',
      'Loitering timer: accumulates time-in-cell within spatial grid',
      'CSV/JSON event logging with anomaly threat score'
    ],
    samplePipelineCode: `# Posture & Loitering Anomaly Analysis
def detect_prone_or_loitering(track):
    bbox = track.bbox # [x, y, w, h]
    aspect_ratio = bbox[2] / (bbox[3] + 1e-5) # width / height
    
    # Human standing aspect ratio is usually ~0.3 - 0.5. Prone/crawling is > 1.2
    is_crawling = aspect_ratio > 1.25
    is_loitering = (track.dwell_time > 30.0) and (track.total_displacement < 5.0)
    
    threat_score = 0.0
    if is_crawling: threat_score += 0.6
    if is_loitering: threat_score += 0.4
    return threat_score, is_crawling, is_loitering`
  },
  {
    id: 'repo-08',
    name: 'Identification-of-Suspects-In-Crowd-Using-Face-Recognition-With-Deep-Learning',
    fullName: 'ShreyasSN/Identification-of-Suspects-In-Crowd-Using-Face-Recognition-With-Deep-Learning',
    repoUrl: 'https://github.com/ShreyasSN/Identification-of-Suspects-In-Crowd-Using-Face-Recognition-With-Deep-Learning',
    category: 'Face Recognition in CCTV Footage',
    techStack: ['Python', 'YOLOv8-Face', 'DeepFace / FaceNet', 'TensorFlow', 'OpenCV'],
    roleInIBVAP: 'Robust face localization and identification under real-world CCTV constraints such as low illumination, long distances, angled cameras, and partial face coverings/scarves.',
    description: 'Uses YOLOv8 for face detection and FaceNet/DeepFace for recognition, with considerations for CCTV conditions such as varying lighting, motion blur, and occluded faces.',
    keyComponents: [
      'Face alignment via 5 facial landmarks (eyes, nose, mouth corners)',
      'Contrast limited adaptive histogram equalization (CLAHE) for night CCTV',
      'Occlusion handling (masks, turbans, tactical scarves)',
      'High-throughput vector indexing using FAISS / Annoy for million-suspect databases'
    ],
    samplePipelineCode: `# Low-Illumination CCTV Facial Enhancement & Landmark Alignment
import cv2

def enhance_cctv_face(face_crop):
    # Convert to LAB color space and apply CLAHE to L channel
    lab = cv2.cvtColor(face_crop, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8,8))
    cl = clahe.apply(l)
    enhanced_lab = cv2.merge((cl, a, b))
    enhanced_bgr = cv2.cvtColor(enhanced_lab, cv2.COLOR_LAB2BGR)
    return enhanced_bgr`
  }
];

export const PUBLIC_CAMERAS: import('../types').PublicCameraBookmark[] = [
  {
    id: 'pub-01',
    name: 'Times Square Traffic Cam',
    streamUrl: 'https://cdn-1.earthcam.com/cams/tsq1.m3u8',
    location: 'New York, US',
    tags: ['Traffic', 'Urban', 'EarthCam'],
    addedDate: '2026-09-07'
  },
  {
    id: 'pub-02',
    name: 'Shibuya Crossing',
    streamUrl: 'https://tokyo-cam.example.com/shibuya.m3u8',
    location: 'Tokyo, JP',
    tags: ['Crowd', 'Intersection'],
    addedDate: '2026-09-08'
  }
];
