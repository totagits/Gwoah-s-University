import React, { useState, useRef, useEffect } from 'react';
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  Hand,
  Users,
  MessageSquare,
  Share2,
  Download,
  PenTool,
  Eraser,
  Square,
  Circle,
  Type,
  RotateCcw,
  Sparkles,
  Wifi,
  ChevronLeft,
  ChevronRight,
  Send,
  HelpCircle,
  CheckCircle2,
  Laptop,
  Maximize2,
  FileText,
  Volume2,
} from 'lucide-react';
import { UserProfile } from '../../types';

interface VirtualClassroomCollabProps {
  currentUser: UserProfile;
}

interface ChatMessage {
  id: string;
  senderName: string;
  senderRole: string;
  text: string;
  timestamp: string;
  isInstructor?: boolean;
}

export const VirtualClassroomCollab: React.FC<VirtualClassroomCollabProps> = ({
  currentUser,
}) => {
  // Mode: 'whiteboard' or 'presentation'
  const [activeView, setActiveView] = useState<'presentation' | 'whiteboard'>('presentation');

  // Media states
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [handRaised, setHandRaised] = useState(false);
  const [lowBandwidthMode, setLowBandwidthMode] = useState(false);

  // Presentation slides state
  const [currentSlide, setCurrentSlide] = useState(0);

  // Whiteboard drawing state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawColor, setDrawColor] = useState('#4A1249');
  const [drawWidth, setDrawWidth] = useState(3);
  const [drawTool, setDrawTool] = useState<'pen' | 'highlighter' | 'eraser'>('pen');
  const [stickyNotes, setStickyNotes] = useState<Array<{ id: string; text: string; x: number; y: number; color: string }>>([
    {
      id: 'sticky-1',
      text: 'Remember: In-order traversal visits left subtree, root, then right subtree!',
      x: 30,
      y: 40,
      color: '#FEF08A',
    },
    {
      id: 'sticky-2',
      text: 'Agro-sensor data packets sync via MQTT over Starlink at 10-second intervals.',
      x: 30,
      y: 160,
      color: '#BAE6FD',
    },
  ]);

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'c-1',
      senderName: 'Dr. Moses S. Doe',
      senderRole: 'Senior Lecturer',
      text: 'Welcome scholars. Please open Lecture 4 in your Shared Resource Library.',
      timestamp: '14:02',
      isInstructor: true,
    },
    {
      id: 'c-2',
      senderName: 'Sando Fahnbulleh',
      senderRole: 'Student',
      text: 'Good afternoon Dr. Doe. Audio and slides are crisp on our lab workstations.',
      timestamp: '14:04',
    },
    {
      id: 'c-3',
      senderName: 'Helena Kollie',
      senderRole: 'Admissions & Student Guild',
      text: 'The Fendall soil sensor dataset is loaded in the terminal!',
      timestamp: '14:05',
    },
  ]);
  const [newMessageText, setNewMessageText] = useState('');

  // Active participants list
  const participants = [
    { name: 'Dr. Moses S. Doe', role: 'Instructor (Senior Lecturer)', speaking: true, hasVideo: true, avatar: '👨🏾‍🏫' },
    { name: 'Sando Fahnbulleh', role: 'Student (Year 3 CompSci)', speaking: false, hasVideo: true, avatar: '🧑🏾‍🎓', hand: handRaised },
    { name: 'Helena Kollie', role: 'Student (Engineering)', speaking: false, hasVideo: false, avatar: '👩🏾‍🎓' },
    { name: 'Samuel Barclay', role: 'Bursar Observer', speaking: false, hasVideo: false, avatar: '👨🏾‍💼' },
    { name: 'Patricia Tweh', role: 'Registrar Evaluator', speaking: false, hasVideo: true, avatar: '👩🏾‍💼' },
  ];

  const presentationSlides = [
    {
      title: 'CSC 301: Advanced Data Structures & Liberian Agro-Tech Sensor Networks',
      subtitle: 'Harvest Intercontinental American University • Department of Computer Science',
      bulletPoints: [
        'Course Module: Tree Data Structures & Hierarchical Soil Moisture Optimization',
        'Demonstration Site: Fendall Agro-Technology Demonstration Campus (Field Plot B)',
        'Starlink Satellite Telemetry: Real-time sensor aggregation over high-latency WAN links',
        'Laboratory Practical: Building balanced BST search pipelines with low-memory footprint',
      ],
      highlight: 'Sample lesson presentation — no live broadcast',
      codeSnippet: `class AgroSensorNode {
    double moisturePercent;
    long timestampUTC;
    AgroSensorNode left, right;

    AgroSensorNode(double moisture) {
        this.moisturePercent = moisture;
    }
}`,
    },
    {
      title: 'Algorithmic Complexity & Low-Bandwidth Network Efficiency',
      subtitle: 'Designing for West African Telecommunications Infrastructure',
      bulletPoints: [
        'Local Edge Caching: Minimizing round-trip queries from rural Monrovia & Fendall hubs',
        'BST Search vs Linear Array: O(log N) average search reduces server CPU cycles by 94%',
        'Offline Synchronization: Automatic journal write-ahead when satellite link suffers rain-fade',
        'Statutory NCHE Benchmark: Applied computer science relevant to national agricultural output',
      ],
      highlight: 'Key Takeaway: Computational efficiency saves bandwidth and solar battery power',
      codeSnippet: `// Synchronize batch readings to HIAU Central Cloud
public void syncReadingsToCloud(AgroSensorNode root) {
    if (root == null) return;
    syncReadingsToCloud(root.left);
    starlinkTransmit(root.moisturePercent);
    syncReadingsToCloud(root.right);
}`,
    },
    {
      title: 'Hands-on Student Laboratory Exercise',
      subtitle: 'Week 2 Continuous Assessment (15 Marks)',
      bulletPoints: [
        'Step 1: Clone the CSC 301 repository from the Shared Resource Library',
        'Step 2: Implement balance factor calculation for the Fendall soil tree nodes',
        'Step 3: Execute unit tests in the student portal workspace',
        'Step 4: Submit code before Friday 5:00 PM GMT for continuous assessment grading',
      ],
      highlight: 'Due Date: Friday, November 6, 2026 • Electronic Portal Submission',
      codeSnippet: `// TODO: Implement self-balancing AVL rotation
public AgroSensorNode rotateRight(AgroSensorNode y) {
    AgroSensorNode x = y.left;
    AgroSensorNode T2 = x.right;
    x.right = y;
    y.left = T2;
    return x;
}`,
    },
  ];

  // Canvas drawing handlers
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set high DPI scale
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Initial canvas background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Draw initial grid
    ctx.strokeStyle = '#F1F5F9';
    ctx.lineWidth = 1;
    for (let x = 0; x < rect.width; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, rect.height);
      ctx.stroke();
    }
    for (let y = 0; y < rect.height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(rect.width, y);
      ctx.stroke();
    }
  }, [activeView]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (drawTool === 'eraser') {
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 20;
    } else if (drawTool === 'highlighter') {
      ctx.strokeStyle = '#FEF08A88';
      ctx.lineWidth = 16;
    } else {
      ctx.strokeStyle = drawColor;
      ctx.lineWidth = drawWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, rect.width, rect.height);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim()) return;
    const newMsg: ChatMessage = {
      id: `c-${Date.now()}`,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      text: newMessageText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isInstructor: currentUser.role === 'lecturer' || currentUser.role === 'dean',
    };
    setChatMessages((prev) => [...prev, newMsg]);
    setNewMessageText('');
  };

  const handleAddStickyNote = () => {
    const noteText = prompt('Enter note text for visual whiteboard:');
    if (noteText) {
      setStickyNotes((prev) => [
        ...prev,
        {
          id: `sticky-${Date.now()}`,
          text: noteText,
          x: 100 + Math.random() * 200,
          y: 80 + Math.random() * 100,
          color: '#FEF08A',
        },
      ]);
    }
  };

  return (
    <div className="hiau-virtual-classroom min-w-0 max-w-full space-y-5 overflow-x-clip">
      <p role="status" className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm font-semibold text-amber-950">DEMO ONLY — The participant names, messages, slides, connection indicators and lesson material shown below are illustrative. No classroom session or real-time communication is active.</p>
      {/* Top Banner: Virtual Collaboration & Live E-Learning Classroom */}
      <div className="min-w-0 bg-gradient-to-r from-[#4A1249] to-[#2A082C] text-white rounded-2xl p-4 sm:p-6 border-2 border-[#C39A53]/60 shadow-xl flex flex-col 2xl:flex-row items-start 2xl:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-bold uppercase tracking-wider text-[#C39A53] mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping inline-block" />
            <span>Demonstration interface · Not a live class</span>
            <span>•</span>
            <span>CSC 301 (Section A)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-collegiate font-black uppercase tracking-tight !text-white break-words">
            Online Courses & Visual Collaboration Studio
          </h2>
          <p className="text-xs text-purple-200 mt-1 max-w-2xl">
            Sample slides and local whiteboard tools only. Live attendance, audio/video, classroom chat delivery and synchronization are not connected to an approved course session.
          </p>
        </div>

        <div className="flex w-full flex-wrap items-center gap-2.5 2xl:w-auto 2xl:shrink-0">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-mono font-bold">
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            <span>No live connection telemetry</span>
          </span>

          <button
            onClick={() => setLowBandwidthMode(!lowBandwidthMode)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border ${
              lowBandwidthMode
                ? 'bg-[#C39A53] !text-[#2A082C] border-[#C39A53]'
                : 'bg-white/10 text-purple-200 border-white/20 hover:bg-white/20'
            }`}
            title="Toggle data-saving mode for remote Liberian telecom networks"
          >
            {lowBandwidthMode ? 'Data Saver Active' : 'Low-Bandwidth Mode'}
          </button>
        </div>
      </div>

      {/* Main Studio Workspace Grid */}
      <div className="grid min-w-0 grid-cols-1 2xl:grid-cols-12 gap-4 xl:gap-6">
        {/* Left & Center (8 Cols): Video / Presentation / Whiteboard */}
        <div className="min-w-0 2xl:col-span-8 space-y-4">
          {/* View Mode Switcher & Media Toolbar */}
          <div className="min-w-0 bg-white border border-purple-200 rounded-xl p-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setActiveView('presentation')}
                className={`min-h-10 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeView === 'presentation'
                    ? 'bg-[#4A1249] !text-white shadow-xs'
                    : 'bg-slate-100 text-[#35103b] hover:bg-purple-50'
                }`}
              >
                <FileText className="w-4 h-4 text-[#C39A53]" />
                <span>Presentation Slides</span>
              </button>

              <button
                onClick={() => setActiveView('whiteboard')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeView === 'whiteboard'
                    ? 'bg-[#4A1249] !text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-purple-50'
                }`}
              >
                <PenTool className="w-4 h-4 text-[#C39A53]" />
                <span>Visual Whiteboard</span>
              </button>
            </div>

            {/* Media Action Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                  isMuted ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
              >
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-emerald-600" />}
                <span className="text-[11px] hidden sm:inline">{isMuted ? 'Muted' : 'Mic On'}</span>
              </button>

              <button
                onClick={() => setIsVideoOn(!isVideoOn)}
                className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                  !isVideoOn ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                title={isVideoOn ? 'Stop webcam' : 'Start webcam'}
              >
                {isVideoOn ? <Video className="w-4 h-4 text-[#4A1249]" /> : <VideoOff className="w-4 h-4" />}
                <span className="text-[11px] hidden sm:inline">{isVideoOn ? 'Video Active' : 'Off'}</span>
              </button>

              <button
                onClick={() => setHandRaised(!handRaised)}
                className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer ${
                  handRaised
                    ? 'bg-[#C39A53] text-[#2A082C] shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-amber-100'
                }`}
                title="Raise hand to ask question"
              >
                <Hand className="w-4 h-4" />
                <span className="text-[11px]">{handRaised ? 'Hand Raised' : 'Raise Hand'}</span>
              </button>
            </div>
          </div>

          {/* 1. PRESENTATION SLIDES VIEW */}
          {activeView === 'presentation' && (
            <div className="min-w-0 bg-slate-900 border-2 border-purple-200 rounded-2xl overflow-hidden shadow-xl text-white flex flex-col justify-between min-h-[460px]">
              {/* Slide Content Header */}
              <div className="min-w-0 p-4 sm:p-6 space-y-6">
                <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded bg-[#4A1249] text-[#C39A53] text-xs font-bold font-mono border border-[#C39A53]/50">
                      Slide {currentSlide + 1} of {presentationSlides.length}
                    </span>
                    <span className="text-xs text-slate-400 hidden sm:inline">
                      {presentationSlides[currentSlide].subtitle}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-[#C39A53] font-bold">
                    <Laptop className="w-4 h-4 text-[#C39A53]" />
                    <span>Sample lesson · not a live stream</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg sm:text-2xl font-collegiate font-bold !text-white tracking-tight uppercase break-words">
                    {presentationSlides[currentSlide].title}
                  </h3>
                  <div className="mt-2 inline-block px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/40 text-[11px] text-purple-200 font-semibold">
                    {presentationSlides[currentSlide].highlight}
                  </div>
                </div>

                <div className="grid min-w-0 grid-cols-1 2xl:grid-cols-2 gap-5 pt-2">
                  <ul className="space-y-3">
                    {presentationSlides[currentSlide].bulletPoints.map((pt, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-[#C39A53] shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Code snippet display */}
                  <div className="min-w-0 max-w-full bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 font-sans">
                      Sample code snippet — not synchronized:
                    </div>
                    <pre className="w-max min-w-0 text-[11px] leading-relaxed">{presentationSlides[currentSlide].codeSnippet}</pre>
                  </div>
                </div>
              </div>

              {/* Bottom Slide Navigation Bar */}
              <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={() => setCurrentSlide((prev) => Math.max(0, prev - 1))}
                  disabled={currentSlide === 0}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1 cursor-pointer disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <div className="flex items-center gap-1.5">
                  {presentationSlides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`w-3 h-3 rounded-full transition-all cursor-pointer ${
                        currentSlide === idx ? 'bg-[#C39A53] scale-125' : 'bg-slate-700 hover:bg-slate-500'
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>

                <button
                  onClick={() => setCurrentSlide((prev) => Math.min(presentationSlides.length - 1, prev + 1))}
                  disabled={currentSlide === presentationSlides.length - 1}
                  className="hiau-action-primary px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center gap-1 cursor-pointer disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C39A53]"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* 2. VISUAL WHITEBOARD VIEW */}
          {activeView === 'whiteboard' && (
            <div className="bg-white border-2 border-purple-200 rounded-2xl overflow-hidden shadow-xl flex flex-col min-h-[480px]">
              {/* Whiteboard Toolbar */}
              <div className="p-3 bg-purple-50/70 border-b border-purple-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDrawTool('pen')}
                    className={`p-2 rounded-lg cursor-pointer transition-colors ${
                      drawTool === 'pen' ? 'bg-[#4A1249] text-white' : 'bg-white text-slate-700 hover:bg-purple-100'
                    }`}
                    title="Pen"
                  >
                    <PenTool className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDrawTool('highlighter')}
                    className={`p-2 rounded-lg cursor-pointer transition-colors ${
                      drawTool === 'highlighter' ? 'bg-[#4A1249] text-white' : 'bg-white text-slate-700 hover:bg-purple-100'
                    }`}
                    title="Highlighter"
                  >
                    <Type className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDrawTool('eraser')}
                    className={`p-2 rounded-lg cursor-pointer transition-colors ${
                      drawTool === 'eraser' ? 'bg-[#4A1249] text-white' : 'bg-white text-slate-700 hover:bg-purple-100'
                    }`}
                    title="Eraser"
                  >
                    <Eraser className="w-4 h-4" />
                  </button>

                  <div className="h-5 w-[1px] bg-slate-300 mx-1" />

                  {/* Color Swatches */}
                  <div className="flex items-center gap-1.5">
                    {['#4A1249', '#C39A53', '#145A53', '#DC2626', '#2563EB', '#111827'].map((c) => (
                      <button
                        key={c}
                        onClick={() => {
                          setDrawColor(c);
                          setDrawTool('pen');
                        }}
                        className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${
                          drawColor === c && drawTool === 'pen' ? 'scale-125 border-slate-900 ring-2 ring-[#C39A53]' : 'border-white'
                        }`}
                        style={{ backgroundColor: c }}
                        title={`Color: ${c}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAddStickyNote}
                    className="px-3 py-1.5 bg-[#C39A53] hover:bg-[#DDB86C] text-[#2A082C] font-bold text-xs uppercase tracking-wider rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Square className="w-3.5 h-3.5" />
                    <span>Add Sticky Note</span>
                  </button>

                  <button
                    onClick={clearCanvas}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-lg flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Clear Canvas</span>
                  </button>
                </div>
              </div>

              {/* Canvas Interactive Drawing Area */}
              <div className="relative flex-1 bg-slate-50 overflow-hidden cursor-crosshair">
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  className="w-full h-[400px] touch-none block"
                />

                {/* Sticky notes overlay */}
                {stickyNotes.map((note) => (
                  <div
                    key={note.id}
                    style={{ left: `${note.x}px`, top: `${note.y}px`, backgroundColor: note.color }}
                    className="absolute p-3 rounded-lg shadow-md border border-slate-300 w-48 text-xs text-slate-800 font-sans cursor-move animate-in fade-in"
                  >
                    <div className="text-[10px] font-bold text-slate-600 uppercase mb-1 flex items-center justify-between">
                      <span>Instructor Note</span>
                      <button
                        onClick={() => setStickyNotes((prev) => prev.filter((n) => n.id !== note.id))}
                        className="text-slate-500 hover:text-rose-600 font-bold"
                      >
                        ×
                      </button>
                    </div>
                    <p className="leading-snug">{note.text}</p>
                  </div>
                ))}
              </div>

              {/* Whiteboard footer note */}
              <div className="p-2.5 bg-white border-t border-slate-200 text-slate-500 text-[11px] flex items-center justify-between">
                <span>Local-only whiteboard preview; changes are not shared with students</span>
                <span className="font-mono text-[10px] text-[#4A1249]">Local demonstration</span>
              </div>
            </div>
          )}
        </div>

        {/* Right (4 Cols): Participants & Live Seminar Chat */}
        <div className="min-w-0 2xl:col-span-4 space-y-4">
          {/* Active Participants List */}
          <div className="min-w-0 bg-white border border-purple-200 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-purple-100 pb-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#4A1249]" />
                <h4 className="font-collegiate font-bold text-xs uppercase tracking-wider text-slate-900">
                  Illustrative Participants ({participants.length})
                </h4>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                Sample list · Not connected
              </span>
            </div>

            <div className="space-y-2">
              {participants.map((p, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-purple-50/50 hover:bg-purple-100/50 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-lg">{p.avatar}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate flex items-center gap-1.5">
                        <span>{p.name}</span>
                        {p.hand && (
                          <span className="text-[10px] px-1 bg-amber-200 text-amber-900 font-bold rounded">
                            ✋ Hand
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">{p.role}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {p.speaking && <Volume2 className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />}
                    {p.hasVideo ? (
                      <Video className="w-3.5 h-3.5 text-[#4A1249]" />
                    ) : (
                      <VideoOff className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Seminar Chat */}
          <div className="min-w-0 bg-white border border-purple-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between h-[360px]">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-purple-100 pb-2 mb-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#C39A53]" />
                <h4 className="font-collegiate font-bold text-xs uppercase tracking-wider text-slate-900">
                  Seminar Q&A Discussion
                </h4>
              </div>
              <span className="text-[10px] text-slate-400">Sample thread · not sent</span>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-xs">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-2.5 rounded-xl border ${
                    msg.isInstructor
                      ? 'bg-purple-50/80 border-purple-200 text-slate-900'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className={`font-bold text-[11px] ${msg.isInstructor ? 'text-[#4A1249]' : 'text-slate-800'}`}>
                      {msg.senderName} {msg.isInstructor && '★ (Faculty)'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{msg.timestamp}</span>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-700">{msg.text}</p>
                </div>
              ))}
            </div>

            {/* Chat Send Form */}
            <form onSubmit={handleSendMessage} className="pt-2 border-t border-purple-100 flex items-center gap-2 mt-2">
              <input
                type="text"
                placeholder="Ask Dr. Doe or post code question..."
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                className="min-w-0 flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#4A1249]"
              />
              <button
                type="submit"
                className="hiau-action-primary shrink-0 p-2 rounded-lg cursor-pointer transition-colors shadow-xs"
                aria-label="Send question to seminar"
              >
                <Send className="w-4 h-4 text-[#C39A53]" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
