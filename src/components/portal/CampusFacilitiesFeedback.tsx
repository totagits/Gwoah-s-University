import React, { useState } from 'react';
import {
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Building,
  MapPin,
  Camera,
  Send,
  Plus,
  RefreshCw,
  Search,
  Check,
  ShieldAlert,
  Droplets,
  Zap,
  Wifi,
  Wind,
  Layers,
  ArrowRight,
  ExternalLink,
  User,
  Phone,
  FileText,
} from 'lucide-react';
import { UserProfile, FacilityTicket } from '../../types';
import { api } from '../../services/api';

interface CampusFacilitiesFeedbackProps {
  currentUser: UserProfile;
  onTicketCreated?: () => void;
  onNavigateToTasks?: () => void;
}

const HIAU_CAMPUS_BUILDINGS = [
  {
    id: 'bldg-admin-monrovia',
    name: 'Main Administrative Complex',
    shortName: 'Admin Complex',
    campus: 'Main Campus, Montserrado',
    image: '/assets/aistudio/image_29eb5504.png',
    commonAreas: ['Room 101 (Registrar)', 'Room 204 (Senate Hall)', 'Bursar Counter', 'Main Restrooms (Ground Floor)', 'Deans Wing'],
  },
  {
    id: 'bldg-laptop-lab',
    name: 'Agro-Tech Laptop Laboratory & ICT Commons',
    shortName: 'Laptop Lab',
    campus: 'Central Academic Quad',
    image: '/assets/aistudio/image_51d124f3.png',
    commonAreas: ['Workstation Pod A', 'Workstation Pod B', 'Projection Screen & Podium', 'Starlink Terminal Rack', 'UPS Power Bank'],
  },
  {
    id: 'bldg-central-library',
    name: 'Central Academic Library & Study Commons',
    shortName: 'Central Library',
    campus: 'Main Academic Building',
    image: '/assets/aistudio/image_1386103e.png',
    commonAreas: ['Reserve Stacks A-C', 'Main Reading Tables (North)', 'Circulation Desk', 'Digital Study Pods', 'Archives Room'],
  },
  {
    id: 'bldg-agrotech-center',
    name: 'Agro-Technology Research Center & Science Labs',
    shortName: 'Agro-Tech Center',
    campus: 'Fendall Campus, Liberia',
    image: '/assets/aistudio/image_a5aca03e.png',
    commonAreas: ['Biotechnology Wet Lab', 'Soil Chemistry Station', 'Hydroponics Bay', 'Cold Storage Unit', 'Lecture Hall 1'],
  },
  {
    id: 'bldg-auditorium',
    name: 'University Convocation Auditorium & Chapel',
    shortName: 'Auditorium',
    campus: 'Main Campus',
    image: '/assets/aistudio/image_73fb8933.png',
    commonAreas: ['Main Stage & Podium', 'Auditorium Seating (Rows 1-20)', 'Audio/Visual Soundboard', 'Backstage Dressing Rooms', 'Foyer & Gallery'],
  },
  {
    id: 'bldg-fellowship-hall',
    name: 'Student Fellowship & Dining Hall',
    shortName: 'Fellowship Hall',
    campus: 'Student Life Quad',
    image: '/assets/aistudio/image_d719be56.png',
    commonAreas: ['Dining Hall Counters', 'Fellowship Gathering Room', 'Catering Kitchen', 'Student Union Desk', 'Courtyard Restrooms'],
  },
  {
    id: 'bldg-agri-fields',
    name: 'Fendall Agro-Field Research & Nursery Station',
    shortName: 'Fendall Field Station',
    campus: 'Fendall Agro-Extension Zone',
    image: '/assets/aistudio/image_5886efe4.png',
    commonAreas: ['Seedling Greenhouses', 'Solar Irrigation Pump Station', 'Field Equipment Shed', 'Meteorological Station', 'Demonstration Plots'],
  },
];

