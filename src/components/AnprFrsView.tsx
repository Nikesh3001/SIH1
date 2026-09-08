import React, { useState } from 'react';
import { HotlistVehicle, WatchlistSubject, PublicCameraBookmark } from '../types';
import { 
  Car, 
  UserCheck, 
  Search, 
  Plus, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Scan, 
  Fingerprint, 
  Check, 
  Eye, 
  ExternalLink,
  Globe,
  Link,
  MapPin,
  Play
} from 'lucide-react';

interface AnprFrsViewProps {
  hotlistVehicles: HotlistVehicle[];
  watchlistSubjects: WatchlistSubject[];
  publicCameras: PublicCameraBookmark[];
  onAddHotlistVehicle: (vehicle: HotlistVehicle) => void;
  onAddWatchlistSubject: (subject: WatchlistSubject) => void;
  onAddPublicCamera: (camera: PublicCameraBookmark) => void;
  onImportToMatrix: (camera: PublicCameraBookmark) => void;
}

export const AnprFrsView: React.FC<AnprFrsViewProps> = ({
  hotlistVehicles,
  watchlistSubjects,
  publicCameras,
  onAddHotlistVehicle,
  onAddWatchlistSubject,
  onAddPublicCamera,
  onImportToMatrix
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'anpr' | 'frs' | 'global_list'>('anpr');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingVehicle, setIsAddingVehicle] = useState(false);
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [isAddingPublicCamera, setIsAddingPublicCamera] = useState(false);

  // New vehicle form state
  const [newPlate, setNewPlate] = useState('');
  const [newVehicleModel, setNewVehicleModel] = useState('');
  const [newVehicleReason, setNewVehicleReason] = useState('');
  const [newVehicleRisk, setNewVehicleRisk] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM'>('HIGH');

  // New suspect form state
  const [newName, setNewName] = useState('');
  const [newAlias, setNewAlias] = useState('');
  const [newCaseRef, setNewCaseRef] = useState('');
  const [newFlagReason, setNewFlagReason] = useState('');
  const [newThreat, setNewThreat] = useState<'CRITICAL' | 'HIGH' | 'ELEVATED' | 'LOW'>('HIGH');

  // New public camera form state
  const [newCamName, setNewCamName] = useState('');
  const [newCamUrl, setNewCamUrl] = useState('');
  const [newCamLocation, setNewCamLocation] = useState('');
  const [newCamTags, setNewCamTags] = useState('');

  const filteredVehicles = hotlistVehicles.filter(v =>
    v.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.vehicleType.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.flagReason.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSubjects = watchlistSubjects.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.alias && s.alias.toLowerCase().includes(searchQuery.toLowerCase())) ||
    s.caseRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.flagReason.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPublicCameras = publicCameras.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSaveVehicle = () => {
    if (!newPlate) return;
    const vehicle: HotlistVehicle = {
      id: `veh-${Date.now()}`,
      plateNumber: newPlate,
      stateCode: newPlate.substring(0, 2),
      vehicleType: newVehicleModel,
      color: 'Unknown',
      flagReason: newVehicleReason,
      riskLevel: newVehicleRisk,
      reportedDate: new Date().toISOString().split('T')[0]
    };
    onAddHotlistVehicle(vehicle);
    setIsAddingVehicle(false);
    setNewPlate('');
    setNewVehicleModel('');
    setNewVehicleReason('');
  };

  const handleSaveSubject = () => {
    if (!newName) return;
    const subject: WatchlistSubject = {
      id: `sub-${Date.now()}`,
      name: newName,
      alias: newAlias,
      category: newThreat === 'CRITICAL' ? 'WANTED' : 'SUSPECT',
      threatLevel: newThreat,
      caseRef: newCaseRef,
      flagReason: newFlagReason,
      photoUrl: 'https://images.unsplash.com/photo-1594361487019-35cb74fa191b?q=80&w=200&auto=format&fit=crop',
      biometricConfidenceThreshold: 0.90,
    };
    onAddWatchlistSubject(subject);
    setIsAddingSubject(false);
    setNewName('');
    setNewAlias('');
    setNewCaseRef('');
    setNewFlagReason('');
  };

  const handleSavePublicCamera = () => {
    if (!newCamName || !newCamUrl) return;
    const camera: PublicCameraBookmark = {
      id: `pub-${Date.now()}`,
      name: newCamName,
      streamUrl: newCamUrl,
      location: newCamLocation,
      tags: newCamTags.split(',').map(t => t.trim()).filter(Boolean),
      addedDate: new Date().toISOString().split('T')[0]
    };
    onAddPublicCamera(camera);
    setIsAddingPublicCamera(false);
    setNewCamName('');
    setNewCamUrl('');
    setNewCamLocation('');
    setNewCamTags('');
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 p-4">
      {/* Header and Sub-tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('anpr')}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg border-b-2 transition-colors ${
              activeSubTab === 'anpr' 
                ? 'border-amber-500 text-amber-400 bg-slate-900 font-bold' 
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>ANPR HOTLIST</span>
          </button>
          
          <button
            onClick={() => setActiveSubTab('frs')}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg border-b-2 transition-colors ${
              activeSubTab === 'frs' 
                ? 'border-emerald-500 text-emerald-400 bg-slate-900 font-bold' 
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>FRS BIOMETRIC WATCHLIST</span>
          </button>

          <button
            onClick={() => setActiveSubTab('global_list')}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg border-b-2 transition-colors ${
              activeSubTab === 'global_list' 
                ? 'border-blue-500 text-blue-400 bg-slate-900 font-bold' 
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>GLOBAL PUBLIC FEEDS</span>
          </button>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder={`Search ${activeSubTab === 'anpr' ? 'vehicles...' : activeSubTab === 'frs' ? 'subjects...' : 'public cameras...'}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-sm text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>
          
          <button
            onClick={() => {
              if (activeSubTab === 'anpr') setIsAddingVehicle(true);
              else if (activeSubTab === 'frs') setIsAddingSubject(true);
              else setIsAddingPublicCamera(true);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-bold text-slate-950 transition-colors text-sm ${
              activeSubTab === 'anpr' ? 'bg-amber-500 hover:bg-amber-400' :
              activeSubTab === 'frs' ? 'bg-emerald-500 hover:bg-emerald-400' :
              'bg-blue-500 hover:bg-blue-400'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>
              {activeSubTab === 'anpr' ? 'ADD VEHICLE' : activeSubTab === 'frs' ? 'ADD SUSPECT' : 'ADD PUBLIC CAM'}
            </span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto pt-4 pb-20">
        
        {/* --- ANPR VIEW --- */}
        {activeSubTab === 'anpr' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredVehicles.map((vehicle) => (
              <div key={vehicle.id} className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  {/* License Plate Style Render */}
                  <div className="bg-white border-2 border-slate-400 rounded flex flex-col items-center px-2 py-0.5 shadow-sm">
                    <span className="text-[9px] font-bold text-slate-600 tracking-widest leading-none mb-0.5">IND</span>
                    <span className="text-lg font-mono-code font-bold text-black leading-none">{vehicle.plateNumber}</span>
                  </div>
                  <div className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    vehicle.riskLevel === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                    vehicle.riskLevel === 'HIGH' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                    'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  }`}>
                    {vehicle.riskLevel}
                  </div>
                </div>
                
                <div>
                  <div className="text-slate-300 font-medium text-sm">{vehicle.vehicleType}</div>
                  <div className="text-slate-400 text-xs mt-1 line-clamp-2">{vehicle.flagReason}</div>
                </div>
                
                <div className="mt-auto pt-3 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-500">
                  <span>Reported: {vehicle.reportedDate}</span>
                  {vehicle.lastDetectedBOP && (
                    <span className="text-amber-400 flex items-center gap-1">
                      <Scan className="w-3 h-3" /> Last: {vehicle.lastDetectedBOP}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {filteredVehicles.length === 0 && (
              <div className="col-span-full text-center py-12 text-slate-500">No vehicles match your search.</div>
            )}
          </div>
        )}

        {/* --- FRS VIEW --- */}
        {activeSubTab === 'frs' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredSubjects.map((subject) => (
              <div key={subject.id} className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex gap-4">
                <div className="w-24 shrink-0 flex flex-col gap-2">
                  <div className="w-full aspect-[3/4] bg-slate-800 rounded overflow-hidden relative border border-slate-700">
                    <img src={subject.photoUrl} alt={subject.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 shadow-[inset_0_0_10px_rgba(0,0,0,0.8)] pointer-events-none" />
                  </div>
                  <div className="flex items-center justify-center gap-1 text-[9px] text-slate-400 bg-slate-950 rounded py-0.5">
                    <Fingerprint className="w-3 h-3 text-emerald-500" />
                    <span>MATCH {(subject.biometricConfidenceThreshold * 100).toFixed(0)}%+</span>
                  </div>
                </div>

                <div className="flex-1 min-w-0 flex flex-col">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-slate-200 truncate pr-2">{subject.name}</h3>
                    <div className={`px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 ${
                      subject.category === 'WANTED' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      subject.category === 'SUSPECT' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      'bg-slate-700 text-slate-300'
                    }`}>
                      {subject.category}
                    </div>
                  </div>
                  
                  {subject.alias && (
                    <div className="text-xs text-slate-400 mb-2 truncate">AKA: {subject.alias}</div>
                  )}

                  <div className="text-[11px] text-slate-300 line-clamp-3 mb-2 flex-1">
                    <span className="text-slate-500">Ref: {subject.caseRef}</span><br/>
                    {subject.flagReason}
                  </div>

                  <div className="text-[10px] text-slate-500 border-t border-slate-800 pt-2 truncate">
                    Last Seen: {subject.lastKnownSector || 'Unknown Location'}
                  </div>
                </div>
              </div>
            ))}
            {filteredSubjects.length === 0 && (
              <div className="col-span-full text-center py-12 text-slate-500">No subjects match your search.</div>
            )}
          </div>
        )}

        {/* --- GLOBAL PUBLIC FEEDS VIEW --- */}
        {activeSubTab === 'global_list' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredPublicCameras.map((camera) => (
              <div key={camera.id} className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-500/20 rounded text-blue-400 border border-blue-500/30">
                      <Globe className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-slate-200 line-clamp-1" title={camera.name}>{camera.name}</h3>
                  </div>
                </div>
                
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="truncate">{camera.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-mono-code bg-slate-950 p-1 rounded border border-slate-800 overflow-hidden">
                    <Link className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{camera.streamUrl}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mt-2">
                  {camera.tags.map(tag => (
                    <span key={tag} className="px-1.5 py-0.5 rounded bg-slate-800 text-[9px] text-slate-300 border border-slate-700">
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="mt-auto pt-3 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-500">
                  <span>Added: {camera.addedDate}</span>
                  <button 
                    onClick={() => onImportToMatrix(camera)}
                    className="flex items-center gap-1.5 px-2 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                  >
                    <Play className="w-3 h-3" />
                    <span>Monitor Feed</span>
                  </button>
                </div>
              </div>
            ))}
            {filteredPublicCameras.length === 0 && (
              <div className="col-span-full text-center py-12 text-slate-500">No public feeds match your search.</div>
            )}
          </div>
        )}
      </div>

      {/* --- ADD VEHICLE MODAL --- */}
      {isAddingVehicle && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg w-full max-w-md shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <h2 className="text-lg font-bold text-amber-500 flex items-center gap-2">
                <Car className="w-5 h-5" /> ADD TO ANPR HOTLIST
              </h2>
              <button onClick={() => setIsAddingVehicle(false)} className="text-slate-400 hover:text-white">
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">LICENSE PLATE NUMBER *</label>
                <input 
                  type="text" 
                  value={newPlate} 
                  onChange={(e) => setNewPlate(e.target.value.toUpperCase())}
                  placeholder="e.g., DL8C AB 1234"
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 font-mono-code uppercase focus:border-amber-500 focus:outline-none"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">VEHICLE MAKE/MODEL</label>
                  <input 
                    type="text" 
                    value={newVehicleModel} 
                    onChange={(e) => setNewVehicleModel(e.target.value)}
                    placeholder="White SUV / Mahindra Scorpio"
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 text-sm focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">RISK LEVEL</label>
                  <select 
                    value={newVehicleRisk}
                    onChange={(e) => setNewVehicleRisk(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 text-sm focus:border-amber-500 focus:outline-none"
                  >
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL (Instant QRF)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">FLAG REASON / CONTEXT</label>
                <textarea 
                  value={newVehicleReason} 
                  onChange={(e) => setNewVehicleReason(e.target.value)}
                  placeholder="Suspected involvement in cross-border smuggling operation..."
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 text-sm h-20 resize-none focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 flex justify-end gap-3">
              <button 
                onClick={() => setIsAddingVehicle(false)}
                className="px-4 py-2 rounded text-slate-300 hover:bg-slate-800 text-sm font-bold transition-colors"
              >
                CANCEL
              </button>
              <button 
                onClick={handleSaveVehicle}
                disabled={!newPlate}
                className="px-4 py-2 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 disabled:opacity-50 text-sm font-bold transition-colors flex items-center gap-2"
              >
                <Check className="w-4 h-4" /> SAVE RECORD
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- ADD SUBJECT MODAL --- */}
      {isAddingSubject && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg w-full max-w-md shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <h2 className="text-lg font-bold text-emerald-500 flex items-center gap-2">
                <UserCheck className="w-5 h-5" /> ENROLL BIOMETRIC WATCHLIST
              </h2>
              <button onClick={() => setIsAddingSubject(false)} className="text-slate-400 hover:text-white">
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">PRIMARY NAME *</label>
                  <input 
                    type="text" 
                    value={newName} 
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Full Legal Name"
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">KNOWN ALIASES</label>
                  <input 
                    type="text" 
                    value={newAlias} 
                    onChange={(e) => setNewAlias(e.target.value)}
                    placeholder="e.g., Phantom, Viper"
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">CASE/FIR REFERENCE</label>
                  <input 
                    type="text" 
                    value={newCaseRef} 
                    onChange={(e) => setNewCaseRef(e.target.value)}
                    placeholder="NIA-2026-XX"
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 text-sm font-mono-code focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">THREAT CATEGORY</label>
                  <select 
                    value={newThreat}
                    onChange={(e) => setNewThreat(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 text-sm focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="HIGH">SUSPECT (High)</option>
                    <option value="CRITICAL">WANTED (Critical)</option>
                    <option value="ELEVATED">POI (Elevated)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">FLAG REASON / DOSSIER SUMMARY</label>
                <textarea 
                  value={newFlagReason} 
                  onChange={(e) => setNewFlagReason(e.target.value)}
                  placeholder="Key orchestrator in recent perimeter breaches. Approach with caution."
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 text-sm h-20 resize-none focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 flex justify-end gap-3">
              <button 
                onClick={() => setIsAddingSubject(false)}
                className="px-4 py-2 rounded text-slate-300 hover:bg-slate-800 text-sm font-bold transition-colors"
              >
                CANCEL
              </button>
              <button 
                onClick={handleSaveSubject}
                disabled={!newName}
                className="px-4 py-2 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 disabled:opacity-50 text-sm font-bold transition-colors flex items-center gap-2"
              >
                <Check className="w-4 h-4" /> ENROLL SUBJECT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- ADD PUBLIC CAMERA MODAL --- */}
      {isAddingPublicCamera && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg w-full max-w-md shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <h2 className="text-lg font-bold text-blue-500 flex items-center gap-2">
                <Globe className="w-5 h-5" /> ENROLL PUBLIC STREAM
              </h2>
              <button onClick={() => setIsAddingPublicCamera(false)} className="text-slate-400 hover:text-white">
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">CAMERA NAME *</label>
                <input 
                  type="text" 
                  value={newCamName} 
                  onChange={(e) => setNewCamName(e.target.value)}
                  placeholder="e.g., Highway 401 Traffic Cam"
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">STREAM URL (RTSP / HTTP / HLS) *</label>
                <input 
                  type="url" 
                  value={newCamUrl} 
                  onChange={(e) => setNewCamUrl(e.target.value)}
                  placeholder="rtsp://... or https://..."
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 text-sm font-mono-code focus:border-blue-500 focus:outline-none"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">GEOGRAPHIC LOCATION</label>
                  <input 
                    type="text" 
                    value={newCamLocation} 
                    onChange={(e) => setNewCamLocation(e.target.value)}
                    placeholder="City, Country"
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">TAGS (Comma separated)</label>
                  <input 
                    type="text" 
                    value={newCamTags} 
                    onChange={(e) => setNewCamTags(e.target.value)}
                    placeholder="Traffic, Urban, Highway"
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 flex justify-end gap-3">
              <button 
                onClick={() => setIsAddingPublicCamera(false)}
                className="px-4 py-2 rounded text-slate-300 hover:bg-slate-800 text-sm font-bold transition-colors"
              >
                CANCEL
              </button>
              <button 
                onClick={handleSavePublicCamera}
                disabled={!newCamName || !newCamUrl}
                className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 text-sm font-bold transition-colors flex items-center gap-2"
              >
                <Check className="w-4 h-4" /> ADD FEED
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
