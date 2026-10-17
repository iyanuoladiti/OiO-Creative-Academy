import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { NavigationProvider, useNavigation, NavTab } from "./context/NavigationContext";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { AuthModal } from "./components/AuthModal";
import { PaystackCheckoutModal } from "./components/PaystackCheckoutModal";
import { HomePage } from "./pages/HomePage";
import { PendingScreen } from "./pages/PendingScreen";
import { StudentDashboard } from "./pages/StudentDashboard";
import { LiveClassesPage } from "./pages/LiveClassesPage";
import { RecordingsPage } from "./pages/RecordingsPage";
import { MaterialsPage } from "./pages/MaterialsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { CertificatePage } from "./pages/CertificatePage";
import { AdminDashboard } from "./pages/AdminDashboard";

function MainContent() {
  const { user, isEnrolled, isAdmin, loading } = useAuth();
  const {
    currentTab,
    setCurrentTab,
    goBack,
    isAuthModalOpen,
    authMode,
    openAuthModal,
    closeAuthModal,
    registerModal,
  } = useNavigation();

  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  // Register Checkout Modal with Android Back Button support
  React.useEffect(() => {
    if (isCheckoutModalOpen) {
      return registerModal("paystackCheckoutModal", () => setIsCheckoutModalOpen(false));
    }
  }, [isCheckoutModalOpen, registerModal]);

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-[var(--text-main)] transition-colors selection:bg-orange-500/20 selection:text-orange-950 dark:selection:text-orange-200">
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenAuth={openAuthModal}
        onOpenCheckout={() => setIsCheckoutModalOpen(true)}
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
                onRegisterClick={() => openAuthModal("signup")}
                onOpenCheckout={() => setIsCheckoutModalOpen(true)}
                onNavigate={(tab) => setCurrentTab(tab as NavTab)}
                onExploreCurriculum={() => {
                  const el = document.getElementById("curriculum");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
              />
            )}

            {currentTab === "pending" && (
              <PendingScreen onNavigateToDashboard={() => setCurrentTab("dashboard")} />
            )}

            {currentTab === "dashboard" && isEnrolled && (
              <StudentDashboard onNavigate={(tab) => setCurrentTab(tab as NavTab)} />
            )}

            {currentTab === "classes" && isEnrolled && (
              <LiveClassesPage onBack={() => setCurrentTab("dashboard")} />
            )}

            {currentTab === "recordings" && isEnrolled && (
              <RecordingsPage onBack={() => setCurrentTab("dashboard")} />
            )}

            {currentTab === "materials" && isEnrolled && (
              <MaterialsPage onBack={() => setCurrentTab("dashboard")} />
            )}

            {currentTab === "certificate" && isEnrolled && (
              <CertificatePage onBack={() => setCurrentTab("dashboard")} />
            )}

            {currentTab === "profile" && user && (
              <ProfilePage onBack={() => setCurrentTab(isEnrolled ? "dashboard" : "home")} />
            )}

            {currentTab === "admin" && isAdmin && (
              <AdminDashboard onBack={() => setCurrentTab("dashboard")} />
            )}
          </>
        )}
      </main>

      <Footer onOpenAuth={() => openAuthModal("login")} />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        initialMode={authMode}
      />

      <PaystackCheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        onSuccessRedirect={() => setCurrentTab("dashboard")}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationProvider>
        <MainContent />
      </NavigationProvider>
    </AuthProvider>
  );
}
