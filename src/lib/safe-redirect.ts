/**
 * Chỉ cho phép chuyển hướng nội bộ (chống open redirect qua tham số ?next=).
 * "/thanh-toan" → giữ nguyên; "https://evil.com", "//evil.com", "/\\evil" → fallback.
 */
export function safeRedirectPath(next: unknown, fallback = "/"): string {
  if (typeof next !== "string" || next.length === 0 || next.length > 512) return fallback;
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  if (/[\u0000-\u001f]/.test(next)) return fallback;
  try {
    const url = new URL(next, "http://local.invalid");
    if (url.origin !== "http://local.invalid") return fallback;
    return url.pathname + url.search + url.hash;
  } catch {
    return fallback;
  }
}
