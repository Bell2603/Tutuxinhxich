import { PencilLine } from "lucide-react";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { formatVND } from "@/lib/format";
import { PAYMENT_METHOD_LABELS, type PaymentMethod } from "../domain";

type Item = {
  products?: { slug: string } | null;
  id: number;
  product_name: string;
  sku: string;
  image_url: string;
  unit_price: number;
  quantity: number;
  line_total: number;
};

export function OrderItems({
  items,
  reviewLinks = false,
}: {
  items: Item[];
  reviewLinks?: boolean;
}) {
  return (
    <ul className="divide-y divide-line">
      {items.map((item) => (
        <li key={item.id} className="flex items-center gap-4 py-4">
          <span className="relative size-16 shrink-0 overflow-hidden rounded-2xl bg-pink-50">
            {item.image_url ? (
              <Image src={item.image_url} alt="" fill sizes="64px" className="object-cover" />
            ) : null}
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold">{item.product_name}</p>
            <p className="text-sm text-ink-soft">
              {item.sku} · {formatVND(item.unit_price)} × {item.quantity}
            </p>
            {reviewLinks && item.products?.slug ? (
              <Link
                href={`/san-pham/${item.products.slug}#danh-gia` as Route}
                className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-berry hover:underline"
                data-testid="write-review-link"
              >
                <PencilLine className="size-3.5" aria-hidden /> Viết đánh giá
              </Link>
            ) : null}
          </div>
          <span className="font-display font-bold">{formatVND(item.line_total)}</span>
        </li>
      ))}
    </ul>
  );
}

export function OrderTotals({
  subtotal,
  shippingFee,
  total,
}: {
  subtotal: number;
  shippingFee: number;
  total: number;
}) {
  return (
    <dl className="space-y-2 text-sm">
      <div className="flex justify-between">
        <dt className="text-ink-soft">Tạm tính</dt>
        <dd className="font-semibold">{formatVND(subtotal)}</dd>
      </div>
      <div className="flex justify-between">
        <dt className="text-ink-soft">Phí giao hàng</dt>
        <dd className="font-semibold">{shippingFee === 0 ? "Miễn phí" : formatVND(shippingFee)}</dd>
      </div>
      <div className="flex justify-between border-t border-line pt-3 text-base">
        <dt className="font-bold">Tổng cộng</dt>
        <dd className="font-display text-xl font-extrabold" data-testid="order-total">
          {formatVND(total)}
        </dd>
      </div>
    </dl>
  );
}

export function ShippingInfo({
  order,
}: {
  order: {
    recipient_name: string;
    phone: string;
    address: string;
    ward: string;
    province: string;
    note: string;
    payment_method: PaymentMethod;
  };
}) {
  return (
    <dl className="grid gap-3 text-sm">
      <div>
        <dt className="text-ink-soft">Người nhận</dt>
        <dd className="font-semibold">
          {order.recipient_name} · {order.phone}
        </dd>
      </div>
      <div>
        <dt className="text-ink-soft">Địa chỉ</dt>
        <dd className="font-semibold">
          {order.address}, {order.ward}, {order.province}
        </dd>
      </div>
      <div>
        <dt className="text-ink-soft">Thanh toán</dt>
        <dd className="font-semibold">{PAYMENT_METHOD_LABELS[order.payment_method]}</dd>
      </div>
      {order.note ? (
        <div>
          <dt className="text-ink-soft">Ghi chú</dt>
          <dd className="font-semibold whitespace-pre-line">{order.note}</dd>
        </div>
      ) : null}
    </dl>
  );
}
