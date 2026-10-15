"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { addLine, removeLine, sanitizeLines, setLineQuantity, type CartLine } from "./domain";

type CartState = {
  lines: CartLine[];
  hydrated: boolean;
  /** Thêm vào giỏ; trả về số lượng thực sự được thêm (giới hạn theo tồn kho/10). */
  add: (productId: string, quantity: number, stock: number) => number;
  setQuantity: (productId: string, quantity: number, stock: number) => void;
  remove: (productId: string) => void;
  replace: (lines: CartLine[]) => void;
  clear: () => void;
};

export const CART_STORAGE_KEY = "ttxx-cart";

/** Giỏ hàng lưu trên trình duyệt (localStorage) — khách chưa đăng nhập vẫn dùng được, giữ nguyên sau khi đăng nhập. */
export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      hydrated: false,
      add: (productId, quantity, stock) => {
        const result = addLine(get().lines, productId, quantity, stock);
        if (result.added > 0) set({ lines: result.lines });
        return result.added;
      },
      setQuantity: (productId, quantity, stock) =>
        set({ lines: setLineQuantity(get().lines, productId, quantity, stock) }),
      remove: (productId) => set({ lines: removeLine(get().lines, productId) }),
      replace: (lines) => set({ lines: sanitizeLines(lines) }),
      clear: () => set({ lines: [] }),
    }),
    {
      name: CART_STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ lines: state.lines }),
      // Dữ liệu trong localStorage có thể bị sửa tay/hỏng → luôn làm sạch khi đọc.
      merge: (persisted, current) => ({
        ...current,
        lines: sanitizeLines((persisted as { lines?: unknown } | undefined)?.lines),
      }),
      skipHydration: true,
    },
  ),
);

export function selectItemCount(state: CartState): number {
  return state.lines.reduce((sum, line) => sum + line.quantity, 0);
}

type CartUIState = {
  open: boolean;
  bump: number;
  setOpen: (open: boolean) => void;
  triggerBump: () => void;
};

export const useCartUI = create<CartUIState>()((set) => ({
  open: false,
  bump: 0,
  setOpen: (open) => set({ open }),
  triggerBump: () => set((s) => ({ bump: s.bump + 1 })),
}));

type Box = { x: number; y: number; width: number; height: number };
export type Flight = { id: number; src: string; from: Box; to: Box | null };

function cartTargetBox(): Box | null {
  for (const el of document.querySelectorAll<HTMLElement>("[data-cart-target]")) {
    const rect = el.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0)
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
  }
  return null;
}

type FlightState = {
  flights: Flight[];
  launch: (src: string, from: DOMRect) => void;
  land: (id: number) => void;
};

let flightId = 0;

/** Hiệu ứng "bay vào giỏ": ảnh sản phẩm bay từ nút bấm tới biểu tượng giỏ hàng. */
export const useCartFlights = create<FlightState>()((set) => ({
  flights: [],
  launch: (src, from) => {
    // Người dùng bật "giảm chuyển động": bỏ hiệu ứng bay, chỉ nhấp nháy biểu tượng giỏ.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      useCartUI.getState().triggerBump();
      return;
    }
    const box = { x: from.x, y: from.y, width: from.width, height: from.height };
    set((s) => ({
      flights: [...s.flights, { id: ++flightId, src, from: box, to: cartTargetBox() }],
    }));
  },
  land: (id) => set((s) => ({ flights: s.flights.filter((f) => f.id !== id) })),
}));
