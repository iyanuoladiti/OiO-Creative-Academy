import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useAuth } from "./AuthContext";

export type NavTab =
  | "home"
  | "dashboard"
  | "classes"
  | "recordings"
  | "materials"
  | "certificate"
  | "profile"
  | "pending"
  | "admin";

const VALID_TABS: NavTab[] = [
  "home",
  "dashboard",
  "classes",
  "recordings",
  "materials",
  "certificate",
  "profile",
  "pending",
  "admin",
];

interface NavigationContextType {
  currentTab: NavTab;
  setCurrentTab: (tab: NavTab, options?: { replace?: boolean }) => void;
  goBack: () => void;
  isAuthModalOpen: boolean;
  authMode: "login" | "signup";
  openAuthModal: (mode?: "login" | "signup") => void;
  closeAuthModal: () => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  openMobileMenu: () => void;
  closeMobileMenu: () => void;
  registerModal: (id: string, dismiss: () => void) => () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

function getTabFromHash(): NavTab | null {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash.replace(/^#\/?/, "").toLowerCase().trim();
  if (VALID_TABS.includes(hash as NavTab)) {
    return hash as NavTab;
  }
  return null;
}

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, isEnrolled, isPending, isAdmin, loading } = useAuth();

  // Initial tab from URL hash or default
  const [currentTab, setCurrentTabState] = useState<NavTab>(() => {
    return getTabFromHash() || "home";
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("signup");
  const [isMobileMenuOpen, setIsMobileMenuOpenState] = useState(false);
  const [exitToastVisible, setExitToastVisible] = useState(false);

  // Stack of active modal dismiss callbacks
  const modalStackRef = useRef<Map<string, () => void>>(new Map());
  // Keep track of current tab and auth status in refs for popstate handlers
  const currentTabRef = useRef<NavTab>(currentTab);
  currentTabRef.current = currentTab;

  const isAuthModalOpenRef = useRef(isAuthModalOpen);
  isAuthModalOpenRef.current = isAuthModalOpen;

  const isMobileMenuOpenRef = useRef(isMobileMenuOpen);
  isMobileMenuOpenRef.current = isMobileMenuOpen;

  // Track double-tap back to exit on Android
  const lastBackPressTimeRef = useRef<number>(0);
  const exitToastTimerRef = useRef<number | null>(null);

  // Determine root tab for the current user
  const getRootTab = useCallback((): NavTab => {
    if (user && isEnrolled) return "dashboard";
    if (user && isPending) return "pending";
    if (user && isAdmin) return "dashboard";
    return "home";
  }, [user, isEnrolled, isPending, isAdmin]);

  // Method to register any sub-modal (e.g. in AdminDashboard)
  const registerModal = useCallback((id: string, dismiss: () => void) => {
    modalStackRef.current.set(id, dismiss);
    // Push a modal history state
    try {
      window.history.pushState(
        { modalId: id, tab: currentTabRef.current },
        "",
        window.location.hash || `#${currentTabRef.current}`
      );
    } catch {
      // Ignore
    }
    return () => {
      modalStackRef.current.delete(id);
    };
  }, []);

  // Update tab and sync with browser history
  const setCurrentTab = useCallback(
    (newTab: NavTab, options?: { replace?: boolean }) => {
      if (!VALID_TABS.includes(newTab)) return;

      const previousTab = currentTabRef.current;
      setCurrentTabState(newTab);
      currentTabRef.current = newTab;

      // Close mobile menu when switching tabs
      if (isMobileMenuOpenRef.current) {
        setIsMobileMenuOpenState(false);
      }

      const targetHash = `#${newTab}`;
      const stateObj = { tab: newTab, time: Date.now() };

      if (typeof window !== "undefined") {
        if (options?.replace || previousTab === newTab) {
          window.history.replaceState(stateObj, "", targetHash);
        } else {
          // Push a real history state so Android back button can navigate back to previous tab
          window.history.pushState(stateObj, "", targetHash);
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    []
  );

  // Back button helper
  const goBack = useCallback(() => {
    if (typeof window !== "undefined") {
      window.history.back();
    }
  }, []);

  // Open Auth Modal with history integration
  const openAuthModal = useCallback((mode: "login" | "signup" = "signup") => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
    isAuthModalOpenRef.current = true;
    try {
      window.history.pushState(
        { isModal: "auth", tab: currentTabRef.current },
        "",
        window.location.hash || `#${currentTabRef.current}`
      );
    } catch {
      // Ignore
    }
  }, []);

  // Close Auth Modal
  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    isAuthModalOpenRef.current = false;
    if (typeof window !== "undefined" && window.history.state?.isModal === "auth") {
      window.history.back();
    }
  }, []);

  // Open Mobile Menu with history integration
  const openMobileMenu = useCallback(() => {
    setIsMobileMenuOpenState(true);
    isMobileMenuOpenRef.current = true;
    try {
      window.history.pushState(
        { isDrawer: "mobileMenu", tab: currentTabRef.current },
        "",
        window.location.hash || `#${currentTabRef.current}`
      );
    } catch {
      // Ignore
    }
  }, []);

  // Close Mobile Menu
  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpenState(false);
    isMobileMenuOpenRef.current = false;
    if (typeof window !== "undefined" && window.history.state?.isDrawer === "mobileMenu") {
      window.history.back();
    }
  }, []);

