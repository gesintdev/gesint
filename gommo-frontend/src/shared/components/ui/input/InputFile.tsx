"use client";

import clsx from "clsx";
import { FileUp, X } from "lucide-react";
import { useId, useRef } from "react";

import type { InputFieldChromeProps } from "@/shared/components/ui/input/input-field.types";
import { fieldClass, InputFieldChrome } from "@/shared/components/ui/input/InputFieldChrome";

export type InputFileProps = InputFieldChromeProps & {
    /** Nome do arquivo selecionado (exibido no campo). */
    fileName?: string;
    accept?: string;
    onFileChange: (file: File | null) => void;
    placeholder?: string;
    clearable?: boolean;
    className?: string;
};

export function InputFile({
    label,
    hint,
    error,
    required,
    disabled,
    id: idProp,
    wrapperClassName,
    sensitive,
    sensitivePermission,
    fileName,
    accept,
    onFileChange,
    placeholder = "Nenhum arquivo escolhido",
    clearable = true,
    className,
}: InputFileProps) {
    const autoId = useId();
    const id = idProp ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : autoId);
    const inputRef = useRef<HTMLInputElement>(null);
    const hasFile = Boolean(fileName?.trim());

    const openPicker = () => {
        if (disabled) return;
        inputRef.current?.click();
    };

    const clearFile = () => {
        if (disabled) return;
        if (inputRef.current) inputRef.current.value = "";
        onFileChange(null);
    };

    return (
        <InputFieldChrome
            label={label}
            hint={hint}
            error={error}
            required={required}
            disabled={disabled}
            id={id}
            wrapperClassName={wrapperClassName}
            sensitive={sensitive}
            sensitivePermission={sensitivePermission}
        >
            <input
                ref={inputRef}
                id={id}
                type="file"
                accept={accept}
                disabled={disabled}
                className="sr-only"
                aria-invalid={Boolean(error)}
                aria-required={required}
                onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    onFileChange(file);
                }}
            />
            <div
                className={clsx(
                    "gommo-field",
                    fieldClass(disabled, false, Boolean(error)),
                    className,
                )}
            >
                <button
                    type="button"
                    disabled={disabled}
                    className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-base-content/80 hover:text-base-content disabled:cursor-not-allowed"
                    onClick={openPicker}
                >
                    <FileUp className="size-4 shrink-0 opacity-70" strokeWidth={2} />
                    Escolher arquivo
                </button>
                <button
                    type="button"
                    disabled={disabled}
                    className={clsx(
                        "min-w-0 flex-1 truncate text-left text-sm",
                        hasFile ? "text-base-content" : "text-base-content/45",
                    )}
                    onClick={openPicker}
                    title={hasFile ? fileName : undefined}
                >
                    {hasFile ? fileName : placeholder}
                </button>
                {clearable && hasFile ? (
                    <button
                        type="button"
                        tabIndex={-1}
                        disabled={disabled}
                        className="gommo-password-toggle"
                        aria-label="Remover arquivo"
                        onClick={clearFile}
                    >
                        <X className="size-4" strokeWidth={2} />
                    </button>
                ) : null}
            </div>
            {hint && !error ? <p className="gommo-hint">{hint}</p> : null}
        </InputFieldChrome>
    );
}
