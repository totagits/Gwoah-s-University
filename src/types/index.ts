/**
 * Core domain types for Gwoah's University ERP and Portal
 */

export type UserRole = 
  | 'super_admin'
  | 'registrar'
  | 'dean'
  | 'lecturer'
  | 'student'
  | 'bursar'
  | 'admissions_officer';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title: string;
  department?: string;
  studentId?: string;
  staffId?: string;
  avatarUrl?: string;
  themePreference?: 'dark' | 'light';
}

export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'review' | 'completed';
export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';
export type TaskCategory = 
  | 'academic_review' 
  | 'admissions' 
  | 'accreditation_nche' 
  | 'finance' 
  | 'student_support' 
  | 'it_infrastructure'
  | 'curriculum'
  | 'facilities_maintenance';

export interface UniversityTask {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;
  assigneeName: string;
  assigneeRole: UserRole;
  assigneeEmail: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  estimatedHours?: number;
  actualHours?: number;
  tags: string[];
  department: string;
  slaDays: number;
  isPriorityFlagged?: boolean;
  priorityFlaggedBy?: string;
  flaggedAt?: string;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  credits: number;
  department: string;
  faculty: string;
  description: string;
  prerequisites: string[];
  level: 100 | 200 | 300 | 400 | 500;
  feePerCreditUSD: number;
}

export interface CourseSection {
  id: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  sectionCode: string;
  lecturerName: string;
  schedule: string;
  room: string;
  capacity: number;
  enrolled: number;
  semester: string;
  academicYear: string;
}

export type RegistrationStatus = 'registered' | 'waitlisted' | 'dropped' | 'withdrawn';

export interface StudentRegistrationItem {
  id: string;
  studentId: string;
  sectionId: string;
  courseCode: string;
  courseTitle: string;
  credits: number;
  status: RegistrationStatus;
  grade?: string;
  score?: number;
  registeredDate: string;
  droppedDate?: string;
  dropReason?: string;
}

export interface StudentProfileData {
  id: string;
  studentNumber: string;
  fullName: string;
  email: string;
  phone: string;
  dob: string;
  gender: 'Female' | 'Male' | 'Other';
  nationality: string;
  county: string;
  campus: string;
  program: string;
  faculty: string;
  degreeType: 'B.Sc.' | 'B.A.' | 'B.Ed.' | 'Associate' | 'Master';
  cohortYear: number;
  academicStanding: 'Good Standing' | 'Academic Probation' | 'Dean\'s List';
  totalCreditsEarned: number;
  targetDegreeCredits: number;
  cgpa: number;
  accommodationsNeeded?: string;
  financialHold: boolean;
  advisorName: string;
}

export interface ApplicationRecord {
  id: string;
  applicationNumber: string;
  applicantName: string;
  email: string;
  phone: string;
  programDesired: string;
  faculty: string;
  wassceIndex: string;
  wassceCoreSubjects: { subject: string; grade: string }[];
  applicationDate: string;
  status: 'under_review' | 'interview_scheduled' | 'admitted' | 'conditional' | 'rejected' | 'waitlisted';
  reviewerNotes?: string;
  scoringTotal?: number;
  applicationFeePaid: boolean;
}

export interface FinancialAccount {
  studentId: string;
  studentNumber: string;
  studentName: string;
  tuitionBilledUSD: number;
  feesBilledUSD: number;
  scholarshipCreditUSD: number;
  totalPaidUSD: number;
  currentBalanceUSD: number;
  status: 'cleared' | 'partial_hold' | 'critical_hold';
  transactions: FinancialTransaction[];
}

export interface FinancialTransaction {
  id: string;
  date: string;
  type: 'Tuition Bill' | 'Registration Fee' | 'Lab Fee' | 'Bank Deposit' | 'Mobile Money' | 'Scholarship Aid';
  reference: string;
  amountUSD: number;
  paymentMethod?: 'Lonestar MTN Mobile Money' | 'Orange Money' | 'EcoBank Slip' | 'UBA Bank Deposit' | 'Direct Cashier';
  receivedBy?: string;
}

