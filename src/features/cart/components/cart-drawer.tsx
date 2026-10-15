"use client";

import { Trash2 } from "lucide-react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { LogoMark } from "@/components/brand/logo";
import { Button, ButtonLink } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { formatVND } from "@/lib/format";
import { useCart, useCartUI } from "../store";
import { useCartSummary } from "../use-cart-summary";
import { FreeShippingMeter } from "./free-shipping-meter";
import { QuantityStepper } from "./quantity-stepper";

export function CartDrawer() {
  const open = useCartUI((s) => s.open);
  const setOpen = useCartUI((s) => s.setOpen);
  const close = () => setOpen(false);
  const { summary, isLoading, status, reload, lines } = useCartSummary({
    enabled: open,
    reconcile: open,
  });
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);

  return (
    <Sheet
      open={open}
      onClose={close}
      testId="cart-drawer"
      title={
        <>
          Giỏ hàng <span className="text-berry">({summary.itemCount})</span>
        </>
      }
    >
      {lines.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
          <m.div
            initial={{ x: -40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 120, damping: 14 }}
          >
            <LogoMark className="size-28" />
          </m.div>
          <div>
            <p className="font-display text-2xl font-extrabold">Toa hàng còn trống!</p>
            <p className="mt-2 text-ink-soft">
              Chọn một chiếc khăn xinh để chuyến tàu khởi hành nhé.
            </p>
          </div>
          <ButtonLink href="/bo-suu-tap" onClick={close} variant="candy">
            Khám phá bộ sưu tập
          </ButtonLink>
        </div>
      ) : (
        <>
          <div className="px-5 sm:px-6">
            <FreeShippingMeter subtotal={summary.subtotal} />
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6">
            {isLoading ? (
              <div className="space-y-4" aria-label="Đang tải giỏ hàng">
                {lines.map((line) => (
                  <div key={line.productId} className="flex gap-4">
                    <Skeleton className="size-24 rounded-3xl" />
                    <div className="flex-1 space-y-2 pt-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-9 w-28 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : status === "error" ? (
              <div className="rounded-2xl bg-white p-5 text-center">
                <p className="text-ink-soft">Không tải được thông tin sản phẩm.</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={() => void reload()}>
                  Thử lại
                </Button>
              </div>
            ) : (
              <ul className="space-y-3" data-testid="cart-lines">
                <AnimatePresence initial={false}>
                  {summary.items.map((item) => (
                    <m.li
                      key={item.product.id}
                      layout
                      initial={{ opacity: 0, x: 40 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 60, height: 0, marginTop: 0 }}
                      className="flex gap-4 rounded-3xl bg-white p-3 shadow-sm ring-1 ring-line"
                      data-testid="cart-line"
                    >
                      <Link
                        href={`/san-pham/${item.product.slug}` as Route}
                        onClick={close}
                        className="relative size-24 shrink-0 overflow-hidden rounded-2xl bg-pink-50"
                      >
                        <Image
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      </Link>
                      <div className="flex min-w-0 flex-1 flex-col gap-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <Link
                              href={`/san-pham/${item.product.slug}` as Route}
                              onClick={close}
                              className="line-clamp-2 font-semibold hover:text-berry"
                            >
                              {item.product.name}
                            </Link>
                            <p className="text-sm text-ink-soft">{formatVND(item.product.price)}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => remove(item.product.id)}
                            className="grid size-9 shrink-0 place-items-center rounded-full text-ink-faint focus-ring transition-colors hover:bg-pink-50 hover:text-danger"
                            aria-label={`Xóa ${item.product.name} khỏi giỏ`}
                          >
                            <Trash2 className="size-4" aria-hidden />
                          </button>
                        </div>
                        <div className="mt-auto flex items-center justify-between gap-2">
                          <QuantityStepper
                            size="sm"
                            value={item.quantity}
                            max={item.maxQuantity}
                            label={`Số lượng ${item.product.name}`}
                            onChange={(q) => setQuantity(item.product.id, q, item.product.stock)}
                          />
                          <span className="font-display font-bold" data-testid="line-total">
                            {formatVND(item.lineTotal)}
                          </span>
                        </div>
                        {item.quantity >= item.maxQuantity ? (
                          <p className="text-xs font-medium text-warning">
                            Đã đạt số lượng tối đa có thể mua.
                          </p>
                        ) : null}
                      </div>
                    </m.li>
                  ))}
                </AnimatePresence>
              </ul>
            )}
          </div>
          <div className="border-t border-line bg-white/80 px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] backdrop-blur sm:px-6">
            <dl className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-soft">Tạm tính</dt>
                <dd className="font-semibold" data-testid="cart-subtotal">
                  {formatVND(summary.subtotal)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-soft">Phí giao hàng</dt>
                <dd className="font-semibold">
                  {summary.shippingFee === 0 ? "Miễn phí" : formatVND(summary.shippingFee)}
                </dd>
              </div>
              <div className="flex justify-between pt-1 text-base">
                <dt className="font-bold">Tổng cộng</dt>
                <dd className="font-display text-xl font-extrabold" data-testid="cart-total">
                  {formatVND(summary.total)}
                </dd>
              </div>
            </dl>
            <ButtonLink
              href="/thanh-toan"
              onClick={close}
              variant="primary"
              size="lg"
              className="mt-4 w-full"
              aria-disabled={summary.items.length === 0 || isLoading}
            >
              Thanh toán · {formatVND(summary.total)}
            </ButtonLink>
            <button
              type="button"
              onClick={close}
              className="mt-2 w-full py-2 text-sm font-semibold text-ink-soft hover:text-ink"
            >
              Tiếp tục mua sắm
            </button>
          </div>
        </>
      )}
    </Sheet>
  );
}
