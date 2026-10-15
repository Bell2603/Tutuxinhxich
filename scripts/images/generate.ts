/**
 * Sinh bộ ảnh minh họa (DỮ LIỆU DEMO) cho 6 mẫu khăn → public/products/<sku>/{main,detail-1,detail-2,detail-3}.webp
 * Chạy: npm run images:generate  (chỉ cần chạy lại khi muốn vẽ lại ảnh demo).
 * Ảnh thật của shop được tải lên qua trang /admin/san-pham và lưu ở Supabase Storage.
 */
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import sharp from "sharp";
import {
  cloudsPattern,
  daisiesPattern,
  fringe,
  galaxyPattern,
  STRIPE_COLORS,
  stripesPattern,
  tartanPattern,
  tieDyePattern,
  type PatternFn,
} from "./patterns";
import { backdrop, escapeXml, fabricFilter, foldShading, r1, sparkle, ticket } from "./svg";

const W = 1200;
const H = 1500;
const OUT_DIR = resolve(process.cwd(), "public/products");

type Shape = "square" | "long";

type ProductArt = {
  sku: string;
  toa: string;
  name: string;
  shape: Shape;
  size: { w: number; h: number; label: [string, string] };
  pattern: PatternFn;
  fringe?: { colors: readonly string[]; length: number; spacing?: number; width?: number };
  satin?: boolean;
  bg: { from: string; to: string; glow1: string; glow2: string; dark?: boolean };
  accent: string;
  colors: { name: string; hex: string }[];
  material: string;
};

const PRODUCTS: ProductArt[] = [
  {
    sku: "TTXX-001",
    toa: "TOA 01",
    name: "Mây Hồng Kẹo Bông",
    shape: "square",
    size: { w: 70, h: 70, label: ["70 cm", "70 cm"] },
    pattern: cloudsPattern,
    satin: true,
    bg: { from: "#fff0f6", to: "#efe4ff", glow1: "#ffffff", glow2: "#ff8cc0" },
    accent: "#e0267a",
    colors: [
      { name: "Hồng phấn", hex: "#FFB3D1" },
      { name: "Tím lilac", hex: "#C9B6FF" },
      { name: "Trắng kem", hex: "#FFF6EC" },
    ],
    material: "Satin lụa · in kỹ thuật số",
  },
  {
    sku: "TTXX-002",
    toa: "TOA 02",
    name: "Sọc Kẹo Cầu Vồng",
    shape: "long",
    size: { w: 30, h: 180, label: ["30 cm", "180 cm"] },
    pattern: stripesPattern,
    fringe: { colors: STRIPE_COLORS, length: 64, spacing: 13, width: 7 },
    bg: { from: "#fff7df", to: "#e3f5ff", glow1: "#ffffff", glow2: "#ffe066" },
    accent: "#e0267a",
    colors: [
      { name: "Hồng kẹo", hex: "#FF8DC1" },
      { name: "Vàng chanh", hex: "#FFE066" },
      { name: "Xanh mint", hex: "#8BE9C9" },
      { name: "Xanh trời", hex: "#8FD3FF" },
      { name: "Tím lilac", hex: "#C9B6FF" },
    ],
    material: "Len acrylic pha cotton · dệt kim",
  },
  {
    sku: "TTXX-003",
    toa: "TOA 03",
    name: "Hoa Cúc Sân Ga",
    shape: "long",
    size: { w: 50, h: 160, label: ["50 cm", "160 cm"] },
    pattern: daisiesPattern,
    bg: { from: "#f1fae6", to: "#fff4d2", glow1: "#ffffff", glow2: "#a8e07a" },
    accent: "#c27800",
    colors: [
      { name: "Vàng nắng", hex: "#FFD447" },
      { name: "Trắng sữa", hex: "#FFFBF2" },
      { name: "Xanh lá non", hex: "#A8E07A" },
    ],
    material: "Voan chiffon · mỏng nhẹ",
  },
  {
    sku: "TTXX-004",
    toa: "TOA 04",
    name: "Caro Dâu Tây",
    shape: "long",
    size: { w: 65, h: 190, label: ["65 cm", "190 cm"] },
    pattern: tartanPattern,
    fringe: {
      colors: ["#e8344e", "#ffc2d4", "#e8344e", "#fff1dc"],
      length: 70,
      spacing: 12,
      width: 7,
    },
    bg: { from: "#fff1ea", to: "#ffe0ea", glow1: "#ffffff", glow2: "#ff9f7a" },
    accent: "#c8102e",
    colors: [
      { name: "Đỏ dâu", hex: "#E8344E" },
      { name: "Hồng sữa", hex: "#FFC2D4" },
      { name: "Kem", hex: "#FFF1DC" },
    ],
    material: "Dạ mềm cashmere-feel · tua rua",
  },
  {
    sku: "TTXX-005",
    toa: "TOA 05",
    name: "Ngân Hà Lấp Lánh",
    shape: "square",
    size: { w: 90, h: 90, label: ["90 cm", "90 cm"] },
    pattern: galaxyPattern,
    satin: true,
    bg: { from: "#1b1442", to: "#33205f", glow1: "#7b5cff", glow2: "#f2c14e", dark: true },
    accent: "#b07a00",
    colors: [
      { name: "Xanh đêm", hex: "#1E2A6E" },
      { name: "Tím than", hex: "#3B2A6B" },
      { name: "Vàng ánh kim", hex: "#F2C14E" },
    ],
    material: "Satin ánh nhũ · sợi kim tuyến",
  },
  {
    sku: "TTXX-006",
    toa: "TOA 06",
    name: "Bạc Hà Sương Sớm",
    shape: "long",
    size: { w: 70, h: 180, label: ["70 cm", "180 cm"] },
    pattern: tieDyePattern,
    fringe: { colors: ["#bdefe0", "#c9e9ff", "#bdefe0"], length: 40, spacing: 10, width: 5 },
    bg: { from: "#e8fbf3", to: "#e6f1ff", glow1: "#ffffff", glow2: "#9ad7ff" },
    accent: "#0a7f68",
    colors: [
      { name: "Xanh bạc hà", hex: "#9EEBD0" },
      { name: "Xanh trời", hex: "#9AD7FF" },
      { name: "Trắng sữa", hex: "#FFFBF2" },
    ],
    material: "Cotton pha linen · nhuộm loang",
  },
];

