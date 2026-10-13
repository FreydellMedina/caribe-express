import React from 'react';

interface BrandLogoProps {
  className?: string;
  showTagline?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  showTagline = true,
  size = 'md',
}) => {
  const scale = {
    sm: 'scale-75 origin-left',
    md: 'scale-90 origin-left md:scale-100',
    lg: 'scale-110 origin-left',
    xl: 'scale-125 origin-center',
  }[size];

  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      {/* Dynamic Graphic SVG Logo */}
      <svg
        viewBox="0 0 420 145"
        className={`w-auto h-12 md:h-14 transition-transform ${scale}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Caribe Express Logo"
      >
        {/* Speed Streaks behind package */}
        <path d="M295 18 H325" stroke="#F97316" strokeWidth="6" strokeLinecap="round" />
        <path d="M285 28 H318" stroke="#F97316" strokeWidth="6" strokeLinecap="round" />
        <path d="M292 38 H310" stroke="#F97316" strokeWidth="6" strokeLinecap="round" />

        {/* Isometric 3D Delivery Box */}
        {/* Top Face */}
        <path
          d="M365 8 L398 22 L365 37 L332 23 Z"
          fill="#FDBA74"
          stroke="#0A2356"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        {/* Top Box Tape */}
        <path
          d="M348 15 L382 30"
          stroke="#0A2356"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* Left Face */}
        <path
          d="M332 23 L365 37 V75 L332 60 Z"
          fill="#FB923C"
          stroke="#0A2356"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        {/* Right Face */}
        <path
          d="M365 37 L398 22 V59 L365 75 Z"
          fill="#EA580C"
          stroke="#0A2356"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* Padlock (Security) */}
        {/* Shackle */}
        <path
          d="M386 42 C386 35 393 30 401 30 C409 30 416 35 416 42 V49 H386 V42 Z"
          fill="none"
          stroke="#0A2356"
          strokeWidth="4"
          strokeLinecap="round"
        />
        {/* Lock Body */}
        <rect
          x="381"
          y="47"
          width="40"
          height="32"
          rx="7"
          fill="#0A2356"
        />
        {/* Keyhole */}
        <circle cx="401" cy="59" r="3.5" fill="#FFFFFF" />
        <polygon points="399.5,59 402.5,59 404,70 398,70" fill="#FFFFFF" />

        {/* CARIBE text */}
        <g fill="#0A2356">
          {/* C */}
          <path d="M48 45 C48 34 56 26 69 26 H88 V39 H72 C68 39 65 42 65 47 V57 C65 62 68 65 72 65 H88 V78 H69 C56 78 48 70 48 59 Z" />
          {/* A */}
          <path d="M96 78 L111 26 H130 L145 78 H129 L126 65 H115 L112 78 H96 Z M118 53 H123 L120.5 40 Z" />
          {/* R */}
          <path d="M152 78 V26 H175 C185 26 193 33 193 42 C193 49 188 55 181 57 L194 78 H178 L168 60 H167 V78 H152 Z M167 48 H174 C177 48 180 46 180 42 C180 38 177 36 174 36 H167 V48 Z" />
          {/* i with orange square dot */}
          <path d="M201 78 V36 H214 V78 H201 Z" />
          {/* B */}
          <path d="M222 78 V26 H243 C251 26 257 30 257 36 C257 41 254 44 249 46 C255 48 259 52 259 58 C259 66 252 78 242 78 H222 Z M237 36 V46 H242 C244 46 247 44 247 41 C247 38 244 36 242 36 Z M237 54 V68 H243 C246 68 249 65 249 61 C249 57 246 54 243 54 Z" />
          {/* E */}
          <path d="M267 78 V26 H298 V37 H282 V47 H295 V57 H282 V67 H299 V78 H267 Z" />
        </g>

        {/* Orange Accent Dot on 'i' */}
        <rect x="201" y="24" width="13" height="9" rx="1.5" fill="#F97316" />

        {/* EXPRESS text (italicized bold orange) */}
        <g fill="#F97316" transform="translate(130, 84) skewX(-14)">
          <text
            x="0"
            y="26"
            fontFamily="'Outfit', sans-serif"
            fontWeight="900"
            fontSize="32"
            letterSpacing="2.5"
          >
            EXPRESS
          </text>
        </g>

        {/* Tagline "Eficiente, efectivo y Express" */}
        {showTagline && (
          <g>
            <text
              x="52"
              y="132"
              fontFamily="'Brush Script MT', 'Dancing Script', 'Caveat', cursive, sans-serif"
              fontSize="24"
              fontWeight="bold"
              fontStyle="italic"
              fill="#0A2356"
              letterSpacing="0.5"
            >
              Eficiente, efectivo y Express
            </text>
            {/* Orange curved swoop underline */}
            <path
              d="M80 141 Q 200 134, 320 138"
              stroke="#F97316"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          </g>
        )}
      </svg>
    </div>
  );
};
