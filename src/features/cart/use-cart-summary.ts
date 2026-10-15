"use client";

import { useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import { useCatalog } from "@/features/catalog/client-store";
import { reconcileCart, summarizeCart, type CartProduct } from "./domain";
import { useCart } from "./store";

/**
 * Giỏ hàng + dữ liệu sản phẩm mới nhất từ server. Khi `reconcile` bật, tự sửa giỏ nếu sản phẩm
 * ngừng bán/hết hàng/giảm tồn kho và thông báo cho khách.
 */
export function useCartSummary({
  enabled = true,
  reconcile = false,
}: { enabled?: boolean; reconcile?: boolean } = {}) {
  const lines = useCart((s) => s.lines);
  const hydrated = useCart((s) => s.hydrated);
  const replace = useCart((s) => s.replace);
  const { products, status, reload } = useCatalog(enabled && hydrated && lines.length > 0);

  const productMap = useMemo(
    () => new Map<string, CartProduct>((products ?? []).map((p) => [p.id, p])),
    [products],
  );
  const summary = useMemo(() => summarizeCart(lines, productMap), [lines, productMap]);

  const lastNotice = useRef("");
  useEffect(() => {
    if (!reconcile || !products || lines.length === 0) return;
    const result = reconcileCart(lines, productMap);
    if (result.issues.length === 0) return;
    replace(result.lines);
    const key = JSON.stringify(result.issues);
    if (key === lastNotice.current) return;
    lastNotice.current = key;
    for (const issue of result.issues) {
      if (issue.issue === "reduced")
        toast.info(
          `“${issue.name}” chỉ còn ${issue.quantity} chiếc — đã cập nhật số lượng trong giỏ.`,
        );
      else if (issue.issue === "out_of_stock")
        toast.warning(`“${issue.name}” vừa hết hàng nên đã được bỏ khỏi giỏ.`);
      else
        toast.warning(
          `${issue.name === "Sản phẩm" ? "Một sản phẩm" : `“${issue.name}”`} hiện không còn bán nên đã được bỏ khỏi giỏ.`,
        );
    }
  }, [reconcile, products, lines, productMap, replace]);

  return {
    lines,
    hydrated,
    summary,
    status: lines.length === 0 ? ("ready" as const) : status,
    reload,
    isLoading: hydrated && lines.length > 0 && !products && status !== "error",
  };
}
