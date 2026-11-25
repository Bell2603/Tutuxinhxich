import { describe, expect, it } from "vitest";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from "@/features/cart/domain";
import { formatVND } from "@/lib/format";
import { FAQS, POLICY_SECTIONS, RETURN_DAYS, SHIPPING_RETURN_SUMMARY } from "./content";

const policyText = POLICY_SECTIONS.flatMap((s) => s.items).join("\n");
const faqText = FAQS.map((f) => f.answer).join("\n");

describe("nội dung chính sách dùng chung", () => {
  it("phí ship lấy từ hằng số giỏ hàng (khớp SQL)", () => {
    for (const text of [policyText, faqText, SHIPPING_RETURN_SUMMARY]) {
      expect(text).toContain(formatVND(FREE_SHIPPING_THRESHOLD));
      expect(text).toContain(formatVND(SHIPPING_FEE));
    }
  });

  it("chính sách, FAQ và trang sản phẩm cùng số ngày đổi trả", () => {
    for (const text of [policyText, faqText, SHIPPING_RETURN_SUMMARY]) {
      expect(text).toContain(`${RETURN_DAYS} ngày`);
    }
  });

  it("id mục chính sách không trùng (dùng làm anchor)", () => {
    const ids = POLICY_SECTIONS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toContain("bao-quan");
  });
});
