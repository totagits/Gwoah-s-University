import {
  UniversityTask,
  StudentProfileData,
  StudentRegistrationItem,
  ApplicationRecord,
  FinancialAccount,
  NchePolicyItem,
  AuditLogEntry,
  UserProfile,
  LibraryResource,
  AcademicCalendarEvent,
} from '../types';


export interface AnalyticsOverview {
  taskMetrics: {
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
  };
  admissionsFunnel: {
    totalApplications: number;
    admitted: number;
    underReview: number;
    conditional: number;
    conversionRate: number;
  };
  academics: {
    activeStudents: number;
    totalCourseSections: number;
    totalEnrolledSeats: number;
    totalCapacitySeats: number;
    capacityUtilization: number;
    averageCGPA: number;
    attendanceRate: number;
  };
  finance: {
    tuitionBilledUSD: number;
    tuitionCollectedUSD: number;
    scholarshipSubsidyUSD: number;
    outstandingReceivablesUSD: number;
    collectionRate: number;
  };
  collegeEnrollment: Array<{ college: string; enrolled: number; color: string }>;
  compliance: {
    ncheScore: number;
    totalPoliciesTracked: number;
    auditLogCount: number;
  };
}

const API_BASE = '/api';

export const api = {
  // Auth
  async login(roleOrEmail: { role?: string; email?: string; password?: string }) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(roleOrEmail),
    });
    return res.json();
  },

  async getUsers(): Promise<{ users: UserProfile[] }> {
    const res = await fetch(`${API_BASE}/auth/users`);
    return res.json();
  },

  // Tasks
  async getTasks(params?: {
    category?: string;
    priority?: string;
    status?: string;
    department?: string;
    search?: string;
  }): Promise<{ tasks: UniversityTask[] }> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val && val !== 'all') query.append(key, val);
      });
    }
    const res = await fetch(`${API_BASE}/tasks?${query.toString()}`);
    return res.json();
  },

  async createTask(taskData: Partial<UniversityTask>): Promise<{ success: boolean; task: UniversityTask }> {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData),
    });
    return res.json();
  },

  async updateTask(id: string, updates: Partial<UniversityTask>): Promise<{ success: boolean; task: UniversityTask }> {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return res.json();
  },

  async deleteTask(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/tasks/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Analytics
  async getAnalytics(): Promise<AnalyticsOverview> {
    const res = await fetch(`${API_BASE}/analytics/overview`);
    return res.json();
  },

  // Academics & Courses
  async getCoursesAndSections() {
    const res = await fetch(`${API_BASE}/courses`);
    return res.json();
  },

  async getStudent(id: string): Promise<{
    student: StudentProfileData;
    registrations: StudentRegistrationItem[];
    financialAccount: FinancialAccount;
  }> {
    const res = await fetch(`${API_BASE}/students/${id}`);
    return res.json();
  },

  async registerCourse(studentId: string, sectionId: string) {
    const res = await fetch(`${API_BASE}/registration/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, sectionId }),
    });
    return res.json();
  },

  async dropCourse(studentId: string, registrationId: string, reason: string) {
    const res = await fetch(`${API_BASE}/registration/drop`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, registrationId, reason }),
    });
    return res.json();
  },

  // Admissions
  async getApplications(): Promise<{ applications: ApplicationRecord[] }> {
    const res = await fetch(`${API_BASE}/applications`);
    return res.json();
  },

  async submitApplication(appData: Partial<ApplicationRecord>) {
    const res = await fetch(`${API_BASE}/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appData),
    });
    return res.json();
  },

  async updateApplication(id: string, updates: Partial<ApplicationRecord>) {
    const res = await fetch(`${API_BASE}/applications/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return res.json();
  },

  // Finance
  async getFinanceAccount(studentId: string): Promise<{ account: FinancialAccount }> {
    const res = await fetch(`${API_BASE}/finance/student/${studentId}`);
    return res.json();
  },

  async recordPayment(paymentData: { amountUSD: number; paymentMethod: string; reference?: string }) {
    const res = await fetch(`${API_BASE}/finance/pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentData),
    });
    return res.json();
  },

  // Faculty Grades
  async getFacultyRoster(sectionId: string) {
    const res = await fetch(`${API_BASE}/faculty/roster/${sectionId}`);
    return res.json();
  },

  async updateFacultyGrade(payload: {
    registrationId: string;
    score: number;
    letterGrade?: string;
    facultyName?: string;
  }) {
    const res = await fetch(`${API_BASE}/faculty/grades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  // Course Materials (Syllabi & Lecture Notes)
  async getMaterials(courseCode?: string): Promise<{ materials: any[] }> {
    const query = courseCode ? `?courseCode=${encodeURIComponent(courseCode)}` : '';
    const res = await fetch(`${API_BASE}/materials${query}`);
    return res.json();
  },

  // Shared Resource Library (Course Materials, NCHE Guidelines, Institutional Handbooks)
  async getResources(params?: {
    category?: string;
    courseCode?: string;
    search?: string;
    subcategory?: string;
  }): Promise<{ resources: LibraryResource[] }> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val && val !== 'all') query.append(key, val);
      });
    }
    const res = await fetch(`${API_BASE}/resources?${query.toString()}`);
    return res.json();
  },

  async getResourceById(id: string): Promise<{ resource: LibraryResource }> {
    const res = await fetch(`${API_BASE}/resources/${encodeURIComponent(id)}`);
    return res.json();
  },


  async addMaterial(payload: any) {
    const res = await fetch(`${API_BASE}/materials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  // Messaging (Faculty - Student)
  async getMessages(userId?: string): Promise<{ messages: any[] }> {
    const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    const res = await fetch(`${API_BASE}/messages${query}`);
    return res.json();
  },

  async sendMessage(payload: any) {
    const res = await fetch(`${API_BASE}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  // Admin User & Catalog Management
  async createAdminUser(payload: any) {
    const res = await fetch(`${API_BASE}/admin/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async updateAdminUser(id: string, payload: any) {
    const res = await fetch(`${API_BASE}/admin/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async createCourse(payload: any) {
    const res = await fetch(`${API_BASE}/admin/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async createSection(payload: any) {
    const res = await fetch(`${API_BASE}/admin/sections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  // Policies & Audit
  async getPolicies(): Promise<{ policies: NchePolicyItem[] }> {
    const res = await fetch(`${API_BASE}/policies`);
    return res.json();
  },

  async getAuditLogs(): Promise<{ auditLogs: AuditLogEntry[] }> {
    const res = await fetch(`${API_BASE}/audit`);
    return res.json();
  },

  // User Theme Preference
  async updateUserTheme(userId: string, theme: 'dark' | 'light'): Promise<{ success: boolean; user: UserProfile; themePreference: string }> {
    const res = await fetch(`${API_BASE}/users/${encodeURIComponent(userId)}/theme`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme }),
    });
    return res.json();
  },

  // Academic Calendar & Exam Sync
  async getCalendarEvents(params?: {
    type?: string;
    search?: string;
    courseCode?: string;
  }): Promise<{ events: AcademicCalendarEvent[]; total: number; academicYear: string; currentTerm: string }> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val && val !== 'all') query.append(key, val);
      });
    }
    const res = await fetch(`${API_BASE}/calendar/events?${query.toString()}`);
    return res.json();
  },

  async createCalendarEvent(payload: Partial<AcademicCalendarEvent>): Promise<{ success: boolean; event: AcademicCalendarEvent }> {
    const res = await fetch(`${API_BASE}/calendar/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async resetDemoData() {
    const res = await fetch(`${API_BASE}/reset-demo`, { method: 'POST' });
    return res.json();
  },
};
