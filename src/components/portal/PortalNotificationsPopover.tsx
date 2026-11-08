import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  Clock,
  BookOpen,
  ListTodo,
  AlertTriangle,
  CreditCard,
  Wrench,
  ShieldAlert,
  ArrowRight,
  X,
  Sparkles,
  Wifi,
} from 'lucide-react';
import { PortalNotification, NotificationCategory } from '../../types';
import { api } from '../../services/api';

interface PortalNotificationsPopoverProps {
  onNavigateTab: (tabId: string, subAction?: string) => void;
  onOpenPrintModal?: (docType: 'transcript' | 'financial_statement') => void;
}

export const PortalNotificationsPopover: React.FC<PortalNotificationsPopoverProps> = ({
  onNavigateTab,
  onOpenPrintModal,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<PortalNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filterCategory, setFilterCategory] = useState<NotificationCategory | 'all' | 'unread'>('all');
  const [isConnected, setIsConnected] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Fetch initial notifications
  const loadNotifications = async () => {
    try {
      const res = await api.getNotifications();
      if (res.success && res.notifications) {
        setNotifications(res.notifications);
        setUnreadCount(res.unreadCount);
      }
    } catch (err) {
      console.error('Failed to load portal notifications:', err);
    }
  };

  useEffect(() => {
    loadNotifications();

    // Setup Server-Sent Events (SSE) for Real-Time Notification Stream
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/notifications/stream');

      eventSource.addEventListener('connected', () => {
        setIsConnected(true);
      });

      eventSource.addEventListener('notification', (event) => {
        try {
          const newNotif: PortalNotification = JSON.parse(event.data);
          setNotifications((prev) => {
            // Avoid duplicates
            if (prev.some((n) => n.id === newNotif.id)) return prev;
            return [newNotif, ...prev];
          });
          setUnreadCount((c) => c + 1);
        } catch (e) {
          console.error('Failed to parse SSE notification:', e);
        }
      });

      eventSource.onerror = () => {
        setIsConnected(false);
      };
    } catch (err) {
      console.warn('SSE not supported or connection error:', err);
    }

    // Fallback poll every 30s to keep state fresh
    const pollInterval = setInterval(() => {
      loadNotifications();
    }, 30000);

    return () => {
      if (eventSource) eventSource.close();
      clearInterval(pollInterval);
    };
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const res = await api.markNotificationRead(id);
      if (res.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
        setUnreadCount(res.unreadCount);
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const res = await api.markAllNotificationsRead();
      if (res.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Failed to mark all notifications read:', err);
    }
  };

  const handleNotificationClick = async (notif: PortalNotification) => {
    if (!notif.read) {
      await handleMarkAsRead(notif.id);
    }
    setIsOpen(false);

    // Handle special print modal targets
    if (notif.targetAction === 'transcript' && onOpenPrintModal) {
      onOpenPrintModal('transcript');
      return;
    }
    if (notif.targetAction === 'fee_statement' && onOpenPrintModal) {
      onOpenPrintModal('financial_statement');
      return;
    }

    // Route to appropriate tab
    if (notif.targetTab) {
      onNavigateTab(notif.targetTab, notif.targetAction);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filterCategory === 'unread') return !n.read;
    if (filterCategory === 'all') return true;
    return n.category === filterCategory;
  });

  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case 'academic':
        return <BookOpen className="w-4 h-4 text-[#C39A53]" />;
      case 'task':
        return <ListTodo className="w-4 h-4 text-[#4A1249]" />;
      case 'finance':
        return <CreditCard className="w-4 h-4 text-emerald-600" />;
      case 'facility':
        return <Wrench className="w-4 h-4 text-amber-600" />;
      case 'alert':
      default:
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'border-l-4 border-l-rose-600 bg-rose-50/40';
      case 'high':
        return 'border-l-4 border-l-[#C39A53] bg-amber-50/40';
      case 'normal':
      default:
        return 'border-l-4 border-l-[#4A1249] bg-white';
    }
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const now = new Date();
      const past = new Date(isoString);
      const diffMs = now.getTime() - past.getTime();
      const diffMinutes = Math.floor(diffMs / 60000);
      if (diffMinutes < 1) return 'Just now';
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="relative" ref={popoverRef}>
      {/* Bell Trigger Button with Unread Badge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center p-2 rounded-lg bg-[#4A1249] hover:bg-[#661B69] border border-[#C39A53]/50 text-white transition-all cursor-pointer shadow-xs active:scale-95"
        aria-label="University Alerts & Notifications"
        title="Real-Time Academic Updates, Task Deadlines & Institutional Alerts"
      >
        <Bell className="w-4 h-4 text-[#C39A53]" />

        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 bg-[#C39A53] text-[#2A082C] font-black text-[10px] font-mono rounded-full flex items-center justify-center border-2 border-[#2A082C] shadow-sm animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-92 sm:w-[420px] max-w-[95vw] bg-white text-slate-800 rounded-xl shadow-2xl border-2 border-purple-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
          {/* Header Strip */}
          <div className="bg-[#4A1249] text-white p-3.5 flex items-center justify-between border-b border-[#C39A53]/40">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#C39A53]" />
              <h3 className="font-collegiate font-bold text-sm tracking-wide uppercase">
                Academic & Administrative Alerts
              </h3>
              {isConnected && (
                <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-300 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-500/40">
                  <Wifi className="w-2.5 h-2.5" />
                  <span>Live</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-[11px] text-[#C39A53] hover:text-[#DDB86C] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark All Read</span>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-purple-200 hover:text-white p-1 rounded cursor-pointer"
                aria-label="Close notifications"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 p-2 bg-purple-50/60 border-b border-purple-100 overflow-x-auto text-[11px] no-scrollbar">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-2.5 py-1 rounded-full font-bold whitespace-nowrap transition-colors cursor-pointer ${
                filterCategory === 'all'
                  ? 'bg-[#4A1249] text-white'
                  : 'bg-white text-slate-600 hover:text-[#4A1249] border border-slate-200'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilterCategory('unread')}
              className={`px-2.5 py-1 rounded-full font-bold whitespace-nowrap transition-colors cursor-pointer ${
                filterCategory === 'unread'
                  ? 'bg-[#C39A53] text-[#2A082C]'
                  : 'bg-white text-slate-600 hover:text-[#4A1249] border border-slate-200'
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setFilterCategory('academic')}
              className={`px-2.5 py-1 rounded-full font-bold whitespace-nowrap transition-colors cursor-pointer ${
                filterCategory === 'academic'
                  ? 'bg-[#4A1249] text-white'
                  : 'bg-white text-slate-600 hover:text-[#4A1249] border border-slate-200'
              }`}
            >
              Academic
            </button>
            <button
              onClick={() => setFilterCategory('task')}
              className={`px-2.5 py-1 rounded-full font-bold whitespace-nowrap transition-colors cursor-pointer ${
                filterCategory === 'task'
                  ? 'bg-[#4A1249] text-white'
                  : 'bg-white text-slate-600 hover:text-[#4A1249] border border-slate-200'
              }`}
            >
              Tasks & SLAs
            </button>
            <button
              onClick={() => setFilterCategory('alert')}
              className={`px-2.5 py-1 rounded-full font-bold whitespace-nowrap transition-colors cursor-pointer ${
                filterCategory === 'alert'
                  ? 'bg-[#4A1249] text-white'
                  : 'bg-white text-slate-600 hover:text-[#4A1249] border border-slate-200'
              }`}
            >
              Alerts
            </button>
          </div>

          {/* Notifications Scroll List */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <Check className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-xs font-semibold">No alerts in this view</p>
                <p className="text-[11px] text-slate-400 mt-0.5">All tasks, deadlines, and approvals are up to date.</p>
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3.5 hover:bg-purple-50/60 cursor-pointer transition-colors relative group ${getPriorityStyle(
                    notif.priority
                  )} ${!notif.read ? 'font-medium' : 'opacity-85'}`}
                >
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-start gap-2.5">
                      <div className="p-1.5 bg-white border border-slate-200 rounded-lg shadow-2xs shrink-0 mt-0.5">
                        {getCategoryIcon(notif.category)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-xs font-bold text-slate-900 leading-tight">
                            {notif.title}
                          </h4>
                          {notif.badge && (
                            <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-[#C39A53]/20 text-[#4A1249] border border-[#C39A53]/40">
                              {notif.badge}
                            </span>
                          )}
                          {!notif.read && (
                            <span className="w-2 h-2 rounded-full bg-[#C39A53] inline-block animate-pulse" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                          {notif.message}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{formatRelativeTime(notif.timestamp)}</span>
                          </span>
                          {notif.targetTab && (
                            <span className="text-[#4A1249] font-bold flex items-center gap-0.5 group-hover:underline">
                              <span>Open Workflow</span>
                              <ArrowRight className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {!notif.read && (
                      <button
                        onClick={(e) => handleMarkAsRead(notif.id, e)}
                        className="p-1 text-slate-400 hover:text-emerald-600 rounded cursor-pointer shrink-0"
                        title="Mark as read"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Strip */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
            <span className="font-semibold text-[#4A1249]">HIAU Live Campus Stream</span>
            <button
              onClick={() => {
                setIsOpen(false);
                onNavigateTab('tasks');
              }}
              className="text-[#4A1249] hover:text-[#661B69] font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>View All Tasks & SLAs</span>
              <ArrowRight className="w-3 h-3 text-[#C39A53]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
