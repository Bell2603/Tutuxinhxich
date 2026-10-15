"use client";

import { useEffect } from "react";
import { create } from "zustand";
import type { Product } from "./types";

type CatalogState = {
  products: Product[] | null;
  status: "idle" | "loading" | "ready" | "error";
  fetchedAt: number;
  load: (force?: boolean) => Promise<void>;
};

const STALE_MS = 30_000;
let inflight: Promise<void> | null = null;

/** Bản sao danh sách sản phẩm ở trình duyệt cho giỏ hàng & tìm kiếm (lấy từ /api/catalog). */
export const useCatalogStore = create<CatalogState>()((set, get) => ({
  products: null,
  status: "idle",
  fetchedAt: 0,
  load: async (force = false) => {
    const { fetchedAt, status } = get();
    if (!force && status === "ready" && Date.now() - fetchedAt < STALE_MS) return;
    if (inflight) return inflight;
    set({ status: get().products ? "ready" : "loading" });
    inflight = (async () => {
      try {
        const res = await fetch("/api/catalog", { cache: "no-store" });
        if (!res.ok) throw new Error(String(res.status));
        const json = (await res.json()) as { products: Product[] };
        set({ products: json.products, status: "ready", fetchedAt: Date.now() });
      } catch {
        set({ status: get().products ? "ready" : "error" });
      } finally {
        inflight = null;
      }
    })();
    return inflight;
  },
}));

/** Đảm bảo dữ liệu sản phẩm đã tải (và làm mới khi cũ) mỗi khi component cần. */
export function useCatalog(enabled = true) {
  const products = useCatalogStore((s) => s.products);
  const status = useCatalogStore((s) => s.status);
  const load = useCatalogStore((s) => s.load);
  useEffect(() => {
    if (enabled) void load();
  }, [enabled, load]);
  return { products, status, reload: () => load(true) };
}
