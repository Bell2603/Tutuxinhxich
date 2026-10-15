"use client";

import { useEffect } from "react";
import { CART_STORAGE_KEY, useCart } from "../store";

/** Nạp giỏ từ localStorage sau khi hydrate (tránh lệch HTML server/client) + đồng bộ giữa các tab. */
export function CartHydrator() {
  useEffect(() => {
    void Promise.resolve(useCart.persist.rehydrate()).then(() =>
      useCart.setState({ hydrated: true }),
    );
    const onStorage = (event: StorageEvent) => {
      if (event.key === CART_STORAGE_KEY) void useCart.persist.rehydrate();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  return null;
}
