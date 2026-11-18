"use client";

import clsx from "clsx";
import { X } from "lucide-react";

type FieldClearButtonProps = {
    onClick: () => void;
    className?: string;
    /** Dentro de um botão pai (select, data). Não aninha outro button. */
    embedded?: boolean;
};

export function canClearOptionalField(options: {
    required?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
    value?: string | null;
    loading?: boolean;
}): boolean {
    if (options.required || options.disabled || options.readOnly || options.loading) return false;
    return Boolean(options.value && options.value.trim());
}

export function FieldClearButton({ onClick, className, embedded = false }: FieldClearButtonProps) {
    const icon = <X className="size-3.5" strokeWidth={2} />;
    if (embedded) {
        return (
            <span
                role="button"
                tabIndex={-1}
                aria-label="Limpar"
                className={clsx("gesint-field__clear", className)}
                onMouseDown={(event) => event.preventDefault()}
                onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    onClick();
                }}
            >
                {icon}
            </span>
        );
    }
    return (
        <button
            type="button"
            tabIndex={-1}
            aria-label="Limpar"
            className={clsx("gesint-field__clear", className)}
            onMouseDown={(event) => event.preventDefault()}
            onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onClick();
            }}
        >
            {icon}
        </button>
    );
}
