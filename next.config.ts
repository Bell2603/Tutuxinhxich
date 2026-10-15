import type { NextConfig } from "next";

// Ảnh do admin tải lên nằm ở Supabase Storage → cho phép next/image tối ưu ảnh từ đúng host đó.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseHost = supabaseUrl ? new URL(supabaseUrl) : null;
const isLocalSupabase =
  supabaseHost !== null && ["127.0.0.1", "localhost"].includes(supabaseHost.hostname);

const securityHeaders = [
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
