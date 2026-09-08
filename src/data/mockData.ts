import { Camera, SecurityAlert, WatchlistSubject, HotlistVehicle, EdgeNode, AnalyticsRule, GithubRepoReference } from '../types';

import cam01 from '../assets/images/cam_01.jpg';
import cam02 from '../assets/images/cam_02.jpg';
import cam03 from '../assets/images/cam_03.jpg';
import cam04 from '../assets/images/cam_04.jpg';
import cam05 from '../assets/images/cam_05.jpg';
import cam06 from '../assets/images/cam_06.jpg';
import cam07 from '../assets/images/cam_07.jpg';
import cam08 from '../assets/images/cam_08.jpg';

export const INITIAL_CAMERAS: Camera[] = [
  {
    id: 'cam-01',
    name: 'Border Outpost Gate',
    code: 'CAM-01',
    sector: 'Sector Alpha',
    bopName: 'Gate Checkpoint',
    type: 'fixed',
    rtspUrl: cam01,
    onvifProfile: 'Profile S',
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
    virtualFences: [],
    activeDetections: []
  },
  {
    id: 'cam-02',
    name: 'Perimeter Fence',
    code: 'CAM-02',
    sector: 'Sector Alpha',
    bopName: 'Fence Line North',
    type: 'ptz',
    rtspUrl: cam02,
    onvifProfile: 'Profile S',
    ipAddress: '10.14.88.22',
    status: 'online',
    resolution: '4K @ 30 FPS',
    fps: 30,
    fovHeading: 310,
    fovAngle: 60,
    lat: 32.7480,
    lng: 74.8820,
    altitudeMeters: 890,
    nightVisionSupported: true,
    thermalSupported: false,
    virtualFences: [],
    activeDetections: [
      {
        id: 'det-c2-01',
        type: 'person',
        label: 'PERSON | ID: P-102 | 96.8%',
        confidence: 0.968,
        bbox: { x: 45, y: 55, w: 10, h: 25 },
        trackId: 102,
        speedKmh: 4.2,
        direction: 'East',
        timestamp: '21:23:41',
        behavior: 'Patrolling'
      }
    ]
  },
  {
    id: 'cam-03',
    name: 'Border Road',
    code: 'CAM-03',
    sector: 'Sector Bravo',
    bopName: 'Road Charlie',
    type: 'fixed',
    rtspUrl: cam03,
    onvifProfile: 'Profile S',
    ipAddress: '10.14.88.23',
    status: 'online',
    resolution: '1080p @ 30 FPS',
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
        id: 'vf-03',
        name: 'ZONE-03',
        type: 'restricted_zone',
        direction: 'both',
        points: [{ x: 10, y: 50 }, { x: 90, y: 50 }, { x: 95, y: 90 }, { x: 5, y: 90 }],
        color: '#f59e0b',
        active: true,
        alertOnCrossing: true
      }
    ],
    activeDetections: []
  },
  {
    id: 'cam-04',
    name: 'Check Post',
    code: 'CAM-04',
    sector: 'Sector Bravo',
    bopName: 'Transit Gate',
    type: 'fixed',
    rtspUrl: cam04,
    onvifProfile: 'Profile S',
    ipAddress: '10.14.88.24',
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
    virtualFences: [],
    activeDetections: []
  },
  {
    id: 'cam-05',
    name: 'Watch Tower',
    code: 'CAM-05',
    sector: 'Sector Charlie',
    bopName: 'Tower Alpha',
    type: 'ptz',
    rtspUrl: cam05,
    onvifProfile: 'Profile S/T (PTZ)',
    ipAddress: '10.14.88.25',
    status: 'warning',
    resolution: '4K Optical Zoom',
    fps: 30,
    fovHeading: 260,
    fovAngle: 45,
    lat: 32.7310,
    lng: 74.8390,
    altitudeMeters: 460,
    nightVisionSupported: true,
    thermalSupported: false,
    virtualFences: [],
    activeDetections: []
  },
  {
    id: 'cam-06',
    name: 'Vehicle Inspection Area',
    code: 'CAM-06',
    sector: 'Sector Charlie',
    bopName: 'Inspection Bay 1',
    type: 'fixed',
    rtspUrl: cam06,
    onvifProfile: 'Profile S',
    ipAddress: '10.14.88.26',
    status: 'online',
    resolution: '1080p @ 30 FPS',
    fps: 30,
    fovHeading: 220,
    fovAngle: 90,
    lat: 32.6910,
    lng: 74.8190,
    altitudeMeters: 340,
    nightVisionSupported: true,
    thermalSupported: false,
    virtualFences: [],
    activeDetections: [
      {
        id: 'det-c6-01',
        type: 'vehicle',
        label: 'VEHICLE | ID: V-221 | 94.2%',
        confidence: 0.942,
        bbox: { x: 30, y: 40, w: 40, h: 30 },
        trackId: 221,
        speedKmh: 0,
        direction: 'Stationary',
        timestamp: '21:23:48',
        behavior: 'Inspection'
      }
    ]
  },
  {
    id: 'cam-07',
    name: 'Restricted Zone',
    code: 'CAM-07',
    sector: 'Sector Delta',
    bopName: 'Corridor B',
    type: 'fixed',
    rtspUrl: cam07,
    onvifProfile: 'Profile S',
    ipAddress: '10.14.88.27',
    status: 'online',
    resolution: '1080p @ 30 FPS',
    fps: 30,
    fovHeading: 180,
    fovAngle: 80,
    lat: 32.6800,
    lng: 74.8000,
    altitudeMeters: 330,
    nightVisionSupported: true,
    thermalSupported: false,
    virtualFences: [],
    activeDetections: []
  },
  {
    id: 'cam-08',
    name: 'Night Surveillance / Thermal Camera',
    code: 'CAM-08',
    sector: 'Sector Delta',
    bopName: 'Perimeter South',
    type: 'thermal_ir',
    rtspUrl: cam08,
    onvifProfile: 'Profile T (Thermal)',
    ipAddress: '10.14.88.28',
    status: 'online',
    resolution: '720p Thermal',
    fps: 25,
    fovHeading: 120,
    fovAngle: 60,
    lat: 32.6700,
    lng: 74.7900,
    altitudeMeters: 350,
    nightVisionSupported: true,
    thermalSupported: true,
    virtualFences: [],
    activeDetections: []
  }
];

