import React, { useState } from "react";
import { ACADEMY_CONFIG, formatNaira, getWhatsAppRegistrationLink } from "../config";
import { YouTubeLite } from "../components/YouTubeLite";
import { OiOLogo } from "../components/OiOLogo";
import { useAuth } from "../context/AuthContext";
import {
  Scissors,
  Volume2,
  Type,
  Palette,
  Smartphone,
  Briefcase,
  Users,
  Video,
  BookOpen,
  FolderDown,
  MessageCircle,
  CheckCircle2,
  ChevronDown,
  ArrowRight,
  Calendar,
  Clock,
  Sparkles,
  MapPin,
  HelpCircle,
  Laptop,
  Zap,
  LayoutDashboard,
} from "lucide-react";

interface HomePageProps {
  onRegisterClick: () => void;
  onExploreCurriculum: () => void;
  onNavigate?: (tab: string) => void;
  onOpenCheckout?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onRegisterClick,
  onNavigate,
  onOpenCheckout,
}) => {
  const { user, isEnrolled, isPending } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handlePrimaryAction = () => {
    if (isEnrolled) {
      if (onNavigate) onNavigate("dashboard");
    } else if (isPending) {
      if (onNavigate) onNavigate("pending");
    } else if (onOpenCheckout) {
      onOpenCheckout();
    } else {
      onRegisterClick();
    }
  };

  const scrollToCurriculum = () => {
    const el = document.getElementById("curriculum");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const learningCards = [
    {
      icon: Scissors,
      day: 1,
      title: "Foundation: Getting Started & Timeline Basics",
      description:
        "CapCut mobile & desktop interface tour, media importing, precise trimming and splitting, arranging clips, and assembling clean 15-second stories.",
    },
    {
      icon: Volume2,
      day: 2,
      title: "Timeline, Transitions & Audio Mixing",
      description:
        "Synchronizing cuts to musical beats, speed ramps and curves, balancing background music with speech clarity, and adding punchy sound effects (SFX).",
    },
    {
      icon: Type,
      day: 3,
      title: "Text, Captions, Effects & Vertical Reels",
      description:
        "Styling readable auto-captions, keyframed kinetic text animations, tasteful visual effects, and crafting high-retention 9:16 vertical video hooks for TikTok and Reels.",
    },
    {
      icon: Palette,
      day: 4,
      title: "Keyframes, Masking, Overlays & Color Polish",
      description:
        "Smooth scale/position keyframe zooms, green screen chroma key, AI background cutout removal, natural skin tone color correction, and product commercials.",
    },
    {
      icon: Briefcase,
      day: 5,
      title: "Professional Export & Freelance Client Strategy",
      description:
        "Optimal export bitrates (1080x1920 for Reels, 1920x1080 for YouTube), creating a standout 3-5 video commercial portfolio, finding clients, and pricing your edits in Nigeria.",
    },
    {
      icon: Smartphone,
      day: "All",
      title: "Mobile & PC Workflow Mastery",
      description:
        "Whether you edit on an Android phone, iPhone, Windows laptop, or Mac, you master the exact same professional editing principles and commercial workflow.",
    },
  ];

  const whoItsFor = [
    {
      title: "Smartphone & PC Beginners",
      description:
        "You don't need a ₦1,000,000 gaming laptop. If you have a smartphone or any basic PC with CapCut installed, we teach you how to produce commercial-grade videos from scratch.",
    },
    {
      title: "Designers & Marketers",
      description:
        "You already understand graphic design or branding, but clients are demanding video. Learn video pacing, motion, and captions to charge more for video content packages.",
    },
    {
      title: "Content Creators & Founders",
      description:
        "You record videos for Instagram, TikTok, or YouTube and want crisp text hooks, punchy sound design, and clean color grading without hiring an expensive agency.",
    },
  ];

  const whatYouGet = [
    {
      icon: Video,
      title: "5 Live Classes on Google Meet (90 Mins Each)",
      description:
        "Live practical demonstrations across 3 weeks. Watch the instructor edit on mobile and desktop, follow along step-by-step, and get your questions answered live.",
    },
    {
      icon: BookOpen,
      title: "Permanent HD Recordings with No Expiry",
      description:
        "Every 90-minute live class is recorded and uploaded to your student portal immediately so you can rewatch techniques at your own pace anytime.",
    },
    {
      icon: FolderDown,
      title: "Raw Commercial Footage & Audio Assets",
      description:
        "Download sample product clips, sound effect packs, LUTs, and practical exercise projects to practice real client editing alongside the trainer.",
    },
    {
      icon: MessageCircle,
      title: "Direct WhatsApp Cohort Study Group",
      description:
        "Private study group with the instructor and fellow students. Get honest critique on your rough cuts, troubleshoot CapCut issues, and share work.",
    },
  ];

  const faqs = [
    {
      q: "Do I need a laptop or can I join with just a smartphone?",
      a: "You can participate fully with just a smartphone (Android or iPhone) or a PC/Mac. CapCut is available free on mobile and desktop, and we explicitly demonstrate workflows on both devices so everyone is included.",
    },
    {
      q: "Is there a limit on the number of students?",
      a: "Seats are not capped since this is an online live stream with digital practice downloads. However, the special ₦20,000 promotional discount (down from ₦45,000 standard tuition) is reserved for the first 10 students who confirm their seats.",
    },
    {
      q: "What is the schedule of the 5 classes?",
      a: "The training spans 3 weeks in November 2026. Classes run on weekend evenings from 7:00 PM to 8:30 PM (West Africa Time). Each session lasts 90 minutes with live practice and Q&A.",
    },
    {
      q: "What if I miss a live class due to network or power issues?",
      a: "We are based in Ibadan, Nigeria, and understand local connectivity realities. Every single session is recorded in HD and posted to your learning portal immediately after class for unlimited rewatching.",
    },
    {
      q: "How do I make payment and confirm my registration?",
      a: "You can pay via bank transfer directly to our corporate account: OiO Design and Engineering LTD (RC 8014049). Once you make the transfer, enter your transfer reference on the confirmation screen or message us on WhatsApp for instant confirmation.",
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-24 sm:pb-16 text-[var(--text-main)]">
      {/* 1. HERO SECTION */}
      <section className="pt-4 sm:pt-8 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          {/* Official Brand Logo */}
          <div className="flex justify-center pt-2">
            <OiOLogo size="md" className="mx-auto" />
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--accent-orange-soft)] border border-[var(--accent-orange-border)] text-[var(--accent-orange)] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>CapCut Masterclass • Starts Thursday, Nov 19, 2026</span>
          </div>

          {/* Main Headline */}
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[var(--text-main)] leading-[1.15]">
            Learn video editing the way we actually do it.
          </h1>

          {/* Promise */}
          <p className="text-base sm:text-lg text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed">
            A 5-day hands-on CapCut training by practicing editors in Ibadan (2 classes per week, final class in week 3). Master commercial pacing, clean audio, kinetic text, and freelance client workflows on your phone or laptop.
          </p>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={handlePrimaryAction}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-sm bg-[var(--accent-orange)] text-white hover:bg-[var(--accent-orange-hover)] shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {isEnrolled ? (
                <>
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Go to My Dashboard (Enrolled)</span>
                </>
              ) : isPending ? (
                <>
                  <Clock className="w-4 h-4" />
                  <span>Confirm Tuition & Unlock Seat</span>
                </>
              ) : (
                <>
                  <span>Reserve My Seat (₦20,000 Early-Bird)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <button
              onClick={scrollToCurriculum}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-sm bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] text-[var(--text-main)] transition-colors"
            >
              See 5-Day Curriculum
            </button>
          </div>

          {/* Key Facts Row: Dates, Format, Fee */}
          <div className="pt-6 max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
            <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] flex items-start gap-3">
              <Calendar className="w-5 h-5 text-[var(--accent-orange)] shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-light)]">
                  Schedule
                </p>
                <p className="text-xs sm:text-sm font-semibold text-[var(--text-main)] mt-0.5">
                  5 Classes · 3 Weeks
                </p>
                <p className="text-[11px] text-[var(--text-muted)]">90 mins per session (WAT)</p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] flex items-start gap-3">
              <Smartphone className="w-5 h-5 text-[var(--accent-orange)] shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-light)]">
                  Device
                </p>
                <p className="text-xs sm:text-sm font-semibold text-[var(--text-main)] mt-0.5">
                  CapCut Mobile & PC
                </p>
                <p className="text-[11px] text-[var(--text-muted)]">Live on Google Meet</p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] flex items-start gap-3">
              <Zap className="w-5 h-5 text-[var(--accent-orange)] shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-light)]">
                  Tuition
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xs text-[var(--text-light)] line-through">
                    {formatNaira(ACADEMY_CONFIG.STANDARD_FEE_NAIRA)}
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-[var(--accent-orange)]">
                    {formatNaira(ACADEMY_CONFIG.NOVEMBER_DISCOUNT_FEE_NAIRA)}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  First 10 students discount
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. VIDEO AD SECTION (LIGHTWEIGHT ON-DEMAND YOUTUBE) */}
      <section className="px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-3">
          <div className="text-center sm:text-left flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-light)]">
              Inside CapCut: Video Ad & Editing Walkthrough
            </span>
            <span className="text-xs text-[var(--text-muted)] hidden sm:inline">
              Data saver: plays only when tapped
            </span>
          </div>

          <YouTubeLite
            videoId={ACADEMY_CONFIG.YOUTUBE_PROMO_ID}
            title={`${ACADEMY_CONFIG.COURSE_NAME} - Promo Reel`}
          />
        </div>
      </section>

      {/* 3. WHY THIS TRAINING (HONEST, PERSONAL PARAGRAPH) */}
      <section className="px-4 sm:px-6">
        <div className="max-w-3xl mx-auto rounded-2xl p-6 sm:p-10 border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent-orange)]">
            Why This Training
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--text-main)]">
            We edit for real clients. We teach what shows up in real work.
          </h2>
          <div className="space-y-3 text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
            <p>
              You don’t need high-end studio gear to edit clean commercial videos. Many top viral ads and brand campaigns are cut entirely inside CapCut. The bottleneck is rarely the software; it’s understanding rhythm, audio balancing, kinetic typography, and storytelling.
            </p>
            <p>
              At <strong>{ACADEMY_CONFIG.PARENT_COMPANY} ({ACADEMY_CONFIG.COMPANY_RC})</strong>, we edit commercials and marketing reels for clients every single week. We created OiO Creative Academy to teach video editing as an honest, practical craft: how to take raw mobile or camera clips, cut out the fluff, add rhythm, and export videos that clients gladly pay for.
            </p>
          </div>
        </div>
      </section>

      {/* 4. WHAT YOU'LL LEARN (6 CARDS COVERING 5-DAY CURRICULUM) */}
      <section id="curriculum" className="px-4 sm:px-6 scroll-mt-24">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent-orange)]">
              Complete Syllabus
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[var(--text-main)]">
              What you will master in 5 classes
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)]">
              5 focused 90-minute live classes structured for hands-on practice and portfolio creation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {learningCards.map((card, idx) => {
              const IconComp = card.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--accent-orange)]/50 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--accent-orange-soft)] text-[var(--accent-orange)] flex items-center justify-center">
                      <IconComp className="w-5 h-5" />
                    </div>
                    <h3 className="font-serif text-lg font-bold text-[var(--text-main)]">
                      {card.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                  <div className="pt-4 mt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] font-semibold text-[var(--text-light)]">
                    <span>{card.day === "All" ? "Every Session" : `Day 0${card.day}`}</span>
                    <span>90 Minutes</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. WHO IT'S FOR */}
      <section className="px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent-orange)]">
              Target Audience
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--text-main)]">
              Who this is for
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {whoItsFor.map((item, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-3"
              >
                <div className="w-8 h-8 rounded-full bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-[var(--accent-orange)] font-bold text-xs flex items-center justify-center">
                  {idx + 1}
                </div>
                <h3 className="font-serif text-lg font-bold text-[var(--text-main)]">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. WHAT YOU GET */}
      <section className="px-4 sm:px-6">
        <div className="max-w-4xl mx-auto rounded-3xl p-6 sm:p-10 border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-8">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent-orange)]">
              Course Package
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--text-main)]">
              What you get as a registered student
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {whatYouGet.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div key={idx} className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[var(--accent-orange-soft)] text-[var(--accent-orange)] flex items-center justify-center shrink-0 mt-0.5">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-serif text-base font-bold text-[var(--text-main)]">
                      {item.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. HOW IT WORKS IN 3 STEPS */}
      <section className="px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent-orange)]">
              Enrollment Process
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--text-main)]">
              How it works in 3 simple steps
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-2">
              <span className="text-3xl font-serif font-bold text-[var(--accent-orange)]">
                01
              </span>
              <h3 className="font-serif text-lg font-bold text-[var(--text-main)]">
                Create Free Account
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                Sign up with your email, name, and WhatsApp number in under 60 seconds.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-2">
              <span className="text-3xl font-serif font-bold text-[var(--accent-orange)]">
                02
              </span>
              <h3 className="font-serif text-lg font-bold text-[var(--text-main)]">
                Select Course & Pay
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                See the complete 5-day breakdown, transfer tuition (₦20,000 early-bird rate), and submit your reference.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-2">
              <span className="text-3xl font-serif font-bold text-[var(--accent-orange)]">
                03
              </span>
              <h3 className="font-serif text-lg font-bold text-[var(--text-main)]">
                Unlock Dashboard & Join
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                Once approved, tap individual Google Meet links, download CapCut project files, and track your completion progress.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FEE AND DATES BLOCK */}
      <section className="px-4 sm:px-6">
        <div className="max-w-3xl mx-auto rounded-3xl border-2 border-[var(--accent-orange)] bg-[var(--bg-surface)] p-6 sm:p-10 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold tracking-wider text-[var(--accent-orange)]">
                  November Early-Bird Offer
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                  Save ₦25,000
                </span>
              </div>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="font-serif text-3xl sm:text-5xl font-bold text-[var(--text-main)]">
                  {formatNaira(ACADEMY_CONFIG.NOVEMBER_DISCOUNT_FEE_NAIRA)}
                </span>
                <span className="text-sm sm:text-base text-[var(--text-light)] line-through font-semibold">
                  {formatNaira(ACADEMY_CONFIG.STANDARD_FEE_NAIRA)}
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Special promotional discount reserved for the first 10 registered students.
              </p>
            </div>
            <div className="sm:text-right">
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                Online Interactive Training
              </span>
              <p className="text-xs text-[var(--text-light)] mt-1">
                Seats are not capped
              </p>
            </div>
          </div>

          <div className="space-y-2 text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-[var(--text-main)]">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Full 5 classes across 3 weeks (90 mins per session · 7h 30m total)</span>
            </div>
            <div className="flex items-center gap-2 text-[var(--text-main)]">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>CapCut mobile (phone) & PC desktop workflows covered</span>
            </div>
            <div className="flex items-center gap-2 text-[var(--text-main)]">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Permanent HD recordings & raw exercise footage downloads</span>
            </div>
            <div className="flex items-center gap-2 text-[var(--text-main)]">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Personal dashboard with progress indicator & CapCut certificate criteria</span>
            </div>
            <div className="flex items-center gap-2 text-[var(--text-main)]">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Direct WhatsApp cohort group feedback with practicing editors</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handlePrimaryAction}
              className="w-full py-4 px-6 rounded-xl font-bold text-sm sm:text-base bg-[var(--accent-orange)] text-white hover:bg-[var(--accent-orange-hover)] shadow-md transition-all flex items-center justify-center gap-2"
            >
              {isEnrolled ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                  <span>You Are Enrolled • Go to My Dashboard</span>
                </>
              ) : isPending ? (
                <>
                  <Clock className="w-4 h-4" />
                  <span>Confirm Tuition & Unlock Learning Dashboard</span>
                </>
              ) : (
                <>
                  <span>Reserve My Seat (₦20,000 Discount)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* 9. FAQ WITH EXPANDABLE ANSWERS */}
      <section className="px-4 sm:px-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent-orange)]">
              Clear Answers
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--text-main)]">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden transition-all"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-serif text-sm sm:text-base font-bold text-[var(--text-main)] hover:bg-[var(--bg-surface-subtle)] transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-[var(--text-muted)] shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-[var(--accent-orange)]" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-5 sm:px-5 sm:pb-5 text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed border-t border-[var(--border-subtle)]/50 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 10. FINAL CALL TO ACTION + WHATSAPP */}
      <section className="px-4 sm:px-6">
        <div className="max-w-4xl mx-auto rounded-3xl p-8 sm:p-12 text-center bg-gradient-to-b from-[var(--bg-surface)] to-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] space-y-6">
          <div className="flex justify-center">
            <OiOLogo size="sm" />
          </div>

          <div className="space-y-2 max-w-xl mx-auto">
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[var(--text-main)]">
              Ready to create videos you're proud of?
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
              Join the CapCut Masterclass today. Get practical coaching, commercial project footage, and start building client-ready edits.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={handlePrimaryAction}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-sm bg-[var(--accent-orange)] text-white hover:bg-[var(--accent-orange-hover)] shadow-md transition-all flex items-center justify-center gap-2"
            >
              {isEnrolled ? (
                <>
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Go to My Dashboard</span>
                </>
              ) : isPending ? (
                <>
                  <Clock className="w-4 h-4" />
                  <span>View Seat Confirmation & Bank Details</span>
                </>
              ) : (
                <>
                  <span>Reserve My Seat (₦20,000)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <a
              href={getWhatsAppRegistrationLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-sm bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat on WhatsApp</span>
            </a>
          </div>

          <p className="text-[11px] text-[var(--text-light)]">
            Direct questions? Email us at {ACADEMY_CONFIG.OFFICIAL_EMAIL} or chat on WhatsApp at +{ACADEMY_CONFIG.WHATSAPP_NUMBER}
          </p>
        </div>
      </section>

      {/* 11. MOBILE STICKY BOTTOM BAR */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-30 p-3 bg-[var(--bg-surface)]/95 backdrop-blur-md border-t border-[var(--border-subtle)] shadow-2xl flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-light)]">
            CapCut Masterclass
          </p>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-[var(--accent-orange)]">
              {formatNaira(ACADEMY_CONFIG.NOVEMBER_DISCOUNT_FEE_NAIRA)}
            </span>
            <span className="text-[10px] text-[var(--text-light)] line-through">
              {formatNaira(ACADEMY_CONFIG.STANDARD_FEE_NAIRA)}
            </span>
          </div>
        </div>
        <button
          onClick={handlePrimaryAction}
          className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs bg-[var(--accent-orange)] text-white shadow-sm active:scale-95 transition-all text-center"
        >
          {isEnrolled ? "Go to Dashboard" : isPending ? "Confirm Seat" : "Reserve Seat"}
        </button>
      </div>
    </div>
  );
};
