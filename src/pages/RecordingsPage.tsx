import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { Recording } from "../types";
import { YouTubeLite } from "../components/YouTubeLite";
import { BookOpen, Calendar, Clock, FileText, ExternalLink, Download, ArrowLeft } from "lucide-react";

interface RecordingsPageProps {
  onBack?: () => void;
}

export const RecordingsPage: React.FC<RecordingsPageProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "recordings"), orderBy("order", "asc"));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Recording[];
        setRecordings(items);
        setLoading(false);
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, "recordings");
        setLoading(false);
      }
    );
    return () => unsub();
  }, [user]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 text-[var(--text-main)]">
      {onBack && (
        <div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-subtle)] text-xs font-semibold text-[var(--text-main)] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[var(--accent-orange)]" />
            <span>Back to Dashboard</span>
          </button>
        </div>
      )}

      {/* Header */}
      <div className="space-y-2 border-b border-[var(--border-subtle)] pb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent-orange-soft)] text-[var(--accent-orange)] text-xs font-bold">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Rewatch Archive</span>
        </div>
        <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[var(--text-main)]">
          Past Class Recordings
        </h2>
        <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-2xl leading-relaxed">
          Every live Google Meet lesson is archived here in high quality. You have unlimited rewatch access throughout the course and beyond.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-xs text-[var(--text-muted)]">
          Loading recordings...
        </div>
      ) : recordings.length === 0 ? (
        <div className="p-10 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-center space-y-3">
          <BookOpen className="w-10 h-10 text-[var(--text-light)] mx-auto" />
          <h3 className="font-serif font-bold text-lg text-[var(--text-main)]">
            Recordings will appear here after Lesson 1
          </h3>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-md mx-auto leading-relaxed">
            Classes kick off in November 2026. Each session recording will be processed and posted within 2 hours of live session completion.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {recordings.map((rec, idx) => (
            <div
              key={rec.id}
              className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 sm:p-8 space-y-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent-orange)]">
                    Lesson 0{rec.order || idx + 1}
                  </span>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-[var(--text-main)] mt-0.5">
                    {rec.title}
                  </h3>
                </div>
                <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[var(--accent-orange)]" />
                    <span>{rec.sessionDate}</span>
                  </div>
                  {rec.duration && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{rec.duration}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* YouTube video player */}
              <YouTubeLite videoId={rec.youtubeId} title={rec.title} />

              {/* Summary */}
              {rec.summary && (
                <div className="space-y-1.5 text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                  <h5 className="font-semibold text-[var(--text-main)]">Session Overview:</h5>
                  <p>{rec.summary}</p>
                </div>
              )}

              {/* Attached materials */}
              {rec.materials && rec.materials.length > 0 && (
                <div className="pt-3 border-t border-[var(--border-subtle)] space-y-2">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)]">
                    Lesson Downloads & Project Files
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {rec.materials.map((mat, mIdx) => (
                      <a
                        key={mIdx}
                        href={mat.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] hover:border-[var(--accent-orange)] text-xs font-medium flex items-center justify-between transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Download className="w-4 h-4 text-[var(--accent-orange)]" />
                          <span className="font-semibold text-[var(--text-main)]">{mat.title}</span>
                        </div>
                        <span className="text-[10px] uppercase font-bold text-[var(--text-light)]">
                          {mat.type}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
