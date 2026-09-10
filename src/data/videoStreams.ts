// Curated tactical video streams for Option 2: Live Video Streaming Mode
// Uses reliable Google Cloud public test streams & high-grade security camera loops

export interface StreamSourceConfig {
  id: string;
  cameraCode: string;
  name: string;
  category: 'gate' | 'perimeter' | 'thermal' | 'traffic' | 'aerial' | 'webcam';
  videoUrl: string;
  backupVideoUrl: string;
  hlsUrl?: string;
  description: string;
}

export const TACTICAL_VIDEO_FEEDS: Record<string, StreamSourceConfig> = {
  'cam-01': {
    id: 'cam-01',
    cameraCode: 'CAM-01',
    name: 'Gate Checkpoint Feed',
    category: 'gate',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    backupVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    description: 'Real-time vehicle and personnel gate traffic feed (1080p 30fps)'
  },
  'cam-02': {
    id: 'cam-02',
    cameraCode: 'CAM-02',
    name: 'Fence Line North Feed',
    category: 'perimeter',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    backupVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    description: 'High-resolution perimeter fence PTZ live video sweep'
  },
  'cam-03': {
    id: 'cam-03',
    cameraCode: 'CAM-03',
    name: 'Zero Line Thermal IR Feed',
    category: 'thermal',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    backupVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    description: 'Long-range cooled MWIR thermal continuous sensor feed'
  },
  'cam-04': {
    id: 'cam-04',
    cameraCode: 'CAM-04',
    name: 'Logistics Road Inbound Feed',
    category: 'traffic',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    backupVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    description: 'Highway ANPR checkpoint multi-lane logistics vehicle stream'
  },
  'cam-05': {
    id: 'cam-05',
    cameraCode: 'CAM-05',
    name: 'Forward Observation Post Feed',
    category: 'perimeter',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    backupVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    description: 'Elevated mast panoramic observation post camera'
  },
  'cam-06': {
    id: 'cam-06',
    cameraCode: 'CAM-06',
    name: 'Riverine Sector Sensor Feed',
    category: 'perimeter',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    backupVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    description: 'River bank boundary low-light night-vision camera'
  },
  'cam-07': {
    id: 'cam-07',
    cameraCode: 'CAM-07',
    name: 'Tethered UAV Recon Alpha Feed',
    category: 'aerial',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    backupVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    description: 'Tethered UAV 360-degree electro-optical sensor gimbal feed'
  },
  'cam-08': {
    id: 'cam-08',
    cameraCode: 'CAM-08',
    name: 'HQ Command Post Gate Feed',
    category: 'gate',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    backupVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    description: 'Command Post perimeter entry turnstile face-match terminal'
  }
};
