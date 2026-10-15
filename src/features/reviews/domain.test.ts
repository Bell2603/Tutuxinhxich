import { describe, expect, it } from "vitest";
import { formatRating, summarizeReviews } from "./domain";

describe("tổng hợp đánh giá", () => {
  it("tính trung bình (1 chữ số thập phân) và phân bố sao", () => {
    const summary = summarizeReviews([{ rating: 5 }, { rating: 5 }, { rating: 4 }, { rating: 2 }]);
    expect(summary).toEqual({ count: 4, average: 4, distribution: [0, 1, 0, 1, 2] });
    expect(summarizeReviews([{ rating: 5 }, { rating: 4 }, { rating: 4 }]).average).toBe(4.3);
  });
  it("bỏ qua điểm không hợp lệ, danh sách rỗng", () => {
    expect(summarizeReviews([{ rating: 0 }, { rating: 9 }])).toEqual({
      count: 0,
      average: 0,
      distribution: [0, 0, 0, 0, 0],
    });
  });
  it("định dạng điểm kiểu Việt Nam", () => {
    expect(formatRating(4.5)).toBe("4,5");
    expect(formatRating(5)).toBe("5,0");
  });
});
