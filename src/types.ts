/**
 * Core domain types for OiO Creative Academy
 */

export type UserRole = "student" | "admin";
export type EnrollmentStatus = "pending" | "enrolled" | "rejected";
export type PaymentStatus = "pending" | "verified" | "rejected";
export type PaymentMode = "manual" | "paystack";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  whatsapp: string;
  role: UserRole;
  enrollmentStatus: EnrollmentStatus;
  enrolledAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ClassSession {
  id: string;
  title: string;
  description: string;
  date: string; // e.g. "2026-11-07" or "Nov 7, 2026"
  startTime: string; // e.g. "19:00"
  endTime: string; // e.g. "21:00"
  meetUrl: string; // Dedicated Google Meet URL per session
  youtubeLiveId?: string; // Optional YouTube stream ID
  instructorNote: string;
  order: number;
  status?: "scheduled" | "live" | "completed";
  createdAt?: string;
  updatedAt?: string;
}

export interface Recording {
  id: string;
  title: string;
  sessionDate: string;
  youtubeId: string;
  summary: string;
  duration?: string;
  order: number;
  materials?: Array<{
    title: string;
    url: string;
    type: string;
  }>;
  createdAt?: string;
}

export interface MaterialItem {
  id: string;
  title: string;
  description: string;
  category: "Footage" | "Audio" | "Presets" | "Cheatsheet" | "Software" | "General";
  url: string;
  fileType: string; // e.g. "ZIP", "PDF", "Link", "Drive"
  lessonNumber?: number;
  order: number;
  createdAt?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: "normal" | "urgent";
  authorName: string;
  createdAt: string;
}

export interface PaymentRecord {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  amountKobo: number;
  amountNaira: number;
  mode: PaymentMode;
  reference: string;
  status: PaymentStatus;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}
