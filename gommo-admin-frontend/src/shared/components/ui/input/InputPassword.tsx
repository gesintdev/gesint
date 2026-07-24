"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

import type { InputFieldChromeProps } from "@/shared/components/ui/input/input-field.types";
import { InputBase } from "@/shared/components/ui/input/InputBase";

export type InputPasswordProps = InputFieldChromeProps & {
    value: string;
    onValueChange: (value: string) => void;
    placeholder?: string;
    autoComplete?: string;
    className?: string;
};

export function InputPassword({
    value,
    onValueChange,
    autoComplete,
    required,
    className,
    ...chrome
}: InputPasswordProps) {
    const [visible, setVisible] = useState(false);

    return (
        <InputBase
            {...chrome}
            required={required}
            className={className}
            type={visible ? "text" : "password"}
            displayValue={value}
            onDisplayChange={onValueChange}
            autoComplete={autoComplete ?? (required ? "new-password" : "current-password")}
            rightSlot={
                <button
                    type="button"
                    tabIndex={-1}
                    className="gommo-password-toggle"
                    onClick={() => setVisible((current) => !current)}
                    aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
                >
                    {visible ? (
                        <EyeOff className="size-4" strokeWidth={2} />
                    ) : (
                        <Eye className="size-4" strokeWidth={2} />
                    )}
                </button>
            }
        />
    );
}