function svgDoc(defs: string, body: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs>${defs}</defs>${body}</svg>`;
}

function studio(p: ProductArt, id: string) {
  return backdrop(W, H, {
    id,
    from: p.bg.from,
    to: p.bg.to,
    grain: p.bg.dark ? 0.1 : 0.06,
    glows: [
      { x: 260, y: 260, r: 320, color: p.bg.glow1, opacity: p.bg.dark ? 0.35 : 0.85 },
      { x: 980, y: 1180, r: 360, color: p.bg.glow2, opacity: p.bg.dark ? 0.3 : 0.35 },
    ],
  });
}

function decoSparkles(p: ProductArt): string {
  const color = p.bg.dark ? "#f2c14e" : "#ffffff";
  return [
    sparkle(150, 1260, 26, color, 0.9),
    sparkle(1060, 220, 34, color, 0.95),
    sparkle(1010, 330, 14, color, 0.8),
    sparkle(210, 170, 16, p.bg.dark ? "#c9b6ff" : p.accent, 0.5),
  ].join("");
}

/** Ảnh chính: khăn trải phẳng trên nền studio + vé tàu thương hiệu. */
function mainImage(p: ProductArt): string {
  const uid = `m${p.sku.slice(-3)}`;
  const bg = studio(p, `${uid}bg`);
  const isSquare = p.shape === "square";
  const w = isSquare ? 780 : 390;
  const h = isSquare ? 780 : 1170;
  const pat = p.pattern(w, h, uid);
  const shade = foldShading(`${uid}-fold`, w, h, {
    angle: isSquare ? 35 : 80,
    bands: isSquare ? 7 : 11,
    light: p.satin ? 0.34 : 0.18,
    dark: p.bg.dark ? 0.32 : 0.2,
    seed: Number(p.sku.slice(-3)),
  });
  const sheen = p.satin
    ? `<linearGradient id="${uid}-sheen" x1="0" y1="0" x2="1" y2="1"><stop offset="0.25" stop-color="#fff" stop-opacity="0"/><stop offset="0.45" stop-color="#fff" stop-opacity="0.38"/><stop offset="0.6" stop-color="#fff" stop-opacity="0"/></linearGradient>`
    : "";
  const filter = fabricFilter(`${uid}-cloth`, {
    seed: Number(p.sku.slice(-3)) * 7,
    frequency: isSquare ? 0.0032 : 0.0042,
    scale: isSquare ? 64 : 58,
    shadow: p.bg.dark ? "#000000" : "#6b2f57",
    shadowOpacity: p.bg.dark ? 0.55 : 0.24,
  });
  const fr = p.fringe;
  const fringes = fr
    ? `<g>${fringe(w, fr.length, fr.colors, fr.spacing, fr.width)}</g><g transform="translate(0 ${h}) scale(1 -1)">${fringe(w, fr.length, fr.colors, fr.spacing, fr.width)}</g>`
    : "";
  const rotate = isSquare ? -9 : -16;
  const cx = W / 2 + (isSquare ? 0 : 10);
  const cy = isSquare ? 700 : 720;
  const scarf = `<g filter="url(#${uid}-cloth)"><g transform="translate(${cx} ${cy}) rotate(${rotate}) translate(${-w / 2} ${-h / 2})">
      ${fringes}
      <clipPath id="${uid}-clip"><rect width="${w}" height="${h}" rx="4"/></clipPath>
      <g clip-path="url(#${uid}-clip)">${pat.body}${shade.overlay}${p.satin ? `<rect width="${w}" height="${h}" fill="url(#${uid}-sheen)"/>` : ""}</g>
    </g></g>`;
  const tk = ticket(isSquare ? 900 : 905, isSquare ? 1245 : 1265, 7, {
    toa: p.toa,
    name: p.name,
    accent: p.accent,
    paper: p.bg.dark ? "#fff7e8" : "#ffffff",
    ink: "#2b1145",
    notch: p.bg.dark ? "#2b1c55" : p.bg.to,
  });
  return svgDoc(
    `${bg.defs}${pat.defs}${shade.defs}${sheen}${filter}`,
    `${bg.body}${decoSparkles(p)}${scarf}${tk}`,
  );
}

/** Ảnh chi tiết 1: cận cảnh chất vải (macro) với nếp gấp mạnh. */
function macroImage(p: ProductArt): string {
  const uid = `d1${p.sku.slice(-3)}`;
  const isSquare = p.shape === "square";
  const w = isSquare ? 900 : 760;
  const h = isSquare ? 900 : 1400;
  const pat = p.pattern(w, h, uid);
  const shade = foldShading(`${uid}-fold`, w, h, {
    angle: 60,
    bands: 9,
    light: p.satin ? 0.45 : 0.24,
    dark: 0.3,
    seed: Number(p.sku.slice(-3)) + 40,
  });
  const filter = `<filter id="${uid}-cloth" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.0026" numOctaves="2" seed="${Number(p.sku.slice(-3)) * 3}" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="90" xChannelSelector="R" yChannelSelector="G"/></filter>`;
  const vignette = `<radialGradient id="${uid}-vig" cx="0.5" cy="0.45" r="0.75"><stop offset="0.55" stop-color="#2b1145" stop-opacity="0"/><stop offset="1" stop-color="#2b1145" stop-opacity="0.42"/></radialGradient>`;
  const sheen = p.satin
    ? `<linearGradient id="${uid}-sheen" x1="0" y1="0" x2="1" y2="0.8"><stop offset="0.3" stop-color="#fff" stop-opacity="0"/><stop offset="0.5" stop-color="#fff" stop-opacity="0.45"/><stop offset="0.66" stop-color="#fff" stop-opacity="0"/></linearGradient>`
    : "";
  const scale = isSquare ? 1.9 : 1.25;
  const tx = isSquare ? -70 : -170;
  const ty = isSquare ? -40 : -120;
  const fr = p.fringe;
  const fringeTop = fr
    ? `<g transform="translate(0 ${-6})">${fringe(w, fr.length * 1.3, fr.colors, fr.spacing, fr.width)}</g>`
    : "";
  const bgFill = p.bg.dark ? "#120d2e" : p.bg.from;
  const body = `<rect width="${W}" height="${H}" fill="${bgFill}"/>
    <g filter="url(#${uid}-cloth)"><g transform="translate(${tx} ${ty + (fr ? 140 : 0)}) scale(${scale}) rotate(-6)">
      ${fringeTop}${pat.body}${shade.overlay}${p.satin ? `<rect width="${w}" height="${h}" fill="url(#${uid}-sheen)"/>` : ""}
    </g></g>
    <rect width="${W}" height="${H}" fill="url(#${uid}-vig)"/>`;
  return svgDoc(`${pat.defs}${shade.defs}${filter}${vignette}${sheen}`, body);
}