export const INITIAL_ALERTS: SecurityAlert[] = [
  {
    id: 'alt-001',
    eventId: 'EVT-2026-0908-01',
    cameraId: 'cam-07',
    cameraName: 'Restricted Zone',
    bopName: 'CAM-07',
    sector: 'Sector Delta',
    timestamp: '21:24:11',
    category: 'FACE_MATCH',
    severity: 'CRITICAL',
    detectedObject: 'Face match detected',
    confidence: 0.98,
    ruleTriggered: 'RULE-05: High-Confidence Biometric Watchlist Positive',
    status: 'NEW',
    details: 'Biometric match identified in restricted zone.',
    snapshotUrl: '',
    coordinates: { lat: 32.6800, lng: 74.8000 },
    personName: 'Unknown Suspect',
    tamperHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    videoClipDurationSecs: 18
  },
  {
    id: 'alt-002',
    eventId: 'EVT-2026-0908-02',
    cameraId: 'cam-03',
    cameraName: 'Border Road',
    bopName: 'CAM-03',
    sector: 'Sector Bravo',
    timestamp: '21:24:03',
    category: 'INTRUSION',
    severity: 'CRITICAL',
    detectedObject: 'Intrusion alert',
    confidence: 0.94,
    ruleTriggered: 'RULE-01: Boundary Breach',
    status: 'NEW',
    details: 'INTRUSION DETECTED | ZONE-03',
    snapshotUrl: '',
    coordinates: { lat: 32.7150, lng: 74.8420 },
    tamperHash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
    videoClipDurationSecs: 22
  },
  {
    id: 'alt-003',
    eventId: 'EVT-2026-0908-03',
    cameraId: 'cam-06',
    cameraName: 'Vehicle Inspection Area',
    bopName: 'CAM-06',
    sector: 'Sector Charlie',
    timestamp: '21:23:48',
    category: 'VEHICLE_TRACK',
    severity: 'INFO',
    detectedObject: 'Vehicle detected',
    confidence: 0.94,
    ruleTriggered: 'Routine Vehicle Check',
    status: 'ACKNOWLEDGED',
    details: 'VEHICLE | ID: V-221 | 94.2%',
    snapshotUrl: '',
    coordinates: { lat: 32.6910, lng: 74.8190 },
    plateNumber: 'UNKNOWN',
    tamperHash: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    videoClipDurationSecs: 30
  },
  {
    id: 'alt-004',
    eventId: 'EVT-2026-0908-04',
    cameraId: 'cam-02',
    cameraName: 'Perimeter Fence',
    bopName: 'CAM-02',
    sector: 'Sector Alpha',
    timestamp: '21:23:41',
    category: 'PERSON_TRACK',
    severity: 'WARNING',
    detectedObject: 'Person detected',
    confidence: 0.96,
    ruleTriggered: 'Proximity Warning',
    status: 'ACKNOWLEDGED',
    details: 'PERSON | ID: P-102 | 96.8%',
    snapshotUrl: '',
    coordinates: { lat: 32.7480, lng: 74.8820 },
    tamperHash: '4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e',
    videoClipDurationSecs: 15
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