const INITIAL_DEMO_TICKETS: FacilityTicket[] = [
  {
    id: 'fac-101',
    ticketNumber: 'HIAU-FAC-2026-101',
    buildingId: 'bldg-laptop-lab',
    buildingName: 'Agro-Tech Laptop Laboratory & ICT Commons',
    campusName: 'Central Academic Quad',
    locationDetails: 'Workstation Pod B (Rows 3 & 4)',
    category: 'connectivity',
    priority: 'high',
    title: 'Starlink Ethernet Port Loosened on Switch #2',
    description: 'Students at tables 3 and 4 experience intermittent disconnection during timed programming laboratory assignments. Needs RJ45 crimping or switch port patch.',
    reporterName: 'Sando Freeman',
    reporterEmail: 'sando.freeman@student.hiau.edu.lr',
    reporterPhone: '+231 770 234 567',
    reporterRole: 'student',
    status: 'investigating',
    createdAt: '2026-10-27T08:30:00Z',
    updatedAt: '2026-10-27T10:15:00Z',
    assignedStaff: 'Ing. Joseph Kollie (Lead Network Specialist)',
    resolutionNotes: 'Switch port tested; replacement CAT6 patch cord requested from inventory store.',
  },
  {
    id: 'fac-102',
    ticketNumber: 'HIAU-FAC-2026-102',
    buildingId: 'bldg-central-library',
    buildingName: 'Central Academic Library & Study Commons',
    campusName: 'Main Academic Building',
    locationDetails: 'North Reading Hall (Window Bay 2)',
    category: 'ventilation_ac',
    priority: 'medium',
    title: 'Air Conditioning Blower Whine & Filter Dust',
    description: 'AC unit #3 makes a continuous rattling noise during quiet study hours and airflow is warm. Needs filter cleansing and refrigerant inspection.',
    reporterName: 'Martha K. Weah',
    reporterEmail: 'martha.weah@student.hiau.edu.lr',
    reporterRole: 'student',
    status: 'dispatched',
    createdAt: '2026-10-26T14:20:00Z',
    updatedAt: '2026-10-27T09:00:00Z',
    assignedStaff: 'HVAC Tech Emmanuel Doe',
    resolutionNotes: 'Technician dispatched with replacement washable filter; scheduled for 14:00 today.',
  },
  {
    id: 'fac-103',
    ticketNumber: 'HIAU-FAC-2026-103',
    buildingId: 'bldg-admin-monrovia',
    buildingName: 'Main Administrative Complex',
    campusName: 'Main Campus, Montserrado',
    locationDetails: 'Ground Floor West Restroom',
    category: 'sanitation',
    priority: 'urgent',
    title: 'Water Pressure Sensor & Restroom Basin Leak',
    description: 'Sink basin #2 shutoff valve is dripping onto tile flooring, creating a slip hazard near the entrance.',
    reporterName: 'Mrs. Jappah Tweh',
    reporterEmail: 'jappah.tweh@hiau.edu.lr',
    reporterRole: 'registrar',
    status: 'resolved',
    createdAt: '2026-10-25T11:00:00Z',
    updatedAt: '2026-10-25T13:45:00Z',
    assignedStaff: 'Plumbing Foreman Tamba Flomo',
    resolutionNotes: 'Shutoff washer replaced, floor dried and warning signage removed.',
  },
];