/** Ảnh chi tiết 2: khăn gấp gọn trong hộp quà, có đai giấy và vé tàu. */
function foldedImage(p: ProductArt): string {
  const uid = `d2${p.sku.slice(-3)}`;
  const bg = studio(p, `${uid}bg`);
  const fw = 600;
  const fh = 460;
  const pat = p.pattern(fw * 1.4, fh * 1.4, uid);
  const filter = fabricFilter(`${uid}-soft`, {
    seed: 9,
    frequency: 0.006,
    scale: 14,
    shadow: p.bg.dark ? "#000" : "#6b2f57",
    shadowOpacity: p.bg.dark ? 0.5 : 0.22,
    blur: 18,
    dy: 20,
  });
  const layer = (dx: number, dy: number, shade: number, i: number) => `
    <g transform="translate(${dx} ${dy})">
      <clipPath id="${uid}-c${i}"><rect width="${fw}" height="${fh}" rx="14"/></clipPath>
      <g clip-path="url(#${uid}-c${i})"><g transform="translate(${-60 - i * 40} ${-40 - i * 30})">${pat.body}</g>
        <rect width="${fw}" height="${fh}" fill="#2b1145" opacity="${shade}"/>
        <rect x="${fw / 2 - 30}" y="0" width="60" height="${fh}" fill="#ffffff" opacity="0.12"/>
        <rect x="0" y="0" width="${fw}" height="10" fill="#ffffff" opacity="0.25"/>
      </g>
    </g>`;
  const box = `<g transform="translate(${W / 2} 760) rotate(-7)">
      <rect x="${-fw / 2 - 70}" y="${-fh / 2 - 70}" width="${fw + 140}" height="${fh + 140}" rx="34" fill="${p.bg.dark ? "#2b1c55" : "#ffffff"}" opacity="0.92"/>
      <rect x="${-fw / 2 - 52}" y="${-fh / 2 - 52}" width="${fw + 104}" height="${fh + 104}" rx="26" fill="none" stroke="${p.accent}" stroke-opacity="0.25" stroke-width="3" stroke-dasharray="4 10"/>
      <g filter="url(#${uid}-soft)" transform="translate(${-fw / 2} ${-fh / 2})">
        ${layer(22, 26, 0.22, 2)}${layer(11, 13, 0.1, 1)}${layer(0, 0, 0, 0)}
      </g>
      <rect x="-70" y="${-fh / 2 - 8}" width="140" height="${fh + 40}" fill="${p.bg.dark ? "#fff3d6" : "#fff8ef"}" opacity="0.96"/>
      <text transform="translate(12 0) rotate(90)" text-anchor="middle" font-family="Helvetica Neue, Arial, sans-serif" font-size="30" font-weight="800" letter-spacing="6" fill="#2b1145">TU TU XÌNH XỊCH</text>
      <text transform="translate(-34 0) rotate(90)" text-anchor="middle" font-family="Helvetica Neue, Arial, sans-serif" font-size="20" font-weight="600" letter-spacing="3" fill="${p.accent}">${escapeXml(p.name.toUpperCase())}</text>
    </g>`;
  const string = `<path d="M ${W / 2 + 40} 600 C 860 560, 900 820, 930 1080" stroke="${p.accent}" stroke-width="4" fill="none" opacity="0.7"/>`;
  const tk = ticket(925, 1160, -8, {
    toa: p.toa,
    name: p.name,
    accent: p.accent,
    paper: p.bg.dark ? "#fff7e8" : "#ffffff",
    ink: "#2b1145",
    notch: p.bg.dark ? "#2e1d5c" : p.bg.to,
  });
  return svgDoc(
    `${bg.defs}${pat.defs}${filter}`,
    `${bg.body}${decoSparkles(p)}${box}${string}${tk}`,
  );
}

