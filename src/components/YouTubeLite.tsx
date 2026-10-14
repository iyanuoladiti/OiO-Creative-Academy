import React, { useState } from "react";
import { Play, Video, Film, Sparkles } from "lucide-react";

interface YouTubeLiteProps {
  videoId?: string;
  title?: string;
  aspectRatio?: string;
  className?: string;
}

export const YouTubeLite: React.FC<YouTubeLiteProps> = ({
  videoId,
  title = "Course Preview Video",
  className = "",
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  // If no valid video ID is provided, render an editorial placeholder
  if (!videoId || videoId.trim() === "") {
    return (
      <div
        className={`relative w-full aspect-video rounded-2xl overflow-hidden border border-[var(--border-subtle)] bg-stone-900 text-stone-200 flex flex-col items-center justify-center p-6 text-center ${className}`}
      >
        <div className="w-14 h-14 rounded-full bg-orange-600/20 text-orange-400 flex items-center justify-center mb-4 border border-orange-500/30">
          <Film className="w-6 h-6" />
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-orange-400 mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Inside the Studio</span>
        </div>
        <h3 className="font-serif text-xl sm:text-2xl text-stone-100 max-w-md font-semibold">
          Preview Reel: Real Client Timelines & Workflow
        </h3>
        <p className="text-xs sm:text-sm text-stone-400 max-w-sm mt-2 leading-relaxed">
          See actual Premiere Pro & DaVinci timelines, project folders, and pacing breakdowns taught in the course.
        </p>
      </div>
    );
  }

  // Active iframe
  if (isPlaying) {
    return (
      <div className={`relative w-full aspect-video rounded-2xl overflow-hidden border border-[var(--border-subtle)] bg-black shadow-lg ${className}`}>
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0"
        />
      </div>
    );
  }

  // Lightweight thumbnail preview before click (saves 800KB+ data!)
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  return (
    <div
      onClick={() => setIsPlaying(true)}
      className={`group relative w-full aspect-video rounded-2xl overflow-hidden border border-[var(--border-subtle)] cursor-pointer bg-stone-950 shadow-md transition-all hover:shadow-xl ${className}`}
      role="button"
      tabIndex={0}
      aria-label={`Play ${title}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          setIsPlaying(true);
        }
      }}
    >
      <img
        src={thumbnailUrl}
        alt={title}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-80"
        onError={(e) => {
          // Hide broken image thumbnail if custom placeholder needed
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />

      {/* Play button */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[var(--accent-orange)] text-white flex items-center justify-center shadow-2xl transition-all duration-300 group-hover:scale-110 group-hover:bg-[#cf4d07]">
          <Play className="w-7 h-7 sm:w-9 sm:h-9 translate-x-0.5 fill-white" />
        </div>
        <div className="mt-4 text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 text-xs font-medium text-stone-200">
            <Video className="w-3.5 h-3.5 text-orange-400" />
            Watch 90-sec overview • Tap to load video
          </span>
        </div>
      </div>
    </div>
  );
};
