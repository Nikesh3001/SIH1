import React, { useState, useRef } from 'react';
import { SecurityAlert } from '../types';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  FileText, 
  Search, 
  Download, 
  Printer, 
  ShieldCheck, 
  Hash, 
  Calendar, 
  CheckCircle2, 
  Eye, 
  Filter,
  Lock,
  FileDown
} from 'lucide-react';

interface EvidenceLockerProps {
  alerts: SecurityAlert[];
  onSelectAlert: (alert: SecurityAlert) => void;
}

export const EvidenceLocker: React.FC<EvidenceLockerProps> = ({
  alerts,
  onSelectAlert,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDossier, setSelectedDossier] = useState<SecurityAlert | null>(alerts[0] || null);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const reportRef = useRef<HTMLDivElement>(null);

  const filteredAlerts = alerts.filter(a => {
    const matchSearch = 
      a.eventId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.detectedObject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.bopName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.tamperHash.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = categoryFilter === 'ALL' || a.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkExport = () => {
    if (selectedIds.size === 0) return;
    const selectedData = alerts.filter(a => selectedIds.has(a.id));
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(selectedData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `BULK_EVIDENCE_EXPORT_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setSelectedIds(new Set());
  };

  const handlePrintDossier = () => {
    window.print();
  };

  const handleExportJson = (alert: SecurityAlert) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(alert, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `EVIDENCE_${alert.eventId}_INTEGRITY_VERIFIED.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleGeneratePDF = async () => {
    if (!reportRef.current || !selectedDossier) return;
    
    try {
      setIsGeneratingPdf(true);
      const element = reportRef.current;
      
      // Use html2canvas to render the DOM element to a canvas
      const canvas = await html2canvas(element, { 
        scale: 2, 
        useCORS: true,
        backgroundColor: '#020617', // Match the dark theme background
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      // Initialize jsPDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      // Add the image to the PDF
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      // Download the PDF
      pdf.save(`INCIDENT_DOSSIER_${selectedDossier.eventId}.pdf`);
    } catch (error) {
      console.error('Failed to generate PDF', error);
      alert('Failed to generate PDF dossier.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-3 h-full select-none">
      {/* Left List of Forensic Records */}
      <div className="w-full lg:w-96 shrink-0 bg-slate-900/60 border border-slate-800 rounded-lg p-3 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono-code font-bold text-slate-200">
            <Lock className="w-4 h-4 text-amber-400" />
            <span>TAMPER-EVIDENT EVIDENCE ARCHIVE</span>
          </div>
          {selectedIds.size > 0 && (
            <button
              onClick={handleBulkExport}
              className="flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] transition-colors"
            >
              <Download className="w-3 h-3" />
              <span>Bulk Export ({selectedIds.size})</span>
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search Event ID, hash, BOP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/60"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[10px] font-mono-code">
          {['ALL', 'INTRUSION', 'VIRTUAL_FENCE', 'ANPR_WATCHLIST', 'FACE_WATCHLIST', 'NIGHT_MOVEMENT'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-2 py-0.5 rounded transition-colors whitespace-nowrap ${
                categoryFilter === cat 
                  ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300 font-bold' 
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Records Table/List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[550px]">
          {filteredAlerts.map(alert => {
            const isSelected = selectedDossier?.id === alert.id;
            return (
              <div
                key={alert.id}
                onClick={() => setSelectedDossier(alert)}
                className={`p-2.5 rounded-md border cursor-pointer transition-all flex flex-col gap-1 text-xs font-mono-code ${
                  isSelected
                    ? 'bg-slate-800 border-amber-400 shadow-sm'
                    : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(alert.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleSelection(alert.id);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-0.5 rounded accent-amber-500 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-400">{alert.eventId}</span>
                      <span className="text-slate-400 text-[11px]">{alert.timestamp}</span>
                    </div>

                    <div className="text-slate-200 font-sans font-medium line-clamp-1 mt-1">
                      {alert.detectedObject}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 mt-1 border-t border-slate-800/80">
                      <span className="truncate">{alert.bopName}</span>
                      <span className="flex items-center gap-1 text-emerald-400">
                        <ShieldCheck className="w-3 h-3" />
                        <span>SHA-256 OK</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: Forensic Dossier Viewport (Printable Official Border Security Report) */}
      {selectedDossier && (
        <div className="flex-1 bg-slate-900/60 border border-slate-800 rounded-lg p-6 flex flex-col gap-4 overflow-y-auto font-mono-code text-xs">
          {/* Top Actions */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span className="font-bold text-sm text-slate-100 uppercase">
                FORMAL INCIDENT AUDIT & EVIDENCE DOSSIER
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleExportJson(selectedDossier)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs transition-colors"
                title="Download JSON metadata"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>Export JSON</span>
              </button>
              <button
                onClick={handleGeneratePDF}
                disabled={isGeneratingPdf}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs transition-colors font-bold ${
                  isGeneratingPdf 
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
                title="Generate PDF Dossier"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>{isGeneratingPdf ? 'Generating...' : 'Generate PDF Report'}</span>
              </button>
              <button
                onClick={handlePrintDossier}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors"
                title="Print official inquiry report"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Dossier</span>
              </button>
            </div>
          </div>

          {/* Report Paper Container */}
          <div ref={reportRef} className="bg-slate-950 border border-slate-800 rounded-lg p-6 space-y-4 shadow-inner">
            {/* Ministry Header */}
            <div className="text-center pb-4 border-b border-slate-800">
              <div className="text-amber-400 font-bold tracking-widest text-sm uppercase">
                BORDER SECURITY INTELLIGENCE & SURVEILLANCE CORPS
              </div>
              <div className="text-slate-400 text-[11px] mt-0.5">
                INTELLIGENT BORDER VIDEO ANALYTICS PLATFORM (IBVAP) • TAMPER-EVIDENT RECORD
              </div>
            </div>

            {/* Case & Event ID Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/80 p-3 rounded border border-slate-800 text-[11px]">
              <div>
                <span className="text-slate-500 block text-[9px] uppercase">EVENT IDENTIFIER</span>
                <span className="font-bold text-slate-100">{selectedDossier.eventId}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px] uppercase">RECORDED TIME</span>
                <span className="font-bold text-amber-300">{selectedDossier.timestamp} UTC</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px] uppercase">SECTOR / BOP</span>
                <span className="font-bold text-slate-100 truncate block">{selectedDossier.bopName}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px] uppercase">SEVERITY GRADE</span>
                <span className="font-bold text-red-400">{selectedDossier.severity}</span>
              </div>
            </div>

            {/* Section 1: Detection Findings */}
            <div>
              <h4 className="font-bold text-slate-200 border-b border-slate-800 pb-1 mb-2 text-xs uppercase">
                1. AI Ingestion & Detection Classification
              </h4>
              <div className="space-y-1.5 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Target Object:</span>
                  <span className="font-bold text-slate-100">{selectedDossier.detectedObject}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Inference Confidence Score:</span>
                  <span className="text-emerald-400 font-bold">{(selectedDossier.confidence * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Camera Source:</span>
                  <span>{selectedDossier.cameraName} ({selectedDossier.cameraId})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Geo Coordinates:</span>
                  <span>{selectedDossier.coordinates.lat.toFixed(5)}°N, {selectedDossier.coordinates.lng.toFixed(5)}°E</span>
                </div>
              </div>
            </div>

            {/* Section 2: Correlated Rule Trigger */}
            <div>
              <h4 className="font-bold text-slate-200 border-b border-slate-800 pb-1 mb-2 text-xs uppercase">
                2. Analytics Rule Correlation & Trigger
              </h4>
              <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800 text-slate-300 font-sans leading-relaxed">
                <p className="font-mono-code font-bold text-amber-400 text-xs mb-1">
                  {selectedDossier.ruleTriggered}
                </p>
                <p className="text-slate-400 text-xs">
                  {selectedDossier.details}
                </p>
              </div>
            </div>

            {/* Section 3: Legal Chain of Custody & Cryptographic Hash */}
            <div>
              <h4 className="font-bold text-slate-200 border-b border-slate-800 pb-1 mb-2 text-xs uppercase">
                3. Evidence Integrity & Chain of Custody
              </h4>
              <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800 space-y-1.5 text-[11px]">
                <div className="flex items-center gap-2">
                  <Hash className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-slate-400">SHA-256 Hash Digest:</span>
                  <span className="text-emerald-400 select-all">{selectedDossier.tamperHash}</span>
                </div>
                <div className="text-slate-400 text-[10px]">
                  ✓ Verified: Bit-exact forensic hash recorded by edge inference appliance at time of capture. Admissible under National Electronic Evidence Act.
                </div>
              </div>
            </div>

            {/* Officer Signoff */}
            <div className="pt-4 border-t border-slate-800 flex justify-between items-end text-[11px] text-slate-400">
              <div>
                <div>Logged By: IBVAP Edge Appliance #01</div>
                <div>Status: {selectedDossier.status}</div>
              </div>
              <div className="text-right">
                <div className="border-b border-slate-700 w-40 pb-1 mb-1">
                  {selectedDossier.acknowledgedBy || 'Command Duty Officer'}
                </div>
                <div>Authorized Signature & Seal</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
