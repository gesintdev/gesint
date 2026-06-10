"use client";
import { useState } from "react";
import type { InputFieldChromeProps } from "@/shared/components/ui/input/input-field.types";
import { InputBase } from "@/shared/components/ui/input/InputBase";
import { isValidCep, maskCep } from "@/shared/lib/input/cep";
import { digitsOnly } from "@/shared/lib/input/digits";

export type InputCEPProps = InputFieldChromeProps & {
    value: string;
    onValueChange: (cep: string) => void;
    validate?: boolean;
};

export function InputCEP({ value, onValueChange, validate = true, ...chrome }: InputCEPProps) {
    const [localError, setLocalError] = useState<string | undefined>();

    return (
        <InputBase
            {...chrome}
            error={chrome.error ?? localError}
            displayValue={maskCep(value)}
            inputMode="numeric"
            placeholder="00000-000"
            maxLength={9}
            onDisplayChange={(next) => onValueChange(digitsOnly(next).slice(0, 8))}
            onBlur={() => {
                if (!validate || !value) {
                    setLocalError(undefined);
                    return;
                }
                setLocalError(isValidCep(value) ? undefined : "CEP inválido");
            }}
        />
    );
}
