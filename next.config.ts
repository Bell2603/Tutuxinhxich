import type { NextConfig } from "next";

// Ảnh do admin tải lên nằm ở Supabase Storage → cho phép next/image tối ưu ảnh từ đúng host đó.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseHost = supabaseUrl ? new URL(supabaseUrl) : null;
const isLocalSupabase =
  supabaseHost !== null && ["127.0.0.1", "localhost"].includes(supabaseHost.hostname);

// CSP: chỉ cho phép script/style/ảnh từ chính website (+ Supabase cho ảnh & upload).
// Next.js cần script inline cho hydrate; dùng nonce sẽ buộc mọi trang render động (mất static shell) nên chưa áp dụng.
const isDev = process.env.NODE_ENV !== "production";
const supabaseOrigin = supabaseHost?.origin ?? "";
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${supabaseOrigin}`.trim(),
  "font-src 'self' data:",
  `connect-src 'self' ${supabaseOrigin}${isDev ? " ws: wss:" : ""}`.trim(),
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  typedRoutes: true,
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 90],
    remotePatterns: supabaseHost
      ? [
          {
            protocol: supabaseHost.protocol === "https:" ? "https" : "http",
            hostname: supabaseHost.hostname,
            port: supabaseHost.port,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
    // Chỉ bật khi Supabase chạy local (127.0.0.1) — production luôn là host công khai.
    dangerouslyAllowLocalIP: isLocalSupabase,
  },
  experimental: {
    // Cache build của Turbopack có lúc trả CSS cũ sau khi đổi token màu trong globals.css (xem docs/BUGS.md B-003).
    // Build chỉ mất ~15 giây nên ưu tiên đúng đắn hơn tốc độ.
    turbopackFileSystemCacheForBuild: false,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
