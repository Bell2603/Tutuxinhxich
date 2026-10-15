/** Họa tiết vải của 6 mẫu khăn demo. Mỗi hàm vẽ họa tiết trong hộp (0,0)–(w,h). */
import { between, heart, mulberry32, pick, r1, sparkle } from "./svg";

export type PatternOutput = { defs: string; body: string };
export type PatternFn = (w: number, h: number, uid: string) => PatternOutput;

// TTXX-001 — Mây Hồng Kẹo Bông: khăn vuông, viền hồng có vỏ sò, nền mây.
export const cloudsPattern: PatternFn = (w, h, uid) => {
  const rng = mulberry32(101);
  const border = Math.round(w * 0.06);
  const clouds: string[] = [];
  const cols = 3;
  const rows = Math.max(3, Math.round((h / w) * 3));
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cx = ((col + 0.5 + (row % 2 ? 0.35 : -0.1)) / cols) * w + between(rng, -30, 30);
      const cy = ((row + 0.5) / rows) * h + between(rng, -25, 25);
      const scale = between(rng, 0.7, 1.15) * (w / 760);
      const puffs = [
        [-46, 8, 30],
        [-14, -14, 40],
        [26, -6, 34],
        [52, 12, 24],
        [6, 16, 32],
      ] as const;
      const shadow = puffs
        .map(
          ([dx, dy, r]) =>
            `<circle cx="${r1(cx + dx * scale + 4)}" cy="${r1(cy + dy * scale + 9)}" r="${r1(r * scale)}"/>`,
        )
        .join("");
      const body = puffs
        .map(
          ([dx, dy, r]) =>
            `<circle cx="${r1(cx + dx * scale)}" cy="${r1(cy + dy * scale)}" r="${r1(r * scale)}"/>`,
        )
        .join("");
      clouds.push(
        `<g fill="#ff8cc0" opacity="0.38">${shadow}</g><g fill="#ffffff" opacity="0.92">${body}</g>`,
      );
    }
  }
  const sparkles: string[] = [];
  for (let i = 0; i < Math.round((w * h) / 26000); i++) {
    sparkles.push(
      sparkle(
        between(rng, border + 20, w - border - 20),
        between(rng, border + 20, h - border - 20),
        between(rng, 6, 15),
        pick(rng, ["#ffffff", "#ffffff", "#ff4f9a", "#b48cff"]),
        0.9,
      ),
    );
  }
  const dots: string[] = [];
  for (let i = 0; i < Math.round((w * h) / 9000); i++) {
    dots.push(
      `<circle cx="${r1(between(rng, border, w - border))}" cy="${r1(between(rng, border, h - border))}" r="${r1(between(rng, 1.6, 3.2))}" fill="#ffffff" opacity="0.75"/>`,
    );
  }
  const scallops: string[] = [];
  const step = 28;
  for (let x = border + step / 2; x < w - border; x += step) {
    scallops.push(
      `<circle cx="${r1(x)}" cy="${border}" r="9"/><circle cx="${r1(x)}" cy="${h - border}" r="9"/>`,
    );
  }
  for (let y = border + step / 2; y < h - border; y += step) {
    scallops.push(
      `<circle cx="${border}" cy="${r1(y)}" r="9"/><circle cx="${w - border}" cy="${r1(y)}" r="9"/>`,
    );
  }
  const corners = [
    [border / 2, border / 2],
    [w - border / 2, border / 2],
    [border / 2, h - border / 2],
    [w - border / 2, h - border / 2],
  ]
    .map(([x, y]) => heart(x!, y!, border * 0.32, "#ffffff", 0.95))
    .join("");
  return {
    defs: `<linearGradient id="${uid}-field" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffc0dc"/><stop offset="0.5" stop-color="#e2cfff"/><stop offset="1" stop-color="#ffd3e6"/></linearGradient>`,
    body: `<rect width="${w}" height="${h}" fill="#ff4f9a"/>
      <rect x="${border}" y="${border}" width="${w - border * 2}" height="${h - border * 2}" fill="url(#${uid}-field)"/>
      ${clouds.join("")}${dots.join("")}${sparkles.join("")}
      <g fill="#ffffff" opacity="0.95">${scallops.join("")}</g>
      <rect x="${border + 18}" y="${border + 18}" width="${w - border * 2 - 36}" height="${h - border * 2 - 36}" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-dasharray="2 9" stroke-linecap="round"/>
      ${corners}`,
  };
};

