"use client";

import { useRouter } from "next/navigation";
import { useOptimistic, useTransition } from "react";
import { toast } from "sonner";
import { setReviewVisibilityAction } from "@/features/reviews/actions";
import { Switch } from "./visibility-toggle";

export function ReviewVisibilityToggle({
  reviewId,
  visible,
}: {
  reviewId: string;
  visible: boolean;
}) {
  const router = useRouter();
  const [optimistic, setOptimistic] = useOptimistic(visible);
  const [pending, start] = useTransition();
  return (
    <Switch
      checked={optimistic}
      disabled={pending}
      label="Hiển thị đánh giá trên cửa hàng"
      testId={`review-visibility-${reviewId}`}
      onChange={(next) =>
        start(async () => {
          setOptimistic(next);
          const result = await setReviewVisibilityAction(reviewId, next);
          if (result.ok) toast.success(result.message);
          else toast.error(result.error);
          router.refresh();
        })
      }
    />
  );
}
