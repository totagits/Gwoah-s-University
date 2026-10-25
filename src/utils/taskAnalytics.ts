import { UniversityTask, TaskStatus, TaskPriority } from '../types';

export interface TaskMetricsSummary {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  reviewTasks: number;
  todoTasks: number;
  backlogTasks: number;
  completionRate: number;
  urgentCount: number;
  highCount: number;
  overdueTasksCount: number;
  byCategory: Record<string, number>;
  byDepartment: Record<string, number>;
  slaComplianceRate: number;
}

/**
 * Calculates aggregate analytics from a collection of university tasks.
 */
export function computeTaskAnalytics(
  tasks: UniversityTask[],
  currentDateIso: string = new Date().toISOString()
): TaskMetricsSummary {
  const now = new Date(currentDateIso).getTime();

  let completedTasks = 0;
  let inProgressTasks = 0;
  let reviewTasks = 0;
  let todoTasks = 0;
  let backlogTasks = 0;
  let urgentCount = 0;
  let highCount = 0;
  let overdueTasksCount = 0;

  const byCategory: Record<string, number> = {};
  const byDepartment: Record<string, number> = {};

  for (const task of tasks) {
    if (task.status === 'completed') completedTasks++;
    if (task.status === 'in_progress') inProgressTasks++;
    if (task.status === 'review') reviewTasks++;
    if (task.status === 'todo') todoTasks++;
    if (task.status === 'backlog') backlogTasks++;

    if (task.priority === 'urgent') urgentCount++;
    if (task.priority === 'high') highCount++;

    // Overdue check
    if (task.status !== 'completed') {
      const dueTime = new Date(task.dueDate).getTime();
      if (!isNaN(dueTime) && dueTime < now) {
        overdueTasksCount++;
      }
    }

    // Category count
    byCategory[task.category] = (byCategory[task.category] || 0) + 1;

    // Department count
    byDepartment[task.department] = (byDepartment[task.department] || 0) + 1;
  }

  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const pendingTasks = totalTasks - completedTasks;
  const compliantTasks = pendingTasks - overdueTasksCount;
  const slaComplianceRate = pendingTasks > 0 ? Math.max(0, Math.round((compliantTasks / pendingTasks) * 100)) : 100;

  return {
    totalTasks,
    completedTasks,
    inProgressTasks,
    reviewTasks,
    todoTasks,
    backlogTasks,
    completionRate,
    urgentCount,
    highCount,
    overdueTasksCount,
    byCategory,
    byDepartment,
    slaComplianceRate,
  };
}

/**
 * Filters tasks by search query, status, priority, or department.
 */
export function filterTasks(
  tasks: UniversityTask[],
  filters: {
    status?: TaskStatus | 'all';
    priority?: TaskPriority | 'all';
    department?: string;
    searchQuery?: string;
  }
): UniversityTask[] {
  return tasks.filter((task) => {
    if (filters.status && filters.status !== 'all' && task.status !== filters.status) {
      return false;
    }
    if (filters.priority && filters.priority !== 'all' && task.priority !== filters.priority) {
      return false;
    }
    if (filters.department && filters.department !== 'all' && task.department !== filters.department) {
      return false;
    }
    if (filters.searchQuery && filters.searchQuery.trim() !== '') {
      const q = filters.searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = task.description.toLowerCase().includes(q);
      const matchAssignee = task.assigneeName.toLowerCase().includes(q);
      const matchTags = task.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchAssignee && !matchTags) {
        return false;
      }
    }
    return true;
  });
}
