import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CopyButton } from "./copy-button";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

describe("CopyButton", () => {
  it("sao chép đúng giá trị vào clipboard và đổi nhãn", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });

    render(<CopyButton value="TT2611250001 - NGUYEN VAN A - 0912345678" label="nội dung" />);
    fireEvent.click(screen.getByRole("button", { name: "Sao chép nội dung" }));

    expect(writeText).toHaveBeenCalledWith("TT2611250001 - NGUYEN VAN A - 0912345678");
    await waitFor(() => expect(screen.getByRole("button")).toHaveTextContent("Đã chép"));
  });
});
