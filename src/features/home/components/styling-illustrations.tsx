/** Minh họa 4 cách quàng khăn (SVG thuần, trang trí). */
const S = {
  stroke: "#2B1145",
  strokeWidth: 4,
  strokeLinejoin: "round" as const,
  strokeLinecap: "round" as const,
};

export function BowIllustration() {
  return (
    <svg viewBox="0 0 200 200" className="size-full" aria-hidden>
      <rect width="200" height="200" rx="40" fill="#FFF0F6" />
      <path d="M80 18 h40 v52 q-20 14 -40 0z" fill="#F6C9A8" />
      <path d="M28 200 L40 96 Q100 70 160 96 L172 200z" fill="#fff" {...S} />
      <path d="M70 82 L100 118 L84 130 L56 96z" fill="#fff" {...S} />
      <path d="M130 82 L100 118 L116 130 L144 96z" fill="#fff" {...S} />
      <path d="M96 120 L80 164 L93 158 L100 168z" fill="#FF4F9A" {...S} />
      <path d="M104 120 L120 164 L107 158 L100 168z" fill="#FF4F9A" {...S} />
      <path d="M100 112 C 70 86, 50 110, 58 127 C 64 140, 86 129, 100 117z" fill="#FF8DC1" {...S} />
      <path
        d="M100 112 C 130 86, 150 110, 142 127 C 136 140, 114 129, 100 117z"
        fill="#FF8DC1"
        {...S}
      />
      <rect x="90" y="104" width="20" height="19" rx="7" fill="#FF4F9A" {...S} />
      <circle cx="72" cy="113" r="3.5" fill="#fff" />
      <circle cx="128" cy="113" r="3.5" fill="#fff" />
      <circle cx="80" cy="102" r="2.5" fill="#fff" />
      <circle cx="120" cy="102" r="2.5" fill="#fff" />
    </svg>
  );
}

export function ParisIllustration() {
  return (
    <svg viewBox="0 0 200 200" className="size-full" aria-hidden>
      <rect width="200" height="200" rx="40" fill="#FFF3C7" />
      <path d="M80 14 h40 v56 q-20 14 -40 0z" fill="#F6C9A8" />
      <path d="M24 200 L36 96 Q100 64 164 96 L176 200z" fill="#A98BFF" {...S} />
      <path d="M58 70 Q100 100 142 70 L146 92 Q100 124 54 92z" fill="#8BE9C9" {...S} />
      <path d="M64 78 Q100 104 136 78" fill="none" stroke="#FFE066" strokeWidth="5" />
      <path d="M108 112 L98 190 L120 190 L128 116z" fill="#FF8DC1" {...S} />
      <path d="M126 112 L136 186 L156 180 L140 108z" fill="#8FD3FF" {...S} />
      <path
        d="M101 150 L124 152 M104 172 L121 173 M132 140 L148 137 M135 162 L152 158"
        stroke="#fff"
        strokeWidth="5"
      />
      <ellipse cx="122" cy="106" rx="20" ry="14" fill="#FFE066" {...S} />
      <ellipse cx="122" cy="106" rx="8" ry="5" fill="#2B1145" opacity="0.25" />
    </svg>
  );
}

export function BagIllustration() {
  return (
    <svg viewBox="0 0 200 200" className="size-full" aria-hidden>
      <rect width="200" height="200" rx="40" fill="#DFF4FF" />
      <path
        d="M66 96 C 66 34, 134 34, 134 96"
        fill="none"
        stroke="#2B1145"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path d="M38 94 H162 L151 172 Q149 184 137 184 H63 Q51 184 49 172z" fill="#FFC2D4" {...S} />
      <path d="M44 120 H156" stroke="#2B1145" strokeWidth="4" opacity="0.2" />
      <circle cx="100" cy="120" r="8" fill="#FFCF3F" {...S} />
      <path d="M74 56 L64 104 L74 100 L78 110z" fill="#5CC8FF" {...S} />
      <path d="M80 56 L96 100 L86 98 L84 108z" fill="#A98BFF" {...S} />
      <path d="M78 54 C 56 34, 42 52, 50 62 C 56 70, 70 62, 78 58z" fill="#FF4F9A" {...S} />
      <path d="M78 54 C 96 30, 112 44, 106 56 C 100 66, 86 60, 78 58z" fill="#FF4F9A" {...S} />
      <circle cx="78" cy="56" r="7" fill="#FFE066" {...S} />
    </svg>
  );
}

export function HeadbandIllustration() {
  return (
    <svg viewBox="0 0 200 200" className="size-full" aria-hidden>
      <rect width="200" height="200" rx="40" fill="#DCF9EF" />
      <circle cx="100" cy="104" r="64" fill="#2B1145" />
      <ellipse cx="100" cy="118" rx="44" ry="50" fill="#F6C9A8" />
      <path
        d="M56 104 Q66 66 100 64 Q134 66 144 104 Q122 86 100 90 Q78 86 56 104z"
        fill="#2B1145"
      />
      <path d="M46 92 Q100 40 154 92 L147 106 Q100 62 53 106z" fill="#FF4F9A" {...S} />
      <circle cx="78" cy="76" r="3" fill="#fff" />
      <circle cx="100" cy="68" r="3" fill="#fff" />
      <circle cx="122" cy="76" r="3" fill="#fff" />
      <path d="M140 74 C 152 50, 176 56, 170 72 C 166 82, 152 80, 142 78z" fill="#FF8DC1" {...S} />
      <path d="M140 74 C 128 52, 108 60, 116 72 C 120 80, 134 80, 140 78z" fill="#FF8DC1" {...S} />
      <circle cx="140" cy="76" r="7" fill="#FFE066" {...S} />
      <circle cx="84" cy="122" r="4" fill="#2B1145" />
      <circle cx="116" cy="122" r="4" fill="#2B1145" />
      <circle cx="74" cy="136" r="7" fill="#FF8DC1" opacity="0.6" />
      <circle cx="126" cy="136" r="7" fill="#FF8DC1" opacity="0.6" />
      <path d="M90 142 Q100 152 110 142" fill="none" {...S} />
    </svg>
  );
}
