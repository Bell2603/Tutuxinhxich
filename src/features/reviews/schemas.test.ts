import { describe, expect, it } from "vitest";
import { reviewSchema } from "./schemas";

const base = {
  productId: "00000000-0000-4000-8000-000000000001",
  rating: 5,
  content: "  Khăn mềm, màu xinh lắm!  ",
};

describe("reviewSchema", () => {
  it("cắt khoảng trắng nội dung", () => {
    expect(reviewSchema.parse(base).content).toBe("Khăn mềm, màu xinh lắm!");
  });
  it("chặn số sao ngoài 1–5 và nội dung quá ngắn", () => {
    expect(reviewSchema.safeParse({ ...base, rating: 0 }).success).toBe(false);
    expect(reviewSchema.safeParse({ ...base, rating: 6 }).success).toBe(false);
    expect(reviewSchema.safeParse({ ...base, content: "ngắn" }).error?.issues[0]?.message).toBe(
      "Viết ít nhất 10 ký tự nhé",
    );
  });
});
