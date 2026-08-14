const HeroPlane: React.FC = () => (
  <svg viewBox="0 0 640 260" className="w-full h-auto" role="img" aria-label="Illustration of an airplane climbing over a flight path">
    <defs>
      <linearGradient id="skyFade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#E8EEFF" />
        <stop offset="100%" stopColor="#F3F5F9" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="fuselage" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="100%" stopColor="#DCE3F0" />
      </linearGradient>
    </defs>

    <ellipse cx="320" cy="230" rx="280" ry="18" fill="url(#skyFade)" />

    {/* dashed flight path */}
    <path
      d="M 40 210 Q 220 40 600 70"
      fill="none"
      stroke="#C7D2FE"
      strokeWidth="2.5"
      strokeDasharray="1 12"
      strokeLinecap="round"
    />
    <circle cx="40" cy="210" r="5" fill="#2952E3" />
    <circle cx="600" cy="70" r="5" fill="#2952E3" opacity="0.35" />

    {/* plane, banking along the path */}
    <g transform="translate(430,60) rotate(-18)">
      <path
        d="M0 0 C 40 -4, 120 -4, 165 0 C 172 1, 172 7, 165 8 C 120 12, 40 12, 0 8 Z"
        fill="url(#fuselage)"
        stroke="#B9C4D9"
        strokeWidth="1"
      />
      <path d="M55 1 L20 -34 L34 -34 L78 0 Z" fill="#DCE3F0" stroke="#B9C4D9" strokeWidth="1" />
      <path d="M55 7 L20 42 L34 42 L78 8 Z" fill="#DCE3F0" stroke="#B9C4D9" strokeWidth="1" />
      <path d="M140 1 L160 -14 L152 1 Z" fill="#B9C4D9" />
      <path d="M140 7 L160 20 L152 7 Z" fill="#B9C4D9" />
      <circle cx="30" cy="4" r="2" fill="#8592AD" />
      <circle cx="42" cy="4" r="2" fill="#8592AD" />
      <circle cx="54" cy="4" r="2" fill="#8592AD" />
      <circle cx="66" cy="4" r="2" fill="#8592AD" />
      <circle cx="78" cy="4" r="2" fill="#8592AD" />
      <circle cx="90" cy="4" r="2" fill="#8592AD" />
      <circle cx="102" cy="4" r="2" fill="#8592AD" />
    </g>
  </svg>
);

export default HeroPlane;
