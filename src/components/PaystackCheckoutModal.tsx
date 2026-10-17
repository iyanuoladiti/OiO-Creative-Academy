import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { ACADEMY_CONFIG, formatNaira, setPaystackPublicKey, getPaystackPublicKey } from "../config";
import { triggerPaystackCheckout, convertNairaToKobo, generatePaystackReference } from "../services/paystack";
import { OiOLogo } from "./OiOLogo";
import {
  CreditCard,
  Lock,
  ShieldCheck,
  CheckCircle2,
  X,
  Sparkles,
  ShoppingBag,
  Plus,
  Minus,
  Check,
  Copy,
  ArrowRight,
  ExternalLink,
  Printer,
  Smartphone,
  Laptop,
  MessageCircle,
  Key,
  ChevronDown,
  AlertCircle,
} from "lucide-react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  description: string;
  isBase?: boolean;
}

interface PaystackCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessRedirect?: () => void;
}

export const PaystackCheckoutModal: React.FC<PaystackCheckoutModalProps> = ({
  isOpen,
  onClose,
  onSuccessRedirect,
}) => {
  const { user, profile, confirmPaystackSuccess } = useAuth();

  // Form Fields
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerWhatsapp, setCustomerWhatsapp] = useState("");
  const [customKey, setCustomKey] = useState("");
  const [showKeyConfig, setShowKeyConfig] = useState(false);

  // Cart state
  const [quantity, setQuantity] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Success state & receipt
  const [successReceipt, setSuccessReceipt] = useState<{
    reference: string;
    amountNaira: number;
    amountKobo: number;
    paidAt: string;
    customerName: string;
    customerEmail: string;
    itemsSummary: string;
  } | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);

  // Initialize customer fields from auth profile
  useEffect(() => {
    if (user || profile) {
      if (!customerName) {
        setCustomerName(profile?.displayName || user?.displayName || "");
      }
      if (!customerEmail) {
        setCustomerEmail(profile?.email || user?.email || "");
      }
      if (!customerWhatsapp) {
        setCustomerWhatsapp(profile?.whatsapp || "");
      }
    }
    setCustomKey(getPaystackPublicKey());
  }, [user, profile]);

  if (!isOpen) return null;

  // Addon definitions
  const addons: CartItem[] = [
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

  // Dynamic cart calculation
  const basePricePerSeat = ACADEMY_CONFIG.COURSE_FEE_NAIRA; // 20,000 early bird
  const standardPricePerSeat = ACADEMY_CONFIG.STANDARD_FEE_NAIRA; // 45,000 standard
  const seatsTotal = basePricePerSeat * quantity;

  const addonsTotal = selectedAddons.reduce((sum, addonId) => {
    const item = addons.find((a) => a.id === addonId);
    return sum + (item ? item.price : 0);
  }, 0);

  const totalNaira = seatsTotal + addonsTotal;
  const totalKobo = convertNairaToKobo(totalNaira);
  const totalDiscount = (standardPricePerSeat - basePricePerSeat) * quantity;

  const toggleAddon = (id: string) => {
    setError(null);
    if (selectedAddons.includes(id)) {
      setSelectedAddons(selectedAddons.filter((item) => item !== id));
    } else {
      setSelectedAddons([...selectedAddons, id]);
    }
  };

  const handleSaveCustomKey = () => {
    if (customKey.trim()) {
      setPaystackPublicKey(customKey.trim());
      setShowKeyConfig(false);
    }
  };

  const handlePaystackPayment = async () => {
    setError(null);

    // Validate inputs
    if (!customerName.trim()) {
      setError("Please provide your full name for the student registry.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!customerEmail.trim() || !emailRegex.test(customerEmail.trim())) {
      setError("Please enter a valid email address to receive your receipt and class link.");
      return;
    }

    const activeKey = customKey.trim() || ACADEMY_CONFIG.PAYSTACK_PUBLIC_KEY;
    if (!activeKey || !activeKey.startsWith("pk_")) {
      setError("A valid Paystack Public Key (starting with 'pk_test_' or 'pk_live_') is required.");
      setShowKeyConfig(true);
      return;
    }

    setProcessing(true);

    const transactionReference = generatePaystackReference("OIO");
    const itemsDescription = `${quantity}x ${ACADEMY_CONFIG.COURSE_NAME}${
      selectedAddons.length > 0 ? ` + ${selectedAddons.length} Add-on(s)` : ""
    }`;

    try {
      await triggerPaystackCheckout({
        key: activeKey,
        email: customerEmail.trim(),
        amount: totalKobo, // Dynamic Kobo conversion
        ref: transactionReference,
        metadata: {
          student_name: customerName.trim(),
          student_whatsapp: customerWhatsapp.trim(),
          course_name: ACADEMY_CONFIG.COURSE_NAME,
          custom_fields: [
            {
              display_name: "Student Name",
              variable_name: "student_name",
              value: customerName.trim(),
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
          setProcessing(false);
          const finalRef = response.reference || transactionReference;

          // Save verified payment to Firestore and upgrade student enrollment
          confirmPaystackSuccess({
            reference: finalRef,
            amountNaira: totalNaira,
            amountKobo: totalKobo,
            customerEmail: customerEmail.trim(),
            customerName: customerName.trim(),
            notes: `Paystack Online Gateway | ${itemsDescription}`,
          }).catch((err) => {
            console.error("Error recording Paystack payment:", err);
          });

          // Trigger Success State with receipt
          setSuccessReceipt({
            reference: finalRef,
            amountNaira: totalNaira,
            amountKobo: totalKobo,
            paidAt: new Date().toLocaleDateString("en-NG", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
            customerName: customerName.trim(),
            customerEmail: customerEmail.trim(),
            itemsSummary: itemsDescription,
          });
        },
        onClose: () => {
          setProcessing(false);
        },
      });
    } catch (err: unknown) {
      setProcessing(false);
      setError(
        err instanceof Error ? err.message : "Failed to launch Paystack popup. Please try again."
      );
    }
  };

  const handleCopyReference = (ref: string) => {
    navigator.clipboard.writeText(ref);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl shadow-2xl overflow-hidden my-4">
        {/* Top Header */}
        <div className="p-4 sm:p-6 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-page)]/50">
          <div className="flex items-center gap-3">
            <OiOLogo size="sm" />
            <div className="h-4 w-px bg-[var(--border-subtle)]" />
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold">
              <Lock className="w-3 h-3" />
              <span>Paystack Secured</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-subtle)] transition-colors"
            aria-label="Close checkout"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Either 'Thank You' Confirmation Screen or Cart Checkout Form */}
        {successReceipt ? (
          /* THANK YOU CONFIRMATION SCREEN */
          <div className="p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/15 border-2 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Payment Confirmed via Paystack</span>
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--text-main)]">
                Thank You, {successReceipt.customerName.split(" ")[0]}!
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-md mx-auto leading-relaxed">
                Your tuition payment has been verified successfully. Your student seat for the{" "}
                <strong>CapCut Masterclass (November Cohort)</strong> is locked in and fully active.
              </p>
            </div>

            {/* Official Itemized Receipt */}
            <div className="p-5 rounded-2xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] space-y-3.5 text-xs sm:text-sm">
              <div className="flex justify-between items-center pb-2.5 border-b border-[var(--border-subtle)]">
                <span className="text-[var(--text-muted)]">Transaction Reference:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-[var(--text-main)]">
                    {successReceipt.reference}
                  </span>
                  <button
                    onClick={() => handleCopyReference(successReceipt.reference)}
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
                <span className="text-[var(--text-muted)]">Student Details:</span>
                <span className="font-semibold text-[var(--text-main)] text-right">
                  {successReceipt.customerName} ({successReceipt.customerEmail})
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[var(--text-muted)]">Payment Gateway:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  Paystack Inline (Cards, Bank Transfer, USSD)
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[var(--text-muted)]">Date & Time:</span>
                <span className="text-[var(--text-main)]">{successReceipt.paidAt}</span>
              </div>

              <div className="flex justify-between items-center pt-2.5 border-t border-[var(--border-subtle)]">
                <span className="font-bold text-[var(--text-main)]">Total Amount Paid:</span>
                <span className="font-serif text-lg font-bold text-[var(--accent-orange)]">
                  {formatNaira(successReceipt.amountNaira)}
                </span>
              </div>
            </div>

            {/* Next Steps & Action Buttons */}
            <div className="space-y-3 pt-2">
              <button
                onClick={() => {
                  onClose();
                  if (onSuccessRedirect) {
                    onSuccessRedirect();
                  } else if (typeof window !== "undefined") {
                    window.location.hash = "#dashboard";
                    window.location.reload();
                  }
                }}
                className="w-full py-3.5 px-5 rounded-2xl text-xs sm:text-sm font-bold bg-[var(--accent-orange)] text-white hover:bg-[var(--accent-orange-hover)] transition-all shadow-md flex items-center justify-center gap-2"
              >
                <span>Enter Your Learning Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <a
                  href={`https://wa.me/${ACADEMY_CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(
                    `Hi OiO Creative Academy, I just completed my Paystack payment for CapCut Masterclass. Reference: ${successReceipt.reference}. Please add me to the cohort WhatsApp group!`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-4 rounded-xl text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Join Class WhatsApp Group</span>
                </a>

                <button
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
          /* CART & DYNAMIC CHECKOUT FORM */
          <div className="p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[var(--text-main)]">
                Enroll via Paystack
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                Pay instantly with your ATM Card, Bank Account, Transfer, or USSD using Nigeria's most trusted gateway.
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Dynamic Cart Items */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-[var(--text-main)] uppercase tracking-wider pb-2 border-b border-[var(--border-subtle)]">
                <span className="flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-[var(--accent-orange)]" />
                  <span>Order Summary</span>
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  ₦25,000 Early-Bird Active
                </span>
              </div>

              {/* Main Course Item */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <h4 className="font-bold text-xs sm:text-sm text-[var(--text-main)]">
                    {ACADEMY_CONFIG.COURSE_NAME}
                  </h4>
                  <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                    5 Live Classes (90 mins each) • Google Meet • Lifetime Footage & Recordings
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] text-[var(--text-light)] line-through">
                      {formatNaira(standardPricePerSeat)}
                    </span>
                    <span className="text-xs font-bold text-[var(--accent-orange)]">
                      {formatNaira(basePricePerSeat)} / seat
                    </span>
                  </div>
                </div>

                {/* Seat Quantity Selector */}
                <div className="flex items-center gap-2 border border-[var(--border-subtle)] rounded-lg bg-[var(--bg-surface)] p-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-main)] disabled:opacity-30"
                    title="Decrease seats"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="font-mono text-xs font-bold px-1.5">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-main)]"
                    title="Increase seats"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Optional Add-ons */}
              <div className="pt-2 border-t border-[var(--border-subtle)] space-y-2">
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
                          ? "bg-[var(--accent-orange-soft)] border-[var(--accent-orange)]"
                          : "bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-[var(--text-light)]"
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div
                          className={`w-4 h-4 rounded border mt-0.5 flex items-center justify-center shrink-0 ${
                            isChecked
                              ? "bg-[var(--accent-orange)] border-[var(--accent-orange)] text-white"
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

              {/* Dynamic Totals */}
              <div className="pt-3 border-t border-[var(--border-subtle)] space-y-1.5 text-xs">
                <div className="flex justify-between text-[var(--text-muted)]">
                  <span>Subtotal ({quantity} seat{quantity > 1 ? "s" : ""}):</span>
                  <span>{formatNaira(seatsTotal)}</span>
                </div>
                {addonsTotal > 0 && (
                  <div className="flex justify-between text-[var(--text-muted)]">
                    <span>Add-ons ({selectedAddons.length}):</span>
                    <span>+{formatNaira(addonsTotal)}</span>
                  </div>
                )}
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span>Promotional Discount:</span>
                  <span>-{formatNaira(totalDiscount)}</span>
                </div>
                <div className="flex justify-between text-[var(--text-muted)]">
                  <span>Paystack Processing Fee:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">₦0 (Covered by OiO)</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-[var(--border-subtle)] text-sm font-bold">
                  <span className="text-[var(--text-main)]">Total Amount:</span>
                  <div className="text-right">
                    <span className="font-serif text-xl font-bold text-[var(--accent-orange)]">
                      {formatNaira(totalNaira)}
                    </span>
                    <div className="text-[10px] text-[var(--text-light)] font-mono">
                      ({totalKobo.toLocaleString()} Kobo)
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Information Inputs */}
            <div className="space-y-3.5">
              <div className="text-xs font-bold text-[var(--text-main)] uppercase tracking-wider flex items-center justify-between">
                <span>Student Details</span>
                <span className="text-[10px] text-[var(--text-light)] font-normal">
                  Pre-filled for your certificate & access
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--text-main)] mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tunde Adeyemi"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-orange)]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[var(--text-main)] mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="student@gmail.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-orange)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--text-main)] mb-1">
                  WhatsApp Number (optional, for Google Meet notifications)
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 08101969224"
                  value={customerWhatsapp}
                  onChange={(e) => setCustomerWhatsapp(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-orange)]"
                />
              </div>

              {/* Paystack Public Key Configuration Toggle */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowKeyConfig(!showKeyConfig)}
                  className="text-[11px] text-[var(--text-light)] hover:text-[var(--accent-orange)] flex items-center gap-1 transition-colors"
                >
                  <Key className="w-3 h-3" />
                  <span>Using custom Paystack Public Key? (Click to view/change)</span>
                  <ChevronDown
                    className={`w-3 h-3 transition-transform ${showKeyConfig ? "rotate-180" : ""}`}
                  />
                </button>

                {showKeyConfig && (
                  <div className="p-3 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] space-y-2 mt-2 animate-in fade-in">
                    <label className="block text-[10px] font-semibold text-[var(--text-main)]">
                      Paystack Public Key (starts with pk_test_ or pk_live_)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="pk_test_..."
                        value={customKey}
                        onChange={(e) => setCustomKey(e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs font-mono text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-orange)]"
                      />
                      <button
                        type="button"
                        onClick={handleSaveCustomKey}
                        className="px-3 py-1.5 rounded-lg bg-[var(--accent-orange)] text-white text-xs font-semibold"
                      >
                        Save
                      </button>
                    </div>
                    <p className="text-[10px] text-[var(--text-light)]">
                      Current Active: <code className="font-mono">{customKey || "Default Test Key"}</code>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Clean Paystack Checkout Button */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handlePaystackPayment}
                disabled={processing}
                className="w-full py-4 px-6 rounded-2xl text-sm sm:text-base font-bold bg-[#0aa564] hover:bg-[#088b54] text-white shadow-lg shadow-emerald-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-3 disabled:opacity-60 cursor-pointer"
              >
                {processing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Connecting Secure Paystack Checkout...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    <span>
                      Pay {formatNaira(totalNaira)} with Paystack
                      {selectedAddons.length > 0 && (
                        <span className="opacity-90 font-medium">
                          {" "}
                          ({quantity} Course + {selectedAddons.length} Add-on
                          {selectedAddons.length > 1 ? "s" : ""})
                        </span>
                      )}
                    </span>
                    <Lock className="w-4 h-4 ml-1 opacity-80" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-4 text-[11px] text-[var(--text-light)]">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>256-Bit Bank Grade SSL</span>
                </span>
                <span>•</span>
                <span>Mastercard, Visa, Verve & Transfer</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
