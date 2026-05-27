"use client";

import clsx from "clsx";
import type { InputHTMLAttributes, ReactNode } from "react";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightSlot?: ReactNode;
  wrapperClassName?: string;
};

/** Input HTML simples (legado). Para campos tipados use `@/shared/components/ui/input/index`. */
export function Input({
  label,
  hint,
  error,
  leftIcon,
  rightSlot,
  className,
  wrapperClassName,
  id,
  ...props
}: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={wrapperClassName}>
      {label && (
        <label htmlFor={inputId} className="gommo-label">
          {label}
        </label>
      )}
      <div className={clsx("gommo-field", error && "border-error/60", className)}>
        {leftIcon}
        <input id={inputId} aria-invalid={Boolean(error)} {...props} />
        {rightSlot}
      </div>
      {error && <p className="mt-1.5 text-[11px] font-medium text-error">{error}</p>}
      {!error && hint && <p className="mt-1.5 text-[11px] text-base-content/45">{hint}</p>}
    </div>
  );
}