/** Ảnh chi tiết 3: thẻ kích thước + bảng màu. */
function infoImage(p: ProductArt): string {
  const uid = `d3${p.sku.slice(-3)}`;
  const bg = studio(p, `${uid}bg`);
  const isSquare = p.shape === "square";
  const boxW = isSquare ? 460 : Math.round(560 * (p.size.w / p.size.h)) + 40;
  const boxH = isSquare ? 460 : 640;
  const pat = p.pattern(boxW, boxH, uid);
  const cardX = 90;
  const cardY = 110;
  const cardW = W - 180;
  const cardH = H - 220;
  const sx = W / 2 - boxW / 2 + (isSquare ? 0 : -40);
  const sy = 330;
  const ink = "#2b1145";
  const arrow = (x1: number, y1: number, x2: number, y2: number) =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${ink}" stroke-width="3" marker-start="url(#${uid}-arr)" marker-end="url(#${uid}-arr)"/>`;
  const swatchY = 1110;
  const swatchGap = Math.min(190, (cardW - 120) / p.colors.length);
  const swatchStart = W / 2 - (swatchGap * (p.colors.length - 1)) / 2;
  const swatches = p.colors
    .map((c, i) => {
      const x = swatchStart + i * swatchGap;
      return `<circle cx="${r1(x)}" cy="${swatchY}" r="42" fill="${c.hex}" stroke="#2b1145" stroke-opacity="0.15" stroke-width="3"/>
        <text x="${r1(x)}" y="${swatchY + 82}" text-anchor="middle" font-family="Helvetica Neue, Arial, sans-serif" font-size="${p.colors.length > 4 ? 22 : 25}" font-weight="600" fill="${ink}">${escapeXml(c.name)}</text>`;
    })
    .join("");
  const body = `${bg.body}
    <rect x="${cardX + 10}" y="${cardY + 18}" width="${cardW}" height="${cardH}" rx="48" fill="#2b1145" opacity="0.12"/>
    <rect x="${cardX}" y="${cardY}" width="${cardW}" height="${cardH}" rx="48" fill="#ffffff"/>
    <text x="${W / 2}" y="${cardY + 100}" text-anchor="middle" font-family="Helvetica Neue, Arial, sans-serif" font-size="30" font-weight="700" letter-spacing="5" fill="${p.accent}">${p.toa} · ${p.sku}</text>
    <text x="${W / 2}" y="${cardY + 165}" text-anchor="middle" font-family="Helvetica Neue, Arial, sans-serif" font-size="52" font-weight="800" fill="${ink}">${escapeXml(p.name)}</text>
    <clipPath id="${uid}-clip"><rect x="${sx}" y="${sy}" width="${boxW}" height="${boxH}" rx="10"/></clipPath>
    <g clip-path="url(#${uid}-clip)"><g transform="translate(${sx} ${sy})">${pat.body}</g></g>
    ${arrow(sx, sy + boxH + 46, sx + boxW, sy + boxH + 46)}
    <text x="${sx + boxW / 2}" y="${sy + boxH + 96}" text-anchor="middle" font-family="Helvetica Neue, Arial, sans-serif" font-size="34" font-weight="700" fill="${ink}">${p.size.label[0]}</text>
    ${arrow(sx + boxW + 46, sy, sx + boxW + 46, sy + boxH)}
    <text transform="translate(${sx + boxW + 100} ${sy + boxH / 2}) rotate(90)" text-anchor="middle" font-family="Helvetica Neue, Arial, sans-serif" font-size="34" font-weight="700" fill="${ink}">${p.size.label[1]}</text>
    <line x1="${cardX + 80}" y1="${swatchY - 110}" x2="${cardX + cardW - 80}" y2="${swatchY - 110}" stroke="${ink}" stroke-opacity="0.12" stroke-width="2" stroke-dasharray="6 8"/>
    ${swatches}
    <text x="${W / 2}" y="${cardY + cardH - 52}" text-anchor="middle" font-family="Helvetica Neue, Arial, sans-serif" font-size="26" font-weight="500" fill="${ink}" opacity="0.7">${escapeXml(p.material)}</text>`;
  const marker = `<marker id="${uid}-arr" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10z" fill="${ink}"/></marker>`;
  return svgDoc(`${bg.defs}${pat.defs}${marker}`, body);
}

async function render(svg: string, file: string): Promise<void> {
  await sharp(Buffer.from(svg), { density: 72 }).webp({ quality: 86, effort: 5 }).toFile(file);
}

const only = process.argv[2];
for (const p of PRODUCTS) {
  if (only && !p.sku.toLowerCase().endsWith(only)) continue;
  const dir = resolve(OUT_DIR, p.sku.toLowerCase());
  mkdirSync(dir, { recursive: true });
  await render(mainImage(p), resolve(dir, "main.webp"));
  await render(macroImage(p), resolve(dir, "detail-1.webp"));
  await render(foldedImage(p), resolve(dir, "detail-2.webp"));
  await render(infoImage(p), resolve(dir, "detail-3.webp"));
  console.log(`✔ ${p.sku} ${p.name}`);
}
