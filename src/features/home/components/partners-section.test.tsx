import { render, screen } from "@testing-library/react";
import { LazyMotion, domAnimation } from "motion/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { PARTNERS, type Partner } from "@/config/partners";
import { distribute, PartnersSection } from "./partners-section";

// jsdom không có IntersectionObserver (Reveal dùng whileInView).
class NoopObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}
vi.stubGlobal("IntersectionObserver", NoopObserver);
vi.stubGlobal("matchMedia", (query: string) => ({
  matches: false,
  media: query,
  addEventListener() {},
  removeEventListener() {},
}));

const sample = (n: number): Partner[] =>
  Array.from({ length: n }, (_, i) => ({
    name: `Đối tác ${i + 1}`,
    url: `https://doitac-${i + 1}.example`,
    logo: `/partners/doitac-${i + 1}.webp`,
  }));

const withMotion = (ui: ReactNode) =>
  render(
    <LazyMotion features={domAnimation} strict>
      {ui}
    </LazyMotion>,
  );

describe("PartnersSection", () => {
  it("không render gì khi danh sách đối tác rỗng", () => {
    const { container } = withMotion(<PartnersSection partners={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("mỗi đối tác là link mở tab mới, có ảnh trong /partners và tên", () => {
    const partners = sample(4);
    withMotion(<PartnersSection partners={partners} />);
    const links = screen.getAllByTestId("partner-link");
    expect(links).toHaveLength(4);
    for (const partner of partners) {
      const link = screen.getByRole("link", { name: `Mở website ${partner.name} (mở tab mới)` });
      expect(link).toHaveAttribute("href", partner.url);
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
      expect(link).toHaveTextContent(partner.name);
      expect(link.querySelector("img")?.getAttribute("src")).toContain(
        encodeURIComponent(partner.logo),
      );
    }
  });

  it("chia đối tác lần lượt vào tối đa 3 cột, không bỏ sót ai", () => {
    expect(distribute(sample(1))).toHaveLength(1);
    expect(distribute(sample(2))).toHaveLength(2);
    const columns = distribute(sample(7));
    expect(columns.map((c) => c.length)).toEqual([3, 2, 2]);
    expect(columns.flat()).toHaveLength(7);
  });
});

describe("config đối tác", () => {
  it("link https và ảnh nằm trong public/partners, không trùng", () => {
    for (const p of PARTNERS) {
      expect(p.url).toMatch(/^https:\/\//);
      expect(p.logo).toMatch(/^\/partners\/[^/]+\.(webp|png|jpe?g|avif|svg)$/);
    }
    expect(new Set(PARTNERS.map((p) => p.url)).size).toBe(PARTNERS.length);
  });
});
