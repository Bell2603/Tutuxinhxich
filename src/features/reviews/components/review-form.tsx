"use client";

import { Loader2, PencilLine, Trash2 } from "lucide-react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import Link from "next/link";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/field";
import { formatDate } from "@/lib/format";
import { deleteMyReviewAction, submitReviewAction } from "../actions";
import type { MyReviewStatus } from "../queries";
import { reviewSchema } from "../schemas";
import { StarInput } from "./star-input";
import { StarRating } from "./star-rating";

export function ReviewForm({
  productId,
  slug,
  status,
}: {
  productId: string;
  slug: string;
  status: MyReviewStatus | null;
}) {
  const router = useRouter();
  const id = useId();
  const existing = status?.review ?? null;
  const [editing, setEditing] = useState(false);
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [content, setContent] = useState(existing?.content ?? "");
  const [errors, setErrors] = useState<{ rating?: string; content?: string }>({});
  const [pending, start] = useTransition();

  if (!status) {
    return (
      <div
        className="rounded-[2rem] bg-white p-6 text-center ring-1 ring-line"
        data-testid="review-login"
      >
        <p className="font-semibold">Đã nhận được khăn từ Tu Tu?</p>
        <Link
          href={`/dang-nhap?next=${encodeURIComponent(`/san-pham/${slug}#danh-gia`)}` as Route}
          className="mt-2 inline-block font-bold text-berry hover:underline"
        >
          Đăng nhập để viết đánh giá
        </Link>
      </div>
    );
  }

  if (!status.eligible && !existing) {
    return (
      <p
        className="rounded-[2rem] bg-white p-6 text-center text-ink-soft ring-1 ring-line"
        data-testid="review-not-eligible"
      >
        Chỉ khách đã nhận được chiếc khăn này mới viết được đánh giá — để mọi nhận xét đều là thật.
        🧣
      </p>
    );
  }

  function submit() {
    const parsed = reviewSchema.safeParse({ productId, rating, content });
    if (!parsed.success) {
      const fieldErrors: { rating?: string; content?: string } = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if ((key === "rating" || key === "content") && !fieldErrors[key])
          fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    start(async () => {
      const result = await submitReviewAction(parsed.data);
      if (result.ok) {
        toast.success(result.message ?? "Cảm ơn bạn đã đánh giá!");
        setEditing(false);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  function remove() {
    if (!existing) return;
    start(async () => {
      const result = await deleteMyReviewAction(existing.id);
      if (result.ok) {
        toast.success(result.message ?? "Đã xóa đánh giá.");
        setRating(0);
        setContent("");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  if (existing && !editing) {
    return (
      <div className="rounded-[2rem] bg-white p-6 ring-1 ring-line" data-testid="my-review">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-display text-lg font-extrabold">Đánh giá của bạn</p>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setEditing(true)} disabled={pending}>
              <PencilLine className="size-4" aria-hidden /> Sửa
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={remove}
              disabled={pending}
              data-testid="delete-review"
            >
              <Trash2 className="size-4" aria-hidden /> Xóa
            </Button>
          </div>
        </div>
        <StarRating value={existing.rating} className="mt-2" />
        <p className="mt-2 whitespace-pre-line text-ink-soft">{existing.content}</p>
        <p className="mt-2 text-xs text-ink-faint">Viết ngày {formatDate(existing.created_at)}</p>
        {!existing.is_visible ? (
          <p className="mt-3 rounded-xl bg-sun-100 px-3 py-2 text-xs font-semibold text-warning">
            Đánh giá đang được ẩn bởi quản trị viên và chỉ bạn nhìn thấy.
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <m.form
        key="form"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
        className="space-y-4 rounded-[2rem] bg-white p-6 ring-1 ring-line"
        noValidate
        data-testid="review-form"
      >
        <p className="font-display text-lg font-extrabold">
          {existing ? "Sửa đánh giá" : "Viết đánh giá của bạn"}
        </p>
        <StarInput value={rating} onChange={setRating} error={errors.rating} />
        <div>
          <label htmlFor={`${id}-content`} className="text-sm font-semibold">
            Cảm nhận về chiếc khăn
          </label>
          <Textarea
            id={`${id}-content`}
            value={content}
            onChange={(e) => setContent(e.target.value.slice(0, 1000))}
            rows={4}
            placeholder="Chất vải, màu sắc ngoài đời, cách bạn phối…"
            className="mt-1.5"
            aria-invalid={errors.content ? true : undefined}
            aria-describedby={errors.content ? `${id}-content-error` : `${id}-content-count`}
          />
          {errors.content ? (
            <p
              id={`${id}-content-error`}
              className="mt-1 text-sm font-medium text-danger"
              role="alert"
            >
              {errors.content}
            </p>
          ) : (
            <p id={`${id}-content-count`} className="mt-1 text-right text-xs text-ink-faint">
              {content.trim().length}/1000
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={pending} data-testid="submit-review">
            {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
            {existing ? "Lưu đánh giá" : "Gửi đánh giá"}
          </Button>
          {existing ? (
            <Button variant="ghost" onClick={() => setEditing(false)} disabled={pending}>
              Hủy
            </Button>
          ) : null}
        </div>
      </m.form>
    </AnimatePresence>
  );
}
