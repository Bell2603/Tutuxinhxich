import { describe, expect, it } from "vitest";
import { makeProduct } from "@/test-utils";
import {
  availableColorFamilies,
  countActiveFilters,
  DEFAULT_FILTERS,
  filterProducts,
  matchesQuery,
  parseFilters,
  productImages,
  serializeFilters,
  sortProducts,
  stockLabel,
  stockStatus,
} from "./domain";

const products = [
  makeProduct({
    id: "1",
    sku: "TTXX-001",
    name: "Mây Hồng Kẹo Bông",
    price: 289_000,
    fabric: "satin",
    sortOrder: 1,
    colors: [{ name: "Hồng phấn", hex: "#FFB3D1", family: "hong" }],
  }),
  makeProduct({
    id: "3",
    sku: "TTXX-003",
    name: "Hoa Cúc Sân Ga",
    price: 199_000,
    fabric: "voan",
    sortOrder: 3,
    colors: [{ name: "Vàng nắng", hex: "#FFD447", family: "vang" }],
  }),
  makeProduct({
    id: "4",
    sku: "TTXX-004",
    name: "Caro Dâu Tây",
    price: 429_000,
    fabric: "len",
    sortOrder: 4,
    colors: [{ name: "Đỏ dâu", hex: "#E8344E", family: "do" }],
  }),
];

describe("parseFilters / serializeFilters", () => {
  it("đọc tham số URL hợp lệ, bỏ giá trị lạ", () => {
    expect(
      parseFilters({
        q: " hoa ",
        mau: "do,xyz,hong",
        "chat-lieu": "len",
        gia: "tren-400k",
        "sap-xep": "gia-tang",
      }),
    ).toEqual({
      q: "hoa",
      colors: ["hong", "do"],
      fabrics: ["len"],
      price: "tren-400k",
      sort: "gia-tang",
    });
    expect(parseFilters({ gia: "re-lam", "sap-xep": "hack" })).toEqual(DEFAULT_FILTERS);
  });
  it("ghi ra URL gọn và đọc lại được", () => {
    expect(serializeFilters(DEFAULT_FILTERS)).toBe("");
    const filters = {
      q: "hoa cúc",
      colors: ["vang" as const],
      fabrics: [],
      price: "duoi-250k" as const,
      sort: "gia-giam" as const,
    };
    const qs = serializeFilters(filters);
    expect(parseFilters(Object.fromEntries(new URLSearchParams(qs.slice(1))))).toEqual(filters);
    expect(countActiveFilters(filters)).toBe(3);
  });
});

describe("filterProducts", () => {
  it("tìm không dấu", () => {
    expect(
      filterProducts(products, { ...DEFAULT_FILTERS, q: "hoa cuc" }).map((p) => p.sku),
    ).toEqual(["TTXX-003"]);
    expect(
      filterProducts(products, { ...DEFAULT_FILTERS, q: "dau tay" }).map((p) => p.sku),
    ).toEqual(["TTXX-004"]);
    expect(matchesQuery(products[0]!, "satin hồng")).toBe(true);
    expect(matchesQuery(products[0]!, "satin xanh")).toBe(false);
  });
  it("lọc theo màu, chất liệu, giá", () => {
    expect(
      filterProducts(products, { ...DEFAULT_FILTERS, colors: ["do"] }).map((p) => p.sku),
    ).toEqual(["TTXX-004"]);
    expect(
      filterProducts(products, { ...DEFAULT_FILTERS, fabrics: ["satin", "voan"] }).map(
        (p) => p.sku,
      ),
    ).toEqual(["TTXX-001", "TTXX-003"]);
    expect(
      filterProducts(products, { ...DEFAULT_FILTERS, price: "duoi-250k" }).map((p) => p.sku),
    ).toEqual(["TTXX-003"]);
    expect(
      filterProducts(products, { ...DEFAULT_FILTERS, price: "250k-400k" }).map((p) => p.sku),
    ).toEqual(["TTXX-001"]);
    expect(filterProducts(products, { ...DEFAULT_FILTERS, colors: ["tim"] })).toEqual([]);
  });
  it("sắp xếp", () => {
    expect(sortProducts(products, "gia-tang").map((p) => p.price)).toEqual([
      199_000, 289_000, 429_000,
    ]);
    expect(sortProducts(products, "gia-giam").map((p) => p.price)).toEqual([
      429_000, 289_000, 199_000,
    ]);
    expect(sortProducts([...products].reverse(), "noi-bat").map((p) => p.sortOrder)).toEqual([
      1, 3, 4,
    ]);
    expect(sortProducts(products, "ten-a-z").map((p) => p.sku)).toEqual([
      "TTXX-004",
      "TTXX-003",
      "TTXX-001",
    ]);
  });
  it("màu có trong danh mục", () => {
    expect(availableColorFamilies(products)).toEqual(["hong", "vang", "do"]);
  });
});

describe("tồn kho & ảnh", () => {
  it("trạng thái tồn kho", () => {
    expect(stockStatus(0)).toBe("out_of_stock");
    expect(stockStatus(5)).toBe("low_stock");
    expect(stockStatus(6)).toBe("in_stock");
    expect(stockLabel(3)).toBe("Chỉ còn 3 chiếc");
    expect(stockLabel(0)).toBe("Hết hàng");
  });
  it("productImages: ảnh chính trước, bỏ trùng/rỗng", () => {
    expect(productImages({ imageUrl: "/a.webp", gallery: ["/b.webp", "/a.webp", " "] })).toEqual([
      "/a.webp",
      "/b.webp",
    ]);
  });
});
