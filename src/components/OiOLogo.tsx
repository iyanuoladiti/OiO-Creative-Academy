import React from "react";

interface OiOLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
}

export const OiOLogo: React.FC<OiOLogoProps> = ({
  className = "",
  size = "md",
  showText = true,
}) => {
  const sizeMap = {
    sm: { width: 120, height: 44, iconOnlyWidth: 44, iconOnlyHeight: 28 },
    md: { width: 160, height: 58, iconOnlyWidth: 54, iconOnlyHeight: 34 },
    lg: { width: 220, height: 80, iconOnlyWidth: 72, iconOnlyHeight: 46 },
    xl: { width: 300, height: 110, iconOnlyWidth: 96, iconOnlyHeight: 60 },
  };

  const currentSize = sizeMap[size];

  if (!showText) {
    // Icon-only version of the OiO with cap
    return (
      <svg
        viewBox="0 0 160 100"
        width={currentSize.iconOnlyWidth}
        height={currentSize.iconOnlyHeight}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`shrink-0 ${className}`}
        aria-label="OiO Creative Academy"
      >
        {/* Left 'O' */}
        <circle cx="34" cy="56" r="30" stroke="#FF5800" strokeWidth="17" />

        {/* Center 'i' */}
        <rect x="71" y="38" width="17" height="48" rx="8.5" fill="#FF5800" />
        <circle cx="79.5" cy="22" r="8.5" fill="#FF5800" />

        {/* Right 'O' */}
        <circle cx="126" cy="56" r="30" stroke="#FF5800" strokeWidth="17" />

        {/* Graduation Cap atop right 'O' */}
        <g id="grad-cap">
          {/* Mortarboard Diamond */}
          <polygon
            points="142,6 172,18 142,30 112,18"
            fill="#FF5800"
          />
          {/* Skull Cap underside */}
          <path
            d="M125 24 C125 32 159 32 159 24 Z"
            fill="#E04C00"
          />
          {/* Tassel Button & String */}
          <circle cx="142" cy="18" r="2.5" fill="#ffffff" />
          <path
            d="M142 18 Q 166 22 168 34"
            stroke="#FF5800"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          {/* Tassel Drop */}
          <rect x="165" y="33" width="5.5" height="10" rx="2.5" fill="#FF5800" />
        </g>
      </svg>
    );
  }

  // Full Logo: "OiO" mark + "CREATIVE ACADEMY" text matching uploaded brand asset
  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      <svg
        viewBox="0 0 280 185"
        width={currentSize.width}
        height={currentSize.height}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
        aria-label="OiO Creative Academy"
      >
        {/* ===================== OiO MARK ===================== */}
        <g id="oio-mark">
          {/* Left 'O' */}
          <circle cx="56" cy="62" r="44" stroke="#FF5800" strokeWidth="25" />

          {/* Center 'i' */}
          <rect x="115" y="38" width="24" height="68" rx="12" fill="#FF5800" />
          <circle cx="127" cy="16" r="12" fill="#FF5800" />

          {/* Right 'O' */}
          <circle cx="198" cy="62" r="44" stroke="#FF5800" strokeWidth="25" />

          {/* Graduation Cap atop right 'O' */}
          <g id="cap" transform="translate(64, -20) scale(0.92)">
            {/* Mortarboard Diamond Top */}
            <polygon
              points="148,10 186,24 148,38 110,24"
              fill="#FF5800"
            />
            {/* Skull Cap Underneath */}
            <path
              d="M126 31 C126 41 170 41 170 31 Z"
              fill="#E04C00"
            />
            {/* Center Button */}
            <circle cx="148" cy="24" r="3.2" fill="#FFFFFF" />
            {/* Hanging Tassel Line */}
            <path
              d="M148 24 Q 180 28 183 45"
              stroke="#FF5800"
              strokeWidth="3.2"
              strokeLinecap="round"
              fill="none"
            />
            {/* Tassel Bell / Drop */}
            <rect x="179.5" y="44" width="7" height="13" rx="3.5" fill="#FF5800" />
          </g>
        </g>

        {/* ===================== CREATIVE ===================== */}
        <text
          x="140"
          y="146"
          textAnchor="middle"
          fill="var(--text-main)"
          style={{
            fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
            fontWeight: 900,
            fontSize: "36px",
            letterSpacing: "0.06em",
          }}
        >
          CREATIVE
        </text>

        {/* ===================== ACADEMY ===================== */}
        <text
          x="140"
          y="178"
          textAnchor="middle"
          fill="var(--text-main)"
          style={{
            fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
            fontWeight: 800,
            fontSize: "19px",
            letterSpacing: "0.42em",
          }}
        >
          ACADEMY
        </text>
      </svg>
    </div>
  );
};
