import Image from "next/image";
import { bank } from "@/config/bank";
import { formatVND } from "@/lib/format";
import { transferContent, vietQrPayload } from "../bank-transfer";
import { qrDataUrl } from "../qr";
import { CopyButton } from "./copy-button";

/**
 * Hướng dẫn chuyển khoản cho một đơn (trang chi tiết đơn). Chỉ render khi đã kiểm tra
 * `isBankConfigured()` + `shouldShowTransfer()` ở nơi gọi.
 */
export async function BankTransferPanel({
  order,
}: {
  order: { code: string; recipient_name: string; phone: string; total: number };
}) {
  const content = transferContent(order.code, order.recipient_name, order.phone);
  const qr = await qrDataUrl(
    vietQrPayload({
      bin: bank.bin,
      accountNumber: bank.accountNumber,
      amount: order.total,
      content,
    }),
  );

  const rows = [
    { label: "Ngân hàng", value: bank.bankName },
    {
      label: "Số tài khoản",
      value: bank.accountNumber,
      copy: "số tài khoản",
      testId: "bank-account",
    },
    { label: "Chủ tài khoản", value: bank.accountName },
    { label: "Số tiền", value: formatVND(order.total), testId: "bank-amount" },
    {
      label: "Nội dung chuyển khoản",
      value: content,
      copy: "nội dung chuyển khoản",
      testId: "bank-content",
    },
  ];

  return (
    <section
      className="rounded-[2rem] bg-white p-6 shadow-card ring-2 ring-bubblegum"
      aria-labelledby="bank-title"
      data-testid="bank-transfer"
    >
      <h2 id="bank-title" className="text-2xl font-extrabold">
        Chuyển khoản
      </h2>
      <p className="mt-2 text-sm text-ink-soft">
        Quét mã QR bằng app ngân hàng (số tiền và nội dung được điền sẵn) hoặc chuyển thủ công theo
        thông tin dưới đây. Tu Tu xác nhận đơn sau khi nhận được tiền.
      </p>
      <div className="mt-5 flex justify-center">
        <Image
          src={qr}
          alt={`Mã VietQR chuyển khoản ${formatVND(order.total)} cho đơn ${order.code}`}
          width={224}
          height={224}
          unoptimized
          className="size-56 rounded-2xl ring-1 ring-line"
          data-testid="bank-qr"
        />
      </div>
      <dl className="mt-5 space-y-3 text-sm">
        {rows.map((row) => (
          <div key={row.label}>
            <dt className="text-ink-soft">{row.label}</dt>
            <dd className="flex items-center justify-between gap-3">
              <span className="min-w-0 font-semibold break-words text-ink" data-testid={row.testId}>
                {row.value}
              </span>
              {row.copy ? <CopyButton value={row.value} label={row.copy} /> : null}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-5 rounded-2xl bg-sun-100 px-4 py-3 text-xs font-semibold text-warning">
        Vui lòng giữ nguyên nội dung chuyển khoản để Tu Tu đối soát nhanh. Nếu chưa thanh toán, bạn
        có thể tự hủy đơn khi đơn còn “Chờ xác nhận”.
      </p>
    </section>
  );
}
