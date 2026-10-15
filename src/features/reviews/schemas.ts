import { z } from "zod";

export const reviewSchema = z.object({
  productId: z.uuid(),
  rating: z.number({ message: "Chọn số sao" }).int().min(1, "Chọn số sao").max(5, "Tối đa 5 sao"),
  content: z.string().trim().min(10, "Viết ít nhất 10 ký tự nhé").max(1000, "Tối đa 1000 ký tự"),
});

export type ReviewInput = z.input<typeof reviewSchema>;