export const CampusFacilitiesFeedback: React.FC<CampusFacilitiesFeedbackProps> = ({
  currentUser,
  onTicketCreated,
  onNavigateToTasks,
}) => {
  const [activeTab, setActiveTab] = useState<'submit' | 'history'>('submit');
  const [tickets, setTickets] = useState<FacilityTicket[]>(INITIAL_DEMO_TICKETS);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<FacilityTicket | null>(null);

  // Form State
  const [selectedBuildingId, setSelectedBuildingId] = useState(HIAU_CAMPUS_BUILDINGS[0].id);
  const [locationDetails, setLocationDetails] = useState('');
  const [category, setCategory] = useState<FacilityTicket['category']>('sanitation');
  const [priority, setPriority] = useState<FacilityTicket['priority']>('high');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reporterPhone, setReporterPhone] = useState('+231 ');
  const [hasPhoto, setHasPhoto] = useState(false);

  const selectedBuilding = HIAU_CAMPUS_BUILDINGS.find((b) => b.id === selectedBuildingId) || HIAU_CAMPUS_BUILDINGS[0];

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !locationDetails.trim()) return;

    setIsSubmitting(true);
    const newTicketNum = `HIAU-FAC-2026-${Math.floor(100 + Math.random() * 900)}`;

    const newTicket: FacilityTicket = {
      id: `fac-${Date.now()}`,
      ticketNumber: newTicketNum,
      buildingId: selectedBuilding.id,
      buildingName: selectedBuilding.name,
      campusName: selectedBuilding.campus,
      locationDetails,
      category,
      priority,
      title,
      description,
      reporterName: currentUser.name,
      reporterEmail: currentUser.email,
      reporterPhone,
      reporterRole: currentUser.role,
      status: 'reported',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assignedStaff: 'Dispatched to Physical Plant Supervisor',
    };

    // Auto-create task in TaskManagementDashboard
    try {
      const taskRes = await api.createTask({
        title: `[FACILITY #${newTicketNum}] ${selectedBuilding.shortName}: ${title}`,
        description: `BUILDING: ${selectedBuilding.name} (${selectedBuilding.campus})\nLOCATION: ${locationDetails}\nCATEGORY: ${category.toUpperCase()}\nREPORTER: ${currentUser.name} (${currentUser.role} • ${currentUser.email})\nPHONE: ${reporterPhone}\n\nISSUE DESCRIPTION:\n${description}`,
        category: 'facilities_maintenance',
        priority,
        status: 'todo',
        assigneeName: 'Ing. Joseph Kollie (Physical Plant)',
        assigneeRole: 'super_admin',
        assigneeEmail: 'facilities@hiau.edu.lr',
        department: 'Facilities & Physical Plant',
        dueDate: new Date(Date.now() + (priority === 'urgent' ? 1 : priority === 'high' ? 2 : 4) * 86400000).toISOString(),
        slaDays: priority === 'urgent' ? 1 : priority === 'high' ? 2 : 5,
        tags: ['Facilities', selectedBuilding.shortName, category, newTicketNum],
      });

      if (taskRes && taskRes.task) {
        newTicket.taskId = taskRes.task.id;
      }
    } catch (err) {
      console.warn('Task integration fallback:', err);
    }

    setTickets((prev) => [newTicket, ...prev]);
    setSubmissionSuccess(newTicket);
    setIsSubmitting(false);

    // Reset form fields
    setTitle('');
    setDescription('');
    setLocationDetails('');
    setHasPhoto(false);

    if (onTicketCreated) onTicketCreated();
  };

  const filteredTickets = tickets.filter((t) => {
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchSearch =
      !searchQuery.trim() ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.buildingName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.locationDetails.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  const getPriorityBadge = (p: FacilityTicket['priority']) => {
    switch (p) {
      case 'urgent':
        return <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-rose-50 text-rose-700 border border-rose-300">Urgent • 4h SLA</span>;
      case 'high':
        return <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-50 text-amber-800 border border-amber-300">High • 24h SLA</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-blue-50 text-blue-700 border border-blue-200">Medium • 72h</span>;
      case 'low':
        return <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-slate-100 text-slate-700 border border-slate-300">Low Priority</span>;
    }
  };

  const getStatusBadge = (s: FacilityTicket['status']) => {
    switch (s) {
      case 'reported':
        return <span className="px-2.5 py-1 rounded text-xs font-bold uppercase bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-amber-600" /> Ticket Logged</span>;
      case 'investigating':
        return <span className="px-2.5 py-1 rounded text-xs font-bold uppercase bg-blue-50 text-blue-700 border border-blue-300 flex items-center gap-1.5"><Search className="w-3.5 h-3.5 text-blue-600" /> Investigating</span>;
      case 'dispatched':
        return <span className="px-2.5 py-1 rounded text-xs font-bold uppercase bg-purple-50 text-[#4A1249] border border-purple-300 flex items-center gap-1.5"><Wrench className="w-3.5 h-3.5 text-[#4A1249]" /> Staff Dispatched</span>;
      case 'resolved':
        return <span className="px-2.5 py-1 rounded text-xs font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Work Completed</span>;
    }
  };

  const getCategoryIcon = (cat: FacilityTicket['category']) => {
    switch (cat) {
      case 'sanitation':
        return <Droplets className="w-4 h-4 text-cyan-600" />;
      case 'electrical':
        return <Zap className="w-4 h-4 text-amber-600" />;
      case 'connectivity':
        return <Wifi className="w-4 h-4 text-indigo-600" />;
      case 'ventilation_ac':
        return <Wind className="w-4 h-4 text-teal-600" />;
      case 'furniture_structural':
        return <Building className="w-4 h-4 text-purple-600" />;
      case 'plumbing':
        return <Wrench className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#4A1249] border-2 border-[#C39A53]/50 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-[#2A082C] border border-[#C39A53]/50 text-[#C39A53]">
              <Wrench className="w-6 h-6 text-[#C39A53]" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-collegiate font-black uppercase tracking-tight text-white">
                  CAMPUS FACILITIES & MAINTENANCE FEEDBACK
                </h2>
                <span className="bg-[#C39A53] text-[#2A082C] text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                  Realtime SLA
                </span>
              </div>
              <p className="text-xs text-purple-100 mt-1">
                Report sanitation, electrical, network, or classroom repair tickets across all 7 HIAU facilities. Every ticket directly synchronizes with the Task Management Dashboard.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right hidden sm:block">
            <div className="text-[11px] text-purple-200 font-medium">Physical Plant Hotline</div>
            <div className="text-xs font-mono font-bold text-[#C39A53]">(+231) 770-555-HIAU</div>
          </div>
          {onNavigateToTasks && (
            <button
              onClick={onNavigateToTasks}
              className="px-4 py-2 bg-[#C39A53] hover:bg-[#DDB86C] text-[#2A082C] font-bold text-xs uppercase tracking-wider rounded-xl shadow transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Layers className="w-4 h-4 text-[#2A082C]" />
              <span>View Tasks Board</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => {
            setActiveTab('submit');
            setSubmissionSuccess(null);
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'submit'
              ? 'bg-[#4A1249] text-white shadow-md'
              : 'bg-white text-slate-700 hover:text-[#4A1249] border border-slate-200'
          }`}
        >
          <Plus className="w-4 h-4 text-[#C39A53]" />
          <span>Report Maintenance / Sanitation Issue</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'history'
              ? 'bg-[#4A1249] text-white shadow-md'
              : 'bg-white text-slate-700 hover:text-[#4A1249] border border-slate-200'
          }`}
        >
          <Clock className="w-4 h-4 text-[#C39A53]" />
          <span>Active Tickets & Repair Work Orders ({tickets.length})</span>
        </button>
      </div>

      {/* 1. SUBMIT TICKET TAB */}
      {activeTab === 'submit' && (
        <div className="space-y-6">
          {submissionSuccess ? (
            <div className="bg-white border-2 border-[#C39A53] rounded-2xl p-8 shadow-xl text-center space-y-4 animate-in fade-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto border-2 border-emerald-300">
                <Check className="w-8 h-8 text-emerald-700" />
              </div>
              <div>
                <span className="text-xs font-mono font-bold text-[#4A1249] bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                  Ticket Reference: {submissionSuccess.ticketNumber}
                </span>
                <h3 className="text-2xl font-collegiate font-bold text-[#4A1249] mt-3 uppercase tracking-tight">
                  REPAIR TICKET SUCCESSFULLY DISPATCHED
                </h3>
                <p className="text-sm text-slate-600 max-w-xl mx-auto mt-2 leading-relaxed">
                  Your report for <strong>{submissionSuccess.buildingName}</strong> ({submissionSuccess.locationDetails}) has been routed to Facilities & Physical Plant. An actionable workflow task has been registered on the institutional dashboard.
                </p>
              </div>

              <div className="bg-[#FAF4FB] border border-purple-200 rounded-xl p-4 max-w-lg mx-auto text-left text-xs space-y-2">
                <div className="flex justify-between text-slate-700">
                  <span>Assigned Department:</span>
                  <strong className="text-[#4A1249]">Physical Plant & Maintenance</strong>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Priority SLA:</span>
                  <div>{getPriorityBadge(submissionSuccess.priority)}</div>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Logged Submitter:</span>
                  <span className="font-medium text-slate-900">{submissionSuccess.reporterName} ({submissionSuccess.reporterEmail})</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
                <button
                  onClick={() => setActiveTab('history')}
                  className="px-6 py-2.5 bg-[#4A1249] hover:bg-[#661B69] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow cursor-pointer"
                >
                  Track Work Order Status
                </button>
                <button
                  onClick={() => setSubmissionSuccess(null)}
                  className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer"
                >
                  File Another Ticket
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitTicket} className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-md space-y-6">
              {/* Step 1: Select Facility */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#4A1249] mb-3 flex items-center justify-between">
                  <span>Step 1: Select Affected Campus Facility *</span>
                  <span className="text-slate-500 font-normal">Choose one of our 7 verified buildings</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5">
                  {HIAU_CAMPUS_BUILDINGS.map((bldg) => {
                    const isSelected = selectedBuildingId === bldg.id;
                    return (
                      <button
                        key={bldg.id}
                        type="button"
                        onClick={() => setSelectedBuildingId(bldg.id)}
                        className={`text-left rounded-xl p-2.5 border-2 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                          isSelected
                            ? 'border-[#4A1249] bg-purple-50/60 shadow-md ring-2 ring-[#C39A53]/50'
                            : 'border-slate-200 hover:border-purple-300 bg-white'
                        }`}
                      >
                        <div className="relative h-16 w-full rounded-lg overflow-hidden mb-2 bg-[#2A082C]">
                          <img src={bldg.image} alt={bldg.name} className="w-full h-full object-cover" />
                          {isSelected && (
                            <div className="absolute inset-0 bg-[#4A1249]/30 flex items-center justify-center">
                              <CheckCircle2 className="w-5 h-5 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className={`block text-xs font-collegiate font-bold uppercase tracking-tight truncate ${isSelected ? 'text-[#4A1249]' : 'text-slate-800'}`}>
                            {bldg.shortName}
                          </span>
                          <span className="block text-[10px] text-slate-500 truncate mt-0.5">
                            {bldg.campus}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Specific Location & Common Areas */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                <div className="md:col-span-7 space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#4A1249]">
                    Exact Room, Floor, or Location Area *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Room 204, 2nd Floor East Restroom, Workstation 12"
                    value={locationDetails}
                    onChange={(e) => setLocationDetails(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-[#2E0F34] focus:outline-none focus:border-[#4A1249]"
                  />
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-600">Common Zones:</span>
                    {selectedBuilding.commonAreas.map((area, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setLocationDetails(area)}
                        className="px-2 py-0.5 rounded bg-slate-100 hover:bg-purple-100 text-slate-700 hover:text-[#4A1249] transition-colors cursor-pointer"
                      >
                        {area}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-5 space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#4A1249]">
                    Issue Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as FacilityTicket['category'])}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-[#2E0F34] font-semibold focus:outline-none focus:border-[#4A1249]"
                  >
                    <option value="sanitation">Sanitation & Restroom Supplies</option>
                    <option value="electrical">Electrical, Lighting & Generator Power</option>
                    <option value="connectivity">Starlink, Wi-Fi & ICT Network</option>
                    <option value="ventilation_ac">Air Conditioning & Ventilation</option>
                    <option value="furniture_structural">Desks, Chairs, Doors & Chalkboard</option>
                    <option value="plumbing">Plumbing, Water Pressure & Drainage</option>
                  </select>
                </div>
              </div>

              {/* Step 3: Priority & Issue Details */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#4A1249] mb-1">
                      Urgency / Priority *
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(['urgent', 'high', 'medium', 'low'] as const).map((pr) => (
                        <button
                          key={pr}
                          type="button"
                          onClick={() => setPriority(pr)}
                          className={`py-2 px-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border-2 transition-all cursor-pointer flex items-center justify-center gap-1 ${
                            priority === pr
                              ? 'border-[#4A1249] bg-purple-50 text-[#4A1249] shadow-xs'
                              : 'border-slate-200 text-slate-600 bg-white hover:border-slate-300'
                          }`}
                        >
                          {pr === 'urgent' && <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />}
                          <span>{pr}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#4A1249] mb-1">
                      Callback Phone / WhatsApp (For Technician Dispatch)
                    </label>
                    <input
                      type="tel"
                      value={reporterPhone}
                      onChange={(e) => setReporterPhone(e.target.value)}
                      placeholder="+231 770 123 456"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-[#2E0F34] focus:outline-none focus:border-[#4A1249]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#4A1249] mb-1">
                    Problem Summary / Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Water leakage under sink in 2nd floor restroom"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-[#2E0F34] font-semibold focus:outline-none focus:border-[#4A1249]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#4A1249] mb-1">
                    Detailed Description & Hazard Information *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe the issue in detail, whether it poses a safety hazard, if it interrupts classes or labs, and any relevant equipment identifiers."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-[#2E0F34] focus:outline-none focus:border-[#4A1249] leading-relaxed"
                  />
                </div>

                {/* Photo Simulation Checkbox */}
                <div className="flex items-center gap-3 p-3 bg-purple-50/50 rounded-xl border border-purple-100">
                  <input
                    type="checkbox"
                    id="attachPhoto"
                    checked={hasPhoto}
                    onChange={(e) => setHasPhoto(e.target.checked)}
                    className="rounded border-slate-300 text-[#4A1249] focus:ring-[#4A1249] cursor-pointer"
                  />
                  <label htmlFor="attachPhoto" className="text-xs text-slate-700 cursor-pointer flex items-center gap-1.5 font-medium">
                    <Camera className="w-4 h-4 text-[#C39A53]" />
                    <span>Attach on-site photo evidence (simulated camera capture for repair crew)</span>
                  </label>
                </div>
              </div>

              {/* Submitter Credentials Notice */}
              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-[#4A1249]" />
                  <span>Reporting as: <strong className="text-slate-800">{currentUser.name}</strong> ({currentUser.email} • {currentUser.role})</span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-7 py-3 bg-[#C39A53] hover:bg-[#DDB86C] text-[#2A082C] font-collegiate font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-[#2A082C]" />
                      <span>Dispatching Ticket...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-[#2A082C]" />
                      <span>Submit Actionable Repair Ticket</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* 2. HISTORY / TRACKING TAB */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="font-bold text-slate-600 uppercase tracking-wide">Filter Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-semibold focus:outline-none focus:border-[#4A1249]"
              >
                <option value="all">All Statuses ({tickets.length})</option>
                <option value="reported">Reported</option>
                <option value="investigating">Investigating</option>
                <option value="dispatched">Dispatched / In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search ticket, building, room..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-[#4A1249]"
              />
            </div>
          </div>

          {/* Tickets List */}
          <div className="space-y-3">
            {filteredTickets.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-xs">
                No facility repair tickets match your search or filter.
              </div>
            ) : (
              filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="bg-white border border-slate-200 hover:border-purple-300 rounded-xl p-5 shadow-sm transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#4A1249] bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded">
                        {ticket.ticketNumber}
                      </span>
                      {getPriorityBadge(ticket.priority)}
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#C39A53]" />
                        <strong>{ticket.buildingName}</strong> • {ticket.locationDetails}
                      </span>
                    </div>

                    <div>{getStatusBadge(ticket.status)}</div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      {getCategoryIcon(ticket.category)}
                      <span>{ticket.title}</span>
                    </h4>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                      {ticket.description}
                    </p>
                  </div>

                  <div className="bg-[#FAF8FB] p-3 rounded-lg border border-purple-100/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-slate-600">
                    <div>
                      <span>Assigned Staff: <strong className="text-slate-900">{ticket.assignedStaff || 'Pending Dispatch'}</strong></span>
                      {ticket.resolutionNotes && (
                        <div className="text-emerald-800 mt-0.5 font-medium">
                          Notes: {ticket.resolutionNotes}
                        </div>
                      )}
                    </div>
                    <div className="text-slate-400 font-mono">
                      Reported: {new Date(ticket.createdAt).toLocaleDateString()} by {ticket.reporterName}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
