import "server-only";
import QRCode from "qrcode";

/** Vẽ mã QR thành ảnh SVG dạng data URL ngay trên server (không gọi dịch vụ ngoài, CSP đã cho phép `data:`). */
export async function qrDataUrl(payload: string): Promise<string> {
  const svg = await QRCode.toString(payload, {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: 2,
    color: { dark: "#2B1145", light: "#FFFFFF" },
  });
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
