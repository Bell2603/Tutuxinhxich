import { describe, expect, it } from "vitest";
import { scarfShape, stylesForShape } from "./styling-data";

describe("gợi ý cách quàng theo dáng khăn", () => {
  it("nhận ra khăn vuông và khăn dài từ ô kích thước", () => {
    expect(scarfShape("70 × 70 cm")).toBe("square");
    expect(scarfShape("90x90cm")).toBe("square");
    expect(scarfShape("180 × 30 cm (chưa gồm tua rua)")).toBe("long");
    expect(scarfShape("160 × 50 cm")).toBe("long");
    expect(scarfShape("")).toBe("long");
  });
  it("mỗi dáng khăn có ít nhất 2 cách quàng", () => {
    expect(stylesForShape("square").map((s) => s.key)).toEqual(["no-co", "tui", "bang-do"]);
    expect(stylesForShape("long").map((s) => s.key)).toEqual(["paris", "bang-do"]);
  });
});
