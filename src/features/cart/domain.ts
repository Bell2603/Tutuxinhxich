/**
 * Logic giỏ hàng thuần (không phụ thuộc React) — dùng chung cho store, drawer, checkout và test.
 * Các hằng số phải khớp với SQL trong supabase/migrations/*_order_functions.sql.
 */
export const MAX_QTY_PER_ITEM = 10;
export const FREE_SHIPPING_THRESHOLD = 500_000;
export const SHIPPING_FEE = 30_000;

export type CartLine = { productId: string; quantity: number };

/** Thông tin tối thiểu của sản phẩm để tính giỏ hàng (lấy từ server). */
export type CartProduct = {
  id: string;
  slug: string;
  sku: string;
  name: string;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  imageUrl: string;
  isVisible: boolean;
};

export function shippingFeeFor(subtotal: number): number {
  if (subtotal <= 0 || subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
  return SHIPPING_FEE;
}

/** Số lượng tối đa được mua cho một sản phẩm: min(tồn kho, 10). */
export function maxPurchasable(stock: number): number {
  return Math.max(0, Math.min(Math.floor(stock), MAX_QTY_PER_ITEM));
}

export function clampQuantity(quantity: number, stock: number): number {
  const max = maxPurchasable(stock);
  if (!Number.isFinite(quantity)) return Math.min(1, max);
  return Math.max(0, Math.min(Math.floor(quantity), max));
}

/**
 * Thêm sản phẩm vào giỏ. Trả về giỏ mới và số lượng thực sự được thêm
 * (có thể nhỏ hơn yêu cầu nếu chạm giới hạn tồn kho).
 */
export function addLine(
  lines: CartLine[],
  productId: string,
  quantity: number,
  stock: number,
): { lines: CartLine[]; added: number } {
  const existing = lines.find((l) => l.productId === productId);
  const current = existing?.quantity ?? 0;
  const next = clampQuantity(current + Math.max(0, Math.floor(quantity)), stock);
  const added = Math.max(0, next - current);
  if (added === 0) return { lines, added: 0 };
  if (existing) {
    return {
      lines: lines.map((l) => (l.productId === productId ? { ...l, quantity: next } : l)),
      added,
    };
  }
  return { lines: [...lines, { productId, quantity: next }], added };
}

export function setLineQuantity(
  lines: CartLine[],
  productId: string,
  quantity: number,
  stock: number,
): CartLine[] {
  const next = clampQuantity(quantity, stock);
  if (next <= 0) return removeLine(lines, productId);
  return lines.map((l) => (l.productId === productId ? { ...l, quantity: next } : l));
}

export function removeLine(lines: CartLine[], productId: string): CartLine[] {
  return lines.filter((l) => l.productId !== productId);
}

export type CartIssue = "unavailable" | "out_of_stock" | "reduced";

export type CartItemView = {
  product: CartProduct;
  quantity: number;
  lineTotal: number;
  maxQuantity: number;
};

export type CartSummary = {
  items: CartItemView[];
  itemCount: number;
  subtotal: number;
  shippingFee: number;
  total: number;
  /** Còn thiếu bao nhiêu để được miễn phí vận chuyển (0 nếu đã đủ hoặc giỏ trống). */
  amountToFreeShipping: number;
};

/** Tính tổng giỏ hàng từ dữ liệu sản phẩm mới nhất của server (bỏ dòng không hợp lệ). */
export function summarizeCart(lines: CartLine[], products: Map<string, CartProduct>): CartSummary {
  const items: CartItemView[] = [];
  for (const line of lines) {
    const product = products.get(line.productId);
    if (!product || !product.isVisible) continue;
    const quantity = clampQuantity(line.quantity, product.stock);
    if (quantity <= 0) continue;
    items.push({
      product,
      quantity,
      lineTotal: product.price * quantity,
      maxQuantity: maxPurchasable(product.stock),
    });
  }
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const shippingFee = shippingFeeFor(subtotal);
  return {
    items,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal,
    shippingFee,
    total: subtotal + shippingFee,
    amountToFreeShipping: subtotal > 0 ? Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal) : 0,
  };
}

/**
 * Đối chiếu giỏ với dữ liệu server: xóa sản phẩm ngừng bán/hết hàng, giảm số lượng vượt tồn kho.
 * Trả về giỏ đã sửa + danh sách thay đổi để thông báo cho khách.
 */
export function reconcileCart(
  lines: CartLine[],
  products: Map<string, CartProduct>,
): {
  lines: CartLine[];
  issues: { productId: string; name: string; issue: CartIssue; quantity: number }[];
} {
  const issues: { productId: string; name: string; issue: CartIssue; quantity: number }[] = [];
  const next: CartLine[] = [];
  for (const line of lines) {
    const product = products.get(line.productId);
    if (!product || !product.isVisible) {
      issues.push({
        productId: line.productId,
        name: product?.name ?? "Sản phẩm",
        issue: "unavailable",
        quantity: 0,
      });
      continue;
    }
    const quantity = clampQuantity(line.quantity, product.stock);
    if (quantity <= 0) {
      issues.push({
        productId: line.productId,
        name: product.name,
        issue: "out_of_stock",
        quantity: 0,
      });
      continue;
    }
    if (quantity < line.quantity) {
      issues.push({ productId: line.productId, name: product.name, issue: "reduced", quantity });
    }
    next.push({ productId: line.productId, quantity });
  }
  return { lines: next, issues };
}

/** Xác thực dữ liệu giỏ đọc từ localStorage (có thể bị sửa tay/hỏng). */
export function sanitizeLines(value: unknown): CartLine[] {
  if (!Array.isArray(value)) return [];
  const merged = new Map<string, number>();
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const { productId, quantity } = item as Record<string, unknown>;
    if (typeof productId !== "string" || !/^[0-9a-f-]{36}$/i.test(productId)) continue;
    if (typeof quantity !== "number" || !Number.isFinite(quantity) || quantity < 1) continue;
    merged.set(
      productId,
      Math.min((merged.get(productId) ?? 0) + Math.floor(quantity), MAX_QTY_PER_ITEM),
    );
  }
  return [...merged.entries()]
    .slice(0, 6)
    .map(([productId, quantity]) => ({ productId, quantity }));
}
