"use client";

import { useEffect } from "react";
import { useWishlist, WISHLIST_STORAGE_KEY } from "../store";

export function WishlistHydrator() {
  useEffect(() => {
    void Promise.resolve(useWishlist.persist.rehydrate()).then(() =>
      useWishlist.setState({ hydrated: true }),
    );
    const onStorage = (event: StorageEvent) => {
      if (event.key === WISHLIST_STORAGE_KEY) void useWishlist.persist.rehydrate();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  return null;
}
