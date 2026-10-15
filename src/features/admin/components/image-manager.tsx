"use client";

import { ArrowLeft, ArrowRight, ImagePlus, Loader2, Star, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES, STORAGE_BUCKET } from "../schemas";

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

/** Đường dẫn duy nhất trong bucket: <sku>/<thời gian>-<ngẫu nhiên>.<đuôi> */
function objectPath(sku: string, type: string): string {
  return `${sku.toLowerCase()}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${EXT[type]}`;
}

/**
 * Quản lý ảnh: tải ảnh mới lên Supabase Storage (bucket product-images — chỉ admin được ghi, RLS kiểm tra),
 * chọn ảnh chính, sắp xếp và gỡ ảnh chi tiết. Thay đổi chỉ được lưu khi bấm "Lưu sản phẩm".
 */
export function ImageManager({
  sku,
  imageUrl,
  gallery,
  onChange,
  error,
}: {
  sku: string;
  imageUrl: string;
  gallery: string[];
  onChange: (next: { imageUrl: string; gallery: string[] }) => void;
  error?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(0);
  const all = [imageUrl, ...gallery.filter((g) => g !== imageUrl)].filter(Boolean);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    const supabase = createClient();
    const uploaded: string[] = [];
    const room = 9 - all.length;
    const list = [...files].slice(0, Math.max(0, room));
    if (list.length < files.length)
      toast.warning("Mỗi sản phẩm tối đa 1 ảnh chính + 8 ảnh chi tiết.");
    setUploading(list.length);
    for (const file of list) {
      if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
        toast.error(`“${file.name}”: chỉ nhận ảnh JPG, PNG, WEBP hoặc AVIF.`);
        setUploading((n) => n - 1);
        continue;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        toast.error(`“${file.name}” lớn hơn 5 MB — hãy nén ảnh trước khi tải lên.`);
        setUploading((n) => n - 1);
        continue;
      }
      const path = objectPath(sku, file.type);
      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(path, file, {
          contentType: file.type,
          cacheControl: "31536000",
          upsert: false,
        });
      setUploading((n) => n - 1);
      if (uploadError) {
        toast.error(`Tải “${file.name}” thất bại: bạn cần quyền admin và ảnh ≤ 5 MB.`);
        continue;
      }
      uploaded.push(supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path).data.publicUrl);
    }
    if (inputRef.current) inputRef.current.value = "";
    if (uploaded.length === 0) return;
    const next = [...all, ...uploaded];
    onChange({ imageUrl: next[0]!, gallery: next.slice(1) });
    toast.success(`Đã tải ${uploaded.length} ảnh — bấm “Lưu sản phẩm” để áp dụng.`);
  }

  function apply(list: string[]) {
    onChange({ imageUrl: list[0] ?? "", gallery: list.slice(1) });
  }

  function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= all.length) return;
    const next = [...all];
    [next[index], next[target]] = [next[target]!, next[index]!];
    apply(next);
  }

  return (
    <div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3" data-testid="image-list">
        {all.map((src, i) => (
          <li
            key={src}
            className={cn(
              "group relative overflow-hidden rounded-2xl bg-pink-50 ring-2",
              i === 0 ? "ring-bubblegum" : "ring-line",
            )}
          >
            <div className="relative aspect-[4/5]">
              <Image
                src={src}
                alt={i === 0 ? "Ảnh chính" : `Ảnh chi tiết ${i}`}
                fill
                sizes="200px"
                className="object-cover"
              />
            </div>
            {i === 0 ? (
              <span className="absolute top-2 left-2 rounded-full bg-bubblegum px-2.5 py-1 text-xs font-bold text-ink">
                Ảnh chính
              </span>
            ) : null}
            <div className="flex items-center justify-between gap-1 bg-white p-1.5">
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                className="grid size-8 place-items-center rounded-full focus-ring hover:bg-pink-50 disabled:opacity-30"
                aria-label="Đưa ảnh lên trước"
              >
                <ArrowLeft className="size-4" aria-hidden />
              </button>
              {i !== 0 ? (
                <button
                  type="button"
                  onClick={() => apply([src, ...all.filter((s) => s !== src)])}
                  className="grid size-8 place-items-center rounded-full focus-ring hover:bg-pink-50"
                  aria-label="Đặt làm ảnh chính"
                >
                  <Star className="size-4" aria-hidden />
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === all.length - 1}
                className="grid size-8 place-items-center rounded-full focus-ring hover:bg-pink-50 disabled:opacity-30"
                aria-label="Đưa ảnh ra sau"
              >
                <ArrowRight className="size-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => apply(all.filter((s) => s !== src))}
                disabled={all.length === 1}
                className="grid size-8 place-items-center rounded-full text-danger focus-ring hover:bg-pink-50 disabled:opacity-30"
                aria-label="Gỡ ảnh này"
              >
                <Trash2 className="size-4" aria-hidden />
              </button>
            </div>
          </li>
        ))}
        <li>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading > 0 || all.length >= 9}
            className="flex aspect-[4/5] w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line bg-white text-sm font-semibold text-ink-soft focus-ring transition-colors hover:border-bubblegum hover:text-ink disabled:opacity-50"
          >
            {uploading > 0 ? (
              <Loader2 className="size-6 animate-spin" aria-hidden />
            ) : (
              <ImagePlus className="size-6" aria-hidden />
            )}
            {uploading > 0 ? `Đang tải ${uploading} ảnh…` : "Tải ảnh mới"}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept={ALLOWED_IMAGE_TYPES.join(",")}
            multiple
            className="sr-only"
            tabIndex={-1}
            onChange={(e) => void upload(e.target.files)}
            data-testid="image-upload-input"
            aria-label="Chọn ảnh để tải lên"
          />
        </li>
      </ul>
      <p className="mt-3 text-xs text-ink-soft">
        JPG/PNG/WEBP/AVIF tối đa 5 MB. Nên dùng ảnh dọc tỉ lệ 4:5 (VD 1200×1500 px). Ảnh đầu tiên là
        ảnh chính.
      </p>
      {error ? (
        <p className="mt-2 text-sm font-medium text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
