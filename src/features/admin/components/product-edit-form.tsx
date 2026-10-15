"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ExternalLink, Loader2, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useId, useTransition } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { ProductCard } from "@/features/catalog/components/product-card";
import {
  BADGE_LABELS,
  COLOR_FAMILIES,
  COLOR_FAMILY_LABELS,
  FABRIC_LABELS,
  FABRICS,
  type Product,
} from "@/features/catalog/types";
import { discountPercent, formatVND, toaLabel } from "@/lib/format";
import { updateProductAction } from "../actions";
import { productUpdateSchema, type ProductFormInput, type ProductFormValues } from "../schemas";
import { ImageManager } from "./image-manager";
import { Switch } from "./visibility-toggle";

function toNumber(v: unknown): number {
  const n = Number(String(v ?? "").replace(/[.\s,₫]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export function ProductEditForm({ product }: { product: Product }) {
  const id = useId();
  const router = useRouter();
  const [saving, startSave] = useTransition();
  const defaultValues: ProductFormInput = {
    name: product.name,
    shortDescription: product.shortDescription,
    description: product.description,
    material: product.material,
    fabric: product.fabric,
    size: product.size,
    careInstructions: product.careInstructions,
    price: String(product.price),
    compareAtPrice: product.compareAtPrice ? String(product.compareAtPrice) : "",
    stock: String(product.stock),
    badge: product.badge ?? "",
    isVisible: product.isVisible,
    isFeatured: product.isFeatured,
    sortOrder: String(product.sortOrder),
    colors: product.colors,
    imageUrl: product.imageUrl,
    gallery: product.gallery,
  };

  const form = useForm<ProductFormInput, unknown, ProductFormValues>({
    resolver: zodResolver(productUpdateSchema),
    defaultValues,
    mode: "onTouched",
  });
  const { register, control, handleSubmit, formState, setValue, setError, reset } = form;
  const { errors, isDirty } = formState;
  const colors = useFieldArray({ control, name: "colors" });
  const watched = useWatch({ control }) as ProductFormInput;

  const price = toNumber(watched.price);
  const compare = watched.compareAtPrice === "" ? null : toNumber(watched.compareAtPrice);
  const preview: Product = {
    ...product,
    name: String(watched.name ?? ""),
    shortDescription: String(watched.shortDescription ?? ""),
    price,
    compareAtPrice: compare,
    stock: toNumber(watched.stock),
    badge: (watched.badge || null) as Product["badge"],
    colors: (watched.colors ?? []).filter((c) =>
      /^#[0-9a-f]{6}$/i.test(c?.hex ?? ""),
    ) as Product["colors"],
    imageUrl: String(watched.imageUrl ?? ""),
    gallery: (watched.gallery ?? []) as string[],
    sortOrder: toNumber(watched.sortOrder),
  };

  const onSubmit = handleSubmit((values) => {
    startSave(async () => {
      const result = await updateProductAction(product.id, values);
      if (result.ok) {
        toast.success(result.message ?? "Đã lưu sản phẩm.");
        reset(values as unknown as ProductFormInput);
        router.refresh();
        return;
      }
      toast.error(result.error);
      for (const [name, messages] of Object.entries(result.fieldErrors ?? {})) {
        if (messages?.[0]) setError(name as keyof ProductFormInput, { message: messages[0] });
      }
    });
  });

  const err = (name: keyof ProductFormInput) => errors[name]?.message as string | undefined;
  const a11y = (name: keyof ProductFormInput) => ({
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${id}-${name}-error` : undefined,
  });

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="grid gap-8 xl:grid-cols-[1fr_22rem]"
      data-testid="product-form"
    >
      <div className="space-y-6">
        <section className="rounded-[2rem] bg-white p-6 shadow-card ring-1 ring-line">
          <h2 className="text-xl font-extrabold">Giá & tồn kho</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-3">
            <Field
              id={`${id}-price`}
              label="Giá bán (₫)"
              error={err("price")}
              hint={price ? formatVND(price) : undefined}
              required
            >
              <Input
                id={`${id}-price`}
                inputMode="numeric"
                {...register("price")}
                {...a11y("price")}
                data-testid="field-price"
              />
            </Field>
            <Field
              id={`${id}-compareAtPrice`}
              label="Giá gốc (₫)"
              error={err("compareAtPrice")}
              hint={
                compare && compare > price
                  ? `Giảm ${discountPercent(price, compare)}% · để trống nếu không giảm`
                  : "Để trống nếu không giảm giá"
              }
            >
              <Input
                id={`${id}-compareAtPrice`}
                inputMode="numeric"
                {...register("compareAtPrice")}
                {...a11y("compareAtPrice")}
                data-testid="field-compare"
              />
            </Field>
            <Field
              id={`${id}-stock`}
              label="Tồn kho"
              error={err("stock")}
              hint="0 = hết hàng"
              required
            >
              <Input
                id={`${id}-stock`}
                inputMode="numeric"
                {...register("stock")}
                {...a11y("stock")}
                data-testid="field-stock"
              />
            </Field>
          </div>
        </section>

        <section className="rounded-[2rem] bg-white p-6 shadow-card ring-1 ring-line">
          <h2 className="text-xl font-extrabold">Thông tin sản phẩm</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field
              id={`${id}-name`}
              label="Tên sản phẩm"
              error={err("name")}
              required
              className="sm:col-span-2"
            >
              <Input
                id={`${id}-name`}
                {...register("name")}
                {...a11y("name")}
                data-testid="field-name"
              />
            </Field>
            <Field
              id={`${id}-short`}
              label="Mô tả ngắn (hiện trên thẻ sản phẩm)"
              error={err("shortDescription")}
              className="sm:col-span-2"
            >
              <Textarea
                id={`${id}-short`}
                rows={2}
                {...register("shortDescription")}
                {...a11y("shortDescription")}
              />
            </Field>
            <Field
              id={`${id}-desc`}
              label="Mô tả chi tiết"
              error={err("description")}
              hint="Xuống dòng 2 lần để tách đoạn."
              className="sm:col-span-2"
            >
              <Textarea
                id={`${id}-desc`}
                rows={6}
                {...register("description")}
                {...a11y("description")}
              />
            </Field>
            <Field id={`${id}-material`} label="Chất liệu" error={err("material")}>
              <Input id={`${id}-material`} {...register("material")} {...a11y("material")} />
            </Field>
            <Field
              id={`${id}-fabric`}
              label="Nhóm chất liệu (dùng cho bộ lọc)"
              error={err("fabric")}
            >
              <Select id={`${id}-fabric`} {...register("fabric")}>
                {FABRICS.map((f) => (
                  <option key={f} value={f}>
                    {FABRIC_LABELS[f]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field id={`${id}-size`} label="Kích thước" error={err("size")}>
              <Input id={`${id}-size`} {...register("size")} {...a11y("size")} />
            </Field>
            <Field id={`${id}-badge`} label="Nhãn" error={err("badge")}>
              <Select id={`${id}-badge`} {...register("badge")}>
                <option value="">Không có nhãn</option>
                {(Object.keys(BADGE_LABELS) as (keyof typeof BADGE_LABELS)[]).map((b) => (
                  <option key={b} value={b}>
                    {BADGE_LABELS[b]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field
              id={`${id}-care`}
              label="Hướng dẫn bảo quản (mỗi dòng một ý)"
              error={err("careInstructions")}
              className="sm:col-span-2"
            >
              <Textarea
                id={`${id}-care`}
                rows={4}
                {...register("careInstructions")}
                {...a11y("careInstructions")}
              />
            </Field>
          </div>
        </section>

        <section className="rounded-[2rem] bg-white p-6 shadow-card ring-1 ring-line">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-extrabold">Màu sắc</h2>
            <Button
              variant="light"
              size="sm"
              disabled={colors.fields.length >= 8}
              onClick={() => colors.append({ name: "", hex: "#FF8DC1", family: "hong" })}
            >
              <Plus className="size-4" aria-hidden /> Thêm màu
            </Button>
          </div>
          <p className="mt-1 text-sm text-ink-soft">
            “Nhóm màu” quyết định sản phẩm xuất hiện khi khách lọc theo màu.
          </p>
          <ul className="mt-5 space-y-3">
            {colors.fields.map((field, i) => (
              <li
                key={field.id}
                className="grid grid-cols-[auto_1fr_auto] items-end gap-3 rounded-2xl bg-cream p-3 sm:grid-cols-[auto_1fr_10rem_auto]"
              >
                <label className="flex flex-col gap-1.5 text-sm font-semibold">
                  Mã màu
                  <input
                    type="color"
                    {...register(`colors.${i}.hex`)}
                    className="h-12 w-14 cursor-pointer rounded-xl border-2 border-line bg-white p-1"
                  />
                </label>
                <Field
                  id={`${id}-color-${i}`}
                  label="Tên màu"
                  error={errors.colors?.[i]?.name?.message}
                >
                  <Input
                    id={`${id}-color-${i}`}
                    {...register(`colors.${i}.name`)}
                    placeholder="Hồng phấn"
                  />
                </Field>
                <Field
                  id={`${id}-family-${i}`}
                  label="Nhóm màu"
                  className="col-span-2 sm:col-span-1"
                >
                  <Select id={`${id}-family-${i}`} {...register(`colors.${i}.family`)}>
                    {COLOR_FAMILIES.map((f) => (
                      <option key={f} value={f}>
                        {COLOR_FAMILY_LABELS[f].label}
                      </option>
                    ))}
                  </Select>
                </Field>
                <button
                  type="button"
                  onClick={() => colors.remove(i)}
                  className="mb-1 grid size-10 place-items-center rounded-full text-danger focus-ring hover:bg-pink-50"
                  aria-label={`Xóa màu ${i + 1}`}
                >
                  <Trash2 className="size-4" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
          {errors.colors?.message ? (
            <p className="mt-2 text-sm text-danger">{errors.colors.message}</p>
          ) : null}
        </section>

        <section className="rounded-[2rem] bg-white p-6 shadow-card ring-1 ring-line">
          <h2 className="text-xl font-extrabold">Hình ảnh</h2>
          <div className="mt-5">
            <ImageManager
              sku={product.sku}
              imageUrl={String(watched.imageUrl ?? "")}
              gallery={(watched.gallery ?? []) as string[]}
              error={err("imageUrl") ?? (errors.gallery?.message as string | undefined)}
              onChange={(next) => {
                setValue("imageUrl", next.imageUrl, { shouldDirty: true, shouldValidate: true });
                setValue("gallery", next.gallery, { shouldDirty: true, shouldValidate: true });
              }}
            />
          </div>
        </section>
      </div>

      <aside className="space-y-6 xl:sticky xl:top-6 xl:self-start">
        <section className="rounded-[2rem] bg-white p-6 shadow-card ring-1 ring-line">
          <h2 className="text-xl font-extrabold">Hiển thị</h2>
          <div className="mt-4 space-y-4">
            <Controller
              control={control}
              name="isVisible"
              render={({ field }) => (
                <div className="flex items-center justify-between gap-3">
                  <span>
                    <span className="block font-semibold">Hiện trên cửa hàng</span>
                    <span className="text-sm text-ink-soft">Tắt để ẩn tạm thời</span>
                  </span>
                  <Switch
                    checked={Boolean(field.value)}
                    onChange={field.onChange}
                    label="Hiện trên cửa hàng"
                    testId="field-visible"
                  />
                </div>
              )}
            />
            <Controller
              control={control}
              name="isFeatured"
              render={({ field }) => (
                <div className="flex items-center justify-between gap-3">
                  <span>
                    <span className="block font-semibold">Toa đặc biệt (nổi bật)</span>
                    <span className="text-sm text-ink-soft">Hiện ở mục nổi bật trang chủ</span>
                  </span>
                  <Switch
                    checked={Boolean(field.value)}
                    onChange={field.onChange}
                    label="Sản phẩm nổi bật"
                  />
                </div>
              )}
            />
            <Field
              id={`${id}-sort`}
              label="Số toa (thứ tự hiển thị)"
              error={err("sortOrder")}
              hint={`Hiển thị: ${toaLabel(toNumber(watched.sortOrder))}`}
            >
              <Input
                id={`${id}-sort`}
                inputMode="numeric"
                {...register("sortOrder")}
                {...a11y("sortOrder")}
              />
            </Field>
          </div>
        </section>

        <div className="flex flex-col gap-2">
          <Button type="submit" size="lg" disabled={saving || !isDirty} data-testid="save-product">
            {saving ? <Loader2 className="size-5 animate-spin" aria-hidden /> : null}
            {saving ? "Đang lưu…" : isDirty ? "Lưu sản phẩm" : "Chưa có thay đổi"}
          </Button>
          <Button
            variant="ghost"
            disabled={!isDirty || saving}
            onClick={() => reset(defaultValues)}
          >
            Hoàn tác thay đổi
          </Button>
          <Link
            href={`/san-pham/${product.slug}` as Route}
            target="_blank"
            className="inline-flex items-center justify-center gap-2 py-2 text-sm font-semibold text-berry hover:underline"
          >
            Xem trên cửa hàng <ExternalLink className="size-4" aria-hidden />
          </Link>
        </div>

        <section aria-label="Xem trước">
          <p className="mb-3 text-xs font-bold tracking-[0.2em] text-ink-soft uppercase">
            Xem trước thẻ sản phẩm
          </p>
          <div className="pointer-events-none">
            <ProductCard product={preview} />
          </div>
        </section>
      </aside>
    </form>
  );
}
