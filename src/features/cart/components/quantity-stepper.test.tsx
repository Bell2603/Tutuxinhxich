import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { QuantityStepper } from "./quantity-stepper";

function Harness({ max }: { max: number }) {
  const [value, setValue] = useState(1);
  return <QuantityStepper value={value} max={max} onChange={setValue} label="Số lượng" />;
}

describe("QuantityStepper", () => {
  it("tăng/giảm trong giới hạn và khóa nút ở biên", () => {
    render(<Harness max={2} />);
    const input = screen.getByLabelText("Số lượng", { selector: "input" });
    const minus = screen.getByRole("button", { name: "Giảm số lượng" });
    const plus = screen.getByRole("button", { name: "Tăng số lượng" });
    expect(minus).toBeDisabled();
    fireEvent.click(plus);
    expect(input).toHaveValue("2");
    expect(plus).toBeDisabled();
  });
  it("nhập tay vượt tồn kho bị kẹp lại khi rời ô", () => {
    render(<Harness max={5} />);
    const input = screen.getByLabelText("Số lượng", { selector: "input" });
    fireEvent.change(input, { target: { value: "9" } });
    fireEvent.blur(input);
    expect(input).toHaveValue("5");
    fireEvent.change(input, { target: { value: "" } });
    fireEvent.blur(input);
    expect(input).toHaveValue("5");
  });
});
