/** Tiện ích dựng SVG cho bộ ảnh minh họa sản phẩm (dữ liệu demo). */

export type Rng = () => number;

/** PRNG có seed để ảnh sinh ra luôn giống nhau giữa các lần chạy. */
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const between = (rng: Rng, min: number, max: number) => min + rng() * (max - min);
export const pick = <T>(rng: Rng, list: readonly T[]): T => list[Math.floor(rng() * list.length)]!;
export const r1 = (n: number) => Math.round(n * 10) / 10;

export function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Ngôi sao lấp lánh 4 cánh. */
export function sparkle(cx: number, cy: number, size: number, fill: string, opacity = 1): string {
  const s = size;
  const k = s * 0.22;
  return `<path d="M${r1(cx)} ${r1(cy - s)} Q${r1(cx + k)} ${r1(cy - k)} ${r1(cx + s)} ${r1(cy)} Q${r1(cx + k)} ${r1(cy + k)} ${r1(cx)} ${r1(cy + s)} Q${r1(cx - k)} ${r1(cy + k)} ${r1(cx - s)} ${r1(cy)} Q${r1(cx - k)} ${r1(cy - k)} ${r1(cx)} ${r1(cy - s)}Z" fill="${fill}" opacity="${opacity}"/>`;
}

export function heart(cx: number, cy: number, size: number, fill: string, opacity = 1): string {
  const s = size;
  return `<path d="M${r1(cx)} ${r1(cy + s * 0.9)} C${r1(cx - s * 1.3)} ${r1(cy + s * 0.1)} ${r1(cx - s * 0.9)} ${r1(cy - s * 1.0)} ${r1(cx)} ${r1(cy - s * 0.35)} C${r1(cx + s * 0.9)} ${r1(cy - s * 1.0)} ${r1(cx + s * 1.3)} ${r1(cy + s * 0.1)} ${r1(cx)} ${r1(cy + s * 0.9)}Z" fill="${fill}" opacity="${opacity}"/>`;
}

/** Bộ lọc làm vải gợn sóng (nếp gấp) + đổ bóng mềm. */
export function fabricFilter(
  id: string,
  opts: {
    seed: number;
    frequency: number;
    scale: number;
    shadow: string;
    shadowOpacity: number;
    blur?: number;
    dy?: number;
  },
): string {
  const blur = opts.blur ?? 22;
  const dy = opts.dy ?? 26;
  return `<filter id="${id}" x="-25%" y="-25%" width="150%" height="150%" color-interpolation-filters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency="${opts.frequency}" numOctaves="2" seed="${opts.seed}" result="noise"/>
    <feDisplacementMap in="SourceGraphic" in2="noise" scale="${opts.scale}" xChannelSelector="R" yChannelSelector="G" result="warped"/>
    <feGaussianBlur in="warped" stdDeviation="${blur}" result="blurred"/>
    <feOffset in="blurred" dx="${Math.round(dy * 0.35)}" dy="${dy}" result="offset"/>
    <feFlood flood-color="${opts.shadow}" flood-opacity="${opts.shadowOpacity}"/>
    <feComposite in2="offset" operator="in" result="shadow"/>
    <feMerge><feMergeNode in="shadow"/><feMergeNode in="warped"/></feMerge>
  </filter>`;
}

/** Dải sáng/tối mô phỏng nếp vải, đặt chồng lên họa tiết. */
export function foldShading(
  id: string,
  w: number,
  h: number,
  opts: { angle: number; bands: number; light: number; dark: number; seed: number },
): { defs: string; overlay: string } {
  const rng = mulberry32(opts.seed);
  const stops: string[] = [];
  for (let i = 0; i <= opts.bands; i++) {
    const offset = (i / opts.bands) * 100;
    const isLight = i % 2 === 0;
    const alpha = isLight ? opts.light * between(rng, 0.5, 1) : opts.dark * between(rng, 0.6, 1);
    stops.push(
      `<stop offset="${r1(offset)}%" stop-color="${isLight ? "#ffffff" : "#2b1145"}" stop-opacity="${r1(alpha * 100) / 100}"/>`,
    );
  }
  const rad = (opts.angle * Math.PI) / 180;
  const x2 = 50 + Math.cos(rad) * 50;
  const y2 = 50 + Math.sin(rad) * 50;
  const x1 = 100 - x2;
  const y1 = 100 - y2;
  return {
    defs: `<linearGradient id="${id}" x1="${r1(x1)}%" y1="${r1(y1)}%" x2="${r1(x2)}%" y2="${r1(y2)}%">${stops.join("")}</linearGradient>`,
    overlay: `<rect x="0" y="0" width="${w}" height="${h}" fill="url(#${id})"/>`,
  };
}

/** Nền studio: gradient + đốm sáng + hạt giấy. */
export function backdrop(
  W: number,
  H: number,
  opts: {
    from: string;
    to: string;
    glows: { x: number; y: number; r: number; color: string; opacity: number }[];
    grain: number;
    id: string;
  },
): { defs: string; body: string } {
  const glows = opts.glows
    .map(
      (g) =>
        `<circle cx="${g.x}" cy="${g.y}" r="${g.r}" fill="${g.color}" opacity="${g.opacity}" filter="url(#${opts.id}-blur)"/>`,
    )
    .join("");
  return {
    defs: `<linearGradient id="${opts.id}-bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${opts.from}"/><stop offset="1" stop-color="${opts.to}"/></linearGradient>
      <filter id="${opts.id}-blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="80"/></filter>
      <filter id="${opts.id}-grain" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" result="n"/>
        <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.17  0 0 0 0 0.07  0 0 0 0 0.27  0 0 0 ${opts.grain} 0"/>
      </filter>`,
    body: `<rect width="${W}" height="${H}" fill="url(#${opts.id}-bg)"/>${glows}<rect width="${W}" height="${H}" filter="url(#${opts.id}-grain)"/>`,
  };
}

/** Thẻ "vé tàu" thương hiệu. */
export function ticket(
  x: number,
  y: number,
  rotate: number,
  opts: { toa: string; name: string; accent: string; paper: string; ink: string; notch: string },
): string {
  const w = 300;
  const h = 128;
  return `<g transform="translate(${x} ${y}) rotate(${rotate})">
    <rect x="${-w / 2 + 6}" y="${-h / 2 + 10}" width="${w}" height="${h}" rx="18" fill="#2b1145" opacity="0.16"/>
    <rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="18" fill="${opts.paper}"/>
    <circle cx="${-w / 2}" cy="0" r="16" fill="${opts.notch}"/>
    <circle cx="${w / 2}" cy="0" r="16" fill="${opts.notch}"/>
    <line x1="${w / 2 - 78}" y1="${-h / 2 + 14}" x2="${w / 2 - 78}" y2="${h / 2 - 14}" stroke="${opts.ink}" stroke-opacity="0.35" stroke-width="3" stroke-dasharray="6 7"/>
    <text x="${-w / 2 + 30}" y="-16" font-family="Helvetica Neue, Arial, sans-serif" font-size="19" font-weight="700" letter-spacing="3" fill="${opts.ink}" opacity="0.75">TU TU XÌNH XỊCH</text>
    <text x="${-w / 2 + 30}" y="30" font-family="Helvetica Neue, Arial, sans-serif" font-size="40" font-weight="800" fill="${opts.accent}">${escapeXml(opts.toa)}</text>
    <text x="${w / 2 - 39}" y="12" text-anchor="middle" font-family="Helvetica Neue, Arial, sans-serif" font-size="34" fill="${opts.accent}">✦</text>
  </g>`;
}
