import React, { useState, useEffect } from 'react';
import {
  Zap,
  BookOpen,
  QrCode,
  CreditCard,
  Wrench,
  Library,
  PlusCircle,
  Video,
  X,
  Search,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Clock,
  Sparkles,
  Command,
} from 'lucide-react';
import { UserProfile } from '../../types';

interface PortalQuickActionsMenuProps {
  currentUser: UserProfile;
  onNavigateTab: (tabId: string, subAction?: string) => void;
  onOpenPrintModal: (docType: 'transcript' | 'financial_statement' | 'registration_plan') => void;
}

interface QuickActionItem {
  id: string;
  title: string;
  description: string;
  category: 'Academics' | 'Financial' | 'Facilities' | 'Administration' | 'E-Learning';
  icon: React.ReactNode;
  badge?: string;
  action: () => void;
  shortcut?: string;
}

export const PortalQuickActionsMenu: React.FC<PortalQuickActionsMenuProps> = ({
  currentUser,
  onNavigateTab,
  onOpenPrintModal,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Keyboard shortcut Ctrl+K or Cmd+K to toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const quickActions: QuickActionItem[] = [
    {
      id: 'action-registration',
      title: 'Course Registration (Add / Drop)',
      description: 'Enroll in Semester I 2026/2027 courses, adjust sections, and view capacity limits',
      category: 'Academics',
      icon: <BookOpen className="w-5 h-5 text-[#C39A53]" />,
      badge: 'Open Now',
      shortcut: '1',
      action: () => {
        onNavigateTab('academics');
        setIsOpen(false);
      },
    },
    {
      id: 'action-transcript',
      title: 'Request Official Transcript',
      description: 'Generate NCHE-certified baccalaureate transcript with QR verification code',
      category: 'Academics',
      icon: <QrCode className="w-5 h-5 text-[#4A1249]" />,
      badge: 'Instant PDF',
      shortcut: '2',
      action: () => {
        onOpenPrintModal('transcript');
        setIsOpen(false);
      },
    },
    {
      id: 'action-fees',
      title: 'Fee Payment & Statement of Account',
      description: 'Review tuition balances, EcoBank deposits, mobile money receipts, and financial clearances',
      category: 'Financial',
      icon: <CreditCard className="w-5 h-5 text-emerald-600" />,
      badge: 'Bursar',
      shortcut: '3',
      action: () => {
        onNavigateTab('finance');
        setIsOpen(false);
      },
    },
    {
      id: 'action-fee-statement',
      title: 'Print Official Fee Statement',
      description: 'Generate institutional billing statement with semester payment schedule and seal',
      category: 'Financial',
      icon: <CreditCard className="w-5 h-5 text-[#C39A53]" />,
      badge: 'Print',
      shortcut: '4',
      action: () => {
        onOpenPrintModal('financial_statement');
        setIsOpen(false);
      },
    },
    {
      id: 'action-facility',
      title: 'Report Facility / Maintenance Issue',
      description: 'Submit an actionable repair ticket for classroom AC, plumbing, lab power, or Starlink',
      category: 'Facilities',
      icon: <Wrench className="w-5 h-5 text-amber-600" />,
      badge: '4h SLA',
      shortcut: '5',
      action: () => {
        onNavigateTab('student_portal', 'facilities');
        setIsOpen(false);
      },
    },
    {
      id: 'action-library',
      title: 'Shared Resource Library',
      description: 'Access version-controlled syllabi, past exams, student handbooks, and NCHE regulations',
      category: 'Academics',
      icon: <Library className="w-5 h-5 text-[#4A1249]" />,
      badge: 'Versioned',
      shortcut: '6',
      action: () => {
        onNavigateTab('student_portal', 'library');
        setIsOpen(false);
      },
    },
    {
      id: 'action-classroom',
      title: 'Virtual Classroom & Visual Collaboration',
      description: 'Live interactive whiteboard, presentation slides, chat, and low-bandwidth seminar breakout',
      category: 'E-Learning',
      icon: <Video className="w-5 h-5 text-indigo-600" />,
      badge: 'Live Collab',
      shortcut: '7',
      action: () => {
        onNavigateTab('student_portal', 'classroom');
        setIsOpen(false);
      },
    },
    {
      id: 'action-task',
      title: 'Log Administrative Task / Work Order',
      description: 'Register university governance action, faculty workflow, or accreditation milestone',
      category: 'Administration',
      icon: <PlusCircle className="w-5 h-5 text-[#C39A53]" />,
      badge: 'ERP Core',
      shortcut: '8',
      action: () => {
        onNavigateTab('tasks');
        setIsOpen(false);
      },
    },
  ];

  const filteredActions = quickActions.filter(
    (a) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Contextual action palette: in document flow, never overlaps content or footer. */}
      <div className="relative mb-4 flex items-center justify-end gap-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group inline-flex items-center gap-2 rounded-lg border border-[#d8c9dc] bg-white px-3 py-2 text-sm font-semibold text-[#4A1249] shadow-sm transition-colors hover:bg-[#f7f0f7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4A1249]"
          aria-label="Open ERP Quick Actions Menu"
          title="Quick Actions & Fast Workflow Navigation (Ctrl+K)"
        >
          <div className="text-[#4A1249]">
            <Zap className="w-4 h-4 fill-current" />
          </div>
          <span className="hidden font-semibold sm:inline">
            Quick Actions
          </span>
          <span className="hidden text-[10px] text-slate-500 md:inline">
            Ctrl+K
          </span>
        </button>
      </div>

      {/* Quick Actions Modal Palette */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div
            className="w-full max-w-2xl bg-white border-2 border-purple-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95"
            role="dialog"
            aria-modal="true"
            aria-labelledby="quick-actions-title"
          >
            {/* Header */}
            <div className="bg-[#4A1249] text-white p-4 flex items-center justify-between border-b border-[#C39A53]/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#2A082C] rounded-lg border border-[#C39A53]/50 text-[#C39A53]">
                  <Zap className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h3 id="quick-actions-title" className="font-collegiate font-black text-base uppercase tracking-wide">
                    HIAU ERP Quick Actions Directory
                  </h3>
                  <p className="text-xs text-purple-200">
                    One-click navigation to essential student, academic, and administrative operations
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-purple-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close Quick Actions"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input Bar */}
            <div className="p-3.5 bg-purple-50/70 border-b border-purple-200 flex items-center gap-3">
              <Search className="w-4 h-4 text-[#4A1249] shrink-0" />
              <input
                type="text"
                autoFocus
                placeholder="Type to filter: registration, transcript, fee payment, maintenance, collaboration..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white px-3 py-2 border border-purple-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#4A1249]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Actions Grid */}
            <div className="p-4 overflow-y-auto space-y-2.5 divide-y divide-purple-100/60">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredActions.map((item) => (
                  <button
                    key={item.id}
                    onClick={item.action}
                    className="p-3.5 rounded-xl border border-purple-200 hover:border-[#4A1249] bg-white hover:bg-purple-50/50 text-left transition-all group flex flex-col justify-between cursor-pointer shadow-xs hover:shadow-md"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-purple-50 group-hover:bg-[#4A1249] group-hover:text-white rounded-lg transition-colors">
                            {item.icon}
                          </div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            {item.category}
                          </span>
                        </div>
                        {item.badge && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#C39A53]/20 text-[#4A1249] border border-[#C39A53]/50">
                            {item.badge}
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#4A1249] transition-colors leading-snug">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-purple-50 flex items-center justify-between text-[11px] text-[#4A1249] font-bold">
                      <span className="flex items-center gap-1 group-hover:underline">
                        <span>Launch Action</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#C39A53] group-hover:translate-x-0.5 transition-transform" />
                      </span>
                      {item.shortcut && (
                        <span className="text-[10px] font-mono text-slate-400 border border-slate-200 px-1.5 py-0.2 rounded">
                          Key {item.shortcut}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {filteredActions.length === 0 && (
                <div className="p-8 text-center text-slate-400">
                  <p className="text-sm font-semibold">No quick actions found matching "{searchQuery}"</p>
                  <p className="text-xs text-slate-500 mt-1">Try searching for "registration", "transcript", or "fees"</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-purple-50/60 border-t border-purple-200 flex flex-wrap items-center justify-between text-[11px] text-slate-600">
              <div className="flex items-center gap-2">
                <Command className="w-3.5 h-3.5 text-[#4A1249]" />
                <span>Logged as: <strong className="text-slate-900">{currentUser.name}</strong> ({currentUser.role})</span>
              </div>
              <div className="flex items-center gap-2 font-mono text-[10px] text-slate-500">
                <span>Press <kbd className="bg-white px-1.5 py-0.5 rounded border border-slate-300">Esc</kbd> to exit</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
