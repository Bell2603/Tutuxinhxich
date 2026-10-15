"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { sanitizeWishlist, toggleWishlist } from "./domain";

type WishlistState = {
  ids: string[];
  hydrated: boolean;
  /** Trả về true nếu vừa thêm, false nếu vừa bỏ. */
  toggle: (id: string) => boolean;
  remove: (id: string) => void;
};

export const WISHLIST_STORAGE_KEY = "ttxx-wishlist";

/** Danh sách yêu thích lưu trên trình duyệt (không cần đăng nhập). */
export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      hydrated: false,
      toggle: (id) => {
        const result = toggleWishlist(get().ids, id);
        set({ ids: result.ids });
        return result.added;
      },
      remove: (id) => set({ ids: get().ids.filter((v) => v !== id) }),
    }),
    {
      name: WISHLIST_STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ ids: state.ids }),
      merge: (persisted, current) => ({
        ...current,
        ids: sanitizeWishlist((persisted as { ids?: unknown } | undefined)?.ids),
      }),
      skipHydration: true,
    },
  ),
);
