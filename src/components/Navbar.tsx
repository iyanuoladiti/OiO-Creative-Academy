import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigation, NavTab } from "../context/NavigationContext";
import { ACADEMY_CONFIG, getWhatsAppRegistrationLink } from "../config";
import { OiOLogo } from "./OiOLogo";
import {
  Video,
  Menu,
  X,
  User as UserIcon,
  LogOut,
  ShieldAlert,
  Calendar,
  BookOpen,
  FolderDown,
  Sun,
  Moon,
  MessageCircle,
  Award,
  LayoutDashboard,
  Sparkles,
} from "lucide-react";

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: NavTab) => void;
  onOpenAuth: (mode?: "login" | "signup") => void;
  onOpenCheckout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenAuth,
  onOpenCheckout,
}) => {
  const { user, profile, isAdmin, isEnrolled, isPending, logout } = useAuth();
  const { isMobileMenuOpen, setIsMobileMenuOpen, closeMobileMenu } = useNavigation();
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark") ||
        window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  const toggleDarkMode = () => {
    const root = document.documentElement;
    if (root.classList.contains("dark")) {
      root.classList.remove("dark");
      root.classList.add("light");
      setIsDark(false);
    } else {
      root.classList.remove("light");
      root.classList.add("dark");
      setIsDark(true);
    }
  };

  const handleNavClick = (tab: NavTab) => {
    setCurrentTab(tab);
    closeMobileMenu();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--border-subtle)] bg-[var(--bg-page)]/95 backdrop-blur-md transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-4">
        {/* Brand Logo with Official OiO Logo */}
        <button
          onClick={() => handleNavClick(isEnrolled ? "dashboard" : "home")}
          className="flex items-center gap-3 text-left group focus:outline-none"
        >
          <OiOLogo size="sm" />
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5 lg:gap-2 text-sm font-medium">
          {/* If NOT enrolled (guest or pending): show Overview */}
          {(!user || !isEnrolled) && (
            <button
              onClick={() => handleNavClick("home")}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                currentTab === "home"
                  ? "bg-[var(--accent-orange-soft)] text-[var(--accent-orange)] font-semibold"
                  : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
              }`}
            >
              Overview
            </button>
          )}

          {/* Enrolled Student Links: Dashboard is primary tab instead of Overview */}
          {user && isEnrolled && (
            <>
              <button
                onClick={() => handleNavClick("dashboard")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                  currentTab === "dashboard"
                    ? "bg-[var(--accent-orange-soft)] text-[var(--accent-orange)] font-semibold"
                    : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => handleNavClick("classes")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                  currentTab === "classes"
                    ? "bg-[var(--accent-orange-soft)] text-[var(--accent-orange)] font-semibold"
                    : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Live Classes</span>
              </button>

              <button
                onClick={() => handleNavClick("recordings")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                  currentTab === "recordings"
                    ? "bg-[var(--accent-orange-soft)] text-[var(--accent-orange)] font-semibold"
                    : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Recordings</span>
              </button>

              <button
                onClick={() => handleNavClick("materials")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                  currentTab === "materials"
                    ? "bg-[var(--accent-orange-soft)] text-[var(--accent-orange)] font-semibold"
                    : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
                }`}
              >
                <FolderDown className="w-4 h-4" />
                <span>Materials</span>
              </button>

              <button
                onClick={() => handleNavClick("certificate")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                  currentTab === "certificate"
                    ? "bg-[var(--accent-orange-soft)] text-[var(--accent-orange)] font-semibold"
                    : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
                }`}
              >
                <Award className="w-4 h-4" />
                <span>Certificate</span>
              </button>
            </>
          )}

          {/* Pending Screen link */}
          {user && isPending && (
            <button
              onClick={() => handleNavClick("pending")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                currentTab === "pending"
                  ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 font-semibold"
                  : "text-amber-700 dark:text-amber-400 hover:opacity-80"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>Seat Confirmation</span>
            </button>
          )}

          {/* Admin link */}
          {user && isAdmin && (
            <button
              onClick={() => handleNavClick("admin")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                currentTab === "admin"
                  ? "bg-purple-500/20 text-purple-700 dark:text-purple-300 font-bold"
                  : "text-purple-700 dark:text-purple-400 hover:opacity-90"
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Admin Panel</span>
            </button>
          )}
        </nav>

        {/* Right side Actions */}
        <div className="flex items-center gap-2">
          {/* Dark / Light toggle */}
          <button
            onClick={toggleDarkMode}
            aria-label="Toggle theme"
            className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-subtle)] transition-colors"
          >
            {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* User Logged in / Logged out */}
          {user ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => handleNavClick("profile")}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--border-strong)] transition-all text-xs sm:text-sm font-medium"
              >
                <div className="w-6 h-6 rounded-full bg-[var(--accent-orange)] text-white flex items-center justify-center font-bold text-xs uppercase">
                  {(profile?.displayName || user.displayName || user.email || "S")[0]}
                </div>
                <span className="hidden sm:inline max-w-[110px] truncate text-[var(--text-main)]">
                  {profile?.displayName?.split(" ")[0] || "Account"}
                </span>
                {isEnrolled && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-1.5 py-0.5 rounded font-bold">
                    Enrolled
                  </span>
                )}
                {isAdmin && (
                  <span className="text-[10px] bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 px-1.5 py-0.5 rounded font-semibold">
                    Admin
                  </span>
                )}
              </button>

              <button
                onClick={() => logout()}
                title="Log out"
                className="p-2 rounded-xl text-[var(--text-muted)] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth("login")}
                className="hidden sm:inline-flex px-3.5 py-1.5 text-xs sm:text-sm font-medium text-[var(--text-main)] hover:text-[var(--accent-orange)] transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => (onOpenCheckout ? onOpenCheckout() : onOpenAuth("signup"))}
                className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold bg-[var(--accent-orange)] text-white shadow-sm hover:bg-[var(--accent-orange-hover)] transition-all flex items-center gap-1.5"
              >
                <span>Reserve Seat</span>
              </button>
            </div>
          )}

          {/* Mobile Menu trigger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-[var(--text-main)] hover:bg-[var(--bg-surface-subtle)]"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-4 space-y-2 shadow-xl animate-in slide-in-from-top-2">
          {(!user || !isEnrolled) && (
            <button
              onClick={() => handleNavClick("home")}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-[var(--text-main)] hover:bg-[var(--bg-surface-subtle)] flex items-center justify-between"
            >
              <span>Overview & Course Details</span>
            </button>
          )}

          {user && isEnrolled && (
            <>
              <button
                onClick={() => handleNavClick("dashboard")}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-[var(--text-main)] hover:bg-[var(--bg-surface-subtle)] flex items-center gap-2 font-bold text-[var(--accent-orange)]"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>My Dashboard</span>
              </button>
              <button
                onClick={() => handleNavClick("classes")}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-[var(--text-main)] hover:bg-[var(--bg-surface-subtle)] flex items-center gap-2"
              >
                <Calendar className="w-4 h-4 text-[var(--accent-orange)]" />
                <span>Live Google Meet Classes</span>
              </button>
              <button
                onClick={() => handleNavClick("recordings")}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-[var(--text-main)] hover:bg-[var(--bg-surface-subtle)] flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4 text-[var(--accent-orange)]" />
                <span>Class Recordings</span>
              </button>
              <button
                onClick={() => handleNavClick("materials")}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-[var(--text-main)] hover:bg-[var(--bg-surface-subtle)] flex items-center gap-2"
              >
                <FolderDown className="w-4 h-4 text-[var(--accent-orange)]" />
                <span>Lesson Materials & Files</span>
              </button>
              <button
                onClick={() => handleNavClick("certificate")}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-[var(--text-main)] hover:bg-[var(--bg-surface-subtle)] flex items-center gap-2"
              >
                <Award className="w-4 h-4 text-[var(--accent-orange)]" />
                <span>Certificate of Completion</span>
              </button>
            </>
          )}

          {user && isPending && (
            <button
              onClick={() => handleNavClick("pending")}
              className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium bg-amber-500/15 text-amber-700 dark:text-amber-300 flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                Seat Confirmation & Payment
              </span>
            </button>
          )}

          {user && (
            <button
              onClick={() => handleNavClick("profile")}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-[var(--text-main)] hover:bg-[var(--bg-surface-subtle)] flex items-center gap-2"
            >
              <UserIcon className="w-4 h-4" />
              <span>My Profile & Settings</span>
            </button>
          )}

          {user && isAdmin && (
            <button
              onClick={() => handleNavClick("admin")}
              className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-bold bg-purple-500/15 text-purple-700 dark:text-purple-300 flex items-center gap-2"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Admin Management Panel</span>
            </button>
          )}

          <div className="pt-2 border-t border-[var(--border-subtle)] flex flex-col gap-2">
            <a
              href={getWhatsAppRegistrationLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold bg-emerald-700 text-white hover:bg-emerald-800"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat on WhatsApp ({ACADEMY_CONFIG.WHATSAPP_NUMBER})</span>
            </a>

            {!user ? (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => {
                    closeMobileMenu();
                    onOpenAuth("login");
                  }}
                  className="w-full py-2 px-3 rounded-lg text-xs font-semibold border border-[var(--border-subtle)] text-[var(--text-main)]"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    closeMobileMenu();
                    if (onOpenCheckout) {
                      onOpenCheckout();
                    } else {
                      onOpenAuth("signup");
                    }
                  }}
                  className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-[var(--accent-orange)] text-white"
                >
                  Reserve Seat
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  closeMobileMenu();
                  logout();
                }}
                className="w-full py-2 px-3 rounded-lg text-xs font-semibold text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40"
              >
                Log Out
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
