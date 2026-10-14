import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { db, handleFirestoreError, OperationType } from "../firebase";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
} from "firebase/firestore";
import {
  UserProfile,
  ClassSession,
  Recording,
  MaterialItem,
  Announcement,
  PaymentRecord,
} from "../types";
import { ACADEMY_CONFIG, formatNaira } from "../config";
import {
  Users,
  Calendar,
  BookOpen,
  FolderDown,
  Megaphone,
  CreditCard,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  XCircle,
  Search,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";

export const AdminDashboard: React.FC = () => {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<"students" | "classes" | "recordings" | "materials" | "announcements" | "payments">("students");

  // State
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);

  // Search filter
  const [studentSearch, setStudentSearch] = useState("");

  // Modals / Form States
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassSession | null>(null);

  const [isRecordingModalOpen, setIsRecordingModalOpen] = useState(false);
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);

  // Form fields
  const [classForm, setClassForm] = useState({
    title: "",
    description: "",
    date: "2026-11-07",
    startTime: "19:00",
    endTime: "21:00",
    meetUrl: "https://meet.google.com/xyz-abcd-efg",
    youtubeLiveId: "",
    instructorNote: "Please download lesson footage before class start.",
    order: 1,
  });

  const [recForm, setRecForm] = useState({
    title: "",
    sessionDate: "Nov 7, 2026",
    youtubeId: "",
    summary: "",
    duration: "1h 45m",
    order: 1,
  });

  const [matForm, setMatForm] = useState({
    title: "",
    description: "",
    category: "Footage" as MaterialItem["category"],
    url: "",
    fileType: "ZIP",
    lessonNumber: 1,
    order: 1,
  });

  const [annForm, setAnnForm] = useState({
    title: "",
    content: "",
    priority: "normal" as "normal" | "urgent",
  });

  const [actionStatus, setActionStatus] = useState<string | null>(null);

  // 1. Listen to students
  useEffect(() => {
    if (!isAdmin) return;
    const unsub = onSnapshot(
      collection(db, "users"),
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({
          uid: d.id,
          ...d.data(),
        })) as UserProfile[];
        setStudents(items);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, "users");
      }
    );
    return () => unsub();
  }, [isAdmin]);

  // 2. Listen to classes
  useEffect(() => {
    if (!isAdmin) return;
    const q = query(collection(db, "classes"), orderBy("order", "asc"));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as ClassSession[];
        setClasses(items);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, "classes");
      }
    );
    return () => unsub();
  }, [isAdmin]);

  // 3. Listen to recordings
  useEffect(() => {
    if (!isAdmin) return;
    const q = query(collection(db, "recordings"), orderBy("order", "asc"));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Recording[];
        setRecordings(items);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, "recordings");
      }
    );
    return () => unsub();
  }, [isAdmin]);

  // 4. Listen to materials
  useEffect(() => {
    if (!isAdmin) return;
    const q = query(collection(db, "materials"), orderBy("order", "asc"));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as MaterialItem[];
        setMaterials(items);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, "materials");
      }
    );
    return () => unsub();
  }, [isAdmin]);

  // 5. Listen to announcements
  useEffect(() => {
    if (!isAdmin) return;
    const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Announcement[];
        setAnnouncements(items);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, "announcements");
      }
    );
    return () => unsub();
  }, [isAdmin]);

  // 6. Listen to payments
  useEffect(() => {
    if (!isAdmin) return;
    const q = query(collection(db, "payments"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as PaymentRecord[];
        setPayments(items);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, "payments");
      }
    );
    return () => unsub();
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 rounded-3xl border border-red-500/30 bg-red-500/5 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h3 className="font-serif text-xl font-bold text-red-600 dark:text-red-400">
          Admin Authorization Required
        </h3>
        <p className="text-xs text-[var(--text-muted)] leading-relaxed">
          This portal is restricted to authorized OiO Creative Academy administrators. Please sign in with an admin account ({ACADEMY_CONFIG.OFFICIAL_EMAIL}).
        </p>
      </div>
    );
  }

  // Actions
  const handleUpdateEnrollment = async (uid: string, status: "enrolled" | "rejected" | "pending") => {
    try {
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, {
        enrollmentStatus: status,
        enrolledAt: status === "enrolled" ? new Date().toISOString() : null,
        updatedAt: new Date().toISOString(),
      });
      setActionStatus(`Student status updated to: ${status}`);
      setTimeout(() => setActionStatus(null), 3000);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${uid}`);
    }
  };

  const handleToggleAdminRole = async (uid: string, currentRole: string) => {
    const nextRole = currentRole === "admin" ? "student" : "admin";
    try {
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, {
        role: nextRole,
        updatedAt: new Date().toISOString(),
      });
      // also mirror in /admins collection
      if (nextRole === "admin") {
        await setDoc(doc(db, "admins", uid), {
          addedAt: new Date().toISOString(),
        });
      } else {
        await deleteDoc(doc(db, "admins", uid));
      }
      setActionStatus(`Updated user role to: ${nextRole}`);
      setTimeout(() => setActionStatus(null), 3000);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${uid}`);
    }
  };

  // Class session actions
  const handleSaveClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingClass) {
        const classRef = doc(db, "classes", editingClass.id);
        await updateDoc(classRef, {
          ...classForm,
          updatedAt: new Date().toISOString(),
        });
      } else {
        await addDoc(collection(db, "classes"), {
          ...classForm,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      setIsClassModalOpen(false);
      setEditingClass(null);
      setActionStatus("Class session saved successfully.");
      setTimeout(() => setActionStatus(null), 3000);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, "classes");
    }
  };

  const handleDeleteClass = async (id: string) => {
    if (!confirm("Are you sure you want to delete this class session?")) return;
    try {
      await deleteDoc(doc(db, "classes", id));
      setActionStatus("Session deleted.");
      setTimeout(() => setActionStatus(null), 3000);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `classes/${id}`);
    }
  };

  // Recording actions
  const handleSaveRecording = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "recordings"), {
        ...recForm,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setIsRecordingModalOpen(false);
      setRecForm({
        title: "",
        sessionDate: "Nov 7, 2026",
        youtubeId: "",
        summary: "",
        duration: "1h 45m",
        order: recordings.length + 1,
      });
      setActionStatus("Recording published.");
      setTimeout(() => setActionStatus(null), 3000);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, "recordings");
    }
  };

  const handleDeleteRecording = async (id: string) => {
    if (!confirm("Delete this recording?")) return;
    try {
      await deleteDoc(doc(db, "recordings", id));
      setActionStatus("Recording removed.");
      setTimeout(() => setActionStatus(null), 3000);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `recordings/${id}`);
    }
  };

  // Material actions
  const handleSaveMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "materials"), {
        ...matForm,
        createdAt: new Date().toISOString(),
      });
      setIsMaterialModalOpen(false);
      setMatForm({
        title: "",
        description: "",
        category: "Footage",
        url: "",
        fileType: "ZIP",
        lessonNumber: 1,
        order: materials.length + 1,
      });
      setActionStatus("Material resource added.");
      setTimeout(() => setActionStatus(null), 3000);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, "materials");
    }
  };

  const handleDeleteMaterial = async (id: string) => {
    if (!confirm("Delete this material?")) return;
    try {
      await deleteDoc(doc(db, "materials", id));
      setActionStatus("Material deleted.");
      setTimeout(() => setActionStatus(null), 3000);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `materials/${id}`);
    }
  };

  // Announcement actions
  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "announcements"), {
        ...annForm,
        authorName: "OiO Academy Team",
        createdAt: new Date().toISOString(),
      });
      setIsAnnouncementModalOpen(false);
      setAnnForm({ title: "", content: "", priority: "normal" });
      setActionStatus("Announcement broadcasted.");
      setTimeout(() => setActionStatus(null), 3000);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, "announcements");
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    try {
      await deleteDoc(doc(db, "announcements", id));
      setActionStatus("Announcement deleted.");
      setTimeout(() => setActionStatus(null), 3000);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `announcements/${id}`);
    }
  };

  // Seed inaugural 5 CapCut Masterclass classes (from course curriculum)
  const handleSeedNovemberCurriculum = async () => {
    const inauguralSessions = [
      {
        order: 1,
        title: "Day 1 — Foundation: Getting Started & Timeline Basics",
        description: "Interface tour (mobile & PC), media import, trim, split, clip arrangement, and assembling a 15-second story.",
        date: "2026-11-07",
        startTime: "19:00",
        endTime: "20:30",
        meetUrl: "https://meet.google.com/oio-capcut-day01",
        instructorNote: "Install CapCut on your phone or PC before class. Download Day 1 sample footage clips.",
      },
      {
        order: 2,
        title: "Day 2 — Timeline, Transitions & Audio Mixing",
        description: "Cut to the beat, speed ramps, smooth transitions, dialogue clarity, background music and SFX balance.",
        date: "2026-11-08",
        startTime: "19:00",
        endTime: "20:30",
        meetUrl: "https://meet.google.com/oio-capcut-day02",
        instructorNote: "Wear headphones during this class to listen to audio mixing and audio fade techniques.",
      },
      {
        order: 3,
        title: "Day 3 — Text, Captions, Effects & Vertical Reels",
        description: "Kinetic animated titles, auto-captions styling, stickers, visual effects, and 9:16 vertical hook structures for TikTok & Reels.",
        date: "2026-11-14",
        startTime: "19:00",
        endTime: "20:30",
        meetUrl: "https://meet.google.com/oio-capcut-day03",
        instructorNote: "Prepare a 30-second script idea or video concept for your hands-on Reel assignment.",
      },
      {
        order: 4,
        title: "Day 4 — Keyframes, Masking, Overlays & Color",
        description: "Keyframe zooms, green-screen chroma key, background cutout removal, color adjustments, and product video commercials.",
        date: "2026-11-21",
        startTime: "19:00",
        endTime: "20:30",
        meetUrl: "https://meet.google.com/oio-capcut-day04",
        instructorNote: "Download the product footage package provided in the Materials tab.",
      },
      {
        order: 5,
        title: "Day 5 — Professional Export & Freelance Client Strategy",
        description: "Full project build, export settings (1080x1920 / 1920x1080), client discovery, portfolio presentation, pricing, and final assessment rubric.",
        date: "2026-11-28",
        startTime: "19:00",
        endTime: "20:30",
        meetUrl: "https://meet.google.com/oio-capcut-day05",
        instructorNote: "Final project screening, CapCut masterclass certificate review, and graduation clinic.",
      },
    ];

    try {
      for (const s of inauguralSessions) {
        await addDoc(collection(db, "classes"), {
          ...s,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      setActionStatus("Seeded 5 CapCut Masterclass sessions successfully!");
      setTimeout(() => setActionStatus(null), 4000);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, "classes");
    }
  };

  const filteredStudents = students.filter((s) => {
    const q = studentSearch.toLowerCase();
    return (
      (s.displayName || "").toLowerCase().includes(q) ||
      (s.email || "").toLowerCase().includes(q) ||
      (s.whatsapp || "").toLowerCase().includes(q) ||
      (s.notes || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6 text-[var(--text-main)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider text-purple-600 dark:text-purple-400">
              OiO Creative Academy
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30">
              Admin Portal
            </span>
          </div>
          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[var(--text-main)] mt-1">
            Academy Management
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
            Manage student enrollments, Google Meet links, session recordings, and notices.
          </p>
        </div>

        {/* Status Toast */}
        {actionStatus && (
          <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionStatus}</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] overflow-x-auto pb-2 text-xs sm:text-sm font-semibold">
        <button
          onClick={() => setActiveTab("students")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
            activeTab === "students"
              ? "bg-[var(--accent-orange)] text-white shadow-xs"
              : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Students ({students.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("classes")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
            activeTab === "classes"
              ? "bg-[var(--accent-orange)] text-white shadow-xs"
              : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Live Classes ({classes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("recordings")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
            activeTab === "recordings"
              ? "bg-[var(--accent-orange)] text-white shadow-xs"
              : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Recordings ({recordings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("materials")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
            activeTab === "materials"
              ? "bg-[var(--accent-orange)] text-white shadow-xs"
              : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
          }`}
        >
          <FolderDown className="w-4 h-4" />
          <span>Materials ({materials.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("announcements")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
            activeTab === "announcements"
              ? "bg-[var(--accent-orange)] text-white shadow-xs"
              : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>Announcements ({announcements.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("payments")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
            activeTab === "payments"
              ? "bg-[var(--accent-orange)] text-white shadow-xs"
              : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Payments ({payments.length})</span>
        </button>
      </div>

      {/* 1. STUDENTS TAB */}
      {activeTab === "students" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-[var(--text-light)]" />
              <input
                type="text"
                placeholder="Search students by name, email, WhatsApp, or ref..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs sm:text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-orange)]"
              />
            </div>
            <div className="text-xs text-[var(--text-muted)]">
              Total registered: <strong>{students.length}</strong> • Enrolled:{" "}
              <strong>{students.filter((s) => s.enrollmentStatus === "enrolled").length}</strong>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-x-auto shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--bg-surface-subtle)] border-b border-[var(--border-subtle)] text-[var(--text-muted)] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Student</th>
                  <th className="p-3.5">WhatsApp</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Payment Ref / Notes</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-[var(--text-muted)]">
                      No students found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s) => (
                    <tr key={s.uid} className="hover:bg-[var(--bg-surface-subtle)]/50 transition-colors">
                      <td className="p-3.5 space-y-0.5">
                        <div className="font-bold text-[var(--text-main)] flex items-center gap-1.5">
                          <span>{s.displayName || "Anonymous"}</span>
                          {s.role === "admin" && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] bg-purple-500/20 text-purple-700 dark:text-purple-300 font-bold">
                              Admin
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[var(--text-light)]">{s.email}</div>
                      </td>

                      <td className="p-3.5 font-mono">
                        {s.whatsapp ? (
                          <a
                            href={`https://wa.me/${s.whatsapp.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
                          >
                            <span>{s.whatsapp}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-[var(--text-light)] italic">Not set</span>
                        )}
                      </td>

                      <td className="p-3.5">
                        {s.enrollmentStatus === "enrolled" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Enrolled</span>
                          </span>
                        ) : s.enrollmentStatus === "rejected" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-500/15 text-red-700 dark:text-red-400">
                            <XCircle className="w-3 h-3" />
                            <span>Rejected</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400">
                            <span>Pending</span>
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 text-[var(--text-muted)] max-w-xs truncate">
                        {s.notes || <span className="text-[var(--text-light)] italic">—</span>}
                      </td>

                      <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                        {s.enrollmentStatus !== "enrolled" ? (
                          <button
                            onClick={() => handleUpdateEnrollment(s.uid, "enrolled")}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                          >
                            Approve & Enroll
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpdateEnrollment(s.uid, "pending")}
                            className="px-2.5 py-1 rounded-lg text-xs font-medium border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-amber-600 transition-colors"
                          >
                            Mark Pending
                          </button>
                        )}

                        <button
                          onClick={() => handleToggleAdminRole(s.uid, s.role)}
                          className="px-2 py-1 rounded-lg text-xs border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-purple-600"
                          title="Toggle Admin Role"
                        >
                          {s.role === "admin" ? "Demote" : "Make Admin"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. CLASSES TAB */}
      {activeTab === "classes" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-serif text-lg font-bold">Class Sessions & Google Meet Links</h3>
              <p className="text-xs text-[var(--text-muted)]">
                Each session has its own unique Google Meet link and optional YouTube stream.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {classes.length === 0 && (
                <button
                  onClick={handleSeedNovemberCurriculum}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Seed November 2026 Schedule</span>
                </button>
              )}
              <button
                onClick={() => {
                  setEditingClass(null);
                  setClassForm({
                    title: "",
                    description: "",
                    date: "2026-11-07",
                    startTime: "19:00",
                    endTime: "21:00",
                    meetUrl: "https://meet.google.com/xyz-abcd-efg",
                    youtubeLiveId: "",
                    instructorNote: "",
                    order: classes.length + 1,
                  });
                  setIsClassModalOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[var(--accent-orange)] text-white hover:bg-[var(--accent-orange-hover)] transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Class Session</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {classes.map((cls) => (
              <div
                key={cls.id}
                className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent-orange)]">
                      Session 0{cls.order}
                    </span>
                    <span className="text-xs font-medium text-[var(--text-light)]">
                      {cls.date} • {cls.startTime}–{cls.endTime} WAT
                    </span>
                  </div>

                  <h4 className="font-serif text-base font-bold text-[var(--text-main)]">
                    {cls.title}
                  </h4>
                  <p className="text-xs text-[var(--text-muted)] line-clamp-2">
                    {cls.description}
                  </p>

                  <div className="pt-2 space-y-1 text-xs">
                    <div className="font-mono text-[11px] text-[var(--text-muted)] truncate bg-[var(--bg-surface-subtle)] p-2 rounded-lg border border-[var(--border-subtle)] flex items-center justify-between">
                      <span className="truncate">{cls.meetUrl}</span>
                      <a
                        href={cls.meetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--accent-orange)] hover:underline shrink-0 ml-2"
                      >
                        Test Link
                      </a>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-end gap-2">
                  <button
                    onClick={() => {
                      setEditingClass(cls);
                      setClassForm({
                        title: cls.title,
                        description: cls.description || "",
                        date: cls.date,
                        startTime: cls.startTime,
                        endTime: cls.endTime,
                        meetUrl: cls.meetUrl,
                        youtubeLiveId: cls.youtubeLiveId || "",
                        instructorNote: cls.instructorNote || "",
                        order: cls.order,
                      });
                      setIsClassModalOpen(true);
                    }}
                    className="p-2 rounded-lg border border-[var(--border-subtle)] hover:border-[var(--accent-orange)] text-[var(--text-main)]"
                    title="Edit Session"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteClass(cls.id)}
                    className="p-2 rounded-lg border border-red-500/20 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                    title="Delete Session"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. RECORDINGS TAB */}
      {activeTab === "recordings" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg font-bold">Session Recordings</h3>
              <p className="text-xs text-[var(--text-muted)]">
                Archive past lessons for enrolled students.
              </p>
            </div>
            <button
              onClick={() => setIsRecordingModalOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[var(--accent-orange)] text-white hover:bg-[var(--accent-orange-hover)] transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Recording</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recordings.map((rec) => (
              <div
                key={rec.id}
                className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[var(--accent-orange)]">Lesson 0{rec.order}</span>
                    <span className="text-[var(--text-light)]">{rec.sessionDate}</span>
                  </div>
                  <h4 className="font-serif text-base font-bold text-[var(--text-main)]">
                    {rec.title}
                  </h4>
                  <p className="text-xs text-[var(--text-muted)] line-clamp-2">{rec.summary}</p>
                  <div className="text-[11px] font-mono text-[var(--text-light)]">
                    YouTube ID: {rec.youtubeId}
                  </div>
                </div>

                <div className="pt-2 border-t border-[var(--border-subtle)] flex justify-end">
                  <button
                    onClick={() => handleDeleteRecording(rec.id)}
                    className="p-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. MATERIALS TAB */}
      {activeTab === "materials" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg font-bold">Materials & File Downloads</h3>
              <p className="text-xs text-[var(--text-muted)]">
                Attach practice footage packages, cheat sheets, and sound effects.
              </p>
            </div>
            <button
              onClick={() => setIsMaterialModalOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[var(--accent-orange)] text-white hover:bg-[var(--accent-orange-hover)] transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Resource / File</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {materials.map((mat) => (
              <div
                key={mat.id}
                className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[var(--accent-orange)]">{mat.category}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--bg-surface-subtle)]">
                      {mat.fileType}
                    </span>
                  </div>
                  <h4 className="font-serif text-base font-bold text-[var(--text-main)]">
                    {mat.title}
                  </h4>
                  <p className="text-xs text-[var(--text-muted)]">{mat.description}</p>
                </div>

                <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between">
                  <a
                    href={mat.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-[var(--accent-orange)] hover:underline flex items-center gap-1"
                  >
                    <span>Open link</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    onClick={() => handleDeleteMaterial(mat.id)}
                    className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. ANNOUNCEMENTS TAB */}
      {activeTab === "announcements" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg font-bold">Student Announcements</h3>
              <p className="text-xs text-[var(--text-muted)]">
                Notices displayed on the dashboard for all registered students.
              </p>
            </div>
            <button
              onClick={() => setIsAnnouncementModalOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[var(--accent-orange)] text-white hover:bg-[var(--accent-orange-hover)] transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Post Announcement</span>
            </button>
          </div>

          <div className="space-y-3">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        ann.priority === "urgent"
                          ? "bg-red-500/15 text-red-700 dark:text-red-400"
                          : "bg-[var(--accent-orange-soft)] text-[var(--accent-orange)]"
                      }`}
                    >
                      {ann.priority.toUpperCase()}
                    </span>
                    <span className="text-xs text-[var(--text-light)]">
                      {new Date(ann.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="font-serif text-base font-bold text-[var(--text-main)]">
                    {ann.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                    {ann.content}
                  </p>
                </div>

                <button
                  onClick={() => handleDeleteAnnouncement(ann.id)}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. PAYMENTS AUDIT TAB */}
      {activeTab === "payments" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg font-bold">Payments Audit Log</h3>
              <p className="text-xs text-[var(--text-muted)]">
                Record of manual transfer references and Paystack transaction entries.
              </p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)]">
              Mode: {ACADEMY_CONFIG.PAYMENT_MODE}
            </span>
          </div>

          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-x-auto shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--bg-surface-subtle)] border-b border-[var(--border-subtle)] text-[var(--text-muted)] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Student</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Mode</th>
                  <th className="p-3.5">Reference</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-[var(--text-muted)]">
                      No payment records received yet.
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p.id} className="hover:bg-[var(--bg-surface-subtle)]/50">
                      <td className="p-3.5 space-y-0.5">
                        <div className="font-bold text-[var(--text-main)]">{p.userName}</div>
                        <div className="text-[11px] text-[var(--text-light)]">{p.userEmail}</div>
                      </td>
                      <td className="p-3.5 font-bold text-[var(--text-main)]">
                        {formatNaira(p.amountNaira)}
                      </td>
                      <td className="p-3.5 uppercase font-semibold text-[10px] text-[var(--text-light)]">
                        {p.mode}
                      </td>
                      <td className="p-3.5 font-mono text-xs font-bold text-[var(--text-main)]">
                        {p.reference}
                        {p.notes && (
                          <div className="text-[10px] font-normal text-[var(--text-muted)]">
                            {p.notes}
                          </div>
                        )}
                      </td>
                      <td className="p-3.5 text-[var(--text-light)]">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CLASS SESSION MODAL */}
      {isClassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-serif text-xl font-bold">
              {editingClass ? "Edit Class Session" : "Create New Class Session"}
            </h3>

            <form onSubmit={handleSaveClass} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold mb-1">Session Title</label>
                <input
                  type="text"
                  required
                  value={classForm.title}
                  onChange={(e) => setClassForm({ ...classForm, title: e.target.value })}
                  placeholder="e.g. Cutting and Pacing: Finding The Narrative Rhythm"
                  className="w-full px-3 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-orange)]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={classForm.description}
                  onChange={(e) => setClassForm({ ...classForm, description: e.target.value })}
                  placeholder="What students will learn in this session..."
                  className="w-full px-3 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-orange)]"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={classForm.date}
                    onChange={(e) => setClassForm({ ...classForm, date: e.target.value })}
                    className="w-full px-2 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] text-[var(--text-main)]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Start Time (WAT)</label>
                  <input
                    type="text"
                    required
                    value={classForm.startTime}
                    onChange={(e) => setClassForm({ ...classForm, startTime: e.target.value })}
                    placeholder="19:00"
                    className="w-full px-2 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] text-[var(--text-main)]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">End Time (WAT)</label>
                  <input
                    type="text"
                    required
                    value={classForm.endTime}
                    onChange={(e) => setClassForm({ ...classForm, endTime: e.target.value })}
                    placeholder="21:00"
                    className="w-full px-2 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] text-[var(--text-main)]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Dedicated Google Meet URL</label>
                <input
                  type="url"
                  required
                  value={classForm.meetUrl}
                  onChange={(e) => setClassForm({ ...classForm, meetUrl: e.target.value })}
                  placeholder="https://meet.google.com/abc-defg-hij"
                  className="w-full px-3 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-orange)] font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Optional YouTube Live Video ID</label>
                <input
                  type="text"
                  value={classForm.youtubeLiveId}
                  onChange={(e) => setClassForm({ ...classForm, youtubeLiveId: e.target.value })}
                  placeholder="Optional YouTube live ID"
                  className="w-full px-3 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] text-[var(--text-main)] font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Instructor Note</label>
                <input
                  type="text"
                  value={classForm.instructorNote}
                  onChange={(e) => setClassForm({ ...classForm, instructorNote: e.target.value })}
                  placeholder="e.g. Download lesson footage before class start."
                  className="w-full px-3 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] text-[var(--text-main)]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Sequence Order Number</label>
                <input
                  type="number"
                  required
                  value={classForm.order}
                  onChange={(e) => setClassForm({ ...classForm, order: Number(e.target.value) })}
                  className="w-24 px-3 py-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] text-[var(--text-main)]"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsClassModalOpen(false);
                    setEditingClass(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-[var(--border-subtle)] text-[var(--text-muted)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold bg-[var(--accent-orange)] text-white hover:bg-[var(--accent-orange-hover)]"
                >
                  Save Class Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORDING MODAL */}
      {isRecordingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 space-y-4">
            <h3 className="font-serif text-xl font-bold">Add Class Recording</h3>
            <form onSubmit={handleSaveRecording} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold mb-1">Recording Title</label>
                <input
                  type="text"
                  required
                  value={recForm.title}
                  onChange={(e) => setRecForm({ ...recForm, title: e.target.value })}
                  placeholder="e.g. Session 1: Pacing and Timeline Assembly"
                  className="w-full px-3 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] text-[var(--text-main)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Session Date</label>
                  <input
                    type="text"
                    required
                    value={recForm.sessionDate}
                    onChange={(e) => setRecForm({ ...recForm, sessionDate: e.target.value })}
                    placeholder="Nov 7, 2026"
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] text-[var(--text-main)]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Duration</label>
                  <input
                    type="text"
                    value={recForm.duration}
                    onChange={(e) => setRecForm({ ...recForm, duration: e.target.value })}
                    placeholder="1h 45m"
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] text-[var(--text-main)]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">YouTube Video ID</label>
                <input
                  type="text"
                  required
                  value={recForm.youtubeId}
                  onChange={(e) => setRecForm({ ...recForm, youtubeId: e.target.value })}
                  placeholder="e.g. dQw4w9WgXcQ (from unlisted video URL)"
                  className="w-full px-3 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] text-[var(--text-main)] font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Summary / Key Takeaways</label>
                <textarea
                  rows={3}
                  value={recForm.summary}
                  onChange={(e) => setRecForm({ ...recForm, summary: e.target.value })}
                  placeholder="Topics covered, timestamps, and key points..."
                  className="w-full px-3 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] text-[var(--text-main)]"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRecordingModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--border-subtle)] text-[var(--text-muted)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold bg-[var(--accent-orange)] text-white hover:bg-[var(--accent-orange-hover)]"
                >
                  Publish Recording
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MATERIAL MODAL */}
      {isMaterialModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 space-y-4">
            <h3 className="font-serif text-xl font-bold">Add Course Material or Download</h3>
            <form onSubmit={handleSaveMaterial} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold mb-1">Resource Title</label>
                <input
                  type="text"
                  required
                  value={matForm.title}
                  onChange={(e) => setMatForm({ ...matForm, title: e.target.value })}
                  placeholder="e.g. Commercial Raw Footage Pack A (4K & Proxies)"
                  className="w-full px-3 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] text-[var(--text-main)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Category</label>
                  <select
                    value={matForm.category}
                    onChange={(e) => setMatForm({ ...matForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] text-[var(--text-main)]"
                  >
                    <option value="Footage">Footage</option>
                    <option value="Audio">Audio</option>
                    <option value="Presets">Presets</option>
                    <option value="Cheatsheet">Cheatsheet</option>
                    <option value="Software">Software</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">File Format Badge</label>
                  <input
                    type="text"
                    required
                    value={matForm.fileType}
                    onChange={(e) => setMatForm({ ...matForm, fileType: e.target.value })}
                    placeholder="ZIP / PDF / Drive"
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] text-[var(--text-main)] uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Download / Cloud Drive URL</label>
                <input
                  type="url"
                  required
                  value={matForm.url}
                  onChange={(e) => setMatForm({ ...matForm, url: e.target.value })}
                  placeholder="https://drive.google.com/... or download URL"
                  className="w-full px-3 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] text-[var(--text-main)] font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Description</label>
                <input
                  type="text"
                  value={matForm.description}
                  onChange={(e) => setMatForm({ ...matForm, description: e.target.value })}
                  placeholder="What is inside this file?"
                  className="w-full px-3 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] text-[var(--text-main)]"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsMaterialModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--border-subtle)] text-[var(--text-muted)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold bg-[var(--accent-orange)] text-white hover:bg-[var(--accent-orange-hover)]"
                >
                  Save Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ANNOUNCEMENT MODAL */}
      {isAnnouncementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 space-y-4">
            <h3 className="font-serif text-xl font-bold">Broadcast Announcement</h3>
            <form onSubmit={handleSaveAnnouncement} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={annForm.title}
                  onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })}
                  placeholder="e.g. Schedule Update for Sunday Session"
                  className="w-full px-3 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] text-[var(--text-main)]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Message Content</label>
                <textarea
                  rows={4}
                  required
                  value={annForm.content}
                  onChange={(e) => setAnnForm({ ...annForm, content: e.target.value })}
                  placeholder="Write clear message for students..."
                  className="w-full px-3 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] text-[var(--text-main)]"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="urgentToggle"
                  checked={annForm.priority === "urgent"}
                  onChange={(e) =>
                    setAnnForm({ ...annForm, priority: e.target.checked ? "urgent" : "normal" })
                  }
                  className="rounded text-[var(--accent-orange)]"
                />
                <label htmlFor="urgentToggle" className="text-xs font-semibold cursor-pointer">
                  Mark as Urgent Alert (Highlighted in Red)
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAnnouncementModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--border-subtle)] text-[var(--text-muted)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold bg-[var(--accent-orange)] text-white hover:bg-[var(--accent-orange-hover)]"
                >
                  Broadcast Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
