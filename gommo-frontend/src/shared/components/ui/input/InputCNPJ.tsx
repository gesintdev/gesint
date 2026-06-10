"use client";
import { useState } from "react";
import type { InputFieldChromeProps } from "@/shared/components/ui/input/input-field.types";
import { InputBase } from "@/shared/components/ui/input/InputBase";
import { isValidCnpj, maskCnpj } from "@/shared/lib/input/cnpj";
import { digitsOnly } from "@/shared/lib/input/digits";

export type InputCNPJProps = InputFieldChromeProps & {
    value: string;
    onValueChange: (cnpj: string) => void;
    validate?: boolean;
};

export function InputCNPJ({ value, onValueChange, validate = true, ...chrome }: InputCNPJProps) {
    const [localError, setLocalError] = useState<string | undefined>();

    return (
        <InputBase
            {...chrome}
            error={chrome.error ?? localError}
            displayValue={maskCnpj(value)}
            inputMode="numeric"
            placeholder="00.000.000/0001-00"
            maxLength={18}
            onDisplayChange={(next) => onValueChange(digitsOnly(next).slice(0, 14))}
            onBlur={() => {
                if (!validate || !value) {
                    setLocalError(undefined);
                    return;
                }
                setLocalError(isValidCnpj(value) ? undefined : "CNPJ inválido");
            }}
        />
    );
}
