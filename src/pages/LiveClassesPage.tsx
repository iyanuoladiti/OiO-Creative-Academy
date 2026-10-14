import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { ClassSession } from "../types";
import { YouTubeLite } from "../components/YouTubeLite";
import {
  Calendar,
  Clock,
  Video,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Info,
} from "lucide-react";

export const LiveClassesPage: React.FC = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "classes"), orderBy("order", "asc"));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as ClassSession[];
        setClasses(items);
        setLoading(false);
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, "classes");
        setLoading(false);
      }
    );
    return () => unsub();
  }, [user]);

  const copyMeetUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getSessionStatus = (session: ClassSession) => {
    try {
      const startDateTime = new Date(`${session.date}T${session.startTime}:00+01:00`);
      const endDateTime = new Date(`${session.date}T${session.endTime}:00+01:00`);
      const fifteenMinsBefore = new Date(startDateTime.getTime() - 15 * 60 * 1000);

      if (isNaN(startDateTime.getTime())) {
        return { label: "Scheduled", isLive: false, canJoin: true };
      }

      if (now >= fifteenMinsBefore && now <= endDateTime) {
        return { label: "Live Now", isLive: true, canJoin: true };
      }

      if (now > endDateTime) {
        return { label: "Completed", isLive: false, canJoin: false };
      }

      return { label: "Upcoming", isLive: false, canJoin: false };
    } catch {
      return { label: "Scheduled", isLive: false, canJoin: true };
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8 text-[var(--text-main)]">
      {/* Header */}
      <div className="space-y-2 border-b border-[var(--border-subtle)] pb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent-orange-soft)] text-[var(--accent-orange)] text-xs font-bold">
          <Calendar className="w-3.5 h-3.5" />
          <span>Cohort Live Schedule</span>
        </div>
        <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[var(--text-main)]">
          Live Classes on Google Meet
        </h2>
        <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-2xl leading-relaxed">
          5 live sessions across 3 weeks (90 minutes each). Each class has its own dedicated Google Meet link. The join button becomes active 15 minutes before the session starts and remains open until class ends (West Africa Time).
        </p>
      </div>

      {/* Note about Google Meet in new tab */}
      <div className="p-4 rounded-2xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] flex items-start gap-3 text-xs text-[var(--text-muted)] leading-relaxed">
        <Info className="w-4 h-4 text-[var(--accent-orange)] shrink-0 mt-0.5" />
        <div>
          <strong>Note on Google Meet:</strong> For security and browser microphone/camera permissions, Google Meet opens directly in a clean new browser tab.
        </div>
      </div>

      {/* Classes list */}
      {loading ? (
        <div className="text-center py-12 text-xs text-[var(--text-muted)]">
          Loading sessions...
        </div>
      ) : classes.length === 0 ? (
        <div className="p-8 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-center space-y-2">
          <Calendar className="w-8 h-8 text-[var(--text-light)] mx-auto" />
          <h4 className="font-serif font-bold text-base">Schedule is being confirmed</h4>
          <p className="text-xs text-[var(--text-muted)]">
            The full November 2026 class schedule with individual Google Meet links will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {classes.map((cls, idx) => {
            const status = getSessionStatus(cls);
            return (
              <div
                key={cls.id}
                className={`rounded-3xl border bg-[var(--bg-surface)] p-6 sm:p-8 space-y-5 transition-all ${
                  status.isLive
                    ? "border-emerald-500 shadow-md ring-2 ring-emerald-500/20"
                    : "border-[var(--border-subtle)] hover:border-[var(--border-strong)]"
                }`}
              >
                {/* Top session info */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent-orange)]">
                        Session 0{cls.order || idx + 1}
                      </span>
                      {status.isLive ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white animate-pulse">
                          ● Live Now
                        </span>
                      ) : status.label === "Completed" ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--bg-surface-subtle)] text-[var(--text-light)]">
                          Completed
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--accent-orange-soft)] text-[var(--accent-orange)]">
                          Scheduled
                        </span>
                      )}
                    </div>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-[var(--text-main)]">
                      {cls.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                      {cls.description}
                    </p>
                  </div>

                  {/* Timing block */}
                  <div className="p-3 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] shrink-0 sm:text-right space-y-0.5 text-xs">
                    <div className="flex items-center sm:justify-end gap-1.5 font-bold text-[var(--text-main)]">
                      <Calendar className="w-3.5 h-3.5 text-[var(--accent-orange)]" />
                      <span>{cls.date}</span>
                    </div>
                    <div className="flex items-center sm:justify-end gap-1.5 text-[var(--text-muted)]">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{cls.startTime} – {cls.endTime} (WAT)</span>
                    </div>
                  </div>
                </div>

                {/* Optional YouTube Live stream if instructor configured it */}
                {cls.youtubeLiveId && (
                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-bold text-[var(--accent-orange)] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Optional YouTube Live Broadcast</span>
                    </span>
                    <YouTubeLite videoId={cls.youtubeLiveId} title={`${cls.title} Live Stream`} />
                  </div>
                )}

                {/* Instructor note */}
                {cls.instructorNote && (
                  <div className="p-3.5 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-xs text-[var(--text-muted)] leading-relaxed">
                    <span className="font-bold text-[var(--text-main)]">Instructor Note: </span>
                    {cls.instructorNote}
                  </div>
                )}

                {/* Google Meet Link Section */}
                <div className="pt-2 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center gap-3">
                  {cls.meetUrl ? (
                    <>
                      <a
                        href={cls.meetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`w-full sm:flex-1 py-3 px-5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all ${
                          status.isLive
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                            : "bg-[var(--accent-orange)] hover:bg-[var(--accent-orange-hover)] text-white"
                        }`}
                      >
                        <Video className="w-4 h-4" />
                        <span>Join Session on Google Meet</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>

                      <button
                        onClick={() => copyMeetUrl(cls.meetUrl, cls.id)}
                        className="w-full sm:w-auto py-3 px-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-subtle)] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        {copiedId === cls.id ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-600" />
                            <span className="text-emerald-600 font-bold">Link Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span>Copy Meet Link</span>
                          </>
                        )}
                      </button>
                    </>
                  ) : (
                    <p className="text-xs text-[var(--text-muted)] italic">
                      Google Meet link will be generated for this session.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
