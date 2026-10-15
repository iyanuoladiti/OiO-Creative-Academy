import React, { useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { ACADEMY_CONFIG } from "../config";
import { OiOLogo } from "../components/OiOLogo";
import {
  Award,
  Printer,
  Share2,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  Download,
  Sparkles,
} from "lucide-react";

interface CertificatePageProps {
  completedPercentage?: number;
}

export const CertificatePage: React.FC<CertificatePageProps> = ({
  completedPercentage = 100,
}) => {
  const { user, profile } = useAuth();
  const certRef = useRef<HTMLDivElement>(null);
  const [copiedToast, setCopiedToast] = useState(false);

  const studentName = profile?.displayName || user?.displayName || "Student Name";
  const certId = `OIO-CAPCUT-2026-${(user?.uid || "STU").slice(0, 6).toUpperCase()}`;
  const issueDate = "December 3, 2026";

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    const text = `I'm earning my CapCut Video Editing Masterclass Certificate at OiO Creative Academy (OiO DESIGNS AND ENGINEERING)!`;
    const url = window.location.origin;
    if (navigator.share) {
      navigator.share({ title: "CapCut Masterclass Certificate", text, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${text} ${url}`);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8 text-[var(--text-main)]">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-6 no-print">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent-orange-soft)] text-[var(--accent-orange)] text-xs font-bold">
            <Award className="w-3.5 h-3.5" />
            <span>Official Course Credential</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[var(--text-main)]">
            Certificate of Completion
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)]">
            Awarded upon completion of the 5-day CapCut Video Editing Masterclass curriculum.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl font-bold text-xs bg-[var(--accent-orange)] text-white hover:bg-[var(--accent-orange-hover)] transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF</span>
          </button>

          <button
            onClick={handleShare}
            className="px-3.5 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-subtle)] text-xs font-semibold text-[var(--text-main)] flex items-center gap-1.5 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Copy link toast feedback */}
      {copiedToast && (
        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 no-print animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Certificate verification link copied to clipboard!</span>
        </div>
      )}

      {/* Progress check warning if not yet 100% */}
      {completedPercentage < 100 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-3 no-print">
          <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
          <div className="space-y-0.5">
            <div className="font-bold">Student Credential Preview ({completedPercentage}% Completed)</div>
            <p className="text-[11px] leading-relaxed">
              Complete all 5 live classes and practical assignments across the 3 weeks to earn your verified graduation seal.
            </p>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* THE OFFICIAL CERTIFICATE CANVAS (Print optimized)                    */}
      {/* =================================================================== */}
      <div
        ref={certRef}
        className="certificate-container relative w-full aspect-[1.414/1] bg-[#ffffff] text-[#1b1815] p-6 sm:p-12 rounded-3xl border-8 border-double border-[#e5ded4] shadow-2xl overflow-hidden flex flex-col justify-between select-none"
        style={{
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        }}
      >
        {/* Decorative corner borders */}
        <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-[#FF5800]" />
        <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-[#FF5800]" />
        <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-[#FF5800]" />
        <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-[#FF5800]" />

        {/* Certificate Top Header */}
        <div className="text-center space-y-3 pt-2">
          <div className="flex justify-center">
            <OiOLogo size="md" />
          </div>

          <div className="space-y-1">
            <div className="text-[10px] sm:text-xs font-bold tracking-[0.25em] uppercase text-[#e8590c]">
              OiO Creative Academy
            </div>
            <h1 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight text-[#1b1815] uppercase">
              Certificate of Completion
            </h1>
            <div className="text-[11px] sm:text-xs font-semibold tracking-wider text-[#6b635b] uppercase">
              CapCut Video Editing Masterclass
            </div>
          </div>
        </div>

        {/* Recipient Details */}
        <div className="text-center space-y-4 my-auto px-4">
          <p className="text-xs sm:text-sm italic text-[#5e574f] font-serif">
            This certificate is proudly presented to
          </p>

          <div className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold text-[#1b1815] pb-2 border-b-2 border-[#cfc4b6] max-w-lg mx-auto">
            {studentName}
          </div>

          <p className="text-xs sm:text-sm text-[#4a443d] max-w-xl mx-auto leading-relaxed">
            for successfully completing the five-day practical training course in video editing, audio mixing, captions, keyframe animations, effects, color correction, and social media export.
          </p>
        </div>

        {/* Bottom Signatures & Seal */}
        <div className="pt-6 border-t border-[#e5ded4] flex items-end justify-between text-left text-xs text-[#5e574f]">
          {/* Trainer Signature */}
          <div className="space-y-1">
            <div className="font-serif text-base font-bold italic text-[#1b1815]">
              Oladiti Iyanu
            </div>
            <div className="w-36 h-0.5 bg-[#cfc4b6]" />
            <div className="text-[10px] font-semibold text-[#1b1815]">Instructor's Signature</div>
            <div className="text-[9px] text-[#877f76]">OiO Creative Academy</div>
          </div>

          {/* Golden / Orange Verified Seal */}
          <div className="text-center flex flex-col items-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-double border-[#FF5800] bg-orange-50 text-[#FF5800] flex flex-col items-center justify-center p-1 shadow-inner">
              <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7" />
              <span className="text-[8px] font-bold uppercase tracking-wider mt-0.5">Verified</span>
            </div>
            <span className="text-[9px] font-mono text-[#877f76] mt-1">{certId}</span>
          </div>

          {/* Corporate Accreditation */}
          <div className="text-right space-y-1">
            <div className="font-serif text-sm font-bold text-[#1b1815]">
              {issueDate}
            </div>
            <div className="w-36 h-0.5 bg-[#cfc4b6] ml-auto" />
            <div className="text-[10px] font-semibold text-[#1b1815]">Date Awarded</div>
            <div className="text-[9px] text-[#877f76]">
              {ACADEMY_CONFIG.PARENT_COMPANY} ({ACADEMY_CONFIG.COMPANY_RC})
            </div>
          </div>
        </div>

        {/* Disclaimer footer from teacher manual */}
        <div className="text-center text-[9px] text-[#877f76] pt-2">
          Certificate of course completion; not an official CapCut certification.
        </div>
      </div>

      {/* Print Stylesheet */}
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          .no-print, header, footer {
            display: none !important;
          }
          .certificate-container {
            border: 4px solid #FF5800 !important;
            box-shadow: none !important;
            page-break-inside: avoid;
            margin: 0 auto;
          }
        }
      `}</style>
    </div>
  );
};
