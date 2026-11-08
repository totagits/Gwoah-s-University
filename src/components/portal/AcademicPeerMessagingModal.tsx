/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  MessageSquare,
  Users,
  Send,
  ThumbsUp,
  Plus,
  BookOpen,
  Pin,
  Tag,
  Sparkles,
  HelpCircle,
  Lightbulb,
  Share2,
  Clock,
  CheckCircle2,
  ShieldCheck,
  GraduationCap,
} from 'lucide-react';
import { CourseMaterial, PeerDiscussionThread, PeerDiscussionMessage, UserProfile } from '../../types';
import { api } from '../../services/api';
import { INITIAL_PEER_THREADS, INITIAL_PEER_MESSAGES } from '../../data/peerDiscussionData';

interface AcademicPeerMessagingModalProps {
  material: CourseMaterial;
  currentUser: UserProfile;
  isOpen: boolean;
  onClose: () => void;
}

export const AcademicPeerMessagingModal: React.FC<AcademicPeerMessagingModalProps> = ({
  material,
  currentUser,
  isOpen,
  onClose,
}) => {
  const [threads, setThreads] = useState<PeerDiscussionThread[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<PeerDiscussionMessage[]>([]);
  const [loadingThreads, setLoadingThreads] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // New message state
  const [newMessageText, setNewMessageText] = useState('');
  const [newMessageTag, setNewMessageTag] = useState<'question' | 'solution_tip' | 'resource' | 'announcement'>('question');
  const [sendingMessage, setSendingMessage] = useState(false);

  // New thread creation state
  const [isCreatingThread, setIsCreatingThread] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newThreadDescription, setNewThreadDescription] = useState('');
  const [newThreadInitialMsg, setNewThreadInitialMsg] = useState('');
  const [newThreadTag, setNewThreadTag] = useState<'question' | 'solution_tip' | 'resource' | 'announcement'>('question');
  const [creatingThread, setCreatingThread] = useState(false);

  // Load threads for this course material
  const loadThreads = async () => {
    setLoadingThreads(true);
    try {
      const res = await api.getPeerThreads({ materialId: material.id, courseCode: material.courseCode });
      if (res.threads && res.threads.length > 0) {
        setThreads(res.threads);
        if (!selectedThreadId) {
          setSelectedThreadId(res.threads[0].id);
        }
      } else {
        // Fallback to initial seeds matching material or general course
        const fallback = INITIAL_PEER_THREADS.filter(
          (t) => t.materialId === material.id || t.courseCode === material.courseCode
        );
        setThreads(fallback.length > 0 ? fallback : INITIAL_PEER_THREADS);
        if (fallback.length > 0 && !selectedThreadId) {
          setSelectedThreadId(fallback[0].id);
        } else if (!selectedThreadId && INITIAL_PEER_THREADS.length > 0) {
          setSelectedThreadId(INITIAL_PEER_THREADS[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load peer threads:', err);
      const fallback = INITIAL_PEER_THREADS.filter(
        (t) => t.materialId === material.id || t.courseCode === material.courseCode
      );
      setThreads(fallback.length > 0 ? fallback : INITIAL_PEER_THREADS);
      if (!selectedThreadId && INITIAL_PEER_THREADS.length > 0) {
        setSelectedThreadId(INITIAL_PEER_THREADS[0].id);
      }
    } finally {
      setLoadingThreads(false);
    }
  };

  // Load messages for currently selected thread
  const loadMessages = async (threadId: string) => {
    setLoadingMessages(true);
    try {
      const res = await api.getPeerMessages({ threadId });
      if (res.messages && res.messages.length > 0) {
        setMessages(res.messages);
      } else {
        const fallbackMsgs = INITIAL_PEER_MESSAGES.filter((m) => m.threadId === threadId);
        setMessages(fallbackMsgs);
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
      const fallbackMsgs = INITIAL_PEER_MESSAGES.filter((m) => m.threadId === threadId);
      setMessages(fallbackMsgs);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadThreads();
    }
  }, [isOpen, material.id]);

  useEffect(() => {
    if (selectedThreadId) {
      loadMessages(selectedThreadId);
    }
  }, [selectedThreadId]);

  if (!isOpen) return null;

  const currentThread = threads.find((t) => t.id === selectedThreadId);

  // Send new chat message in current thread
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() || !selectedThreadId) return;

    setSendingMessage(true);
    try {
      const res = await api.sendPeerMessage({
        threadId: selectedThreadId,
        materialId: material.id,
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorRole: currentUser.role === 'student' ? 'Peer Student' : 'Faculty Adviser',
        content: newMessageText.trim(),
        tag: newMessageTag,
      });

      if (res.success && res.message) {
        setMessages((prev) => [...prev, res.message]);
        setNewMessageText('');
        // Update thread count in sidebar
        setThreads((prev) =>
          prev.map((t) =>
            t.id === selectedThreadId
              ? {
                  ...t,
                  messagesCount: (t.messagesCount || 0) + 1,
                  lastActivity: new Date().toISOString(),
                }
              : t
          )
        );
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      // Fallback local append
      const localMsg: PeerDiscussionMessage = {
        id: `msg-local-${Date.now()}`,
        materialId: material.id,
        threadId: selectedThreadId,
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorRole: 'Peer Student',
        authorAvatar: currentUser.name.split(' ').map((n) => n[0]).join('').slice(0, 2),
        timestamp: new Date().toISOString(),
        content: newMessageText.trim(),
        tag: newMessageTag,
        likes: 0,
      };
      setMessages((prev) => [...prev, localMsg]);
      setNewMessageText('');
    } finally {
      setSendingMessage(false);
    }
  };

  // Create brand new collaborative thread
  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newThreadTitle.trim()) return;

    setCreatingThread(true);
    try {
      const res = await api.createPeerThread({
        materialId: material.id,
        courseCode: material.courseCode,
        materialTitle: material.title,
        title: newThreadTitle.trim(),
        description: newThreadDescription.trim(),
        creatorId: currentUser.id,
        creatorName: currentUser.name,
        initialMessage: newThreadInitialMsg.trim() || undefined,
        tag: newThreadTag,
      });

      if (res.success && res.thread) {
        setThreads((prev) => [res.thread, ...prev]);
        setSelectedThreadId(res.thread.id);
        setIsCreatingThread(false);
        setNewThreadTitle('');
        setNewThreadDescription('');
        setNewThreadInitialMsg('');
        loadMessages(res.thread.id);
      }
    } catch (err) {
      console.error('Failed to create thread:', err);
      // Fallback local
      const localThread: PeerDiscussionThread = {
        id: `thread-local-${Date.now()}`,
        materialId: material.id,
        courseCode: material.courseCode,
        materialTitle: material.title,
        title: newThreadTitle.trim(),
        description: newThreadDescription.trim(),
        createdAt: new Date().toISOString(),
        creatorId: currentUser.id,
        creatorName: currentUser.name,
        messagesCount: 1,
        participants: [currentUser.name],
        lastActivity: new Date().toISOString(),
      };
      setThreads((prev) => [localThread, ...prev]);
      setSelectedThreadId(localThread.id);
      setIsCreatingThread(false);
    } finally {
      setCreatingThread(false);
    }
  };

  // Like / Upvote peer message
  const handleLikeMessage = async (msgId: string) => {
    try {
      const res = await api.likePeerMessage(msgId, currentUser.id);
      if (res.success) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === msgId ? { ...m, likes: res.likes } : m
          )
        );
      }
    } catch {
      // Local optimistic toggle
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId ? { ...m, likes: (m.likes || 0) + 1 } : m
        )
      );
    }
  };

  const getTagBadge = (tag?: string) => {
    switch (tag) {
      case 'question':
        return (
          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
            <HelpCircle className="w-3 h-3" />
            <span>Question</span>
          </span>
        );
      case 'solution_tip':
        return (
          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
            <Lightbulb className="w-3 h-3" />
            <span>Solution Tip</span>
          </span>
        );
      case 'resource':
        return (
          <span className="bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
            <Share2 className="w-3 h-3" />
            <span>Study Resource</span>
          </span>
        );
      case 'announcement':
        return (
          <span className="bg-[#4A1249] text-[#C39A53] border border-[#C39A53]/50 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>Study Group Invite</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 overflow-hidden">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-5xl h-[90vh] max-h-[820px] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#2A082C] via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#4A1249] border border-[#C39A53]/50 flex items-center justify-center text-[#C39A53] shadow-md">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#C39A53] bg-amber-400/10 px-2 py-0.5 rounded border border-[#C39A53]/30">
                  {material.courseCode}
                </span>
                <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
                  Academic Peer Collaboration & Study Threads
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white leading-tight truncate max-w-xl mt-0.5">
                {material.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCreatingThread(!isCreatingThread)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#C39A53] hover:bg-[#d4a961] text-slate-950 text-xs font-bold rounded-xl transition-all cursor-pointer shadow"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isCreatingThread ? 'View Threads' : 'New Study Thread'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Left Thread Selector + Right Discussion Area */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* LEFT SIDEBAR: Threads list */}
          <div className="w-full md:w-80 border-r border-slate-800 bg-slate-950 flex flex-col shrink-0">
            <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-[#C39A53]" />
                <span>Discussion Topics ({threads.length})</span>
              </span>
              <button
                onClick={() => setIsCreatingThread(!isCreatingThread)}
                className="text-[11px] font-bold text-[#C39A53] hover:underline cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>{isCreatingThread ? 'Cancel' : 'New Topic'}</span>
              </button>
            </div>

            {/* List of Threads */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              {threads.map((th) => {
                const isSelected = th.id === selectedThreadId && !isCreatingThread;
                return (
                  <button
                    key={th.id}
                    onClick={() => {
                      setSelectedThreadId(th.id);
                      setIsCreatingThread(false);
                    }}
                    className={`w-full text-left p-3 rounded-2xl transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-[#4A1249]/30 border-[#C39A53]/50 text-white shadow-md'
                        : 'bg-slate-900/40 border-slate-800/80 text-slate-300 hover:bg-slate-850 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-mono font-bold text-[#C39A53]">
                        {th.courseCode}
                      </span>
                      {th.isPinned && (
                        <span className="text-[9px] bg-amber-400/20 text-amber-300 border border-amber-400/30 px-1.5 py-0.2 rounded font-bold flex items-center gap-0.5">
                          <Pin className="w-2.5 h-2.5" />
                          <span>Pinned</span>
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs font-bold line-clamp-2 leading-snug">
                      {th.title}
                    </h4>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pt-2 border-t border-slate-800/60">
                      <span>{th.creatorName}</span>
                      <span className="flex items-center gap-1 font-mono">
                        <MessageSquare className="w-3 h-3 text-slate-500" />
                        <span>{th.messagesCount || 0}</span>
                      </span>
                    </div>
                  </button>
                );
              })}

              {threads.length === 0 && (
                <div className="text-center py-12 text-slate-500 text-xs italic">
                  No discussion threads yet for this material. Be the first to start one!
                </div>
              )}
            </div>

            {/* Enrolled Peer Study Group Members */}
            <div className="p-3 border-t border-slate-800 bg-slate-900/40">
              <div className="text-[10px] uppercase font-bold text-slate-400 mb-2 flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 text-[#C39A53]" />
                <span>Enrolled Study Group Peers</span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {['Emmanuel K.', 'Kumba S.', 'Blessing W.', 'Tamba S.', 'Comfort G.'].map((name, i) => (
                  <span
                    key={i}
                    className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700 flex items-center gap-1"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>{name}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT MAIN PANEL: Active Discussion Thread OR Thread Creator */}
          <div className="flex-1 flex flex-col bg-slate-900 overflow-hidden">
            {isCreatingThread ? (
              /* CREATE THREAD FORM */
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="pb-3 border-b border-slate-800">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#C39A53]" />
                    <span>Start New Academic Peer Discussion Topic</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Pose an assignment question, start a study circle, or share problem-solving tips with classmates enrolled in {material.courseCode}.
                  </p>
                </div>

                <form onSubmit={handleCreateThread} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Topic Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Assignment 2: Handling Left-Right (LR) Double Rotations"
                      value={newThreadTitle}
                      onChange={(e) => setNewThreadTitle(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-[#C39A53]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Category Tag</label>
                      <select
                        value={newThreadTag}
                        onChange={(e) => setNewThreadTag(e.target.value as any)}
                        className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-[#C39A53]"
                      >
                        <option value="question">Question on Assignment / Concept</option>
                        <option value="solution_tip">Solution Tip / Code Approach</option>
                        <option value="resource">Study Resource / Reference Notes</option>
                        <option value="announcement">Study Group Invite / Exam Prep</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Course Material Reference</label>
                      <input
                        type="text"
                        disabled
                        value={`${material.courseCode} — ${material.title}`}
                        className="w-full px-3 py-2.5 bg-slate-800/60 border border-slate-800 rounded-xl text-slate-400 truncate cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Brief Discussion Context</label>
                    <input
                      type="text"
                      placeholder="e.g. Edge case discussions regarding AVL height recomputation after recursive deletion"
                      value={newThreadDescription}
                      onChange={(e) => setNewThreadDescription(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-[#C39A53]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Opening Message / Question *</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="State what you are working on, describe where you are stuck, or share your solution walkthrough..."
                      value={newThreadInitialMsg}
                      onChange={(e) => setNewThreadInitialMsg(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-[#C39A53]"
                    />
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsCreatingThread(false)}
                      className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={creatingThread || !newThreadTitle.trim()}
                      className="px-5 py-2.5 bg-[#C39A53] hover:bg-[#d4a961] text-slate-950 font-bold rounded-xl shadow cursor-pointer disabled:opacity-50"
                    >
                      {creatingThread ? 'Creating...' : 'Publish Study Topic'}
                    </button>
                  </div>
                </form>
              </div>
            ) : currentThread ? (
              /* ACTIVE THREAD VIEW & MESSAGE STREAM */
              <>
                {/* Thread Header Banner */}
                <div className="p-4 bg-slate-850/80 border-b border-slate-800 flex items-start justify-between gap-3 shrink-0">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#4A1249] text-[#C39A53] border border-[#C39A53]/40">
                        {currentThread.courseCode} Group Chat
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Initiated by <strong className="text-slate-200">{currentThread.creatorName}</strong>
                      </span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
                      {currentThread.title}
                    </h3>
                    {currentThread.description && (
                      <p className="text-xs text-slate-400 mt-1">
                        {currentThread.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700 flex items-center gap-1">
                      <Users className="w-3 h-3 text-emerald-400" />
                      <span>{currentThread.participants?.length || 3} Active</span>
                    </span>
                  </div>
                </div>

                {/* Messages Stream */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
                  {messages.map((msg) => {
                    const isCurrentUser = msg.authorId === currentUser.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-3 text-xs ${isCurrentUser ? 'flex-row-reverse' : ''}`}
                      >
                        {/* Avatar */}
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 border ${
                            isCurrentUser
                              ? 'bg-[#C39A53] text-slate-950 border-[#C39A53]'
                              : 'bg-slate-800 text-[#C39A53] border-slate-700'
                          }`}
                        >
                          {msg.authorAvatar || msg.authorName.charAt(0)}
                        </div>

                        {/* Message Bubble */}
                        <div
                          className={`max-w-[85%] sm:max-w-xl rounded-2xl p-3.5 space-y-1.5 shadow ${
                            isCurrentUser
                              ? 'bg-[#4A1249] border border-[#C39A53]/50 text-white'
                              : 'bg-slate-850 border border-slate-800 text-slate-200'
                          }`}
                        >
                          {/* Sender Info & Tag */}
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs text-white">
                                {msg.authorName}
                              </span>
                              <span className="text-[10px] text-slate-400 font-normal">
                                ({msg.authorRole})
                              </span>
                            </div>
                            {getTagBadge(msg.tag)}
                          </div>

                          {/* Message Content */}
                          <p className="text-xs leading-relaxed whitespace-pre-wrap">
                            {msg.content}
                          </p>

                          {/* Timestamp & Helpful / Like Reaction */}
                          <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-500" />
                              <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </span>

                            <button
                              onClick={() => handleLikeMessage(msg.id)}
                              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-[#C39A53] transition-colors cursor-pointer border border-slate-700"
                              title="Upvote / Helpful peer contribution"
                            >
                              <ThumbsUp className="w-3 h-3 text-[#C39A53]" />
                              <span className="font-bold text-[#C39A53]">{msg.likes || 0}</span>
                              <span className="hidden sm:inline">Helpful</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {messages.length === 0 && (
                    <div className="text-center py-16 text-slate-500 text-xs italic">
                      No messages in this study thread yet. Post a question to your classmates!
                    </div>
                  )}
                </div>

                {/* Message Input Form */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 space-y-2 shrink-0"
                >
                  {/* Tag quick selector */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[11px]">
                    <span className="text-slate-400 font-semibold shrink-0">Tag as:</span>
                    {(['question', 'solution_tip', 'resource', 'announcement'] as const).map((tagOption) => (
                      <button
                        key={tagOption}
                        type="button"
                        onClick={() => setNewMessageTag(tagOption)}
                        className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap text-[10px] ${
                          newMessageTag === tagOption
                            ? 'bg-[#4A1249] text-[#C39A53] border border-[#C39A53]/60'
                            : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        {tagOption === 'question' && '❓ Question'}
                        {tagOption === 'solution_tip' && '💡 Solution Tip'}
                        {tagOption === 'resource' && '🔗 Study Resource'}
                        {tagOption === 'announcement' && '📢 Group Invite'}
                      </button>
                    ))}
                  </div>

                  {/* Textarea & Send button */}
                  <div className="flex items-end gap-2">
                    <textarea
                      rows={2}
                      required
                      placeholder={`Discuss ${material.courseCode} assignment with classmates...`}
                      value={newMessageText}
                      onChange={(e) => setNewMessageText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                      className="flex-1 px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-[#C39A53] resize-none"
                    />

                    <button
                      type="submit"
                      disabled={sendingMessage || !newMessageText.trim()}
                      className="px-4 py-2.5 bg-[#C39A53] hover:bg-[#d4a961] text-slate-950 font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow disabled:opacity-50 shrink-0 text-xs"
                      aria-label="Send message to peer thread"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Send</span>
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-500">
                <MessageSquare className="w-12 h-12 text-slate-700 mb-3" />
                <p className="text-sm font-bold text-slate-300">Select a study thread from the left</p>
                <p className="text-xs text-slate-500 mt-1">or create a new topic to discuss assignments with fellow students.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
