"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** true sau khi hydrate xong ở trình duyệt (server render luôn false) — tránh lệch HTML. */
export function useMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