// TTXX-002 — Sọc Kẹo Cầu Vồng: len dệt kim sọc 5 màu.
export const STRIPE_COLORS = ["#ff8dc1", "#ffe066", "#8be9c9", "#8fd3ff", "#c9b6ff"] as const;
export const stripesPattern: PatternFn = (w, h, uid) => {
  const band = Math.round(Math.max(48, h / 21));
  const rows: string[] = [];
  let i = 0;
  for (let y = 0; y < h; y += band) {
    rows.push(
      `<rect x="0" y="${y}" width="${w}" height="${band}" fill="${STRIPE_COLORS[i % STRIPE_COLORS.length]}"/>`,
    );
    rows.push(
      `<rect x="0" y="${y + band - 6}" width="${w}" height="6" fill="#ffffff" opacity="0.85"/>`,
    );
    i++;
  }
  return {
    defs: `<pattern id="${uid}-knit" width="14" height="12" patternUnits="userSpaceOnUse">
        <path d="M1 1 L7 10 L13 1" fill="none" stroke="#2b1145" stroke-opacity="0.13" stroke-width="2.2" stroke-linecap="round"/>
        <path d="M1 3 L7 11" fill="none" stroke="#ffffff" stroke-opacity="0.25" stroke-width="1.2"/>
      </pattern>`,
    body: `${rows.join("")}<rect width="${w}" height="${h}" fill="url(#${uid}-knit)"/>
      <rect x="0" y="0" width="14" height="${h}" fill="#2b1145" opacity="0.06"/><rect x="${w - 14}" y="0" width="14" height="${h}" fill="#2b1145" opacity="0.06"/>`,
  };
};

// TTXX-003 — Hoa Cúc Sân Ga: voan trắng sữa, hoa cúc vàng.
export const daisiesPattern: PatternFn = (w, h, uid) => {
  const rng = mulberry32(303);
  const flowers: string[] = [];
  const leaves: string[] = [];
  const count = Math.max(9, Math.round((w * h) / 30000));
  for (let i = 0; i < count; i++) {
    const cx = between(rng, 20, w - 20);
    const cy = between(rng, 20, h - 20);
    const r = between(rng, 26, 50) * Math.max(0.6, Math.min(1.4, w / 380));
    const rot = between(rng, 0, 360);
    for (let k = 0; k < 2; k++) {
      const a = rot + between(rng, -60, 60) + k * 140;
      const lx = cx + Math.cos((a * Math.PI) / 180) * r * 1.05;
      const ly = cy + Math.sin((a * Math.PI) / 180) * r * 1.05;
      leaves.push(
        `<ellipse cx="${r1(lx)}" cy="${r1(ly)}" rx="${r1(r * 0.5)}" ry="${r1(r * 0.2)}" transform="rotate(${r1(a)} ${r1(lx)} ${r1(ly)})" fill="${k ? "#7cc35a" : "#a8e07a"}" opacity="0.85"/>`,
      );
    }
    const petals: string[] = [];
    for (let p = 0; p < 14; p++) {
      const a = rot + (p * 360) / 14;
      petals.push(
        `<ellipse cx="${r1(cx)}" cy="${r1(cy - r * 0.55)}" rx="${r1(r * 0.17)}" ry="${r1(r * 0.48)}" transform="rotate(${r1(a)} ${r1(cx)} ${r1(cy)})"/>`,
      );
    }
    const centerDots = Array.from({ length: 7 }, (_, d) => {
      const a = (d / 7) * Math.PI * 2;
      return `<circle cx="${r1(cx + Math.cos(a) * r * 0.13)}" cy="${r1(cy + Math.sin(a) * r * 0.13)}" r="${r1(r * 0.04)}"/>`;
    }).join("");
    flowers.push(`<g fill="#ffffff" stroke="#e8dcc0" stroke-width="1.5">${petals.join("")}</g>
      <circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(r * 0.27)}" fill="#ffd447"/><g fill="#f0a420">${centerDots}</g>`);
  }
  const dots: string[] = [];
  for (let i = 0; i < Math.round((w * h) / 7000); i++) {
    dots.push(
      `<circle cx="${r1(between(rng, 0, w))}" cy="${r1(between(rng, 0, h))}" r="${r1(between(rng, 1.5, 3.5))}" fill="${pick(rng, ["#ffd447", "#ffe58a", "#a8e07a"])}" opacity="0.8"/>`,
    );
  }
  return {
    defs: `<linearGradient id="${uid}-voan" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fffdf6"/><stop offset="1" stop-color="#fff6dd"/></linearGradient>`,
    body: `<rect width="${w}" height="${h}" fill="url(#${uid}-voan)" opacity="0.93"/>${dots.join("")}${leaves.join("")}${flowers.join("")}
      <rect x="7" y="7" width="${w - 14}" height="${h - 14}" fill="none" stroke="#ffd447" stroke-width="3"/>`,
  };
};

