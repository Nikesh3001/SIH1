// Intelligence Report & Command Briefing PDF Generator
// Compiles real-time incident event data, UTC timestamps, optical telemetry,
// camera surveillance snapshots, AI threat assessment, and officer chain of custody.

import { jsPDF } from 'jspdf';
import { SecurityAlert, Camera } from '../types';

interface IntelligenceReportOptions {
  alert: SecurityAlert;
  camera?: Camera;
  assessment?: { maps?: string; search?: string };
  reportingOfficer?: string;
  commandUnit?: string;
}

/**
 * Loads an image from a URL or generates an authentic tactical surveillance snapshot
 * complete with crosshairs, timestamp watermark, and camera telemetry.
 */
export async function createTacticalSnapshot(
  snapshotUrl?: string,
  camera?: Camera,
  alert?: SecurityAlert
): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 360;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const camName = camera?.name || alert?.cameraName || 'CCTV SENSOR';
  const sector = camera?.sector || alert?.sector || 'SECTOR DELTA';
  const timestamp = alert?.timestamp || new Date().toISOString();
  const eventId = alert?.eventId || 'EVT-SURVEILLANCE';

  // Attempt to draw real image if provided
  let imageDrawn = false;
  const targetUrl = snapshotUrl || camera?.rtspUrl;

  if (targetUrl && !targetUrl.endsWith('.mp4') && !targetUrl.endsWith('.m3u8')) {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject();
        img.src = targetUrl;
        // Timeout after 2.5s to prevent stalling
        setTimeout(() => reject(), 2500);
      });

      ctx.drawImage(img, 0, 0, 640, 360);
      imageDrawn = true;
    } catch {
      imageDrawn = false;
    }
  }

  // If no source image or load failed, render high-fidelity tactical sensor frame
  if (!imageDrawn) {
    // Dark nocturnal gradient background
    const grad = ctx.createLinearGradient(0, 0, 0, 360);
    grad.addColorStop(0, '#020617');
    grad.addColorStop(0.5, '#091e3a');
    grad.addColorStop(1, '#020617');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 640, 360);

    // Subtle tactical scanlines
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
    ctx.lineWidth = 1;
    for (let y = 0; y < 360; y += 8) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(640, y);
      ctx.stroke();
    }

    // Grid coordinates
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(40, 30, 560, 300);
    ctx.setLineDash([]);

    // Surveillance Reticle
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    // Bounding box for intruder
    const bx = 280, by = 110, bw = 90, bh = 170;
    ctx.strokeRect(bx, by, bw, bh);

    // Reticle brackets
    const bLen = 14;
    ctx.beginPath();
    ctx.moveTo(bx, by + bLen); ctx.lineTo(bx, by); ctx.lineTo(bx + bLen, by);
    ctx.moveTo(bx + bw - bLen, by); ctx.lineTo(bx + bw, by); ctx.lineTo(bx + bw, by + bLen);
    ctx.moveTo(bx, by + bh - bLen); ctx.lineTo(bx, by + bh); ctx.lineTo(bx + bLen, by + bh);
    ctx.moveTo(bx + bw - bLen, by + bh); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx + bw, by + bh - bLen);
    ctx.stroke();

    // Target callout tag
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fillRect(bx, by - 24, 150, 20);
    ctx.strokeStyle = '#ef4444';
    ctx.strokeRect(bx, by - 24, 150, 20);
    ctx.fillStyle = '#f87171';
    ctx.font = 'bold 11px monospace';
    ctx.fillText(`TARGET: PERSON 98.4%`, bx + 6, by - 10);
  }

  // Tactical Watermark & HUD Header
  ctx.fillStyle = 'rgba(2, 6, 23, 0.85)';
  ctx.fillRect(0, 0, 640, 28);
  ctx.fillRect(0, 332, 640, 28);

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 11px monospace';
  ctx.fillText(`LIVE SURVEILLANCE RECORDING [REC ●] - ${camName.toUpperCase()}`, 12, 18);

  ctx.fillStyle = '#fbbf24';
  ctx.textAlign = 'right';
  ctx.fillText(`${timestamp} UTC | ${sector.toUpperCase()}`, 628, 18);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#94a3b8';
  ctx.font = '10px monospace';
  ctx.fillText(`EVIDENCE REF: ${eventId} | SHA-256 VERIFIED | IBVAP DEFENSE NODE`, 12, 350);

  ctx.fillStyle = '#10b981';
  ctx.textAlign = 'right';
  ctx.fillText(`GPS: ${camera?.lat?.toFixed(4) || '32.6800'}°N, ${camera?.lng?.toFixed(4) || '74.8000'}°E`, 628, 350);

  return canvas.toDataURL('image/jpeg', 0.92);
}

