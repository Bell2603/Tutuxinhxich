import { z } from "zod";

const toInt = (v: unknown) =>
  typeof v === "string" ? (v.trim() === "" ? Number.NaN : Number(v.replace(/[.\s,₫%]/g, ""))) : v;
const toOptionalInt = (v: unknown) => (v === "" || v === null || v === undefined ? null : toInt(v));
const toOptionalDate = (v: unknown) => (v === "" || v === null || v === undefined ? null : v);

export const couponCreateSchema = z
  .object({
    code: z
      .string()
      .trim()
      .transform((v) => v.toUpperCase())
      .pipe(
        z
          .string()
          .regex(/^[A-Z0-9]{3,20}$/, "Mã gồm 3–20 chữ cái hoặc số, không dấu, không khoảng trắng"),
      ),
    description: z.string().trim().max(200, "Tối đa 200 ký tự"),
    discountType: z.enum(["percent", "fixed"]),
    discountValue: z.preprocess(
      toInt,
      z
        .number({ message: "Nhập mức giảm" })
        .int()
        .positive("Mức giảm phải lớn hơn 0")
        .max(10_000_000),
    ),
    maxDiscount: z.preprocess(
      toOptionalInt,
      z.number().int().positive("Phải lớn hơn 0").max(10_000_000).nullable(),
    ),
    minSubtotal: z.preprocess(
      toInt,
      z
        .number({ message: "Nhập giá trị đơn tối thiểu (0 nếu không yêu cầu)" })
        .int()
        .min(0)
        .max(100_000_000),
    ),
    startsOn: z.preprocess(toOptionalDate, z.iso.date({ message: "Ngày không hợp lệ" }).nullable()),
    endsOn: z.preprocess(toOptionalDate, z.iso.date({ message: "Ngày không hợp lệ" }).nullable()),
    usageLimit: z.preprocess(
      toOptionalInt,
      z.number().int().positive("Phải lớn hơn 0").max(1_000_000).nullable(),
    ),
    perCustomerLimit: z.preprocess(
      toInt,
      z.number({ message: "Nhập số lần" }).int().min(1, "Tối thiểu 1").max(100),
    ),
  })
  .refine((v) => v.discountType !== "percent" || v.discountValue <= 90, {
    path: ["discountValue"],
    message: "Giảm theo % tối đa 90%",
  })
  .refine((v) => !v.startsOn || !v.endsOn || v.endsOn >= v.startsOn, {
    path: ["endsOn"],
    message: "Ngày kết thúc phải sau ngày bắt đầu",
  });

export type CouponCreateInput = z.input<typeof couponCreateSchema>;
export type CouponCreateValues = z.output<typeof couponCreateSchema>;

/** Ngày (theo giờ Việt Nam) → mốc thời gian: bắt đầu từ 00:00, kết thúc hết 23:59:59 ngày đó. */
export function startOfDayVN(date: string): string {
  return `${date}T00:00:00+07:00`;
}

export function endOfDayVN(date: string): string {
  return `${date}T23:59:59+07:00`;
}