  const setIsMobileMenuOpen = useCallback((open: boolean) => {
    if (open) {
      openMobileMenu();
    } else {
      closeMobileMenu();
    }
  }, [openMobileMenu, closeMobileMenu]);

  // Initial setup: ensure baseline history state exists on app load
  useEffect(() => {
    if (typeof window === "undefined") return;

    const hashTab = getTabFromHash();
    const initialTab = hashTab || currentTabRef.current;

    // Ensure URL has the hash
    if (!window.location.hash) {
      window.history.replaceState({ tab: initialTab, isBase: true }, "", `#${initialTab}`);
    } else {
      window.history.replaceState({ tab: initialTab, isBase: true }, "", window.location.hash);
    }

    // Push an anchor state so the Android user is never at history.length 0
    // This provides a buffer that prevents Android Chrome from immediately exiting
    window.history.pushState({ tab: initialTab, isBuffer: true }, "", window.location.hash);
  }, []);

  // Auto-route based on auth changes (only if on root 'home' or landing)
  useEffect(() => {
    if (loading) return;
    const hashTab = getTabFromHash();

    if (user) {
      if (isAdmin && (currentTabRef.current === "home" || !hashTab)) {
        setCurrentTab("dashboard", { replace: true });
      } else if (isEnrolled && (currentTabRef.current === "home" || !hashTab)) {
        setCurrentTab("dashboard", { replace: true });
      } else if (isPending && (currentTabRef.current === "home" || !hashTab)) {
        setCurrentTab("pending", { replace: true });
      } else if (hashTab) {
        // Respect explicit deep-link if allowed
        if ((hashTab === "classes" || hashTab === "recordings" || hashTab === "materials" || hashTab === "certificate") && !isEnrolled) {
          setCurrentTab("home", { replace: true });
        } else {
          setCurrentTabState(hashTab);
          currentTabRef.current = hashTab;
        }
      }
    } else {
      // User logged out
      if (
        currentTabRef.current === "dashboard" ||
        currentTabRef.current === "classes" ||
        currentTabRef.current === "recordings" ||
        currentTabRef.current === "materials" ||
        currentTabRef.current === "certificate" ||
        currentTabRef.current === "profile" ||
        currentTabRef.current === "admin"
      ) {
        setCurrentTab("home", { replace: true });
      }
    }
  }, [user, isEnrolled, isPending, isAdmin, loading, setCurrentTab]);