// TTXX-004 — Caro Dâu Tây: caro đỏ dâu / hồng sữa / kem.
export const tartanPattern: PatternFn = (w, h, uid) => {
  const period = 180;
  const v: string[] = [];
  const hz: string[] = [];
  for (let x = -period; x < w + period; x += period) {
    v.push(`<rect x="${x + 30}" y="0" width="70" height="${h}" fill="#e8344e" opacity="0.62"/>`);
    v.push(`<rect x="${x + 128}" y="0" width="14" height="${h}" fill="#fff1dc" opacity="0.9"/>`);
    v.push(`<rect x="${x + 63}" y="0" width="4" height="${h}" fill="#9e1b32" opacity="0.8"/>`);
  }
  for (let y = -period; y < h + period; y += period) {
    hz.push(`<rect x="0" y="${y + 30}" width="${w}" height="70" fill="#e8344e" opacity="0.62"/>`);
    hz.push(`<rect x="0" y="${y + 128}" width="${w}" height="14" fill="#fff1dc" opacity="0.9"/>`);
    hz.push(`<rect x="0" y="${y + 63}" width="${w}" height="4" fill="#9e1b32" opacity="0.8"/>`);
  }
  return {
    defs: `<pattern id="${uid}-twill" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="3" height="8" fill="#2b1145" opacity="0.08"/></pattern>`,
    body: `<rect width="${w}" height="${h}" fill="#ffc2d4"/>${v.join("")}${hz.join("")}<rect width="${w}" height="${h}" fill="url(#${uid}-twill)"/>`,
  };
};

// TTXX-005 — Ngân Hà Lấp Lánh: satin xanh đêm, sao nhũ vàng.
export const galaxyPattern: PatternFn = (w, h, uid) => {
  const rng = mulberry32(505);
  const border = Math.round(w * 0.05);
  const stars: string[] = [];
  for (let i = 0; i < Math.round((w * h) / 24000); i++) {
    stars.push(
      sparkle(
        between(rng, border + 24, w - border - 24),
        between(rng, border + 24, h - border - 24),
        between(rng, 5, 24),
        `url(#${uid}-gold)`,
        between(rng, 0.75, 1),
      ),
    );
  }
  const dots: string[] = [];
  for (let i = 0; i < Math.round((w * h) / 3500); i++) {
    dots.push(
      `<circle cx="${r1(between(rng, border, w - border))}" cy="${r1(between(rng, border, h - border))}" r="${r1(between(rng, 0.8, 2.6))}" fill="${pick(rng, ["#ffffff", "#ffe7a3", "#c9b6ff"])}" opacity="${r1(between(rng, 0.4, 0.95) * 100) / 100}"/>`,
    );
  }
  const constellation = [
    [0.62, 0.22],
    [0.7, 0.3],
    [0.78, 0.27],
    [0.84, 0.36],
    [0.76, 0.44],
  ].map(([x, y]) => [x! * w, y! * h] as const);
  const borderStars: string[] = [];
  for (let x = border * 1.5; x < w - border; x += 64) {
    borderStars.push(
      sparkle(x, border / 2, 7, "#f2c14e"),
      sparkle(x, h - border / 2, 7, "#f2c14e"),
    );
  }
  for (let y = border * 1.5; y < h - border; y += 64) {
    borderStars.push(
      sparkle(border / 2, y, 7, "#f2c14e"),
      sparkle(w - border / 2, y, 7, "#f2c14e"),
    );
  }
  const mx = w * 0.27;
  const my = h * 0.3;
  const mr = w * 0.075;
  return {
    defs: `<radialGradient id="${uid}-sky" cx="0.35" cy="0.35" r="0.85"><stop offset="0" stop-color="#34449a"/><stop offset="0.45" stop-color="#1e2a6e"/><stop offset="1" stop-color="#11163f"/></radialGradient>
      <linearGradient id="${uid}-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff1b8"/><stop offset="0.5" stop-color="#f2c14e"/><stop offset="1" stop-color="#d99a1e"/></linearGradient>
      <filter id="${uid}-haze" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${r1(w * 0.06)}"/></filter>
      <mask id="${uid}-moon"><rect width="${w}" height="${h}" fill="#000"/><circle cx="${r1(mx)}" cy="${r1(my)}" r="${r1(mr)}" fill="#fff"/><circle cx="${r1(mx + mr * 0.45)}" cy="${r1(my - mr * 0.25)}" r="${r1(mr * 0.9)}" fill="#000"/></mask>`,
    body: `<rect width="${w}" height="${h}" fill="#3b2a6b"/>
      <rect x="${border}" y="${border}" width="${w - border * 2}" height="${h - border * 2}" fill="url(#${uid}-sky)"/>
      <ellipse cx="${w * 0.55}" cy="${h * 0.6}" rx="${w * 0.5}" ry="${h * 0.12}" transform="rotate(-32 ${w * 0.55} ${h * 0.6})" fill="#b48cff" opacity="0.28" filter="url(#${uid}-haze)"/>
      ${dots.join("")}
      <polyline points="${constellation.map(([x, y]) => `${r1(x)},${r1(y)}`).join(" ")}" fill="none" stroke="#f2c14e" stroke-opacity="0.55" stroke-width="2"/>
      ${constellation.map(([x, y]) => `<circle cx="${r1(x)}" cy="${r1(y)}" r="5" fill="#ffe7a3"/>`).join("")}
      ${stars.join("")}
      <rect width="${w}" height="${h}" fill="url(#${uid}-gold)" mask="url(#${uid}-moon)"/>
      <rect x="${border + 8}" y="${border + 8}" width="${w - border * 2 - 16}" height="${h - border * 2 - 16}" fill="none" stroke="#f2c14e" stroke-width="2.5"/>
      <rect x="${border + 16}" y="${border + 16}" width="${w - border * 2 - 32}" height="${h - border * 2 - 32}" fill="none" stroke="#f2c14e" stroke-width="1.2" opacity="0.7"/>
      ${borderStars.join("")}`,
  };
};

