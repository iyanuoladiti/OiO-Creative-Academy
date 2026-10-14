/**
 * OiO CREATIVE ACADEMY - CONFIGURATION FILE
 * 
 * Edit values here without touching application logic.
 */

export const ACADEMY_CONFIG = {
  // Brand & Company details
  ACADEMY_NAME: "OiO Creative Academy",
  PARENT_COMPANY: "OiO Design and Engineering LTD",
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
  COURSE_DURATION: "5 classes across 3 weeks (1 hour 30 mins per session · 7 hrs 30 mins total)",
  SOFTWARE_FOCUS: "CapCut (Both Smartphone and Computer / Desktop users welcome)",
  START_DATE: "Saturday, November 7, 2026",
  SCHEDULE_TEXT: "Saturdays & Sundays in November 2026 • 7:00 PM – 8:30 PM (WAT)",
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
    BANK_NAME: "Kuda Bank / Zenith Bank",
    ACCOUNT_NAME: "OiO Design and Engineering LTD",
    ACCOUNT_NUMBER: "2048196922",
    NOTE: "Please include your full name or email as the transfer narration so we can approve your seat immediately.",
  },

  PAYSTACK_PUBLIC_KEY: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "pk_test_placeholder_key",

  // Authorized Admin Emails
  ADMIN_EMAIL: "oioserviceshq@gmail.com",
  ADMIN_EMAILS: [
    "oioserviceshq@gmail.com",
    "oladitiiyanu@gmail.com",
  ],

  // 5 Masterclass Days Content from Course Manual
  SYLLABUS_DAYS: [
    {
      day: 1,
      title: "Foundation: Getting Started & Timeline Basics",
      goal: "Interface tour, clip import, trimming, splitting, logical arrangement, and 15-second story assembly.",
      duration: "90 mins",
      assignment: "Assemble five raw clips into a 15–30-second story with clean edits.",
    },
    {
      day: 2,
      title: "Timeline, Transitions & Audio Mixing",
      goal: "Cut to the beat, speed ramps, smooth transitions, dialogue clarity, background music and SFX balance.",
      duration: "90 mins",
      assignment: "Produce a 20–30-second montage synchronized to musical beats with audio fades.",
    },
    {
      day: 3,
      title: "Text, Captions, Effects & Vertical Reels",
      goal: "Kinetic titles, auto-captions styling, stickers, visual effects, and 9:16 vertical retention hooks for Instagram/TikTok.",
      duration: "90 mins",
      assignment: "Create a 20–30-second Reel with a strong hook, readable captions and purposeful effects.",
    },
    {
      day: 4,
      title: "Keyframes, Masking, Overlays & Color",
      goal: "Smooth zoom keyframes, green screen chroma key, background cutout removal, and color/light correction.",
      duration: "90 mins",
      assignment: "Produce a product advertisement combining overlays, background replacement and color polish.",
    },
    {
      day: 5,
      title: "Professional Export & Freelance Client Strategy",
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
  const defaultMsg = "Hi OiO Creative Academy, I want to register for the CapCut Video Editing Masterclass (November Discount ₦20,000).";
  const text = encodeURIComponent(customMessage || defaultMsg);
  return `https://wa.me/${ACADEMY_CONFIG.WHATSAPP_NUMBER}?text=${text}`;
}

export function getWhatsAppPaymentConfirmationLink(name: string, email: string, reference?: string): string {
  const refText = reference ? ` My transfer reference is ${reference}.` : "";
  const msg = `Hi OiO Creative Academy, I have made payment for the CapCut Masterclass (₦20,000 discount tier). My name is ${name} (${email}).${refText} Please confirm my seat.`;
  return `https://wa.me/${ACADEMY_CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}

export function formatNaira(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}
