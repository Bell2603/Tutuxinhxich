import { describe, expect, it } from "vitest";
import { parseColors } from "./mappers";

describe("parseColors", () => {
  it("giữ màu hợp lệ, bỏ phần tử sai", () => {
    expect(
      parseColors([
        { name: "Hồng", hex: "#FFB3D1", family: "hong" },
        { name: "Sai hex", hex: "pink", family: "hong" },
        { name: "Sai nhóm", hex: "#000000", family: "cam" },
        "chuỗi",
      ]),
    ).toEqual([{ name: "Hồng", hex: "#FFB3D1", family: "hong" }]);
    expect(parseColors(null)).toEqual([]);
  });
});
