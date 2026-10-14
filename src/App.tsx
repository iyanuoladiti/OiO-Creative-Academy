import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { AuthModal } from "./components/AuthModal";
import { HomePage } from "./pages/HomePage";
import { PendingScreen } from "./pages/PendingScreen";
import { StudentDashboard } from "./pages/StudentDashboard";
import { LiveClassesPage } from "./pages/LiveClassesPage";
import { RecordingsPage } from "./pages/RecordingsPage";
import { MaterialsPage } from "./pages/MaterialsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { AdminDashboard } from "./pages/AdminDashboard";

function MainContent() {
  const { user, isEnrolled, isPending, isAdmin, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>("home");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("signup");

  // Route user according to status on initial load or auth change
  useEffect(() => {
    if (loading) return;
    if (user) {
      if (isAdmin && currentTab === "home") {
        setCurrentTab("dashboard");
      } else if (isEnrolled && currentTab === "home") {
        setCurrentTab("dashboard");
      } else if (isPending && currentTab === "home") {
        setCurrentTab("pending");
      }
    }
  }, [user, isEnrolled, isPending, isAdmin, loading]);

  const handleOpenAuth = (mode: "login" | "signup" = "signup") => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-page)] text-[var(--text-main)] transition-colors selection:bg-orange-500/20 selection:text-orange-950 dark:selection:text-orange-200">
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenAuth={handleOpenAuth}
      />

      <main className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-3">
              <div className="w-8 h-8 border-2 border-[var(--accent-orange)] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-[var(--text-muted)] font-medium">
                Loading OiO Creative Academy...
              </p>
            </div>
          </div>
        ) : (
          <>
            {currentTab === "home" && (
              <HomePage
                onRegisterClick={() => handleOpenAuth("signup")}
                onExploreCurriculum={() => {
                  const el = document.getElementById("curriculum");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
              />
            )}

            {currentTab === "pending" && (
              <PendingScreen />
            )}

            {currentTab === "dashboard" && isEnrolled && (
              <StudentDashboard onNavigate={setCurrentTab} />
            )}

            {currentTab === "classes" && isEnrolled && (
              <LiveClassesPage />
            )}

            {currentTab === "recordings" && isEnrolled && (
              <RecordingsPage />
            )}

            {currentTab === "materials" && isEnrolled && (
              <MaterialsPage />
            )}

            {currentTab === "profile" && user && (
              <ProfilePage />
            )}

            {currentTab === "admin" && isAdmin && (
              <AdminDashboard />
            )}
          </>
        )}
      </main>

      <Footer onOpenAuth={() => handleOpenAuth("login")} />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}
