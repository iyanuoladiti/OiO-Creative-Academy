import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { ACADEMY_CONFIG, formatNaira } from "../config";
import { updatePassword } from "firebase/auth";
import {
  User,
  Phone,
  Mail,
  Lock,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Save,
  LogOut,
} from "lucide-react";

export const ProfilePage: React.FC = () => {
  const { user, profile, isAdmin, updateContactInfo, logout } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.displayName || user?.displayName || "");
  const [whatsapp, setWhatsapp] = useState(profile?.whatsapp || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPass, setChangingPass] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [passMsg, setPassMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    setSavingProfile(true);
    try {
      await updateContactInfo(whatsapp, displayName);
      setProfileMsg({ type: "success", text: "Contact details updated successfully." });
    } catch (err: unknown) {
      setProfileMsg({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to update profile.",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMsg(null);
    if (!user) return;
    if (newPassword.length < 6) {
      setPassMsg({ type: "error", text: "New password must be at least 6 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassMsg({ type: "error", text: "Passwords do not match." });
      return;
    }
    setChangingPass(true);
    try {
      await updatePassword(user, newPassword);
      setPassMsg({ type: "success", text: "Password changed successfully." });
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to change password.";
      if (msg.includes("requires-recent-login")) {
        setPassMsg({
          type: "error",
          text: "For security, please log out and sign back in before changing your password.",
        });
      } else {
        setPassMsg({ type: "error", text: msg });
      }
    } finally {
      setChangingPass(false);
    }
  };

  const enrollmentStatus = profile?.enrollmentStatus || "pending";

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-8 text-[var(--text-main)]">
      {/* Header */}
      <div className="space-y-2 border-b border-[var(--border-subtle)] pb-6">
        <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[var(--text-main)]">
          My Account & Settings
        </h2>
        <p className="text-xs sm:text-sm text-[var(--text-muted)]">
          Manage your personal details and WhatsApp contact for class notifications.
        </p>
      </div>

      {/* Enrollment Card */}
      <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] flex items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-light)]">
            Registration Status
          </span>
          <div className="flex items-center gap-2">
            {enrollmentStatus === "enrolled" || isAdmin ? (
              <span className="flex items-center gap-1.5 text-sm font-bold text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Enrolled (Active Student)</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-sm font-bold text-amber-600 dark:text-amber-400">
                <Clock className="w-4 h-4" />
                <span>Pending Payment Confirmation</span>
              </span>
            )}
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            {ACADEMY_CONFIG.COURSE_NAME} • {ACADEMY_CONFIG.START_DATE}
          </p>
        </div>

        {isAdmin && (
          <span className="px-3 py-1 rounded-full bg-purple-500/15 text-purple-700 dark:text-purple-300 text-xs font-bold border border-purple-500/30">
            Admin Access
          </span>
        )}
      </div>

      {/* Edit Personal Details */}
      <div className="p-6 sm:p-8 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-5">
        <h3 className="font-serif text-lg font-bold text-[var(--text-main)]">
          Personal Information
        </h3>

        {profileMsg && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              profileMsg.type === "success"
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
                : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30"
            }`}
          >
            {profileMsg.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{profileMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-main)] mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 w-4 h-4 text-[var(--text-light)]" />
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] text-xs sm:text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-orange)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-main)] mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-[var(--text-light)]" />
              <input
                type="email"
                disabled
                value={profile?.email || user?.email || ""}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] text-xs sm:text-sm text-[var(--text-light)] opacity-70 cursor-not-allowed"
              />
            </div>
            <p className="text-[10px] text-[var(--text-light)] mt-1">
              Contact academy support if you need to transfer your email.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-main)] mb-1">
              WhatsApp Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 w-4 h-4 text-[var(--text-light)]" />
              <input
                type="tel"
                placeholder="e.g. 0810 123 4567"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] text-xs sm:text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-orange)]"
              />
            </div>
            <p className="text-[10px] text-[var(--text-light)] mt-1">
              Important: Used to add you to the cohort study group on WhatsApp.
            </p>
          </div>

          <button
            type="submit"
            disabled={savingProfile}
            className="py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold bg-[var(--accent-orange)] text-white hover:bg-[var(--accent-orange-hover)] transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{savingProfile ? "Saving..." : "Save Changes"}</span>
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="p-6 sm:p-8 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-5">
        <h3 className="font-serif text-lg font-bold text-[var(--text-main)]">
          Security & Password
        </h3>

        {passMsg && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              passMsg.type === "success"
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
                : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30"
            }`}
          >
            {passMsg.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{passMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-main)] mb-1">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-4 h-4 text-[var(--text-light)]" />
              <input
                type="password"
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] text-xs sm:text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-orange)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-main)] mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-4 h-4 text-[var(--text-light)]" />
              <input
                type="password"
                placeholder="Repeat new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] text-xs sm:text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-orange)]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={changingPass || !newPassword}
            className="py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] hover:border-[var(--accent-orange)] text-[var(--text-main)] transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Lock className="w-4 h-4" />
            <span>{changingPass ? "Updating..." : "Update Password"}</span>
          </button>
        </form>
      </div>

      {/* Logout */}
      <div className="pt-4 border-t border-[var(--border-subtle)] flex justify-between items-center">
        <span className="text-xs text-[var(--text-light)]">
          Signed in as {profile?.email || user?.email}
        </span>
        <button
          onClick={() => logout()}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 border border-red-200 dark:border-red-900/40 transition-colors flex items-center gap-1.5"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );
};
