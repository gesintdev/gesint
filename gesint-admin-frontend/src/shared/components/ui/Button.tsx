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
    primary: "gesint-btn--primary",
    secondary: "gesint-btn--secondary",
    ghost: "gesint-btn--ghost",
    outline: "gesint-btn--outline",
    danger: "gesint-btn--danger",
    success: "gesint-btn--success",
};
/**
 * sm/md/lg — altura unificada via --gesint-control-h (40px).
 * lg só aumenta padding e fonte.
 */
const sizeClass: Record<ButtonSize, string> = {
    sm: "gesint-btn--sm",
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
                "gesint-btn",
                variantClass[variant],
                sizeClass[size],
                iconOnly && "gesint-btn--icon-only",
                className,
            )}
            disabled={disabled || loading}
            {...props}
        >
            {loading && <span className="gesint-spinner" aria-hidden />}
            {!loading && leftIcon}
            {children}
            {!loading && rightIcon}
        </button>
    );
}
