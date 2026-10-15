import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "candy" | "aurora" | "outline" | "ghost" | "light" | "danger";
type Size = "sm" | "md" | "lg" | "icon" | "icon-sm";

const base =
  "relative inline-flex select-none items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition-[transform,box-shadow,background-color,color,border-color] duration-300 ease-[var(--ease-bounce)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 focus-ring";

const variants: Record<Variant, string> = {
  primary:
    "bg-ink text-cream shadow-[0_10px_24px_-12px_rgb(43_17_69/0.6)] hover:bg-[#3d1a60] hover:shadow-pop",
  candy:
    "bg-bubblegum text-ink shadow-[0_10px_24px_-12px_rgb(212_20_90/0.6)] hover:bg-[#ff69aa] hover:shadow-pop",
  aurora: "bg-aurora text-ink shadow-pop hover:brightness-105",
  outline: "border-2 border-ink text-ink hover:bg-ink hover:text-cream",
  ghost: "text-ink hover:bg-pink-50",
  light: "bg-white text-ink shadow-card hover:bg-pink-50",
  danger: "bg-danger text-white hover:bg-[#a30e34]",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-[0.95rem]",
  lg: "h-14 px-8 text-base",
  icon: "size-11",
  "icon-sm": "size-9",
};

export function buttonVariants({
  variant = "primary",
  size = "md",
  className,
}: { variant?: Variant; size?: Size; className?: string } = {}) {
  return cn(base, variants[variant], sizes[size], className);
}

type ButtonProps = ComponentProps<"button"> & { variant?: Variant; size?: Size };

export function Button({ variant, size, className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonVariants({ variant, size, className })} {...props} />;
}

type ButtonLinkProps = ComponentProps<typeof Link> & { variant?: Variant; size?: Size };

export function ButtonLink({ variant, size, className, ...props }: ButtonLinkProps) {
  return <Link className={buttonVariants({ variant, size, className })} {...props} />;
}
