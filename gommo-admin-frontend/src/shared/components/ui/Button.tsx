"use client";

import clsx from "clsx";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline" | "danger" | "success";
type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

const variantClass: Record<ButtonVariant, string> = {
  primary:   "gommo-btn--primary",
  secondary: "gommo-btn--secondary",
  ghost:     "gommo-btn--ghost",
  outline:   "gommo-btn--outline",
  danger:    "gommo-btn--danger",
  success:   "gommo-btn--success",
};

/**
 * sm  — h-36px, px-14, r-8px, 13px  (toolbar / compact actions)
 * md  — h-46px, px-21, r-10px, 15px (default — mirrors .btn--m reference)
 * lg  — h-46px, px-24, r-10px, 16px (hero / page-level CTAs)
 */
const sizeClass: Record<ButtonSize, string> = {
  sm: "gommo-btn--sm",
  md: "",
  lg: "!px-6 !text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  leftIcon,
  rightIcon,
  className,
  children,
  disabled,
  type = "button",
  ...props
}: ButtonProps) {
  const iconOnly = !children && (leftIcon || rightIcon);

  return (
    <button
      type={type}
      className={clsx(
        "gommo-btn",
        variantClass[variant],
        sizeClass[size],
        iconOnly && "gommo-btn--icon-only",
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="gommo-spinner" aria-hidden />}
      {!loading && leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  );
}
