/**
 * OiO CREATIVE ACADEMY - CONFIGURATION FILE
 * 
 * Edit values here without touching application logic.
 */

export const ACADEMY_CONFIG = {
  // Brand & Company details
  ACADEMY_NAME: "OiO Creative Academy",
  PARENT_COMPANY: "OiO DESIGNS AND ENGINEERING",
  COMPANY_RC: "RC 8014049",
  OFFICIAL_EMAIL: "oioserviceshq@gmail.com",
  TAGLINE: "We design clearly. We build properly.",
  CITY_LOCATION: "Ibadan, Nigeria",

  // Primary WhatsApp contact (international format without '+')
  WHATSAPP_NUMBER: "2348101969224",

  // Course Information (Based on CapCut Video Editing Masterclass PDF)
  COURSE_NAME: "CapCut Video Editing Masterclass",
  COURSE_SUBTITLE: "Complete 5-Day Practical Course for Mobile & PC Creators",
  COURSE_TAGLINE: "Edit commercial-ready videos on your phone or laptop in 5 practical live sessions.",
  COURSE_SHORT_NAME: "CapCut Masterclass",
  COURSE_DURATION: "5 classes across 3 weeks (2 classes weekly, final class in week 3 · 90 mins per session)",
  SOFTWARE_FOCUS: "CapCut (Both Smartphone and Computer / Desktop users welcome)",
  START_DATE: "Thursday, November 19, 2026",
  SCHEDULE_TEXT: "Thursdays & Saturdays • 7:00 PM – 8:30 PM (WAT)",
  VENUE_OR_FORMAT: "Live Google Meet sessions + permanent HD recordings & project files",
  SEAT_LIMIT: null, // Unlimited online enrollment

  // Tuition & Discounts
  STANDARD_FEE_NAIRA: 45000,
  NOVEMBER_DISCOUNT_FEE_NAIRA: 20000, // Special early-bird for first 10 students
  DISCOUNT_SEATS_LIMIT: 10,

  // Default active fee
  get COURSE_FEE_NAIRA(): number {
    return this.NOVEMBER_DISCOUNT_FEE_NAIRA;
  },
  get COURSE_FEE_KOBO(): number {
    return this.COURSE_FEE_NAIRA * 100;
  },

  // Promo YouTube Video ID
  YOUTUBE_PROMO_ID: "M7lc1UVf-VE",

  // Payment Mode: "manual" or "paystack" (default: "manual")
  PAYMENT_MODE: (import.meta.env.VITE_PAYMENT_MODE || "manual") as "manual" | "paystack",

  // Manual payment instructions (Bank transfer details)
  MANUAL_PAYMENT: {
    BANK_NAME: "UBA BANK (United Bank for Africa)",
    ACCOUNT_NAME: "OiO DESIGNS AND ENGINEERING",
    ACCOUNT_NUMBER: "1028382219",
    NOTE: "Please include your full name or email as the transfer narration so we can approve your seat immediately.",
  },

  get PAYSTACK_PUBLIC_KEY(): string {
    return getPaystackPublicKey();
  },

  // Authorized Admin Emails
  ADMIN_EMAIL: "oioserviceshq@gmail.com",
  ADMIN_EMAILS: [
    "oioserviceshq@gmail.com",
    "oladitiiyanu@gmail.com",
  ],

  // 5 Masterclass Days Content from Course Manual (Updated for Nov 19 start date: 2 classes/week, final in week 3)
  SYLLABUS_DAYS: [
    {
      day: 1,
      title: "Foundation: Getting Started & Timeline Basics",
      dateFormatted: "Thursday, Nov 19, 2026",
      dateIso: "2026-11-19",
      time: "19:00",
      endTime: "20:30",
      week: 1,
      goal: "Interface tour, clip import, trimming, splitting, logical arrangement, and 15-second story assembly.",
      duration: "90 mins",
      assignment: "Assemble five raw clips into a 15–30-second story with clean edits.",
    },
    {
      day: 2,
      title: "Timeline, Transitions & Audio Mixing",
      dateFormatted: "Saturday, Nov 21, 2026",
      dateIso: "2026-11-21",
      time: "19:00",
      endTime: "20:30",
      week: 1,
      goal: "Cut to the beat, speed ramps, smooth transitions, dialogue clarity, background music and SFX balance.",
      duration: "90 mins",
      assignment: "Produce a 20–30-second montage synchronized to musical beats with audio fades.",
    },
    {
      day: 3,
      title: "Text, Captions, Effects & Vertical Reels",
      dateFormatted: "Thursday, Nov 26, 2026",
      dateIso: "2026-11-26",
      time: "19:00",
      endTime: "20:30",
      week: 2,
      goal: "Kinetic titles, auto-captions styling, stickers, visual effects, and 9:16 vertical retention hooks for Instagram/TikTok.",
      duration: "90 mins",
      assignment: "Create a 20–30-second Reel with a strong hook, readable captions and purposeful effects.",
    },
    {
      day: 4,
      title: "Keyframes, Masking, Overlays & Color",
      dateFormatted: "Saturday, Nov 28, 2026",
      dateIso: "2026-11-28",
      time: "19:00",
      endTime: "20:30",
      week: 2,
      goal: "Smooth zoom keyframes, green screen chroma key, background cutout removal, and color/light correction.",
      duration: "90 mins",
      assignment: "Produce a product advertisement combining overlays, background replacement and color polish.",
    },
    {
      day: 5,
      title: "Professional Export & Freelance Client Strategy",
      dateFormatted: "Thursday, Dec 3, 2026",
      dateIso: "2026-12-03",
      time: "19:00",
      endTime: "20:30",
      week: 3,
      goal: "Export settings (9:16 & 16:9 1080p), portfolio creation, client discovery, project pricing and revision management.",
      duration: "90 mins",
      assignment: "Submit capstone 30-second commercial portfolio cut for assessment rubric.",
    },
  ],
};

/**
 * WhatsApp link generators
 */
export function getWhatsAppRegistrationLink(customMessage?: string): string {
  const defaultMsg = "Hi OiO Creative Academy, I want to register for the CapCut Video Editing Masterclass (Start: 19th November, ₦20,000 Discount).";
  const text = encodeURIComponent(customMessage || defaultMsg);
  return `https://wa.me/${ACADEMY_CONFIG.WHATSAPP_NUMBER}?text=${text}`;
}

export function getWhatsAppPaymentConfirmationLink(name: string, email: string, reference?: string): string {
  const refText = reference ? ` My transfer reference is ${reference}.` : "";
  const msg = `Hi OiO Creative Academy, I paid to UBA 1028382219 (OiO DESIGNS AND ENGINEERING) for the CapCut Masterclass (₦20,000 discount tier). My name is ${name} (${email}).${refText} Please confirm my seat.`;
  return `https://wa.me/${ACADEMY_CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}

export function formatNaira(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getPaystackPublicKey(): string {
  if (typeof window !== "undefined") {
    const custom = localStorage.getItem("oio_paystack_public_key");
    if (custom && custom.trim().startsWith("pk_")) {
      return custom.trim();
    }
  }
  return (
    import.meta.env.VITE_PAYSTACK_PUBLIC_KEY ||
    "pk_test_156c4d3e5b721869e5d4cb941e7542fa79ec0389"
  );
}

export function setPaystackPublicKey(key: string): void {
  if (typeof window !== "undefined") {
    if (key && key.trim()) {
      localStorage.setItem("oio_paystack_public_key", key.trim());
    } else {
      localStorage.removeItem("oio_paystack_public_key");
    }
  }
}

