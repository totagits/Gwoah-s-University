/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  ShieldCheck,
  FileText,
  Search,
  Download,
  Eye,
  Check,
  Copy,
  Printer,
  Sparkles,
  Bookmark,
  Layers,
  Scale,
  Landmark,
  FileSpreadsheet,
  CheckCircle2,
  ExternalLink,
  Info,
  Clock,
  Filter,
  X,
  FileCode,
  GraduationCap,
  HardDrive,
  Wifi,
} from 'lucide-react';
import { LibraryResource, ResourceCategory } from '../../types';
import { INITIAL_LIBRARY_RESOURCES } from '../../data/libraryResourcesData';
import {
  filterLibraryResources,
  computeLibraryStats,
  formatResourceCitation,
  generateResourceDownload,
} from '../../utils/resourceLibrary';
import { downloadCSV } from '../../utils/csvExport';

interface SharedResourceLibraryProps {
  initialCategory?: ResourceCategory | 'all';
  initialSearch?: string;
  onNavigateToCourse?: (courseCode: string) => void;
}

export const SharedResourceLibrary: React.FC<SharedResourceLibraryProps> = ({
  initialCategory = 'all',
  initialSearch = '',
  onNavigateToCourse,
}) => {
  const [resources, setResources] = useState<LibraryResource[]>(INITIAL_LIBRARY_RESOURCES);
  const [loading, setLoading] = useState(false);

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<ResourceCategory | 'all'>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('all');
  const [pinnedOnly, setPinnedOnly] = useState<boolean>(false);
  const [lowBandwidthOnly, setLowBandwidthOnly] = useState<boolean>(false);

  // Active Document Reader Modal
  const [activeResource, setActiveResource] = useState<LibraryResource | null>(null);

  // Feedback notifications
  const [notification, setNotification] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fetch resources from API (with fallback to INITIAL_LIBRARY_RESOURCES)
  useEffect(() => {
    let isMounted = true;
    const fetchResources = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/resources');
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.resources && data.resources.length > 0) {
            setResources(data.resources);
          }
        }
      } catch (err) {
        console.warn('Using local resource seed fallback:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchResources();
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute aggregate stats
  const stats = useMemo(() => computeLibraryStats(resources), [resources]);

  // Unique subcategories & courses for dropdown filters
  const subcategories = useMemo(() => {
    const set = new Set<string>();
    resources.forEach((r) => {
      if (selectedCategory === 'all' || r.category === selectedCategory) {
        set.add(r.subcategory);
      }
    });
    return Array.from(set).sort();
  }, [resources, selectedCategory]);

  const coursesWithMaterials = useMemo(() => {
    const set = new Set<string>();
    resources.forEach((r) => {
      if (r.courseCode) set.add(r.courseCode);
    });
    return Array.from(set).sort();
  }, [resources]);

  // Filtered resources
  const filteredResources = useMemo(() => {
    return filterLibraryResources(resources, {
      category: selectedCategory,
      subcategory: selectedSubcategory,
      courseCode: selectedCourseFilter,
      search: searchQuery,
      pinnedOnly,
      maxFileSizeKB: lowBandwidthOnly ? 500 : undefined,
    });
  }, [
    resources,
    selectedCategory,
    selectedSubcategory,
    selectedCourseFilter,
    searchQuery,
    pinnedOnly,
    lowBandwidthOnly,
  ]);

  // Download handler
  const handleDownload = (resource: LibraryResource) => {
    const { filename, content } = generateResourceDownload(resource);
    downloadCSV(content, filename);
    showNotification(`Downloaded "${resource.title}" (${filename}) for offline study.`);
  };

  // Copy citation handler
  const handleCopyCitation = (resource: LibraryResource) => {
    const citation = formatResourceCitation(resource);
    navigator.clipboard.writeText(citation);
    setCopiedId(resource.id);
    showNotification(`Academic reference copied to clipboard.`);
    setTimeout(() => setCopiedId(null), 3000);
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 5000);
  };

  // Helper for category badge visual
  const getCategoryTheme = (category: ResourceCategory) => {
    switch (category) {
      case 'course_material':
        return {
          label: 'Digitized Course Material',
          bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
          dot: 'bg-cyan-400',
          icon: BookOpen,
        };
      case 'nche_guideline':
        return {
          label: 'NCHE Statutory Guideline',
          bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          dot: 'bg-amber-400',
          icon: Scale,
        };
      case 'institutional_handbook':
        return {
          label: 'Institutional Handbook',
          bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          dot: 'bg-emerald-400',
          icon: Landmark,
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/30">
                <BookOpen className="w-5 h-5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Shared Resource Library
              </h2>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>NCHE Accredited Repository</span>
              </span>
              <span className="bg-slate-800 text-slate-300 text-xs px-2.5 py-0.5 rounded-full border border-slate-700 font-mono">
                AY 2026/2027
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-3xl">
              Centralized digital repository providing scholars with verified access to digitized course syllabi, faculty lecture packets, National Commission on Higher Education (NCHE) regulatory standards, and official student conduct handbooks.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-850 border border-slate-700/80 rounded-xl text-xs text-slate-300">
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              <span>Campus Offline Mirror: </span>
              <strong className="text-emerald-400">Synced</strong>
            </div>
          </div>
        </div>

        {/* Aggregate Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80">
          <div
            onClick={() => setSelectedCategory('all')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-slate-800 border-amber-500/50 shadow-md'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400">Total Digitized</span>
              <Layers className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-white mt-1 font-mono">{stats.total}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Documents in repository</div>
          </div>

          <div
            onClick={() => setSelectedCategory('course_material')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              selectedCategory === 'course_material'
                ? 'bg-slate-800 border-cyan-500/50 shadow-md'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-cyan-400">Course Materials</span>
              <BookOpen className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-bold text-cyan-300 mt-1 font-mono">{stats.courseMaterials}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Syllabi, lectures & lab guides</div>
          </div>

          <div
            onClick={() => setSelectedCategory('nche_guideline')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              selectedCategory === 'nche_guideline'
                ? 'bg-slate-800 border-amber-500/50 shadow-md'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-amber-400">NCHE Guidelines</span>
              <Scale className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-amber-300 mt-1 font-mono">{stats.ncheGuidelines}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Statutory accreditation standards</div>
          </div>

          <div
            onClick={() => setSelectedCategory('institutional_handbook')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              selectedCategory === 'institutional_handbook'
                ? 'bg-slate-800 border-emerald-500/50 shadow-md'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-emerald-400">Handbooks & Charters</span>
              <Landmark className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-300 mt-1 font-mono">{stats.institutionalHandbooks}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Student conduct & bursar policies</div>
          </div>
        </div>
      </div>

      {/* Toast Notification Banner */}
      {notification && (
        <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span className="font-semibold">{notification}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-emerald-400 hover:text-white p-1 rounded-md"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
        {/* Top Search & Primary Category Tabs */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedSubcategory('all');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-850'
              }`}
            >
              All Documents ({stats.total})
            </button>
            <button
              onClick={() => {
                setSelectedCategory('course_material');
                setSelectedSubcategory('all');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedCategory === 'course_material'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-850'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Course Materials ({stats.courseMaterials})</span>
            </button>
            <button
              onClick={() => {
                setSelectedCategory('nche_guideline');
                setSelectedSubcategory('all');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedCategory === 'nche_guideline'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-850'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>NCHE Guidelines ({stats.ncheGuidelines})</span>
            </button>
            <button
              onClick={() => {
                setSelectedCategory('institutional_handbook');
                setSelectedSubcategory('all');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedCategory === 'institutional_handbook'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-850'
              }`}
            >
              <Landmark className="w-3.5 h-3.5" />
              <span>Handbooks & Charters ({stats.institutionalHandbooks})</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topics, course code, NCHE act, author, or tags..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Secondary Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/60 text-xs">
          {/* Quick Filter Tags */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider">Quick Filters:</span>
            
            <button
              onClick={() => setPinnedOnly(!pinnedOnly)}
              className={`px-2.5 py-1 rounded-lg border transition-colors cursor-pointer flex items-center gap-1 ${
                pinnedOnly
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              <Bookmark className="w-3 h-3" />
              <span>Pinned Essentials ({stats.pinnedCount})</span>
            </button>

            <button
              onClick={() => setLowBandwidthOnly(!lowBandwidthOnly)}
              className={`px-2.5 py-1 rounded-lg border transition-colors cursor-pointer flex items-center gap-1 ${
                lowBandwidthOnly
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
              title="Filter documents under 500 KB for slow mobile connections"
            >
              <HardDrive className="w-3 h-3" />
              <span>Low-Bandwidth (&lt;500 KB)</span>
            </button>

            {coursesWithMaterials.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCourseFilter(selectedCourseFilter === c ? 'all' : c)}
                className={`px-2.5 py-1 rounded-lg border font-mono transition-colors cursor-pointer ${
                  selectedCourseFilter === c
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Subcategory Dropdown */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-slate-400 text-xs">Subcategory:</span>
            <select
              value={selectedSubcategory}
              onChange={(e) => setSelectedSubcategory(e.target.value)}
              className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
            >
              <option value="all">All Subcategories</option>
              {subcategories.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>

            {(selectedCategory !== 'all' ||
              selectedSubcategory !== 'all' ||
              selectedCourseFilter !== 'all' ||
              searchQuery ||
              pinnedOnly ||
              lowBandwidthOnly) && (
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedSubcategory('all');
                  setSelectedCourseFilter('all');
                  setSearchQuery('');
                  setPinnedOnly(false);
                  setLowBandwidthOnly(false);
                }}
                className="text-[11px] text-amber-400 hover:text-amber-300 underline cursor-pointer ml-1"
              >
                Reset filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Pinned Essentials Carousel / Highlight Section (when no search query or filter active) */}
      {!searchQuery && selectedCategory === 'all' && !pinnedOnly && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-amber-400" />
              <span>Core Institutional Foundations (Essential Student Reading)</span>
            </h3>
            <span className="text-slate-400 text-[11px]">Recommended for Semester I 2026/2027</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {resources
              .filter((r) => r.isPinned)
              .slice(0, 3)
              .map((pinned) => {
                const theme = getCategoryTheme(pinned.category);
                const CategoryIcon = theme.icon;

                return (
                  <div
                    key={pinned.id}
                    className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-5 transition-all shadow-md flex flex-col justify-between group"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${theme.bg}`}
                        >
                          <CategoryIcon className="w-3 h-3" />
                          <span>{pinned.subcategory}</span>
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {pinned.fileFormat} • {pinned.fileSizeKB} KB
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-2">
                        {pinned.title}
                      </h4>

                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {pinned.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-mono">
                        {pinned.courseCode || pinned.version}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setActiveResource(pinned)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                          title="Read Document"
                        >
                          <Eye className="w-3.5 h-3.5 text-amber-400" />
                          <span>Read</span>
                        </button>
                        <button
                          onClick={() => handleDownload(pinned)}
                          className="p-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg cursor-pointer transition-colors"
                          title="Download document for offline reading"
                          aria-label={`Download ${pinned.title}`}
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Main Results Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs px-1">
          <span className="text-slate-400">
            Showing <strong className="text-white font-mono">{filteredResources.length}</strong> of{' '}
            <strong className="text-slate-300 font-mono">{resources.length}</strong> repository resources
          </span>
          {lowBandwidthOnly && (
            <span className="text-emerald-400 text-[11px] flex items-center gap-1">
              <HardDrive className="w-3.5 h-3.5" />
              <span>Optimized for low-bandwidth cellular connections</span>
            </span>
          )}
        </div>

        {filteredResources.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
            <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
            <h4 className="text-base font-bold text-slate-300">No matching library resources found</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              We couldn't find any digitized materials matching your filter criteria. Try clearing search keywords or resetting category filters.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedSubcategory('all');
                setSelectedCourseFilter('all');
                setSearchQuery('');
                setPinnedOnly(false);
                setLowBandwidthOnly(false);
              }}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl cursor-pointer transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredResources.map((res) => {
              const theme = getCategoryTheme(res.category);
              const CategoryIcon = theme.icon;

              return (
                <div
                  key={res.id}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all"
                >
                  <div className="space-y-3">
                    {/* Header line with badge and metadata */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${theme.bg}`}
                      >
                        <CategoryIcon className="w-3 h-3" />
                        <span>{res.subcategory}</span>
                      </span>

                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        {res.courseCode && (
                          <span className="font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
                            {res.courseCode}
                          </span>
                        )}
                        <span className="font-mono">{res.fileFormat} • {res.fileSizeKB} KB</span>
                      </div>
                    </div>

                    {/* Title */}
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-white tracking-tight leading-snug">
                        {res.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                        <span>{res.authorOrAuthority}</span>
                        <span>•</span>
                        <span>{res.publishedDate}</span>
                        {res.version && (
                          <>
                            <span>•</span>
                            <span className="font-mono text-slate-500">{res.version}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Statutory reference if any */}
                    {res.statutoryReference && (
                      <div className="bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] text-amber-300/90 flex items-center gap-1.5">
                        <Scale className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                        <span className="truncate">Reference: <strong>{res.statutoryReference}</strong></span>
                      </div>
                    )}

                    {/* Description */}
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {res.description}
                    </p>

                    {/* Key Highlights list */}
                    {res.keyHighlights && res.keyHighlights.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <div className="text-[11px] font-semibold text-slate-400">Key Provisions & Contents:</div>
                        <ul className="space-y-1">
                          {res.keyHighlights.map((hl, i) => (
                            <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              <span className="leading-tight">{hl}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Tags */}
                    {res.tags && res.tags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {res.tags.map((tag) => (
                          <span
                            key={tag}
                            onClick={() => setSearchQuery(tag)}
                            className="text-[10px] text-slate-400 hover:text-white bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800 cursor-pointer transition-colors"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Action Footer */}
                  <div className="mt-5 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
                    <button
                      onClick={() => handleCopyCitation(res)}
                      className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                      title="Copy official academic citation"
                    >
                      {copiedId === res.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Citation Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span>Copy Citation</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActiveResource(res)}
                        className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors border border-slate-700"
                      >
                        <Eye className="w-3.5 h-3.5 text-amber-400" />
                        <span>Read Online</span>
                      </button>

                      <button
                        onClick={() => handleDownload(res)}
                        className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md hover:shadow-amber-500/20 cursor-pointer transition-all"
                        aria-label={`Download ${res.title}`}
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* IN-APP DOCUMENT READER MODAL */}
      {/* ========================================================= */}
      {activeResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl text-slate-100 animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-start justify-between p-5 sm:p-6 border-b border-slate-800 bg-slate-950/80 rounded-t-2xl">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      getCategoryTheme(activeResource.category).bg
                    }`}
                  >
                    {activeResource.subcategory}
                  </span>
                  {activeResource.courseCode && (
                    <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/80">
                      {activeResource.courseCode}
                    </span>
                  )}
                  <span className="text-xs text-slate-400 font-mono">
                    {activeResource.fileFormat} • {activeResource.fileSizeKB} KB
                  </span>
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded-full font-semibold">
                    Senate Verified Copy
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  {activeResource.title}
                </h3>

                <div className="text-xs text-slate-400 flex flex-wrap items-center gap-2">
                  <span>Author / Authority: <strong className="text-slate-200">{activeResource.authorOrAuthority}</strong></span>
                  <span>•</span>
                  <span>Academic Year: <strong className="text-slate-200">{activeResource.academicYear}</strong></span>
                  <span>•</span>
                  <span>Version: <strong className="text-slate-200">{activeResource.version}</strong></span>
                </div>
              </div>

              <button
                onClick={() => setActiveResource(null)}
                className="text-slate-400 hover:text-white p-2 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer shrink-0"
                aria-label="Close document reader"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Reader View */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs text-slate-300">
              {/* Statutory callout if any */}
              {activeResource.statutoryReference && (
                <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 flex items-start gap-2.5">
                  <Scale className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                  <div>
                    <div className="font-bold">Official Statutory / Curricular Mandate:</div>
                    <div className="text-[11px] text-amber-200/90 mt-0.5">
                      {activeResource.statutoryReference} — Enforced under the National Commission on Higher Education Act of 1989 and University Senate Bylaws.
                    </div>
                  </div>
                </div>
              )}

              {/* Executive Summary */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5">
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <Info className="w-4 h-4 text-cyan-400" />
                  <span>Executive Summary & Scope</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {activeResource.description}
                </p>
              </div>

              {/* Key Provisions */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Core Highlights & Requirements</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {activeResource.keyHighlights.map((hl, i) => (
                    <div key={i} className="flex items-start gap-2 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-amber-400 font-bold font-mono">0{i + 1}.</span>
                      <span className="text-slate-300 leading-tight">{hl}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Full Digitized Document Content */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-white flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-400" />
                    <span>Digitized Document Specification & Full Text Excerpt</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">Intranet Mirror: LR-GU-LIB-084</span>
                </div>
                <div className="bg-slate-950 p-4 sm:p-5 rounded-xl border border-slate-800 font-mono text-xs text-slate-200 leading-relaxed whitespace-pre-line max-h-96 overflow-y-auto select-text">
                  {activeResource.contentSummary}
                </div>
              </div>

              {/* Academic Citation Box */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-[11px] font-bold text-slate-400">Official Citation (APA 7th Format):</div>
                  <div className="text-[11px] text-slate-300 italic">
                    {formatResourceCitation(activeResource)}
                  </div>
                </div>
                <button
                  onClick={() => handleCopyCitation(activeResource)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  {copiedId === activeResource.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copy Citation</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5 border-t border-slate-800 bg-slate-950/80 rounded-b-2xl">
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Republic of Liberia • National Commission on Higher Education Certified</span>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Printer className="w-4 h-4 text-slate-400" />
                  <span>Print Document</span>
                </button>

                <button
                  onClick={() => handleDownload(activeResource)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md hover:shadow-amber-500/20 cursor-pointer transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Document (.md)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
