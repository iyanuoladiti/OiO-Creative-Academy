import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  ACADEMY_CONFIG,
  formatNaira,
  getWhatsAppPaymentConfirmationLink,
} from "../config";
import { OiOLogo } from "../components/OiOLogo";
import { verifyPaymentWithAI, AIPaymentVerificationResult } from "../services/aiPaymentVerifier";
import {
  triggerPaystackCheckout,
  convertNairaToKobo,
  generatePaystackReference,
} from "../services/paystack";
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
  Bot,
  CreditCard,
  Lock,
  ArrowRight,
  ShoppingBag,
  Plus,
  Minus,
  Printer,
} from "lucide-react";

interface PendingScreenProps {
  onNavigateToDashboard?: () => void;
}

export const PendingScreen: React.FC<PendingScreenProps> = ({ onNavigateToDashboard }) => {
  const { user, profile, submitPaymentProof, confirmPaystackSuccess } = useAuth();

  // Payment tab: Paystack (recommended instant online checkout) vs Manual Bank Transfer
  const [activePaymentTab, setActivePaymentTab] = useState<"paystack" | "manual">("paystack");

  // Paystack dynamic cart state
  const [quantity, setQuantity] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [paystackProcessing, setPaystackProcessing] = useState(false);
  const [paystackError, setPaystackError] = useState<string | null>(null);

  // Success state from Paystack
  const [paystackSuccess, setPaystackSuccess] = useState<{
    reference: string;
    amountNaira: number;
    amountKobo: number;
    paidAt: string;
    studentName: string;
    studentEmail: string;
    itemSummary: string;
  } | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);

  // Customer contact state for Paystack checkout
  const studentName = profile?.displayName || user?.displayName || "Student";
  const studentEmail = profile?.email || user?.email || "";
  const [customerName, setCustomerName] = useState(studentName);
  const [customerEmail, setCustomerEmail] = useState(studentEmail);
  const [customerWhatsapp, setCustomerWhatsapp] = useState(profile?.whatsapp || "");

  // Manual Transfer state
  const [copied, setCopied] = useState(false);
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedSyllabus, setExpandedSyllabus] = useState(true);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<AIPaymentVerificationResult | null>(null);

  // Add-ons list
  const addons = [
    {
      id: "addon-review",
      name: "1-on-1 Portfolio & Cut Review Clinic",
      price: 10000,
      description: "Dedicated 30-min private session with the lead instructor on your commercial reel.",
    },
    {
      id: "addon-pack",
      name: "VIP Video Footage & Sound FX Mega Pack",
      price: 5000,
      description: "15GB curated commercial B-roll library, sound effects, and CapCut project templates.",
    },
  ];

  // Dynamic Cart Calculation
  const basePricePerSeat = ACADEMY_CONFIG.COURSE_FEE_NAIRA; // 20,000 NGN
  const standardPricePerSeat = ACADEMY_CONFIG.STANDARD_FEE_NAIRA; // 45,000 NGN
  const seatsTotal = basePricePerSeat * quantity;
  const addonsTotal = selectedAddons.reduce((sum, addonId) => {
    const item = addons.find((a) => a.id === addonId);
    return sum + (item ? item.price : 0);
  }, 0);
  const totalAmountNaira = seatsTotal + addonsTotal;
  const totalAmountKobo = convertNairaToKobo(totalAmountNaira);
  const totalDiscount = (standardPricePerSeat - basePricePerSeat) * quantity;

  const toggleAddon = (id: string) => {
    setPaystackError(null);
    if (selectedAddons.includes(id)) {
      setSelectedAddons(selectedAddons.filter((item) => item !== id));
    } else {
      setSelectedAddons([...selectedAddons, id]);
    }
  };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(ACADEMY_CONFIG.MANUAL_PAYMENT.ACCOUNT_NUMBER);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyReference = (ref: string) => {
    navigator.clipboard.writeText(ref);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  // Trigger Paystack Popup Checkout
  const handlePaystackCheckout = async () => {
    setPaystackError(null);

    const nameToUse = customerName.trim() || studentName;
    const emailToUse = customerEmail.trim() || studentEmail;

    if (!nameToUse) {
      setPaystackError("Please enter your full name for the student registry.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailToUse || !emailRegex.test(emailToUse)) {
      setPaystackError("Please provide a valid email address to receive your payment receipt.");
      return;
    }

    setPaystackProcessing(true);

    const transactionReference = generatePaystackReference("OIO");
    const itemSummary = `${quantity}x ${ACADEMY_CONFIG.COURSE_NAME}${
      selectedAddons.length > 0 ? ` + ${selectedAddons.length} Add-on(s)` : ""
    }`;

    try {
      await triggerPaystackCheckout({
        key: ACADEMY_CONFIG.PAYSTACK_PUBLIC_KEY,
        email: emailToUse,
        amount: totalAmountKobo, // dynamic amount in Kobo
        ref: transactionReference,
        metadata: {
          student_name: nameToUse,
          student_whatsapp: customerWhatsapp.trim(),
          course_name: ACADEMY_CONFIG.COURSE_NAME,
          custom_fields: [
            {
              display_name: "Student Name",
              variable_name: "student_name",
              value: nameToUse,
            },
            {
              display_name: "Course Title",
              variable_name: "course_title",
              value: ACADEMY_CONFIG.COURSE_NAME,
            },
            {
              display_name: "WhatsApp Number",
              variable_name: "whatsapp_number",
              value: customerWhatsapp.trim() || "N/A",
            },
          ],
        },
        callback: (response) => {
          setPaystackProcessing(false);
          const finalRef = response.reference || transactionReference;

          // Record in Firestore and upgrade student to enrolled
          confirmPaystackSuccess({
            reference: finalRef,
            amountNaira: totalAmountNaira,
            amountKobo: totalAmountKobo,
            customerEmail: emailToUse,
            customerName: nameToUse,
            notes: `Paystack Online Payment: ${itemSummary}`,
          }).catch((err) => {
            console.error("Error recording verified payment:", err);
          });

          // Trigger Success State with Thank You Screen
          setPaystackSuccess({
            reference: finalRef,
            amountNaira: totalAmountNaira,
            amountKobo: totalAmountKobo,
            paidAt: new Date().toLocaleDateString("en-NG", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
            studentName: nameToUse,
            studentEmail: emailToUse,
            itemSummary,
          });
        },
        onClose: () => {
          setPaystackProcessing(false);
        },
      });
    } catch (err: unknown) {
      setPaystackProcessing(false);
      setPaystackError(
        err instanceof Error ? err.message : "Failed to load Paystack popup. Please check your connection."
      );
    }
  };

  const handleRunAiAnalysis = async () => {
    if (!reference.trim() && !notes.trim()) {
      setError("Please paste your bank transfer alert, session ID, or sender name first.");
      return;
    }
    setError(null);
    setAiAnalyzing(true);
    try {
      const combinedInput = `${reference} ${notes}`;
      const res = await verifyPaymentWithAI(combinedInput);
      setAiResult(res);
    } catch (err: unknown) {
      console.warn("AI verification error:", err);
    } finally {
      setAiAnalyzing(false);
    }
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
      const aiNote = aiResult
        ? ` | AI Audit: ${aiResult.summary} (Confidence: ${aiResult.confidence})`
        : "";
      await submitPaymentProof(reference, `${notes}${aiNote}`, "manual");
      setSubmittedSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to record reference.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 space-y-8 text-[var(--text-main)]">
      {/* Header Status */}
      <div className="text-center space-y-3 flex flex-col items-center">
        <OiOLogo size="sm" className="mb-2" />
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-400 text-xs font-bold border border-emerald-500/30">
          <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Step 2: Complete Tuition Payment</span>
        </div>

        <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[var(--text-main)]">
          Welcome, {studentName.split(" ")[0]}!
        </h2>
        <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-xl mx-auto leading-relaxed">
          Your student account is active. Choose between instant online checkout with Paystack (cards, bank transfer, USSD) or direct manual bank transfer to unlock your live classes and curriculum files.
        </p>
      </div>

      {/* THANK YOU CONFIRMATION SCREEN (When Paystack Payment Succeeds) */}
      {paystackSuccess ? (
        <div className="rounded-3xl border-2 border-emerald-500 bg-[var(--bg-surface)] p-6 sm:p-8 space-y-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/15 border-2 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Payment Verified via Paystack</span>
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--text-main)]">
              Thank You, {paystackSuccess.studentName.split(" ")[0]}!
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-md mx-auto leading-relaxed">
              Your enrollment for the <strong>CapCut Video Editing Masterclass (November Cohort)</strong> is confirmed! Your learning dashboard is now fully unlocked.
            </p>
          </div>

          {/* Official Itemized Receipt */}
          <div className="p-5 rounded-2xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] space-y-3.5 text-xs sm:text-sm">
            <div className="flex justify-between items-center pb-2.5 border-b border-[var(--border-subtle)]">
              <span className="text-[var(--text-muted)]">Transaction Reference:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-[var(--text-main)]">
                  {paystackSuccess.reference}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyReference(paystackSuccess.reference)}
                  className="p-1 rounded bg-[var(--bg-surface)] hover:text-[var(--accent-orange)] transition-colors text-xs flex items-center gap-1"
                  title="Copy reference"
                >
                  {copiedRef ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-[var(--text-muted)]">Course Enrolled:</span>
              <span className="font-semibold text-[var(--text-main)] text-right">
                {ACADEMY_CONFIG.COURSE_NAME}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-[var(--text-muted)]">Student Name:</span>
              <span className="font-semibold text-[var(--text-main)]">
                {paystackSuccess.studentName}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-[var(--text-muted)]">Email:</span>
              <span className="font-semibold text-[var(--text-main)]">
                {paystackSuccess.studentEmail}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-[var(--text-muted)]">Payment Gateway:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                Paystack Inline (Secure)
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-[var(--text-muted)]">Date & Time:</span>
              <span className="text-[var(--text-main)]">{paystackSuccess.paidAt}</span>
            </div>

            <div className="flex justify-between items-center pt-2.5 border-t border-[var(--border-subtle)]">
              <span className="font-bold text-[var(--text-main)]">Total Amount Paid:</span>
              <span className="font-serif text-lg font-bold text-[var(--accent-orange)]">
                {formatNaira(paystackSuccess.amountNaira)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={() => {
                if (onNavigateToDashboard) {
                  onNavigateToDashboard();
                } else if (typeof window !== "undefined") {
                  window.location.hash = "#dashboard";
                  window.location.reload();
                }
              }}
              className="w-full py-4 px-5 rounded-2xl text-xs sm:text-sm font-bold bg-[var(--accent-orange)] text-white hover:bg-[var(--accent-orange-hover)] transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>Enter Your Learning Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <a
                href={`https://wa.me/${ACADEMY_CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(
                  `Hi OiO Creative Academy, I just completed my Paystack payment for CapCut Masterclass. Reference: ${paystackSuccess.reference}. Please add me to the cohort WhatsApp group!`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-4 rounded-xl text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white transition-all flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Join Class WhatsApp Group</span>
              </a>

              <button
                type="button"
                onClick={() => window.print()}
                className="py-3 px-4 rounded-xl text-xs font-semibold border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] hover:bg-[var(--bg-surface)] text-[var(--text-main)] transition-all flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4 text-[var(--accent-orange)]" />
                <span>Print Receipt</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* STANDARD PAYMENT SELECTION CARD */
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

          {/* Payment Method Switcher Tabs */}
          <div className="pt-2 border-t border-[var(--border-subtle)] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)]">
                Choose Payment Method:
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Instant Verification</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setActivePaymentTab("paystack")}
                className={`p-4 rounded-2xl border text-left transition-all relative ${
                  activePaymentTab === "paystack"
                    ? "border-emerald-500 bg-emerald-500/10 shadow-sm"
                    : "border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] hover:border-[var(--text-light)]"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-[var(--text-main)]">
                      Paystack Online
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-emerald-600 text-white">
                    Instant Unlock
                  </span>
                </div>
                <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                  Debit Card (Mastercard, Visa, Verve), Bank Transfer, or USSD via Paystack popup.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setActivePaymentTab("manual")}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  activePaymentTab === "manual"
                    ? "border-[var(--accent-orange)] bg-[var(--accent-orange-soft)] shadow-sm"
                    : "border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] hover:border-[var(--text-light)]"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[var(--accent-orange)] text-white flex items-center justify-center">
                      <Building className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-[var(--text-main)]">
                      Direct Bank Transfer
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
                    UBA Corporate
                  </span>
                </div>
                <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                  Wire transfer directly to OiO DESIGNS AND ENGINEERING UBA account.
                </p>
              </button>
            </div>
          </div>

          {/* METHOD 1: PAYSTACK ONLINE CHECKOUT WITH DYNAMIC CART */}
          {activePaymentTab === "paystack" && (
            <div className="p-5 rounded-2xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] space-y-5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-[var(--text-main)]">
                    Paystack Cart & Checkout
                  </span>
                </div>
                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  {formatNaira(totalAmountNaira)} ({totalAmountKobo.toLocaleString()} Kobo)
                </span>
              </div>

              {paystackError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{paystackError}</span>
                </div>
              )}

              {/* Dynamic Quantity & Add-ons */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[var(--text-main)]">Seats Quantity:</span>
                  <div className="flex items-center gap-2 border border-[var(--border-subtle)] rounded-lg bg-[var(--bg-surface)] p-1">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-main)] disabled:opacity-30"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-mono text-xs font-bold px-1.5">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-main)]"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Add-ons list */}
                <div className="space-y-2 pt-1">
                  <span className="text-[11px] font-bold text-[var(--text-main)] uppercase tracking-wider">
                    Optional Add-ons:
                  </span>
                  {addons.map((addon) => {
                    const isChecked = selectedAddons.includes(addon.id);
                    return (
                      <div
                        key={addon.id}
                        onClick={() => toggleAddon(addon.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                          isChecked
                            ? "bg-emerald-500/10 border-emerald-500"
                            : "bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-[var(--text-light)]"
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div
                            className={`w-4 h-4 rounded border mt-0.5 flex items-center justify-center shrink-0 ${
                              isChecked
                                ? "bg-emerald-600 border-emerald-600 text-white"
                                : "border-[var(--border-subtle)] bg-[var(--bg-surface)]"
                            }`}
                          >
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-[var(--text-main)]">
                              {addon.name}
                            </div>
                            <div className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                              {addon.description}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-[var(--text-main)] shrink-0">
                          +{formatNaira(addon.price)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Cart Calculation Breakdown */}
                <div className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-1.5 text-xs">
                  <div className="flex justify-between text-[var(--text-muted)]">
                    <span>Course Subtotal ({quantity} seat{quantity > 1 ? "s" : ""}):</span>
                    <span>{formatNaira(seatsTotal)}</span>
                  </div>
                  {addonsTotal > 0 && (
                    <div className="flex justify-between text-[var(--text-muted)]">
                      <span>Add-ons ({selectedAddons.length}):</span>
                      <span>+{formatNaira(addonsTotal)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span>November Discount:</span>
                    <span>-{formatNaira(totalDiscount)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-[var(--border-subtle)] font-bold text-sm">
                    <span className="text-[var(--text-main)]">Total Amount to Pay:</span>
                    <div className="text-right">
                      <span className="text-emerald-600 dark:text-emerald-400 font-serif text-lg">
                        {formatNaira(totalAmountNaira)}
                      </span>
                      <div className="text-[10px] text-[var(--text-light)] font-mono">
                        ({totalAmountKobo.toLocaleString()} Kobo)
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Student Details Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--text-main)] mb-1">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs text-[var(--text-main)] focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[var(--text-main)] mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs text-[var(--text-main)] focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Clean Checkout Button */}
              <button
                type="button"
                onClick={handlePaystackCheckout}
                disabled={paystackProcessing}
                className="w-full py-4 px-6 rounded-2xl text-xs sm:text-sm font-bold bg-[#0aa564] hover:bg-[#088b54] text-white shadow-lg shadow-emerald-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60"
              >
                {paystackProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Connecting Paystack Checkout...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>
                      Pay {formatNaira(totalAmountNaira)} with Paystack
                      {selectedAddons.length > 0 && (
                        <span className="opacity-90 font-medium">
                          {" "}
                          ({quantity} Course + {selectedAddons.length} Add-on
                          {selectedAddons.length > 1 ? "s" : ""})
                        </span>
                      )}
                    </span>
                    <Lock className="w-3.5 h-3.5 opacity-80" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-3 text-[11px] text-[var(--text-light)]">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Secured by Paystack Inline</span>
                </span>
                <span>•</span>
                <span>Instant Card, Bank Transfer & USSD</span>
              </div>
            </div>
          )}

          {/* METHOD 2: DIRECT MANUAL BANK TRANSFER */}
          {activePaymentTab === "manual" && (
            <div className="space-y-4 pt-1 animate-in fade-in duration-150">
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
                    {ACADEMY_CONFIG.PARENT_COMPANY}{" "}
                    <span className="text-xs text-[var(--text-light)] font-normal">
                      ({ACADEMY_CONFIG.COMPANY_RC})
                    </span>
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--text-muted)]">Bank Name:</span>
                  <span className="font-bold text-[var(--text-main)]">
                    {ACADEMY_CONFIG.MANUAL_PAYMENT.BANK_NAME}
                  </span>
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
                        Additional Note or Paste Bank SMS Alert (optional)
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Paste transaction narration, e.g. 'TRF/UBA/1028382219/OIO DESIGNS/20,000'..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] text-xs sm:text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-orange)]"
                      />
                    </div>

                    {/* AI Verification Tool */}
                    <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={handleRunAiAnalysis}
                        disabled={aiAnalyzing}
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[var(--accent-orange-soft)] text-[var(--accent-orange)] hover:bg-[var(--accent-orange)] hover:text-white transition-colors flex items-center justify-center gap-1.5 border border-[var(--accent-orange-border)]"
                      >
                        <Bot className="w-3.5 h-3.5" />
                        <span>{aiAnalyzing ? "AI Agent Analyzing..." : "Verify Details with AI Agent"}</span>
                      </button>
                      <span className="text-[10px] text-[var(--text-light)] text-center sm:text-right">
                        Checks UBA 1028382219 transfer match
                      </span>
                    </div>

                    {/* AI Verification Result Card */}
                    {aiResult && (
                      <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs space-y-1 animate-in fade-in">
                        <div className="flex items-center justify-between font-bold">
                          <span className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>AI Payment Agent Analysis:</span>
                          </span>
                          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                            {aiResult.confidence} confidence
                          </span>
                        </div>
                        <p className="text-[11px] leading-relaxed">{aiResult.summary}</p>
                      </div>
                    )}

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
          )}
        </div>
      )}

      {/* Contact and Legal info */}
      <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 space-y-3 text-xs sm:text-sm">
        <h4 className="font-serif font-bold text-sm sm:text-base text-[var(--text-main)]">
          Need Help or Have Questions?
        </h4>
        <p className="text-[var(--text-muted)] leading-relaxed">
          Our team is available to assist you with Paystack payment, bank transfers, CapCut installation, and class links.
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
