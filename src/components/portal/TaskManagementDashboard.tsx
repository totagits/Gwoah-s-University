import React, { useState, useEffect } from 'react';
import {
  ListTodo,
  Plus,
  Filter,
  Search,
  Clock,
  AlertCircle,
  CheckCircle2,
  Calendar,
  User,
  ArrowRight,
  MoreVertical,
  Trash2,
  Tag,
  Shield,
  Layers,
  Sparkles,
  RefreshCw,
  Kanban,
  Table as TableIcon,
} from 'lucide-react';
import { UniversityTask, TaskStatus, TaskPriority, TaskCategory, UserProfile } from '../../types';
import { api } from '../../services/api';

interface TaskManagementDashboardProps {
  currentUser: UserProfile;
  onRefreshAnalytics?: () => void;
}

export const TaskManagementDashboard: React.FC<TaskManagementDashboardProps> = ({
  currentUser,
  onRefreshAnalytics,
}) => {
  const [tasks, setTasks] = useState<UniversityTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Create Task Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newTaskData, setNewTaskData] = useState({
    title: '',
    description: '',
    category: 'accreditation_nche' as TaskCategory,
    priority: 'high' as TaskPriority,
    status: 'todo' as TaskStatus,
    assigneeName: currentUser.name,
    assigneeRole: currentUser.role,
    assigneeEmail: currentUser.email,
    department: currentUser.department || 'Registry',
    dueDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
    slaDays: 14,
    tags: 'NCHE, Compliance',
  });

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await api.getTasks({
        category: categoryFilter,
        priority: priorityFilter,
        status: statusFilter,
        department: departmentFilter,
        search: searchQuery,
      });
      if (res.tasks) {
        setTasks(res.tasks);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [categoryFilter, priorityFilter, statusFilter, departmentFilter, searchQuery]);

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const res = await api.updateTask(taskId, { status: newStatus });
      if (res.success) {
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
        );
        if (onRefreshAnalytics) onRefreshAnalytics();
      }
    } catch (err) {
      console.error('Failed to update task status:', err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this institutional task?')) return;
    try {
      const res = await api.deleteTask(taskId);
      if (res.success) {
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
        if (onRefreshAnalytics) onRefreshAnalytics();
      }
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const payload = {
        title: newTaskData.title,
        description: newTaskData.description,
        category: newTaskData.category,
        priority: newTaskData.priority,
        status: newTaskData.status,
        assigneeName: newTaskData.assigneeName,
        assigneeRole: newTaskData.assigneeRole,
        assigneeEmail: newTaskData.assigneeEmail,
        department: newTaskData.department,
        dueDate: new Date(newTaskData.dueDate).toISOString(),
        slaDays: Number(newTaskData.slaDays) || 14,
        tags: newTaskData.tags.split(',').map((t) => t.trim()).filter(Boolean),
      };

      const res = await api.createTask(payload);
      if (res.success && res.task) {
        setTasks((prev) => [res.task, ...prev]);
        setIsCreateModalOpen(false);
        setNewTaskData({
          title: '',
          description: '',
          category: 'accreditation_nche',
          priority: 'high',
          status: 'todo',
          assigneeName: currentUser.name,
          assigneeRole: currentUser.role,
          assigneeEmail: currentUser.email,
          department: currentUser.department || 'Registry',
          dueDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
          slaDays: 14,
          tags: 'NCHE, Compliance',
        });
        if (onRefreshAnalytics) onRefreshAnalytics();
      }
    } catch (err) {
      console.error('Failed to create task:', err);
    } finally {
      setCreating(false);
    }
  };

  const kanbanColumns: Array<{ id: TaskStatus; label: string; color: string }> = [
    { id: 'backlog', label: 'Backlog', color: 'slate' },
    { id: 'todo', label: 'To Do', color: 'blue' },
    { id: 'in_progress', label: 'In Progress', color: 'amber' },
    { id: 'review', label: 'Senate / Dept Review', color: 'purple' },
    { id: 'completed', label: 'Completed', color: 'emerald' },
  ];

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent':
        return <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold px-2 py-0.5 rounded">Urgent</span>;
      case 'high':
        return <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold px-2 py-0.5 rounded">High</span>;
      case 'medium':
        return <span className="bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[10px] font-bold px-2 py-0.5 rounded">Medium</span>;
      case 'low':
        return <span className="bg-slate-700 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded">Low</span>;
    }
  };

  const getCategoryLabel = (cat: TaskCategory) => {
    switch (cat) {
      case 'accreditation_nche':
        return 'NCHE Accreditation';
      case 'academic_review':
        return 'Academic & Senate Review';
      case 'admissions':
        return 'Admissions & WASSCE';
      case 'finance':
        return 'Finance & Bursar';
      case 'student_support':
        return 'DEI & Student Support';
      case 'it_infrastructure':
        return 'IT & Connectivity';
      case 'curriculum':
        return 'Curriculum Development';
      default:
        return cat;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Institutional Task Management
            </h2>
            <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold px-2 py-0.5 rounded-full">
              {tasks.length} Active Workflows
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Track accreditation deliverables, exam moderation, admissions verification, and departmental SLAs across Gwoah's University.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* View toggle */}
          <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'kanban' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
              }`}
              aria-label="Kanban View"
            >
              <Kanban className="w-4 h-4" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'list' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
              }`}
              aria-label="Table List View"
            >
              <TableIcon className="w-4 h-4" />
              <span>Table</span>
            </button>
          </div>

          <button
            onClick={fetchTasks}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors"
            title="Refresh Tasks"
            aria-label="Refresh tasks"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl text-xs">
        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search tasks, assignee, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Category filter */}
        <div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Categories</option>
            <option value="accreditation_nche">NCHE Accreditation</option>
            <option value="academic_review">Academic Review</option>
            <option value="admissions">Admissions</option>
            <option value="finance">Finance / Bursar</option>
            <option value="student_support">DEI & Student Support</option>
            <option value="it_infrastructure">IT Infrastructure</option>
          </select>
        </div>

        {/* Priority filter */}
        <div>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Department filter */}
        <div>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Departments</option>
            <option value="Registry">Office of the Registrar</option>
            <option value="Engineering">College of Engineering</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Admissions">Admissions Office</option>
            <option value="Finance">Bursar & Finance</option>
            <option value="Student Affairs">Student Affairs & DEI</option>
            <option value="ICT Services">ICT Services</option>
          </select>
        </div>

        {/* Status filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Statuses</option>
            <option value="backlog">Backlog</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="review">Review</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* KANBAN BOARD VIEW */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {kanbanColumns.map((col) => {
            const columnTasks = tasks.filter((t) => t.status === col.id);
            return (
              <div
                key={col.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-3 min-w-[240px] flex flex-col"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 px-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        col.id === 'completed'
                          ? 'bg-emerald-400'
                          : col.id === 'in_progress'
                          ? 'bg-amber-400'
                          : col.id === 'review'
                          ? 'bg-purple-400'
                          : col.id === 'todo'
                          ? 'bg-blue-400'
                          : 'bg-slate-500'
                      }`}
                    />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      {col.label}
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
                    {columnTasks.length}
                  </span>
                </div>

                {/* Column Cards */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[640px] pr-1">
                  {columnTasks.map((task) => {
                    const isOverdue =
                      task.status !== 'completed' &&
                      new Date(task.dueDate).getTime() < Date.now();

                    return (
                      <div
                        key={task.id}
                        className="bg-slate-850 border border-slate-800 hover:border-amber-500/40 rounded-xl p-3.5 shadow transition-all space-y-2.5 text-xs group"
                      >
                        {/* Priority and Category */}
                        <div className="flex items-center justify-between gap-1">
                          {getPriorityBadge(task.priority)}
                          <span className="text-[10px] text-slate-400 font-medium truncate max-w-[120px]">
                            {getCategoryLabel(task.category)}
                          </span>
                        </div>

                        {/* Title */}
                        <h4 className="font-bold text-white group-hover:text-amber-400 transition-colors leading-snug">
                          {task.title}
                        </h4>

                        {/* Description */}
                        <p className="text-[11px] text-slate-400 line-clamp-2">
                          {task.description}
                        </p>

                        {/* Assignee & Due Date */}
                        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                          <div className="flex items-center gap-1.5 text-slate-300">
                            <div className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-amber-400">
                              {task.assigneeName.charAt(0)}
                            </div>
                            <span className="truncate max-w-[90px]">{task.assigneeName}</span>
                          </div>

                          <div
                            className={`flex items-center gap-1 font-mono text-[10px] ${
                              isOverdue ? 'text-rose-400 font-bold' : 'text-slate-400'
                            }`}
                          >
                            <Clock className="w-3 h-3" />
                            <span>{new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                          </div>
                        </div>

                        {/* Action buttons to transition status */}
                        <div className="pt-1 flex items-center justify-between">
                          <select
                            value={task.status}
                            onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                            className="bg-slate-800 text-slate-300 border border-slate-700 text-[10px] rounded px-1.5 py-1 focus:outline-none focus:border-amber-500 cursor-pointer"
                            aria-label={`Change status for ${task.title}`}
                          >
                            <option value="backlog">Backlog</option>
                            <option value="todo">To Do</option>
                            <option value="in_progress">In Progress</option>
                            <option value="review">Review</option>
                            <option value="completed">Completed</option>
                          </select>

                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                            title="Delete task"
                            aria-label={`Delete task ${task.title}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {columnTasks.length === 0 && (
                    <div className="text-center py-8 text-slate-500 text-xs italic border border-dashed border-slate-800 rounded-xl">
                      No tasks in this stage
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TABLE LIST VIEW */}
      {viewMode === 'list' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Task Title & Category</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Assignee</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Due Date & SLA</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-850/60 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-bold text-white">{task.title}</div>
                      <div className="text-[11px] text-amber-400/80 mt-0.5">{getCategoryLabel(task.category)}</div>
                    </td>
                    <td className="px-4 py-3">{task.department}</td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-200">{task.assigneeName}</div>
                      <div className="text-[10px] text-slate-500">{task.assigneeRole}</div>
                    </td>
                    <td className="px-4 py-3">{getPriorityBadge(task.priority)}</td>
                    <td className="px-4 py-3">
                      <div className="font-mono text-slate-200">
                        {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                      <div className="text-[10px] text-slate-500">SLA: {task.slaDays} Days</div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                        className="bg-slate-800 text-slate-200 border border-slate-700 text-xs rounded px-2 py-1"
                        aria-label={`Change status for ${task.title}`}
                      >
                        <option value="backlog">Backlog</option>
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="review">Review</option>
                        <option value="completed">Completed</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400"
                        aria-label={`Delete task ${task.title}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE TASK MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl p-6 shadow-2xl relative my-6 text-slate-100">
            <h3 className="text-xl font-bold text-white mb-4 pb-3 border-b border-slate-800 flex items-center gap-2">
              <Plus className="w-5 h-5 text-amber-400" />
              <span>Create New Institutional Task</span>
            </h3>

            <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., NCHE Laboratory Equipment Audit for Fendall Campus"
                  value={newTaskData.title}
                  onChange={(e) => setNewTaskData({ ...newTaskData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Description & Deliverable Scope *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Specify clear deliverables, policy dependencies, and required approvals..."
                  value={newTaskData.description}
                  onChange={(e) => setNewTaskData({ ...newTaskData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={newTaskData.category}
                    onChange={(e) => setNewTaskData({ ...newTaskData, category: e.target.value as TaskCategory })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="accreditation_nche">NCHE Accreditation</option>
                    <option value="academic_review">Academic Review</option>
                    <option value="admissions">Admissions</option>
                    <option value="finance">Finance & Bursar</option>
                    <option value="student_support">DEI & Student Support</option>
                    <option value="it_infrastructure">IT Infrastructure</option>
                    <option value="curriculum">Curriculum Development</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Priority</label>
                  <select
                    value={newTaskData.priority}
                    onChange={(e) => setNewTaskData({ ...newTaskData, priority: e.target.value as TaskPriority })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Department</label>
                  <input
                    type="text"
                    value={newTaskData.department}
                    onChange={(e) => setNewTaskData({ ...newTaskData, department: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Assignee Name</label>
                  <input
                    type="text"
                    value={newTaskData.assigneeName}
                    onChange={(e) => setNewTaskData({ ...newTaskData, assigneeName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newTaskData.dueDate}
                    onChange={(e) => setNewTaskData({ ...newTaskData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">SLA Days Target</label>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={newTaskData.slaDays}
                    onChange={(e) => setNewTaskData({ ...newTaskData, slaDays: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow cursor-pointer disabled:opacity-50"
                >
                  {creating ? 'Saving Task...' : 'Save & Publish Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
