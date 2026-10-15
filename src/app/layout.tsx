import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro, Bricolage_Grotesque, Fraunces } from "next/font/google";
import { Providers } from "@/components/providers";
import { site } from "@/config/site";
import { siteUrl } from "@/lib/env";
import "./globals.css";

const display = Bricolage_Grotesque({
  subsets: ["latin", "vietnamese"],
  variable: "--font-bricolage",
  display: "swap",
});

const serif = Fraunces({
  subsets: ["latin", "vietnamese"],
  variable: "--font-fraunces",
  style: ["normal", "italic"],
  display: "swap",
});

const sans = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-be-vietnam",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: `${site.name} — Khăn quàng cổ thời trang`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: site.name,
    title: `${site.name} — ${site.slogan}`,
    description: site.description,
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#fff8f1",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi" className={`${display.variable} ${serif.variable} ${sans.variable}`}>
      <body className="min-h-dvh overflow-x-clip">
        <a
          href="#noi-dung"
          className="fixed top-2 left-2 z-[100] -translate-y-20 rounded-full bg-ink px-5 py-3 font-semibold text-cream transition-transform focus:translate-y-0"
        >
          Bỏ qua đến nội dung chính
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
