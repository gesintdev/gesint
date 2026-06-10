"use client";
import { useState } from "react";
import type { InputFieldChromeProps } from "@/shared/components/ui/input/input-field.types";
import { InputBase } from "@/shared/components/ui/input/InputBase";

export type InputPasswordProps = InputFieldChromeProps & {
    value: string;
    onValueChange: (value: string) => void;
    placeholder?: string;
    autoComplete?: string;
};

export function InputPassword({ value, onValueChange, autoComplete, required, ...chrome }: InputPasswordProps) {
    const [visible, setVisible] = useState(false);

    return (
        <InputBase
            {...chrome}
            required={required}
            type={visible ? "text" : "password"}
            displayValue={value}
            onDisplayChange={onValueChange}
            autoComplete={autoComplete ?? (required ? "new-password" : "current-password")}
            rightSlot={
                <button
                    type="button"
                    tabIndex={-1}
                    className="shrink-0 px-2 text-[11px] font-medium text-base-content/50 hover:text-base-content"
                    onClick={() => setVisible((current) => !current)}
                    aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
                >
                    {visible ? "Ocultar" : "Mostrar"}
                </button>
            }
        />
    );
}