  // Global popstate / Android Back Button event listener
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      // 1. If an active modal is in our registered stack, dismiss it first!
      if (modalStackRef.current.size > 0) {
        const lastEntry = Array.from(modalStackRef.current.entries()).pop();
        if (lastEntry) {
          const [id, dismiss] = lastEntry;
          modalStackRef.current.delete(id);
          dismiss();
          return;
        }
      }

      // 2. If Auth Modal is open, dismiss it!
      if (isAuthModalOpenRef.current) {
        setIsAuthModalOpen(false);
        isAuthModalOpenRef.current = false;
        return;
      }

      // 3. If Mobile Menu drawer is open, dismiss it!
      if (isMobileMenuOpenRef.current) {
        setIsMobileMenuOpenState(false);
        isMobileMenuOpenRef.current = false;
        return;
      }

      // 4. Tab navigation via history state or hash
      const hashTab = getTabFromHash();
      const stateTab = e.state?.tab as NavTab | undefined;
      const targetTab = hashTab || stateTab;

      if (targetTab && VALID_TABS.includes(targetTab)) {
        if (targetTab !== currentTabRef.current) {
          setCurrentTabState(targetTab);
          currentTabRef.current = targetTab;
          window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }
      }

      // 5. If we are already on the root tab (e.g. 'home' or 'dashboard'), handle Android exit guard
      const rootTab = getRootTab();
      if (currentTabRef.current === rootTab || currentTabRef.current === "home") {
        const now = Date.now();
        const timeSinceLastBack = now - lastBackPressTimeRef.current;

        // If user tapped back again within 2 seconds: let them exit native Chrome
        if (timeSinceLastBack < 2200) {
          // Native exit: do not push state back, allow browser to navigate back / exit
          return;
        }

        // First tap: prevent Chrome from exiting immediately!
        lastBackPressTimeRef.current = now;

        // Show Android snackbar toast
        setExitToastVisible(true);
        if (exitToastTimerRef.current) clearTimeout(exitToastTimerRef.current);
        exitToastTimerRef.current = window.setTimeout(() => {
          setExitToastVisible(false);
        }, 2200);

        // Re-push a guard state so Chrome stays on this page until confirmed
        window.history.pushState(
          { tab: currentTabRef.current, isExitGuard: true },
          "",
          window.location.hash || `#${currentTabRef.current}`
        );
      } else {
        // If on a subpage (e.g. 'certificate', 'recordings', 'classes', 'materials'), navigate back to dashboard/root
        const fallbackTab = user && isEnrolled ? "dashboard" : "home";
        setCurrentTabState(fallbackTab);
        currentTabRef.current = fallbackTab;
        window.history.pushState({ tab: fallbackTab }, "", `#${fallbackTab}`);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };

    const handleHashChange = () => {
      const hashTab = getTabFromHash();
      if (hashTab && VALID_TABS.includes(hashTab) && hashTab !== currentTabRef.current) {
        setCurrentTabState(hashTab);
        currentTabRef.current = hashTab;
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("hashchange", handleHashChange);
      if (exitToastTimerRef.current) clearTimeout(exitToastTimerRef.current);
    };
  }, [getRootTab, user, isEnrolled]);

  return (
    <NavigationContext.Provider
      value={{
        currentTab,
        setCurrentTab,
        goBack,
        isAuthModalOpen,
        authMode,
        openAuthModal,
        closeAuthModal,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        openMobileMenu,
        closeMobileMenu,
        registerModal,
      }}
    >
      {children}

      {/* Android-native "Press back again to exit" toast */}
      {exitToastVisible && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full bg-[#1b1815]/95 dark:bg-[#f3eee6]/95 text-[#f3eee6] dark:text-[#1b1815] text-xs font-semibold shadow-2xl border border-white/10 dark:border-black/10 backdrop-blur-md flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 select-none pointer-events-none">
          <svg className="w-4 h-4 text-[var(--accent-orange)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Press back again to exit OiO Academy</span>
        </div>
      )}
    </NavigationContext.Provider>
  );
};

export function useNavigation(): NavigationContextType {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
}
