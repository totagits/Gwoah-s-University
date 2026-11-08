import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  BookOpen,
  Calendar,
  Library,
  Download,
  ExternalLink,
  Clock,
  CheckCircle2,
  FileText,
  Tag,
  Filter,
  X,
  Sparkles,
} from 'lucide-react';
import { CourseMaterial, LibraryResource, AcademicCalendarEvent } from '../../types';
import { api } from '../../services/api';
import { INITIAL_LIBRARY_RESOURCES } from '../../data/libraryResourcesData';

interface StudentUnifiedSearchFilterProps {
  enrolledCourseCodes: string[];
  onOpenResource?: (resource: LibraryResource) => void;
  onOpenMaterial?: (material: CourseMaterial) => void;
  onNavigateToCalendar?: () => void;
}

interface UnifiedSearchResult {
  id: string;
  type: 'material' | 'library' | 'exam';
  title: string;
  subtitle: string;
  description: string;
  courseCode?: string;
  dateOrSize: string;
  badge: string;
  badgeColor: string;
  actionLabel: string;
  rawItem: CourseMaterial | LibraryResource | AcademicCalendarEvent;
}

export const StudentUnifiedSearchFilter: React.FC<StudentUnifiedSearchFilterProps> = ({
  enrolledCourseCodes,
  onOpenResource,
  onOpenMaterial,
  onNavigateToCalendar,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'material' | 'library' | 'exam'>('all');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');

  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [resources, setResources] = useState<LibraryResource[]>(INITIAL_LIBRARY_RESOURCES);
  const [calendarEvents, setCalendarEvents] = useState<AcademicCalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);

  // Load all data streams
  useEffect(() => {
    const loadUnifiedData = async () => {
      setLoading(true);
      try {
        const [matRes, calRes] = await Promise.all([
          api.getMaterials().catch(() => ({ materials: [] })),
          api.getCalendarEvents().catch(() => ({ events: [] })),
        ]);
        if (matRes?.materials) setMaterials(matRes.materials);
        if (calRes?.events) setCalendarEvents(calRes.events);
      } catch (err) {
        console.error('Error loading unified search data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadUnifiedData();
  }, []);

  // Normalize results into unified shape
  const allResults = useMemo<UnifiedSearchResult[]>(() => {
    const list: UnifiedSearchResult[] = [];

    // 1. Digital Course Materials
    materials.forEach((m) => {
      list.push({
        id: `mat-${m.id}`,
        type: 'material',
        title: m.title,
        subtitle: `${m.courseCode} • Week ${m.weekNumber} (${m.type.replace('_', ' ')})`,
        description: m.description,
        courseCode: m.courseCode,
        dateOrSize: `${m.fileSizeKB} KB • ${m.uploadedDate}`,
        badge: 'Course Material',
        badgeColor: 'bg-purple-100 text-[#4A1249] border-purple-300',
        actionLabel: 'Download Notes',
        rawItem: m,
      });
    });

    // 2. Shared Library Resources
    resources.forEach((r) => {
      list.push({
        id: `lib-${r.id}`,
        type: 'library',
        title: r.title,
        subtitle: `${r.subcategory} • Author: ${r.authorOrAuthority}`,
        description: r.description,
        courseCode: r.courseCode,
        dateOrSize: `${r.fileFormat} • ${r.fileSizeKB} KB`,
        badge: r.category === 'nche_guideline' ? 'NCHE Policy' : 'Library Resource',
        badgeColor: 'bg-[#C39A53]/20 text-[#2A082C] border-[#C39A53]/50',
        actionLabel: 'Read Document',
        rawItem: r,
      });
    });

    // 3. Upcoming Exam Dates & Deadlines
    calendarEvents.forEach((e) => {
      list.push({
        id: `cal-${e.id}`,
        type: 'exam',
        title: e.title,
        subtitle: `${e.eventType.toUpperCase()} • ${e.location || 'HIAU Main Quad'}`,
        description: e.description,
        courseCode: e.courseCode,
        dateOrSize: `Date: ${new Date(e.startDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}`,
        badge: e.eventType === 'exam' ? 'Examination' : 'Academic Deadline',
        badgeColor: e.eventType === 'exam' ? 'bg-rose-100 text-rose-800 border-rose-300' : 'bg-amber-100 text-amber-900 border-amber-300',
        actionLabel: 'View Exam Info',
        rawItem: e,
      });
    });

    return list;
  }, [materials, resources, calendarEvents]);

  // Live filter results based on query, type, and course
  const filteredResults = useMemo(() => {
    return allResults.filter((item) => {
      // Type match
      if (selectedType !== 'all' && item.type !== selectedType) {
        return false;
      }

      // Course match
      if (selectedCourse !== 'all') {
        if (!item.courseCode || item.courseCode.toLowerCase() !== selectedCourse.toLowerCase()) {
          return false;
        }
      }

      // Query match across title, subtitle, description, and courseCode
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matches =
          item.title.toLowerCase().includes(q) ||
          item.subtitle.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          (item.courseCode && item.courseCode.toLowerCase().includes(q));
        if (!matches) return false;
      }

      return true;
    });
  }, [allResults, selectedType, selectedCourse, searchQuery]);

  const handleAction = (item: UnifiedSearchResult) => {
    if (item.type === 'library' && onOpenResource) {
      onOpenResource(item.rawItem as LibraryResource);
    } else if (item.type === 'material') {
      const mat = item.rawItem as CourseMaterial;
      if (onOpenMaterial) onOpenMaterial(mat);
      else {
        alert(`Downloading ${mat.title} (${mat.fileSizeKB} KB) for offline study.`);
      }
    } else if (item.type === 'exam') {
      if (onNavigateToCalendar) onNavigateToCalendar();
    }
  };

  return (
    <div className="bg-white border-2 border-purple-200 rounded-2xl p-5 sm:p-6 shadow-md space-y-4">
      {/* Header Strip */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-purple-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#4A1249] text-[#C39A53] rounded-lg shadow-2xs">
            <Search className="w-5 h-5 text-[#C39A53]" />
          </div>
          <div>
            <h3 className="font-collegiate font-bold text-base text-[#4A1249] uppercase tracking-wide">
              Real-Time Academic Search & Resource Locator
            </h3>
            <p className="text-xs text-slate-500">
              Instant keyword lookup across lecture notes, digital library stacks, and upcoming examination dates
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-bold text-[#4A1249] bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
            {filteredResults.length} Matched Items
          </span>
        </div>
      </div>

      {/* Real-Time Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#4A1249] absolute left-3.5 top-3.5" />
        <input
          type="text"
          placeholder="Search course notes, syllabi, textbooks, exam timetables (e.g., 'tree', 'exam', 'CSC 301', 'handbook')..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-purple-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#4A1249] focus:bg-white shadow-inner font-medium"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
            aria-label="Clear search query"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Category Pills & Enrolled Subject Quick Selectors */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        {/* Type Filter */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-slate-500 text-[11px] font-bold uppercase tracking-wider mr-1">Stream:</span>
          <button
            onClick={() => setSelectedType('all')}
            className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
              selectedType === 'all'
                ? 'bg-[#4A1249] text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-purple-50'
            }`}
          >
            All Streams ({allResults.length})
          </button>
          <button
            onClick={() => setSelectedType('material')}
            className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer flex items-center gap-1 ${
              selectedType === 'material'
                ? 'bg-[#4A1249] text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-purple-50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Course Notes ({materials.length})</span>
          </button>
          <button
            onClick={() => setSelectedType('library')}
            className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer flex items-center gap-1 ${
              selectedType === 'library'
                ? 'bg-[#4A1249] text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-purple-50'
            }`}
          >
            <Library className="w-3.5 h-3.5" />
            <span>Library Resources ({resources.length})</span>
          </button>
          <button
            onClick={() => setSelectedType('exam')}
            className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer flex items-center gap-1 ${
              selectedType === 'exam'
                ? 'bg-[#4A1249] text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-purple-50'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Exams & Dates ({calendarEvents.length})</span>
          </button>
        </div>

        {/* Enrolled Courses Filter */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Subject:</span>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="px-2.5 py-1 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-[#4A1249] cursor-pointer"
          >
            <option value="all">All Enrolled Subjects</option>
            {enrolledCourseCodes.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results List */}
      <div className="max-h-[380px] overflow-y-auto space-y-2 pr-1 divide-y divide-slate-100">
        {loading ? (
          <div className="p-8 text-center text-slate-400">
            <div className="w-6 h-6 border-2 border-[#4A1249] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span className="text-xs">Searching academic records...</span>
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl">
            <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-600">No matching items found</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Try adjusting your query or resetting the subject filter.
            </p>
          </div>
        ) : (
          filteredResults.map((item) => (
            <div
              key={item.id}
              className="pt-2.5 first:pt-0 p-3 rounded-xl hover:bg-purple-50/50 transition-colors border border-transparent hover:border-purple-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                  {item.courseCode && (
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-800 border border-slate-300">
                      {item.courseCode}
                    </span>
                  )}
                  <span className="text-[11px] font-semibold text-slate-500">
                    {item.dateOrSize}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#4A1249] transition-colors leading-snug">
                  {item.title}
                </h4>
                <p className="text-[11px] text-slate-600 line-clamp-1 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="shrink-0 w-full sm:w-auto">
                <button
                  onClick={() => handleAction(item)}
                  className="w-full sm:w-auto px-3.5 py-1.5 bg-[#4A1249] hover:bg-[#661B69] text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-[#C39A53]/40"
                >
                  {item.type === 'material' && <Download className="w-3.5 h-3.5 text-[#C39A53]" />}
                  {item.type === 'library' && <BookOpen className="w-3.5 h-3.5 text-[#C39A53]" />}
                  {item.type === 'exam' && <Calendar className="w-3.5 h-3.5 text-[#C39A53]" />}
                  <span>{item.actionLabel}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
