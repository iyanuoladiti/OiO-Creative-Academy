import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  ACADEMY_CONFIG,
  formatNaira,
  getWhatsAppPaymentConfirmationLink,
} from "../config";
import {
  Clock,
  Building,
  Copy,
  Check,
  MessageCircle,
  ShieldCheck,
  AlertCircle,
  Video,
  Sparkles,
  Smartphone,
  Laptop,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Mail,
  Zap,
} from "lucide-react";

export const PendingScreen: React.FC = () => {
  const { user, profile, submitPaymentProof } = useAuth();
  const [copied, setCopied] = useState(false);
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedSyllabus, setExpandedSyllabus] = useState(true);

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(ACADEMY_CONFIG.MANUAL_PAYMENT.ACCOUNT_NUMBER);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reference.trim()) {
      setError("Please enter your transfer narration, reference number, or sender account name.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await submitPaymentProof(reference, notes, "manual");
      setSubmittedSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to record reference.");
    } finally {
      setSubmitting(false);
    }
  };

  const studentName = profile?.displayName || user?.displayName || "Student";
  const studentEmail = profile?.email || user?.email || "";

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 space-y-8 text-[var(--text-main)]">
      {/* Header Status */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 text-xs font-bold border border-amber-500/30">
          <Clock className="w-4 h-4 animate-spin text-amber-600 dark:text-amber-400" />
          <span>Step 2: Confirm Tuition to Unlock Dashboard</span>
        </div>

        <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[var(--text-main)]">
          Welcome, {studentName.split(" ")[0]}!
        </h2>
        <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-xl mx-auto leading-relaxed">
          Your student account is active. Review the 5-day CapCut Masterclass breakdown below and complete your payment to get full access to live Google Meet sessions and project files.
        </p>
      </div>

      {/* Course Selection & Pricing Card */}
      <div className="rounded-3xl border-2 border-[var(--accent-orange)] bg-[var(--bg-surface)] p-6 sm:p-8 space-y-6 shadow-md">
        {/* Selected Course Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[var(--border-subtle)] pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--accent-orange-soft)] text-[var(--accent-orange)] border border-[var(--accent-orange-border)]">
                Selected Course
              </span>
              <span className="text-xs text-[var(--text-muted)]">November 2026 Cohort</span>
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--text-main)]">
              {ACADEMY_CONFIG.COURSE_NAME}
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
              {ACADEMY_CONFIG.COURSE_DURATION}
            </p>
            <div className="flex items-center gap-2 pt-1 text-xs font-semibold text-[var(--text-main)]">
              <span className="flex items-center gap-1 text-[var(--accent-orange)]">
                <Smartphone className="w-3.5 h-3.5" /> Mobile
              </span>
              <span>&</span>
              <span className="flex items-center gap-1 text-[var(--accent-orange)]">
                <Laptop className="w-3.5 h-3.5" /> PC / Laptop
              </span>
              <span className="text-[var(--text-light)]">• Both Welcome in CapCut</span>
            </div>
          </div>

          {/* Pricing with Early-Bird Discount */}
          <div className="p-4 rounded-2xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] sm:text-right space-y-1 shrink-0">
            <div className="flex items-center sm:justify-end gap-2">
              <span className="text-xs text-[var(--text-light)] line-through font-semibold">
                {formatNaira(ACADEMY_CONFIG.STANDARD_FEE_NAIRA)}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                Save ₦25,000
              </span>
            </div>
            <div className="font-serif text-3xl font-bold text-[var(--accent-orange)]">
              {formatNaira(ACADEMY_CONFIG.COURSE_FEE_NAIRA)}
            </div>
            <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center sm:justify-end gap-1">
              <Zap className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />
              <span>November Discount for First 10 Students</span>
            </p>
          </div>
        </div>

        {/* Online Seats Note */}
        <div className="p-3.5 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] flex items-start gap-2.5 text-xs text-[var(--text-muted)] leading-relaxed">
          <Sparkles className="w-4 h-4 text-[var(--accent-orange)] shrink-0 mt-0.5" />
          <div>
            <strong>Interactive Online Live Training:</strong> Seats are not capped because live streaming accommodates everyone, but the <strong>₦20,000 promotional discount</strong> is reserved for the first 10 students.
          </div>
        </div>

        {/* 5-Day Curriculum Breakdown Toggle */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setExpandedSyllabus(!expandedSyllabus)}
            className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[var(--text-main)] hover:text-[var(--accent-orange)] transition-colors py-1"
          >
            <span>What You Will Learn in the 5 Classes (Click to {expandedSyllabus ? "Collapse" : "Expand"})</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                expandedSyllabus ? "rotate-180 text-[var(--accent-orange)]" : ""
              }`}
            />
          </button>

          {expandedSyllabus && (
            <div className="space-y-2.5 pt-1 text-xs animate-in fade-in duration-150">
              {ACADEMY_CONFIG.SYLLABUS_DAYS.map((day) => (
                <div
                  key={day.day}
                  className="p-3.5 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-bold text-sm text-[var(--text-main)]">
                      Day 0{day.day}: {day.title}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[var(--accent-orange-soft)] text-[var(--accent-orange)]">
                      {day.duration}
                    </span>
                  </div>
                  <p className="text-[var(--text-muted)] leading-relaxed">{day.goal}</p>
                  <div className="text-[11px] text-[var(--text-light)] italic pt-0.5">
                    <strong>Practical assignment:</strong> {day.assignment}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Official Bank Transfer Details */}
        <div className="space-y-4 pt-2 border-t border-[var(--border-subtle)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-main)]">
              <Building className="w-4 h-4 text-[var(--accent-orange)]" />
              <span>Direct Bank Transfer Details</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-[var(--text-light)]">
              Corporate Account
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-muted)]">Company Name:</span>
              <span className="font-bold text-[var(--text-main)]">
                {ACADEMY_CONFIG.PARENT_COMPANY} <span className="text-xs text-[var(--text-light)] font-normal">({ACADEMY_CONFIG.COMPANY_RC})</span>
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-muted)]">Bank Name:</span>
              <span className="font-bold text-[var(--text-main)]">{ACADEMY_CONFIG.MANUAL_PAYMENT.BANK_NAME}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-[var(--border-subtle)]">
              <span className="text-[var(--text-muted)]">Account Number:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-bold text-[var(--text-main)] tracking-wider">
                  {ACADEMY_CONFIG.MANUAL_PAYMENT.ACCOUNT_NUMBER}
                </span>
                <button
                  type="button"
                  onClick={handleCopyAccount}
                  className="p-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--accent-orange)] transition-colors text-xs flex items-center gap-1"
                  title="Copy account number"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-[10px] text-emerald-600 font-bold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span className="text-[10px]">Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-[var(--border-subtle)] font-bold">
              <span className="text-[var(--text-muted)]">Tuition Amount:</span>
              <span className="text-base text-[var(--accent-orange)]">
                {formatNaira(ACADEMY_CONFIG.COURSE_FEE_NAIRA)}
              </span>
            </div>
          </div>

          <p className="text-xs text-[var(--text-muted)] italic leading-relaxed">
            Note: {ACADEMY_CONFIG.MANUAL_PAYMENT.NOTE}
          </p>
        </div>

        {/* Step to Submit Transfer Reference */}
        <div className="pt-4 border-t border-[var(--border-subtle)] space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-main)]">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Already Made the Transfer? Enter Your Reference to Notify Admin:</span>
          </div>

          {submittedSuccess ? (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm space-y-2">
              <div className="font-bold flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Payment Reference Recorded!</span>
              </div>
              <p className="leading-relaxed">
                Thank you! Our admin team has received your transfer reference. Once confirmed against our bank records, your student dashboard will be unlocked with Google Meet class links and footage packs.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmitProof} className="space-y-3">
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[var(--text-main)] mb-1">
                  Bank Transfer Reference / Sender Account Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tunde Adeyemi (Access Bank) or Session ID: 0902..."
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] text-xs sm:text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-orange)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-main)] mb-1">
                  Additional Note (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Paid ₦20,000 for November early-bird discount tier"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] text-xs sm:text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-orange)]"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-[var(--accent-orange)] text-white hover:bg-[var(--accent-orange-hover)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
              >
                {submitting ? "Submitting..." : "Submit Payment Reference"}
              </button>
            </form>
          )}

          {/* Quick WhatsApp Notification Button */}
          <div className="pt-2">
            <a
              href={getWhatsAppPaymentConfirmationLink(studentName, studentEmail, reference)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Confirm on WhatsApp with Transfer Receipt (+{ACADEMY_CONFIG.WHATSAPP_NUMBER})</span>
            </a>
          </div>
        </div>
      </div>

      {/* Contact and Legal info */}
      <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 space-y-3 text-xs sm:text-sm">
        <h4 className="font-serif font-bold text-sm sm:text-base text-[var(--text-main)]">
          Need Help or Have Questions?
        </h4>
        <p className="text-[var(--text-muted)] leading-relaxed">
          Our team is available to assist you with CapCut installation, registration, and confirmation.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 pt-1 text-xs text-[var(--text-main)]">
          <div className="flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-[var(--accent-orange)]" />
            <span>Email: <strong>{ACADEMY_CONFIG.OFFICIAL_EMAIL}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>WhatsApp: <strong>+{ACADEMY_CONFIG.WHATSAPP_NUMBER}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
