import { describe, expect, it } from "vitest";
import { bank } from "@/config/bank";
import {
  crc16,
  isBankConfigured,
  shouldShowTransfer,
  toBankText,
  TRANSFER_CONTENT_MAX,
  transferContent,
  vietQrPayload,
} from "./bank-transfer";

const REAL = {
  bankName: "Vietcombank",
  bin: "970436",
  accountNumber: "0123456789",
  accountName: "NGUYEN VAN A",
};

/** Tách chuỗi TLV (ID 2 số + độ dài 2 số + giá trị) thành object. */
function parseTlv(input: string): Record<string, string> {
  const out: Record<string, string> = {};
  let i = 0;
  while (i < input.length) {
    const id = input.slice(i, i + 2);
    const len = Number(input.slice(i + 2, i + 4));
    out[id] = input.slice(i + 4, i + 4 + len);
    i += 4 + len;
  }
  return out;
}

describe("config ngân hàng", () => {
  it("giá trị mẫu trong src/config/bank.ts bị coi là chưa điền", () => {
    expect(isBankConfigured(bank)).toBe(false);
  });

  it("nhận ra config đã điền thật và từ chối từng trường sai", () => {
    expect(isBankConfigured(REAL)).toBe(true);
    expect(isBankConfigured({ ...REAL, bin: "97043" })).toBe(false);
    expect(isBankConfigured({ ...REAL, accountNumber: "ĐIỀN SỐ TÀI KHOẢN" })).toBe(false);
    expect(isBankConfigured({ ...REAL, accountName: "ĐIỀN TÊN CHỦ TÀI KHOẢN" })).toBe(false);
    expect(isBankConfigured({ ...REAL, bankName: "" })).toBe(false);
  });
});

describe("nội dung chuyển khoản", () => {
  it("bỏ dấu, in hoa, bỏ ký tự đặc biệt", () => {
    expect(toBankText("  Nguyễn Thị Đào-Hoa!! ")).toBe("NGUYEN THI DAO HOA");
  });

  it("đúng cú pháp <Mã đơn> - <TÊN> - <SĐT>", () => {
    expect(transferContent("TT2611250001", "Nguyễn Văn A", "0912345678")).toBe(
      "TT2611250001 - NGUYEN VAN A - 0912345678",
    );
  });

  it(`tối đa ${TRANSFER_CONTENT_MAX} ký tự: chỉ cắt tên, giữ đủ mã đơn và SĐT`, () => {
    const content = transferContent(
      "TT2611250001",
      "Công Tôn Nữ Hoàng Thị Ngọc Bích Phương Thảo",
      "0912345678",
    );
    expect(content.length).toBeLessThanOrEqual(TRANSFER_CONTENT_MAX);
    expect(content.startsWith("TT2611250001 - CONG TON NU")).toBe(true);
    expect(content.endsWith(" - 0912345678")).toBe(true);
    expect(content).not.toMatch(/ {2}| - $/);
  });

  it("đơn chuyển khoản đã hủy/đã giao không hiện hướng dẫn chuyển khoản", () => {
    expect(shouldShowTransfer("pending")).toBe(true);
    expect(shouldShowTransfer("confirmed")).toBe(true);
    expect(shouldShowTransfer("shipping")).toBe(true);
    expect(shouldShowTransfer("delivered")).toBe(false);
    expect(shouldShowTransfer("cancelled")).toBe(false);
  });
});

describe("VietQR", () => {
  it("CRC-16/CCITT-FALSE đúng giá trị kiểm tra chuẩn", () => {
    expect(crc16("123456789")).toBe("29B1");
  });

  it("chuỗi EMVCo có tài khoản nhận, số tiền, nội dung và CRC hợp lệ", () => {
    const content = "TT2611250001 - NGUYEN VAN A - 0912345678";
    const payload = vietQrPayload({
      bin: REAL.bin,
      accountNumber: REAL.accountNumber,
      amount: 589000,
      content,
    });
    const top = parseTlv(payload);
    expect(top["00"]).toBe("01");
    expect(top["01"]).toBe("12");
    expect(top["53"]).toBe("704");
    expect(top["54"]).toBe("589000");
    expect(top["58"]).toBe("VN");
    expect(parseTlv(top["62"]!)["08"]).toBe(content);

    const merchant = parseTlv(top["38"]!);
    expect(merchant["00"]).toBe("A000000727");
    expect(merchant["02"]).toBe("QRIBFTTA");
    expect(parseTlv(merchant["01"]!)).toEqual({ "00": REAL.bin, "01": REAL.accountNumber });

    // CRC tính trên toàn bộ chuỗi tới hết "6304".
    expect(top["63"]).toBe(crc16(payload.slice(0, -4)));
    expect(payload.slice(-8, -4)).toBe("6304");
  });
});
