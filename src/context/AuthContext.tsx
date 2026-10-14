import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  addDoc,
  collection,
} from "firebase/firestore";
import { auth, db, googleProvider, handleFirestoreError, OperationType } from "../firebase";
import { UserProfile, PaymentRecord } from "../types";
import { ACADEMY_CONFIG } from "../config";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  isEnrolled: boolean;
  isPending: boolean;
  loading: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string, whatsapp: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateContactInfo: (whatsapp: string, displayName?: string) => Promise<void>;
  submitPaymentProof: (reference: string, notes?: string, mode?: "manual" | "paystack") => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdminState, setIsAdminState] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Monitor Auth State
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setProfile(null);
        setIsAdminState(false);
        setLoading(false);
        return;
      }

      const isHardcodedAdmin =
        Boolean(currentUser.email && ACADEMY_CONFIG.ADMIN_EMAILS.some(
          (adminMail) => adminMail.toLowerCase() === currentUser.email?.toLowerCase()
        ));

      // Bootstrap admin document if authorized admin email
      if (isHardcodedAdmin) {
        try {
          const adminDocRef = doc(db, "admins", currentUser.uid);
          await setDoc(adminDocRef, {
            email: currentUser.email,
            name: currentUser.displayName || "Admin",
            addedAt: new Date().toISOString(),
          }, { merge: true });
        } catch {
          // Ignore bootstrap collision if already exists
        }
      }

      // Check admin status from /admins collection
      try {
        const adminCheckRef = doc(db, "admins", currentUser.uid);
        const adminSnap = await getDoc(adminCheckRef);
        setIsAdminState(isHardcodedAdmin || adminSnap.exists());
      } catch {
        setIsAdminState(isHardcodedAdmin);
      }

      // Realtime listener on user profile
      const userDocRef = doc(db, "users", currentUser.uid);
      const unsubscribeProfile = onSnapshot(
        userDocRef,
        async (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            setProfile(data);
            if (data.role === "admin") {
              setIsAdminState(true);
            }
          } else {
            // First time login via Google
            const newProfile: UserProfile = {
              uid: currentUser.uid,
              email: currentUser.email || "",
              displayName: currentUser.displayName || "Student",
              whatsapp: "",
              role: isHardcodedAdmin ? "admin" : "student",
              enrollmentStatus: isHardcodedAdmin ? "enrolled" : "pending",
              createdAt: new Date().toISOString(),
            };

            try {
              await setDoc(userDocRef, newProfile);
              setProfile(newProfile);
            } catch (err) {
              handleFirestoreError(err, OperationType.WRITE, `users/${currentUser.uid}`);
            }
          }
          setLoading(false);
        },
        (error) => {
          console.warn("User profile listener warning:", error);
          setLoading(false);
        }
      );

      return () => {
        unsubscribeProfile();
      };
    });

    return () => unsubscribeAuth();
  }, []);

  const signInWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email.trim(), pass);
    } catch (err: unknown) {
      throw err;
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string, whatsapp: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    if (cred.user) {
      await updateProfile(cred.user, { displayName: name.trim() });
      const isHardcodedAdmin =
        Boolean(cred.user.email && ACADEMY_CONFIG.ADMIN_EMAILS.some(
          (adminMail) => adminMail.toLowerCase() === cred.user.email?.toLowerCase()
        ));

      const userDocRef = doc(db, "users", cred.user.uid);
      const initialProfile: UserProfile = {
        uid: cred.user.uid,
        email: cred.user.email || email.trim(),
        displayName: name.trim(),
        whatsapp: whatsapp.trim(),
        role: isHardcodedAdmin ? "admin" : "student",
        enrollmentStatus: isHardcodedAdmin ? "enrolled" : "pending",
        createdAt: new Date().toISOString(),
      };

      try {
        await setDoc(userDocRef, initialProfile);
        setProfile(initialProfile);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${cred.user.uid}`);
      }
    }
  };

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      throw err;
    }
  };

  const logout = async () => {
    await signOut(auth);
    setProfile(null);
    setIsAdminState(false);
  };

  const updateContactInfo = async (whatsapp: string, displayName?: string) => {
    if (!user) return;
    const userDocRef = doc(db, "users", user.uid);
    const updates: Partial<UserProfile> = {
      whatsapp: whatsapp.trim(),
      updatedAt: new Date().toISOString(),
    };
    if (displayName) {
      updates.displayName = displayName.trim();
      await updateProfile(user, { displayName: displayName.trim() });
    }
    try {
      await updateDoc(userDocRef, updates);
      if (profile) {
        setProfile({ ...profile, ...updates });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const submitPaymentProof = async (reference: string, notes?: string, mode: "manual" | "paystack" = "manual") => {
    if (!user) throw new Error("Please sign in first.");
    const paymentData: Omit<PaymentRecord, "id"> = {
      userId: user.uid,
      userEmail: user.email || profile?.email || "",
      userName: profile?.displayName || user.displayName || "Student",
      amountNaira: ACADEMY_CONFIG.COURSE_FEE_NAIRA,
      amountKobo: ACADEMY_CONFIG.COURSE_FEE_KOBO,
      mode,
      reference: reference.trim(),
      status: "pending",
      notes: notes?.trim() || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await addDoc(collection(db, "payments"), paymentData);
      // Also update the note on the user profile so admin sees it immediately in students table
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        notes: `Transfer Ref: ${reference.trim()}${notes ? ` | ${notes.trim()}` : ""}`,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, "payments");
    }
  };

  const isAdmin = isAdminState || profile?.role === "admin";
  const isEnrolled = isAdmin || profile?.enrollmentStatus === "enrolled";
  const isPending = !isAdmin && profile?.enrollmentStatus === "pending";

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAdmin,
        isEnrolled,
        isPending,
        loading,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        logout,
        updateContactInfo,
        submitPaymentProof,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