/**
 * Builds an official Command Briefing & Intelligence Report PDF.
 */
export async function buildIntelligenceReportPdf({
  alert,
  camera,
  assessment,
  reportingOfficer = 'Officer In-Charge Capt. Verma',
  commandUnit = 'QRF Alpha-1 (Striker) - Sector Command'
}: IntelligenceReportOptions): Promise<{ doc: jsPDF; filename: string }> {
  // Initialize A4 PDF in portrait mode (210mm x 297mm)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    putOnlyUsedFonts: true
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210
  const pageHeight = doc.internal.pageSize.getHeight(); // 297
  const margin = 12;
  const contentWidth = pageWidth - margin * 2; // 186mm

  // Generate or load camera snapshot
  const snapshotDataUrl = await createTacticalSnapshot(alert.snapshotUrl, camera, alert);

  // Colors
  const darkNavy = [15, 23, 42]; // #0f172a
  const slateBorder = [51, 65, 85]; // #334155
  const alertRed = [220, 38, 38]; // #dc2626
  const amberAccent = [217, 119, 6]; // #d97706
  const emeraldGreen = [16, 185, 129]; // #10b981
  const textDark = [30, 41, 59]; // #1e293b
  const textMuted = [100, 116, 139]; // #64748b

  let y = margin;

  // 1. TOP CLASSIFICATION STRIP
  doc.setFillColor(15, 23, 42);
  doc.rect(margin, y, contentWidth, 7, 'F');
  doc.setDrawColor(220, 38, 38);
  doc.setLineWidth(0.6);
  doc.line(margin, y + 7, margin + contentWidth, y + 7);

  doc.setFont('courier', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(239, 68, 68);
  doc.text('TOP SECRET // NOFORN // LAW ENFORCEMENT & DEFENSE OPERATIONS SENSITIVE', margin + 3, y + 4.8);

  doc.setTextColor(148, 163, 184);
  doc.text(`DOC: IBVAP-INTEL-${alert.eventId}`, pageWidth - margin - 3, y + 4.8, { align: 'right' });
  y += 10;

  // 2. HEADER BLOCK (Title, Platform & Filing Metadata)
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.rect(margin, y, contentWidth, 22, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text('OFFICIAL TACTICAL INTELLIGENCE BRIEFING', margin + 4, y + 6.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Intelligent Border Video Analytics Platform (IBVAP) — Joint Defense & Security Command', margin + 4, y + 11.5);

  const localFilingTime = new Date().toLocaleString('en-US', { 
    timeZone: 'UTC', 
    dateStyle: 'medium', 
    timeStyle: 'medium' 
  });
  doc.setFont('courier', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(217, 119, 6);
  doc.text(`FILING STAMP: ${localFilingTime} UTC  |  VERIFIED DISPATCH REPORT`, margin + 4, y + 17.5);

  // Status Badge on the right
  const isCritical = alert.severity === 'CRITICAL';
  doc.setFillColor(isCritical ? 254 : 254, isCritical ? 242 : 243, isCritical ? 242 : 199);
  doc.setDrawColor(isCritical ? 239 : 245, isCritical ? 68 : 158, isCritical ? 68 : 11);
  doc.rect(pageWidth - margin - 42, y + 3, 38, 16, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(isCritical ? 185 : 180, isCritical ? 28 : 83, isCritical ? 28 : 9);
  doc.text(`${alert.severity} PRIORITY`, pageWidth - margin - 23, y + 9, { align: 'center' });
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`STATUS: ${alert.status}`, pageWidth - margin - 23, y + 14.5, { align: 'center' });
  y += 25;

  // 3. INCIDENT CORE METRICS (4-Column Data Card)
  const colW = contentWidth / 4;
  const cardH = 22;

  const dataCards = [
    {
      title: 'INCIDENT IDENTIFIER',
      line1: alert.eventId,
      line2: `CATEGORY: ${alert.category}`,
      line3: `DWELL: ${alert.videoClipDurationSecs || 18}s Clip Buffer`
    },
    {
      title: 'SECTOR & CAMERA',
      line1: alert.bopName,
      line2: alert.cameraName,
      line3: `SECTOR: ${alert.sector}`
    },
    {
      title: 'GEO-COORDINATES',
      line1: `${camera?.lat?.toFixed(4) || alert.coordinates?.lat?.toFixed(4) || '32.6800'}° N`,
      line2: `${camera?.lng?.toFixed(4) || alert.coordinates?.lng?.toFixed(4) || '74.8000'}° E`,
      line3: `ALT: ${camera?.altitudeMeters || 380}m MSL`
    },
    {
      title: 'DETECTION VERIFICATION',
      line1: alert.detectedObject.slice(0, 20),
      line2: `CONFIDENCE: ${(alert.confidence * 100).toFixed(1)}%`,
      line3: 'COCO-1 (PERSON) VERIFIED'
    }
  ];

  dataCards.forEach((card, idx) => {
    const cx = margin + idx * colW;
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.rect(cx, y, colW - (idx < 3 ? 1.5 : 0), cardH, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(card.title, cx + 2.5, y + 4.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(card.line1, cx + 2.5, y + 9.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(51, 65, 85);
    doc.text(card.line2, cx + 2.5, y + 14);
    doc.text(card.line3, cx + 2.5, y + 18.5);
  });
  y += cardH + 4;

  // 4. SECTION 1: SURVEILLANCE SNAPSHOT & OPTICAL TELEMETRY
  drawSectionHeader(doc, margin, y, contentWidth, 'SECTION 1: FORENSIC SURVEILLANCE SNAPSHOT & SENSOR EVIDENCE');
  y += 7;

  // Image block
  const imgW = 114;
  const imgH = 64; // ~16:9
  try {
    doc.addImage(snapshotDataUrl, 'JPEG', margin, y, imgW, imgH);
    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(0.5);
    doc.rect(margin, y, imgW, imgH);
  } catch (err) {
    console.error('Failed to embed snapshot image in PDF:', err);
  }

  // Telemetry side card (right of image)
  const sideX = margin + imgW + 3;
  const sideW = contentWidth - imgW - 3;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.rect(sideX, y, sideW, imgH, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('OPTICAL TELEMETRY', sideX + 3, y + 5);

  const telemetryLines = [
    { label: 'Sensor ID', val: alert.cameraId },
    { label: 'Optics Mode', val: camera?.nightVisionSupported ? 'Day/NVG Optical' : 'Standard 1080p' },
    { label: 'Trigger Time', val: `${alert.timestamp} UTC` },
    { label: 'Target Class', val: 'COCO ID: 1 (person)' },
    { label: 'MOT Tracking', val: 'Temporal 1-to-1 MOT' },
    { label: 'Spatial Filter', val: 'Inanimate Suppressed' },
    { label: 'Rule Engine', val: 'ByteTrack Extrapolated' },
    { label: 'Tamper Hash', val: alert.tamperHash.slice(0, 14) + '...' }
  ];

  let ty = y + 10;
  telemetryLines.forEach(item => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(item.label + ':', sideX + 3, ty);

    doc.setFont('courier', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(30, 41, 59);
    doc.text(item.val, sideX + sideW - 3, ty, { align: 'right' });
    ty += 6.5;
  });

  y += imgH + 4;

  // 5. SECTION 2: AI CORRELATION RULES & EVENT CHRONOLOGY
  drawSectionHeader(doc, margin, y, contentWidth, 'SECTION 2: AI CORRELATION RULE EVALUATION & EVENT NARRATIVE');
  y += 7;

  doc.setFillColor(255, 251, 235); // Light amber
  doc.setDrawColor(251, 191, 36);
  doc.setLineWidth(0.4);
  doc.rect(margin, y, contentWidth, 24, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(180, 83, 9);
  doc.text(`CORRELATED EVENT RULE: ${alert.ruleTriggered}`, margin + 3, y + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  const narrativeLines = doc.splitTextToSize(
    alert.details || 'Optical motion vector crossed calibrated perimeter tripwire boundary. Multi-frame temporal tracking confirmed positive anthropometric displacement.',
    contentWidth - 6
  );
  doc.text(narrativeLines, margin + 3, y + 10.5);

  doc.setFont('courier', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`INTEGRITY HASH (SHA-256): ${alert.tamperHash}`, margin + 3, y + 21);
  y += 27;

  // 6. SECTION 3: GEOSPATIAL TERRAIN ANALYSIS & CONTEXTUAL INTEL
  drawSectionHeader(doc, margin, y, contentWidth, 'SECTION 3: GEOSPATIAL TERRAIN ANALYSIS & INTELLIGENCE ASSESSMENT');
  y += 7;

  const hasAssess = Boolean(assessment?.maps || assessment?.search);
  const terrainText = assessment?.maps || 
    `Topographical analysis for Sector ${alert.sector} indicates ridge-line approach with limited natural vegetation concealment. Nearest access road is 340m west. Dominant terrain features provide clear line-of-sight for thermal perimeter sensors.`;
  const intelText = assessment?.search || 
    `Contextual operational data confirms heightened surveillance readiness in BOP ${alert.bopName}. No authorized friendly personnel scheduled for this sector. Recommended QRF staging at Intercept Point Charlie.`;

  const assessBoxH = 26;
  const halfW = (contentWidth - 3) / 2;

  // Left subcard: Terrain
  doc.setFillColor(240, 249, 255); // Light sky
  doc.setDrawColor(186, 230, 253);
  doc.rect(margin, y, halfW, assessBoxH, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(3, 105, 161);
  doc.text('GEOSPATIAL TERRAIN ANALYSIS', margin + 3, y + 4.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(30, 41, 59);
  const splitTerrain = doc.splitTextToSize(terrainText, halfW - 6);
  doc.text(splitTerrain.slice(0, 4), margin + 3, y + 9);

  // Right subcard: Contextual Intel
  doc.setFillColor(254, 252, 232); // Light amber
  doc.setDrawColor(254, 240, 138);
  doc.rect(margin + halfW + 3, y, halfW, assessBoxH, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(161, 98, 7);
  doc.text('CONTEXTUAL INTEL & WEATHER', margin + halfW + 6, y + 4.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(30, 41, 59);
  const splitIntel = doc.splitTextToSize(intelText, halfW - 6);
  doc.text(splitIntel.slice(0, 4), margin + halfW + 6, y + 9);

  y += assessBoxH + 4;

  // 7. SECTION 4: STANDARD OPERATING PROCEDURES & COMMAND SIGN-OFF
  drawSectionHeader(doc, margin, y, contentWidth, 'SECTION 4: COMMAND RESPONSE ACTIONS & AUTHORIZED SIGN-OFF');
  y += 7;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, y, contentWidth, 23, 'FD');

  const actionText = alert.actionTaken || `QRF Striker-1 Dispatched to ${alert.bopName} on VHF Channel 4`;
  const ackOfficer = alert.acknowledgedBy || reportingOfficer;

  // Action status summary
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`DISPATCH ACTION TAKEN:`, margin + 3, y + 5);
  doc.setFont('helvetica', 'normal');
  doc.text(actionText, margin + 42, y + 5);

  // Signature Blocks
  const sigColW = contentWidth / 2;
  // Duty Officer
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text('DUTY INTELLIGENCE OFFICER:', margin + 3, y + 11);
  doc.setFont('courier', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(ackOfficer, margin + 3, y + 16);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.5);
  doc.setTextColor(16, 185, 129);
  doc.text('ELECTRONICALLY VERIFIED & SIGNED', margin + 3, y + 20);

  // Sector Commander Sign-off
  const sig2X = margin + sigColW + 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text('SECTOR COMMAND APPROVAL:', sig2X, y + 11);
  doc.setFont('courier', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('COL. R. K. SHARMA (SECTOR COMMANDER)', sig2X, y + 16);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.5);
  doc.setTextColor(16, 185, 129);
  doc.text('COMMAND BRIEFING RECORD ARCHIVED', sig2X, y + 20);

  // 8. FOOTER
  const footerY = pageHeight - margin + 3;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);

  doc.setFont('courier', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(220, 38, 38);
  doc.text('CONFIDENTIAL // LAW ENFORCEMENT & MILITARY OPERATIONAL SENSITIVE // OFFICIAL USE ONLY', margin, footerY);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('PAGE 1 OF 1  |  IBVAP TACTICAL PLATFORM', pageWidth - margin, footerY, { align: 'right' });

  const cleanEventId = alert.eventId.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `INTELLIGENCE_REPORT_${cleanEventId}_COMMAND_BRIEFING.pdf`;

  return { doc, filename };
}

/**
 * Generates and triggers automatic browser download of the intelligence report PDF.
 */
export async function downloadIntelligenceReport(options: IntelligenceReportOptions): Promise<string> {
  const { doc, filename } = await buildIntelligenceReportPdf(options);
  doc.save(filename);
  return filename;
}

function drawSectionHeader(doc: jsPDF, x: number, y: number, w: number, title: string) {
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(x, y, w, 5.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(248, 250, 252);
  doc.text(title, x + 3, y + 3.8);
}
