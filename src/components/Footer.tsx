import React from "react";
import { ACADEMY_CONFIG, getWhatsAppRegistrationLink } from "../config";
import { OiOLogo } from "./OiOLogo";
import { MessageCircle, MapPin, Mail, ArrowUpRight } from "lucide-react";

export const Footer: React.FC<{ onOpenAuth: () => void }> = ({ onOpenAuth }) => {
  return (
    <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-muted)] py-12 px-4 sm:px-6 transition-colors">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand info */}
          <div className="space-y-4">
            <OiOLogo size="sm" />
            <p className="text-sm italic font-serif text-[var(--text-main)] opacity-90">
              "{ACADEMY_CONFIG.TAGLINE}"
            </p>
            <p className="text-xs leading-relaxed text-[var(--text-muted)]">
              OiO Creative Academy is a division of {ACADEMY_CONFIG.PARENT_COMPANY} ({ACADEMY_CONFIG.COMPANY_RC}).
              We teach practical creative skills directly from our commercial project experience.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] pt-1">
              <MapPin className="w-3.5 h-3.5 text-[var(--accent-orange)]" />
              <span>{ACADEMY_CONFIG.CITY_LOCATION}</span>
            </div>
          </div>

          {/* Quick links & Contact */}
          <div className="space-y-3">
            <h5 className="text-xs uppercase font-bold tracking-wider text-[var(--text-main)]">
              Reach Out Directly
            </h5>
            <p className="text-xs leading-relaxed">
              Have a question about CapCut requirements, payment, or the November 2026 schedule? Contact us directly:
            </p>
            <a
              href={getWhatsAppRegistrationLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-700/10 hover:bg-emerald-700/20 text-emerald-800 dark:text-emerald-400 text-xs font-semibold transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>WhatsApp: +{ACADEMY_CONFIG.WHATSAPP_NUMBER}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
            <div className="text-xs text-[var(--text-light)] flex items-center gap-1.5 pt-1">
              <Mail className="w-3.5 h-3.5" />
              <span>Email: {ACADEMY_CONFIG.OFFICIAL_EMAIL}</span>
            </div>
          </div>

          {/* Registration & Student portal */}
          <div className="space-y-3">
            <h5 className="text-xs uppercase font-bold tracking-wider text-[var(--text-main)]">
              Student Access
            </h5>
            <p className="text-xs leading-relaxed">
              Already registered for this cohort? Log in to join live sessions, download cheat sheets, and rewatch previous class recordings.
            </p>
            <button
              onClick={onOpenAuth}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-[var(--text-main)] hover:border-[var(--accent-orange)] transition-colors"
            >
              Sign In to Student Portal
            </button>
          </div>
        </div>

        <div className="pt-8 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-light)]">
          <p>
            © {new Date().getFullYear()} {ACADEMY_CONFIG.ACADEMY_NAME} • {ACADEMY_CONFIG.PARENT_COMPANY}. All rights reserved.
          </p>
          <p className="text-[11px]">
            Designed clearly. Built properly.
          </p>
        </div>
      </div>
    </footer>
  );
};