export interface NchePolicyItem {
  id: string;
  sourceAuthority: string;
  sourceDate: string;
  documentTitle: string;
  statutoryReference: string;
  mandateDescription: string;
  systemControlImplemented: string;
  complianceStatus: 'Compliant' | 'Audited' | 'Action Required';
  responsibleOffice: string;
}

export interface DirectMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  recipientId: string;
  recipientName: string;
  courseCode?: string;
  subject: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface CourseMaterial {
  id: string;
  courseCode: string;
  title: string;
  weekNumber: number;
  type: 'syllabus' | 'lecture_notes' | 'assignment' | 'reading';
  description: string;
  fileSizeKB: number;
  downloadUrl?: string;
  uploadedDate: string;
  facultyAuthor: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  ipAddress: string;
}

export type ResourceCategory = 'course_material' | 'nche_guideline' | 'institutional_handbook';

export interface ResourceVersion {
  version: string;
  uploadedAt: string;
  uploadedBy: string;
  changeSummary: string;
  fileSizeKB: number;
  contentSummary?: string;
  isActive: boolean;
}

export interface LibraryResource {
  id: string;
  title: string;
  category: ResourceCategory;
  subcategory: string;
  courseCode?: string;
  authorOrAuthority: string;
  publishedDate: string;
  academicYear: string;
  version: string;
  fileFormat: 'PDF' | 'DOCX' | 'MD';
  fileSizeKB: number;
  statutoryReference?: string;
  description: string;
  contentSummary: string;
  keyHighlights: string[];
  isPinned?: boolean;
  tags: string[];
  versionHistory?: ResourceVersion[];
}

export interface FacilityTicket {
  id: string;
  ticketNumber: string;
  buildingId: string;
  buildingName: string;
  campusName: string;
  locationDetails: string; // e.g. Room 204, East Wing Restroom
  category: 'sanitation' | 'electrical' | 'connectivity' | 'ventilation_ac' | 'furniture_structural' | 'plumbing';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  reporterName: string;
  reporterEmail: string;
  reporterPhone?: string;
  reporterRole: string;
  status: 'reported' | 'investigating' | 'dispatched' | 'resolved';
  createdAt: string;
  updatedAt: string;
  assignedStaff?: string;
  resolutionNotes?: string;
  taskId?: string; // Linked task in TaskManagementDashboard
}

export type CalendarEventType = 'registration' | 'exam' | 'senate' | 'holiday' | 'financial';

export interface AcademicCalendarEvent {
  id: string;
  title: string;
  description: string;
  eventType: CalendarEventType;
  startDate: string; // ISO date 'YYYY-MM-DD' or 'YYYY-MM-DDTHH:mm:ss'
  endDate: string; // ISO date 'YYYY-MM-DD' or 'YYYY-MM-DDTHH:mm:ss'
  location?: string;
  courseCode?: string;
  isMandatory: boolean;
  statutoryRef?: string;
  term: string;
}

export type NotificationCategory = 'academic' | 'task' | 'alert' | 'finance' | 'facility';
export type NotificationPriority = 'critical' | 'high' | 'normal' | 'info';

export interface PortalNotification {
  id: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  targetTab?: string;
  targetAction?: string;
  badge?: string;
  entityId?: string;
}

export interface PeerDiscussionMessage {
  id: string;
  materialId: string;
  threadId: string;
  authorId: string;
  authorName: string;
  authorRole: string; // e.g. 'Student', 'Study Group Lead', 'Course Rep'
  authorAvatar?: string;
  timestamp: string;
  content: string;
  tag?: 'question' | 'solution_tip' | 'resource' | 'announcement';
  likes: number;
  likedBy?: string[];
}

export interface PeerDiscussionThread {
  id: string;
  materialId: string;
  courseCode: string;
  materialTitle: string;
  title: string;
  description?: string;
  createdAt: string;
  creatorId: string;
  creatorName: string;
  messagesCount: number;
  participants: string[];
  lastActivity: string;
  isPinned?: boolean;
}
