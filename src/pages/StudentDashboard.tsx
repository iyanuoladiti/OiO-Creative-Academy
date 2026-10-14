import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { ClassSession, Recording, Announcement } from "../types";
import { ACADEMY_CONFIG } from "../config";
import { YouTubeLite } from "../components/YouTubeLite";
import {
  Calendar,
  Clock,
  Video,
  Copy,
  Check,
  ExternalLink,
  BookOpen,
  FolderDown,
  Megaphone,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Trophy,
  CheckCircle2,
  Circle,
  Smartphone,
  Laptop,
} from "lucide-react";

interface StudentDashboardProps {
  onNavigate: (tab: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigate }) => {
  const { user, profile } = useAuth();
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [now, setNow] = useState<Date>(new Date());

  // Personal completed days checklist (stored in localStorage per student)
  const [completedDays, setCompletedDays] = useState<number[]>(() => {
    if (!user) return [];
    try {
      const saved = localStorage.getItem(`oio_progress_${user.uid}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleDayCheck = (dayNum: number) => {
    if (!user) return;
    const updated = completedDays.includes(dayNum)
      ? completedDays.filter((d) => d !== dayNum)
      : [...completedDays, dayNum];
    setCompletedDays(updated);
    try {
      localStorage.setItem(`oio_progress_${user.uid}`, JSON.stringify(updated));
    } catch {
      // Ignore localStorage errors
    }
  };

  // Update clock every 10 seconds for countdown
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  // Fetch live classes
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "classes"), orderBy("order", "asc"));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ClassSession[];
        setClasses(items);
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, "classes");
      }
    );
    return () => unsub();
  }, [user]);

  // Fetch recordings
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "recordings"), orderBy("order", "desc"), limit(2));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Recording[];
        setRecordings(items);
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, "recordings");
      }
    );
    return () => unsub();
  }, [user]);

  // Fetch announcements
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"), limit(3));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Announcement[];
        setAnnouncements(items);
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, "announcements");
      }
    );
    return () => unsub();
  }, [user]);

  // Next class session (first session that is not completed)
  const isClassPast = (cls: ClassSession) => {
    try {
      const endDateTime = new Date(`${cls.date}T${cls.endTime}:00+01:00`);
      return !isNaN(endDateTime.getTime()) && now > endDateTime;
    } catch {
      return false;
    }
  };

  const upcomingClasses = classes.filter((c) => !isClassPast(c));
  const nextClass = upcomingClasses.length > 0 ? upcomingClasses[0] : classes[0] || null;

  // Calculate Course Progress Percentage
  // Total sessions: classes length if scheduled, or fallback to 5 syllabus days
  const totalSessionsCount = Math.max(classes.length, ACADEMY_CONFIG.SYLLABUS_DAYS.length);
  
  // Calculate completed: based on past sessions OR student checkoffs OR past recordings
  const pastSessionsCount = classes.filter((c) => isClassPast(c) || c.status === "completed").length;
  const effectiveCompletedCount = Math.max(pastSessionsCount, completedDays.length);
  const completionPercentage = Math.min(
    100,
    Math.round((effectiveCompletedCount / totalSessionsCount) * 100)
  );

  const getProgressLabel = (pct: number) => {
    if (pct === 100) return "Masterclass Completed! Ready for Commercial Client Work";
    if (pct >= 80) return "Phase 4: Client Delivery, Portfolios & Export Mastery";
    if (pct >= 60) return "Phase 3: Keyframes, Overlays & Color Grading";
    if (pct >= 40) return "Phase 2: Text, Captions & High-Retention Reels";
    if (pct >= 20) return "Phase 1: Timeline Basics, Transitions & Audio";
    return "Course Starting Soon • Get CapCut installed on your phone or PC";
  };

  const copyMeetLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getSessionTimingState = (session: ClassSession | null) => {
    if (!session) return { isActive: false, countdownText: "No sessions scheduled", isPast: false };

    try {
      const startDateTime = new Date(`${session.date}T${session.startTime}:00+01:00`);
      const endDateTime = new Date(`${session.date}T${session.endTime}:00+01:00`);
      const fifteenMinsBefore = new Date(startDateTime.getTime() - 15 * 60 * 1000);

      if (isNaN(startDateTime.getTime())) {
        return { isActive: true, countdownText: `${session.date} • ${session.startTime} WAT`, isPast: false };
      }

      if (now >= fifteenMinsBefore && now <= endDateTime) {
        return { isActive: true, countdownText: "Class is Live Now!", isPast: false };
      }

      if (now > endDateTime) {
        return { isActive: false, countdownText: "Completed", isPast: true };
      }

      const diffMs = startDateTime.getTime() - now.getTime();
      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diffMs / (1000 * 60)) % 60);

      const countdownText = days > 0
        ? `${days}d ${hours}h until live`
        : `${hours}h ${minutes}m until live`;

      return { isActive: false, countdownText, isPast: false };
    } catch {
      return { isActive: true, countdownText: `${session.date} at ${session.startTime} WAT`, isPast: false };
    }
  };

  const nextClassTiming = getSessionTimingState(nextClass);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 text-[var(--text-main)]">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider text-[var(--accent-orange)]">
              Student Learning Portal
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
              Enrolled Student
            </span>
          </div>
          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[var(--text-main)] mt-1">
            Welcome back, {profile?.displayName?.split(" ")[0] || "Student"}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
            {ACADEMY_CONFIG.COURSE_NAME} • {ACADEMY_CONFIG.COURSE_DURATION}
          </p>
        </div>

        {/* CapCut format badge & WhatsApp */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-[11px] font-medium text-[var(--text-muted)]">
            <Smartphone className="w-3.5 h-3.5 text-[var(--accent-orange)]" />
            <span>Mobile</span>
            <span className="text-[var(--text-light)]">+</span>
            <Laptop className="w-3.5 h-3.5 text-[var(--accent-orange)]" />
            <span>PC</span>
          </div>
          <a
            href={`https://wa.me/${ACADEMY_CONFIG.WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs font-semibold text-[var(--text-main)] hover:border-emerald-600 flex items-center gap-1.5 transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>WhatsApp Study Group</span>
          </a>
        </div>
      </div>

      {/* Announcements Banner (if any) */}
      {announcements.length > 0 && (
        <div className="space-y-2">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className={`p-4 rounded-2xl border flex items-start gap-3 transition-colors ${
                ann.priority === "urgent"
                  ? "bg-red-500/10 border-red-500/30 text-red-900 dark:text-red-200"
                  : "bg-[var(--bg-surface-subtle)] border-[var(--border-subtle)] text-[var(--text-main)]"
              }`}
            >
              {ann.priority === "urgent" ? (
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              ) : (
                <Megaphone className="w-5 h-5 text-[var(--accent-orange)] shrink-0 mt-0.5" />
              )}
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-serif text-sm font-bold">{ann.title}</h4>
                  <span className="text-[10px] text-[var(--text-light)]">
                    {new Date(ann.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  {ann.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. COURSE PROGRESS INDICATOR CARD (NEW REQUIREMENT)                       */}
      {/* ========================================================================= */}
      <section className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[var(--accent-orange)]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent-orange)]">
                Course Completion Tracker
              </span>
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[var(--text-main)]">
              {completionPercentage}% of Masterclass Completed
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              {effectiveCompletedCount} of {totalSessionsCount} sessions completed • {getProgressLabel(completionPercentage)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-2xl sm:text-3xl font-serif font-bold text-[var(--accent-orange)]">
              {completionPercentage}%
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="w-full h-3 rounded-full bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] overflow-hidden p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[var(--accent-orange)] to-amber-500 transition-all duration-700 ease-out shadow-xs"
              style={{ width: `${Math.max(5, completionPercentage)}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[11px] text-[var(--text-light)]">
            <span>Day 1: Interface & Basics</span>
            <span>Day 3: Reels & Text</span>
            <span>Day 5: Client Portfolio</span>
          </div>
        </div>

        {/* 5-Day Curriculum Checklist & Sync */}
        <div className="pt-2 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)]">
              5-Day CapCut Modules Checklist:
            </h4>
            <span className="text-[11px] text-[var(--text-muted)]">
              Tap to track your practical exercises
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {ACADEMY_CONFIG.SYLLABUS_DAYS.map((item) => {
              const isChecked = completedDays.includes(item.day);
              // Check if matching class in firestore is past
              const matchingClass = classes.find((c) => c.order === item.day);
              const isSessionDone = matchingClass && isClassPast(matchingClass);
              const isDone = isChecked || isSessionDone;

              return (
                <div
                  key={item.day}
                  onClick={() => toggleDayCheck(item.day)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                    isDone
                      ? "bg-emerald-500/5 border-emerald-500/30 hover:border-emerald-500"
                      : "bg-[var(--bg-surface-subtle)] border-[var(--border-subtle)] hover:border-[var(--accent-orange)]"
                  }`}
                >
                  <button
                    type="button"
                    aria-label={`Toggle Day ${item.day}`}
                    className="mt-0.5 shrink-0"
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Circle className="w-5 h-5 text-[var(--text-light)]" />
                    )}
                  </button>

                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-serif text-xs font-bold text-[var(--text-main)]">
                        Day 0{item.day}: {item.title}
                      </span>
                      <span className="text-[10px] text-[var(--text-light)] font-medium">
                        90 mins
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)] line-clamp-1">
                      {item.goal}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. NEXT LIVE CLASS SPOTLIGHT CARD */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg font-bold flex items-center gap-2">
            <Video className="w-5 h-5 text-[var(--accent-orange)]" />
            <span>Next Live Class Session</span>
          </h3>
          <button
            onClick={() => onNavigate("classes")}
            className="text-xs font-semibold text-[var(--accent-orange)] hover:underline flex items-center gap-1"
          >
            <span>View All 5 Sessions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {nextClass ? (
          <div className="rounded-3xl border-2 border-[var(--accent-orange)]/40 bg-[var(--bg-surface)] p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-2 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-orange-soft)] text-[var(--accent-orange)] text-xs font-bold">
                  <Sparkles className="w-3 h-3" />
                  <span>Session 0{nextClass.order || 1} • 90 Minutes</span>
                </div>
                <h4 className="font-serif text-xl sm:text-2xl font-bold text-[var(--text-main)]">
                  {nextClass.title}
                </h4>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                  {nextClass.description || "Live hands-on screen demonstration in CapCut, mobile/PC timeline review, and guided practical editing."}
                </p>
              </div>

              {/* Timing badge & Countdown */}
              <div className="sm:text-right shrink-0">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-main)]">
                  <Clock className="w-3.5 h-3.5 text-[var(--accent-orange)]" />
                  <span>{nextClassTiming.countdownText}</span>
                </div>
                <p className="text-[11px] text-[var(--text-muted)] mt-1">
                  {nextClass.date} • {nextClass.startTime} – {nextClass.endTime} WAT
                </p>
              </div>
            </div>

            {/* Instructor Note */}
            {nextClass.instructorNote && (
              <div className="p-3.5 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-xs text-[var(--text-muted)] italic leading-relaxed">
                <strong>Instructor Note:</strong> {nextClass.instructorNote}
              </div>
            )}

            {/* Google Meet Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              {nextClass.meetUrl ? (
                <>
                  <a
                    href={nextClass.meetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full sm:flex-1 py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
                      nextClassTiming.isActive
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white animate-pulse"
                        : "bg-[var(--accent-orange)] hover:bg-[var(--accent-orange-hover)] text-white"
                    }`}
                  >
                    <Video className="w-4 h-4" />
                    <span>Join Google Meet Session</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  <button
                    onClick={() => copyMeetLink(nextClass.meetUrl, nextClass.id)}
                    className="w-full sm:w-auto py-3.5 px-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-subtle)] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    {copiedId === nextClass.id ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-600 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </>
              ) : (
                <div className="text-xs text-[var(--text-muted)] italic">
                  Google Meet link will be posted prior to class start.
                </div>
              )}
            </div>

            <p className="text-[11px] text-[var(--text-light)]">
              * Google Meet opens in a new tab. CapCut phone and PC users both edit live during the call.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-8 text-center space-y-2">
            <Calendar className="w-8 h-8 text-[var(--text-light)] mx-auto" />
            <h4 className="font-serif font-bold text-base">Class schedule being loaded</h4>
            <p className="text-xs text-[var(--text-muted)]">
              The 5 CapCut live sessions for November 2026 will appear here shortly.
            </p>
          </div>
        )}
      </section>

      {/* 3. RECENT RECORDINGS SECTION */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg font-bold flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[var(--accent-orange)]" />
            <span>Class Recordings & Replays</span>
          </h3>
          <button
            onClick={() => onNavigate("recordings")}
            className="text-xs font-semibold text-[var(--accent-orange)] hover:underline flex items-center gap-1"
          >
            <span>View All Recordings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recordings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recordings.map((rec) => (
              <div
                key={rec.id}
                className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden space-y-3 p-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <YouTubeLite videoId={rec.youtubeId} title={rec.title} />
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-[var(--text-light)]">
                      <span>{rec.sessionDate}</span>
                      {rec.duration && <span>{rec.duration}</span>}
                    </div>
                    <h4 className="font-serif text-base font-bold text-[var(--text-main)]">
                      {rec.title}
                    </h4>
                    <p className="text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed">
                      {rec.summary}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 text-center text-xs text-[var(--text-muted)] space-y-1">
            <p className="font-semibold text-[var(--text-main)]">No recordings uploaded yet</p>
            <p>Every 90-minute live class will be recorded and posted here within 2 hours of completion.</p>
          </div>
        )}
      </section>

      {/* 4. QUICK SHORTCUT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => onNavigate("materials")}
          className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--accent-orange)]/60 text-left transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-orange-soft)] text-[var(--accent-orange)] flex items-center justify-center">
              <FolderDown className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm text-[var(--text-main)]">
                CapCut Practice Footage & Audio Assets
              </h4>
              <p className="text-xs text-[var(--text-muted)]">
                Download raw video clips, SFX & preset packs
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[var(--text-muted)] group-hover:translate-x-1 group-hover:text-[var(--accent-orange)] transition-all" />
        </button>

        <button
          onClick={() => onNavigate("classes")}
          className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--accent-orange)]/60 text-left transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-orange-soft)] text-[var(--accent-orange)] flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm text-[var(--text-main)]">
                All 5 Class Dates & Google Meet Links
              </h4>
              <p className="text-xs text-[var(--text-muted)]">
                View 3-week schedule and timing in WAT
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[var(--text-muted)] group-hover:translate-x-1 group-hover:text-[var(--accent-orange)] transition-all" />
        </button>
      </div>
    </div>
  );
};
