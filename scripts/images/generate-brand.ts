/** Sinh ảnh chia sẻ mạng xã hội (src/app/opengraph-image.png) + apple-icon. Chạy: npx tsx scripts/images/generate-brand.ts */
import sharp from "sharp";

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FF4F9A"/><stop offset=".5" stop-color="#A98BFF"/><stop offset="1" stop-color="#5CC8FF"/></linearGradient></defs>
<rect width="1200" height="630" fill="#FFF8F1"/><rect x="0" y="0" width="1200" height="14" fill="url(#g)"/>
<circle cx="1050" cy="120" r="260" fill="#FFE3EE"/><circle cx="120" cy="560" r="220" fill="#ECE4FF"/>
<text x="80" y="210" font-family="Helvetica Neue, Arial" font-weight="800" font-size="88" fill="#2B1145">Tu Tu Xình Xịch</text>
<text x="80" y="300" font-family="Georgia" font-style="italic" font-size="50" fill="#D4145A">Xinh từng nút thắt,</text>
<text x="80" y="362" font-family="Georgia" font-style="italic" font-size="50" fill="#D4145A">chất từng chuyến đi</text>
<text x="80" y="450" font-family="Helvetica Neue, Arial" font-weight="600" font-size="32" fill="#5B4A6E">6 mẫu khăn quàng cổ — 6 toa tàu sắc màu</text>
</svg>`;

const background = await sharp(Buffer.from(svg)).png().toBuffer();
const scarfA = await sharp("public/products/ttxx-001/main.webp").resize(250, 312).png().toBuffer();
const scarfB = await sharp("public/products/ttxx-005/main.webp").resize(250, 312).png().toBuffer();
await sharp(background)
  .composite([
    { input: scarfA, left: 820, top: 190 },
    { input: scarfB, left: 920, top: 260 },
  ])
  .png()
  .toFile("src/app/opengraph-image.png");
await sharp("src/app/icon.svg", { density: 400 })
  .resize(180, 180)
  .png()
  .toFile("src/app/apple-icon.png");
console.log("✔ opengraph-image.png, apple-icon.png");