// TTXX-006 — Bạc Hà Sương Sớm: cotton linen nhuộm loang.
export const tieDyePattern: PatternFn = (w, h, uid) => {
  const rng = mulberry32(606);
  const blobs: string[] = [];
  for (let i = 0; i < 14; i++) {
    blobs.push(
      `<ellipse cx="${r1(between(rng, 0, w))}" cy="${r1(between(rng, 0, h))}" rx="${r1(between(rng, w * 0.25, w * 0.6))}" ry="${r1(between(rng, h * 0.04, h * 0.12))}" fill="${pick(rng, ["#9eebd0", "#9ad7ff", "#fffbf2", "#c5f5e4", "#7fd8f5"])}" opacity="0.7"/>`,
    );
  }
  const slubs: string[] = [];
  for (let i = 0; i < Math.round(h / 9); i++) {
    const y = between(rng, 0, h);
    const x = between(rng, -20, w * 0.7);
    slubs.push(
      `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(between(rng, 30, 160))}" height="${r1(between(rng, 1, 2.4))}" fill="${pick(rng, ["#ffffff", "#2b1145"])}" opacity="${r1(between(rng, 0.06, 0.16) * 100) / 100}"/>`,
    );
  }
  return {
    defs: `<linearGradient id="${uid}-dye" x1="0" y1="0" x2="0.15" y2="1">
        <stop offset="0" stop-color="#fffbf2"/><stop offset="0.2" stop-color="#c5f5e4"/><stop offset="0.45" stop-color="#9eebd0"/>
        <stop offset="0.72" stop-color="#9ad7ff"/><stop offset="0.9" stop-color="#d4edff"/><stop offset="1" stop-color="#fffbf2"/></linearGradient>
      <filter id="${uid}-bleed" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="${r1(Math.max(18, w * 0.06))}"/></filter>
      <filter id="${uid}-linen" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.04 0.9" numOctaves="2" seed="12" result="n"/>
        <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.17  0 0 0 0 0.07  0 0 0 0 0.27  0 0 0 0.22 0"/>
      </filter>`,
    body: `<rect width="${w}" height="${h}" fill="url(#${uid}-dye)"/><g filter="url(#${uid}-bleed)">${blobs.join("")}</g>
      <rect width="${w}" height="${h}" filter="url(#${uid}-linen)"/>${slubs.join("")}`,
  };
};

/** Tua rua ở đầu khăn dài (vẽ phía trên y=0, hướng lên). */
export function fringe(
  w: number,
  length: number,
  colors: readonly string[],
  spacing = 13,
  width = 6,
): string {
  const strands: string[] = [];
  let i = 0;
  for (let x = spacing / 2 + 4; x < w - 4; x += spacing) {
    const color = colors[i % colors.length];
    const sway = ((i * 37) % 9) - 4;
    strands.push(
      `<path d="M${r1(x)} 4 Q${r1(x + sway)} ${r1(-length / 2)} ${r1(x + sway * 1.6)} ${-length}" stroke="${color}" stroke-width="${width}" stroke-linecap="round" fill="none"/>`,
    );
    i++;
  }
  return strands.join("");
}
