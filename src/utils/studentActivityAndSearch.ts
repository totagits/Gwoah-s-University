/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CourseMaterial, LibraryResource, AcademicCalendarEvent } from '../types';

export interface UnifiedItemSearchQuery {
  query: string;
  type: 'all' | 'material' | 'library' | 'exam';
  courseCode: string;
}

export function matchesSearchCriteria(
  title: string,
  description: string,
  courseCode: string | undefined,
  criteria: UnifiedItemSearchQuery
): boolean {
  // Course code filter
  if (criteria.courseCode !== 'all' && courseCode) {
    if (!courseCode.toLowerCase().includes(criteria.courseCode.toLowerCase())) {
      return false;
    }
  }

  // Text search query
  if (!criteria.query.trim()) return true;

  const q = criteria.query.toLowerCase().trim();
  const inTitle = title.toLowerCase().includes(q);
  const inDesc = description.toLowerCase().includes(q);
  const inCode = courseCode ? courseCode.toLowerCase().includes(q) : false;

  return inTitle || inDesc || inCode;
}

export function filterUnifiedItems<T extends { title: string; description?: string; courseCode?: string }>(
  items: T[],
  query: string,
  selectedCourse: string = 'all'
): T[] {
  return items.filter((item) =>
    matchesSearchCriteria(item.title, item.description || '', item.courseCode, {
      query,
      type: 'all',
      courseCode: selectedCourse,
    })
  );
}

export function computeActivitySummary(activities: { type: string; status: string }[]) {
  const total = activities.length;
  const submissions = activities.filter((a) => a.type === 'submission').length;
  const grades = activities.filter((a) => a.type === 'grade').length;
  const library = activities.filter((a) => a.type === 'library').length;
  const orders = activities.filter((a) => a.type === 'work_order').length;

  return {
    total,
    submissions,
    grades,
    library,
    orders,
  };
}
