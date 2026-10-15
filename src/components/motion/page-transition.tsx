import { ViewTransition, type ReactNode } from "react";

/**
 * Hiệu ứng chuyển trang bằng View Transitions API (React <ViewTransition>):
 * - mặc định: trang cũ mờ nhanh, trang mới mờ dần + trồi nhẹ;
 * - link gắn transitionTypes={["nav-forward"]} / ["nav-back"]: trượt theo hướng đi tới / quay lại.
 * Chỉ chạy khi điều hướng phía client (lần tải đầu không bị ẩn nội dung SSR). Trình duyệt không hỗ trợ → đổi trang bình thường.
 * Đặt trong từng page.tsx (layout không mount lại nên không có enter/exit).
 */
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <ViewTransition
      enter={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "page-enter" }}
      exit={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "page-exit" }}
      default="none"
    >
      <div>{children}</div>
    </ViewTransition>
  );
}

/** Skeleton trượt xuống & mờ đi khi dữ liệu tới. Dùng làm fallback của <Suspense>. */
export function SkeletonExit({ children }: { children: ReactNode }) {
  return (
    <ViewTransition exit="slide-down" default="none">
      {children}
    </ViewTransition>
  );
}

/** Nội dung thật trồi lên & rõ dần thay cho skeleton. */
export function ContentEnter({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter="slide-up" default="none">
      {children}
    </ViewTransition>
  );
}
