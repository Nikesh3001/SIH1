import React, { useState } from 'react';
import { SecurityAlert, Severity, AlertCategory } from '../types';
import { 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Truck, 
  Radio, 
  Volume2, 
  Download, 
  UserCheck, 
  FileText, 
  Clock, 
  MapPin, 
  Crosshair,
  Filter,
  Check,
  Zap,
  ExternalLink
} from 'lucide-react';
import { tacticalAudio } from '../utils/audio';

interface AlertsPanelProps {
  alerts: SecurityAlert[];
  onAcknowledgeAlert: (alertId: string, officerName: string) => void;
  onDispatchQrf: (alertId: string, unitName: string) => void;
  onExportDossier: (alert: SecurityAlert) => void;
  onSelectCameraFeed?: (cameraId: string) => void;
}

export const AlertsPanel: React.FC<AlertsPanelProps> = ({
  alerts,
  onAcknowledgeAlert,
  onDispatchQrf,
  onExportDossier,
  onSelectCameraFeed,
}) => {
  const [selectedAlertId, setSelectedAlertId] = useState<string>(alerts[0]?.id || '');
  const [severityFilter, setSeverityFilter] = useState<'ALL' | Severity>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'NEW' | 'ACKNOWLEDGED' | 'DISPATCHED' | 'RESOLVED'>('ALL');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const activeAlert = alerts.find(a => a.id === selectedAlertId) || alerts[0];

  const filteredAlerts = alerts.filter(a => {
    const matchSev = severityFilter === 'ALL' || a.severity === severityFilter;
    const matchStatus = statusFilter === 'ALL' || a.status === statusFilter;
    return matchSev && matchStatus;
  });

  const handleDispatch = (alert: SecurityAlert) => {
    tacticalAudio.playRadioChirp();
    onDispatchQrf(alert.id, 'QRF Alpha-1 (Striker)');
    setActionSuccessMsg(`🚨 QRF Striker-1 Dispatched to ${alert.bopName} on VHF Channel 4!`);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const handleAcknowledge = (alert: SecurityAlert) => {
    tacticalAudio.playRadioChirp();
    onAcknowledgeAlert(alert.id, 'Officer In-Charge Capt. Verma');
    setActionSuccessMsg(`✅ Incident ${alert.eventId} marked ACKNOWLEDGED.`);
    setTimeout(() => setActionSuccessMsg(null), 3000);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-3 h-full select-none">
      {/* Left List of Security Alerts */}
      <div className="w-full lg:w-96 shrink-0 bg-slate-900/60 border border-slate-800 rounded-lg p-3 flex flex-col gap-3">
        {/* Filter Headers */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-mono-code font-bold text-slate-200">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>INCIDENT FEED ({filteredAlerts.length})</span>
          </div>

          {/* Severity filter */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[11px] font-mono-code text-slate-300 focus:outline-none"
          >
            <option value="ALL">ALL SEVERITIES</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[10px] font-mono-code">
          {(['ALL', 'NEW', 'ACKNOWLEDGED', 'DISPATCHED', 'RESOLVED'] as const).map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2 py-0.5 rounded transition-colors whitespace-nowrap ${
                statusFilter === st 
                  ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300 font-bold' 
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Action toast notification */}
        {actionSuccessMsg && (
          <div className="p-2 rounded bg-amber-500/20 border border-amber-500/60 text-amber-200 text-xs font-mono-code animate-pulse">
            {actionSuccessMsg}
          </div>
        )}

        {/* Alerts Scrollable Feed */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[550px]">
          {filteredAlerts.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs font-mono-code">
              No security alerts matching criteria.
            </div>
          ) : (
            filteredAlerts.map(alert => {
              const isSelected = alert.id === activeAlert?.id;
              const isCritical = alert.severity === 'CRITICAL';
              const isHigh = alert.severity === 'HIGH';

              return (
                <div
                  key={alert.id}
                  onClick={() => setSelectedAlertId(alert.id)}
                  className={`p-2.5 rounded-md border cursor-pointer transition-all flex flex-col gap-1.5 ${
                    isSelected
                      ? 'bg-slate-800/90 border-amber-400 shadow-md shadow-amber-500/10'
                      : isCritical && alert.status === 'NEW'
                        ? 'bg-red-950/40 border-red-800/80 hover:border-red-600'
                        : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono-code">
                    <span className="text-slate-400 font-semibold">{alert.eventId}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      isCritical ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                      isHigh ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40' :
                      'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    }`}>
                      {alert.severity}
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-slate-200 line-clamp-1">
                    {alert.detectedObject}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono-code">
                    <span className="truncate max-w-[160px]">{alert.bopName}</span>
                    <span className="text-amber-400">{alert.timestamp}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[10px] font-mono-code">
                    <span className="text-slate-500">{alert.category}</span>
                    <span className={`font-semibold ${
                      alert.status === 'NEW' ? 'text-red-400 animate-pulse' :
                      alert.status === 'DISPATCHED' ? 'text-blue-400' :
                      alert.status === 'ACKNOWLEDGED' ? 'text-amber-400' :
                      'text-emerald-400'
                    }`}>
                      ● {alert.status}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Column: Detailed Incident Examination & Triage Dossier */}
      {activeAlert && (
        <div className="flex-1 bg-slate-900/60 border border-slate-800 rounded-lg p-4 flex flex-col gap-4 overflow-y-auto">
          {/* Incident Dossier Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono-code text-slate-400">INCIDENT DOSSIER:</span>
                <span className="text-sm font-bold font-mono-code text-amber-400">{activeAlert.eventId}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono-code font-bold ${
                  activeAlert.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-300 border border-red-500/50' :
                  'bg-orange-500/20 text-orange-300 border border-orange-500/50'
                }`}>
                  {activeAlert.severity} PRIORITY
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-100 mt-1">
                {activeAlert.detectedObject}
              </h2>
            </div>

            {/* Jump to Camera Feed */}
            {onSelectCameraFeed && (
              <button
                onClick={() => onSelectCameraFeed(activeAlert.cameraId)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-mono-code transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                <span>Jump to Live Stream</span>
              </button>
            )}
          </div>

          {/* Incident Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono-code">
            <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded">
              <div className="text-[10px] text-slate-500 uppercase">Detection Sector</div>
              <div className="font-bold text-slate-200 truncate mt-0.5">{activeAlert.bopName}</div>
              <div className="text-[10px] text-slate-400 truncate">{activeAlert.sector}</div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded">
              <div className="text-[10px] text-slate-500 uppercase">Detection Time</div>
              <div className="font-bold text-amber-300 mt-0.5">{activeAlert.timestamp} UTC</div>
              <div className="text-[10px] text-slate-400">Clip: {activeAlert.videoClipDurationSecs}s buffered</div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded">
              <div className="text-[10px] text-slate-500 uppercase">AI Model Confidence</div>
              <div className="font-bold text-emerald-400 mt-0.5">{(activeAlert.confidence * 100).toFixed(1)}%</div>
              <div className="text-[10px] text-slate-400">ByteTrack + YOLOv8</div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded">
              <div className="text-[10px] text-slate-500 uppercase">Tamper-Evident SHA-256</div>
              <div className="font-bold text-slate-300 truncate mt-0.5" title={activeAlert.tamperHash}>
                {activeAlert.tamperHash.slice(0, 12)}...
              </div>
              <div className="text-[10px] text-emerald-400">Verified Evidence Hash</div>
            </div>
          </div>

          {/* AI Correlation Rule Engine Details */}
          <div className="bg-slate-950/80 border border-amber-500/30 rounded p-3 text-xs font-mono-code">
            <div className="flex items-center gap-2 text-amber-400 font-bold mb-1">
              <Zap className="w-4 h-4" />
              <span>CORRELATED EVENT TRIGGER & RULE EVALUATION</span>
            </div>
            <div className="text-slate-200 font-semibold mb-1">
              {activeAlert.ruleTriggered}
            </div>
            <p className="text-slate-400 font-sans text-xs leading-relaxed">
              {activeAlert.details}
            </p>
          </div>

          {/* Operational SOP Action Buttons */}
          <div className="bg-slate-950/80 border border-slate-800 rounded p-3 flex flex-col gap-3 font-mono-code text-xs">
            <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
              COMMAND RESPONSE STANDARD OPERATING PROCEDURES (SOP)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              <button
                onClick={() => handleDispatch(activeAlert)}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded bg-red-600 hover:bg-red-500 text-white font-bold transition-all shadow-md active:scale-95"
              >
                <Truck className="w-4 h-4" />
                <span>Dispatch QRF Unit</span>
              </button>

              <button
                onClick={() => handleAcknowledge(activeAlert)}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all shadow-md active:scale-95"
              >
                <UserCheck className="w-4 h-4" />
                <span>Acknowledge Event</span>
              </button>

              <button
                onClick={() => onExportDossier(activeAlert)}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold transition-all"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>Export Dossier (PDF)</span>
              </button>

              <button
                onClick={() => {
                  tacticalAudio.playAlertSound('CRITICAL');
                  alert(`Engaged high-intensity acoustic perimeter warning at ${activeAlert.bopName}!`);
                }}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold transition-all"
              >
                <Volume2 className="w-4 h-4 text-red-400" />
                <span>Perimeter Horn</span>
              </button>
            </div>
          </div>

          {/* Audit History & Officer Acknowledgement Notes */}
          {activeAlert.acknowledgedBy && (
            <div className="p-2.5 rounded bg-emerald-950/20 border border-emerald-800/40 text-xs font-mono-code text-slate-300">
              <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Acknowledged by: {activeAlert.acknowledgedBy}</span>
              </div>
              {activeAlert.actionTaken && (
                <div className="mt-1 text-slate-400">
                  Action Taken: {activeAlert.actionTaken}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
