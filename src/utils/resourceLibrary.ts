/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LibraryResource, ResourceCategory } from '../types';

export interface ResourceFilterOptions {
  category?: ResourceCategory | 'all';
  subcategory?: string;
  courseCode?: string;
  search?: string;
  maxFileSizeKB?: number;
  pinnedOnly?: boolean;
}

/**
 * Filter library resources based on category, course, search terms, and bandwidth constraints.
 */
export function filterLibraryResources(
  resources: LibraryResource[],
  options: ResourceFilterOptions = {}
): LibraryResource[] {
  const {
    category = 'all',
    subcategory,
    courseCode,
    search = '',
    maxFileSizeKB,
    pinnedOnly = false,
  } = options;

  const normalizedSearch = search.trim().toLowerCase();

  return resources.filter((resource) => {
    // Category check
    if (category !== 'all' && resource.category !== category) {
      return false;
    }

    // Subcategory check
    if (subcategory && subcategory !== 'all' && resource.subcategory.toLowerCase() !== subcategory.toLowerCase()) {
      return false;
    }

    // Course Code check
    if (courseCode && courseCode !== 'all') {
      if (!resource.courseCode || resource.courseCode.toLowerCase() !== courseCode.toLowerCase()) {
        return false;
      }
    }

    // Pinned only check
    if (pinnedOnly && !resource.isPinned) {
      return false;
    }

    // File size constraint (low-bandwidth filter)
    if (maxFileSizeKB && resource.fileSizeKB > maxFileSizeKB) {
      return false;
    }

    // Keyword search match
    if (normalizedSearch) {
      const matchTitle = resource.title.toLowerCase().includes(normalizedSearch);
      const matchDesc = resource.description.toLowerCase().includes(normalizedSearch);
      const matchAuth = resource.authorOrAuthority.toLowerCase().includes(normalizedSearch);
      const matchRef = resource.statutoryReference?.toLowerCase().includes(normalizedSearch) || false;
      const matchSub = resource.subcategory.toLowerCase().includes(normalizedSearch);
      const matchCourse = resource.courseCode?.toLowerCase().includes(normalizedSearch) || false;
      const matchTags = resource.tags.some((t) => t.toLowerCase().includes(normalizedSearch));

      if (!matchTitle && !matchDesc && !matchAuth && !matchRef && !matchSub && !matchCourse && !matchTags) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Compute aggregate statistics for the shared resource library.
 */
export function computeLibraryStats(resources: LibraryResource[]) {
  const total = resources.length;
  const courseMaterials = resources.filter((r) => r.category === 'course_material').length;
  const ncheGuidelines = resources.filter((r) => r.category === 'nche_guideline').length;
  const institutionalHandbooks = resources.filter((r) => r.category === 'institutional_handbook').length;
  const pinnedCount = resources.filter((r) => r.isPinned).length;
  const totalStorageKB = resources.reduce((acc, r) => acc + r.fileSizeKB, 0);

  return {
    total,
    courseMaterials,
    ncheGuidelines,
    institutionalHandbooks,
    pinnedCount,
    totalStorageKB,
    lowBandwidthCount: resources.filter((r) => r.fileSizeKB <= 500).length,
  };
}

/**
 * Format an academic reference citation for research and compliance tracking.
 */
export function formatResourceCitation(resource: LibraryResource): string {
  const year = resource.publishedDate ? resource.publishedDate.substring(0, 4) : '2026';
  const ref = resource.statutoryReference ? ` [Ref: ${resource.statutoryReference}]` : '';
  const course = resource.courseCode ? ` (${resource.courseCode})` : '';

  return `${resource.authorOrAuthority} (${year}). ${resource.title}${course}${ref}. Gwoah's University Academic Library & Repository, Monrovia, Republic of Liberia.`;
}

/**
 * Prepares a structured document string formatted for offline download (Markdown/Text).
 */
export function generateResourceDownload(resource: LibraryResource): {
  filename: string;
  content: string;
  mimeType: string;
} {
  const safeTitle = resource.title
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/__+/g, '_')
    .slice(0, 40);
  const filename = `${resource.category.toUpperCase()}_${safeTitle}_${resource.version}.md`;

  const highlightsText = resource.keyHighlights.map((h, i) => `${i + 1}. ${h}`).join('\n');
  const tagsText = resource.tags.map((t) => `#${t}`).join(' ');

  const content = `# ${resource.title}
================================================================================
INSTITUTION: Gwoah's University (Monrovia & Fendall Campuses)
AUTHOR / REGULATORY BODY: ${resource.authorOrAuthority}
CATEGORY: ${resource.category.replace('_', ' ').toUpperCase()} (${resource.subcategory})
ACADEMIC YEAR: ${resource.academicYear} | VERSION: ${resource.version}
DATE DIGITIZED: ${resource.publishedDate}
FILE SPECIFICATION: ${resource.fileFormat} (~${resource.fileSizeKB} KB)
${resource.statutoryReference ? `STATUTORY / ACCREDITATION REFERENCE: ${resource.statutoryReference}\n` : ''}${resource.courseCode ? `COURSE CODE: ${resource.courseCode}\n` : ''}TAGS: ${tagsText}
================================================================================

## EXECUTIVE SUMMARY & SCOPE
${resource.description}

## CORE HIGHLIGHTS & STATUTORY MANDATES
${highlightsText}

## DIGITIZED DOCUMENT TEXT & INSTRUCTIONAL SPECIFICATION
${resource.contentSummary}

================================================================================
OFFICIAL CITATION:
${formatResourceCitation(resource)}

Accredited by National Commission on Higher Education (NCHE) - Republic of Liberia
Stored in Gwoah's University Student Portal Repository
`;

  return {
    filename,
    content,
    mimeType: 'text/markdown;charset=utf-8;',
  };
}
