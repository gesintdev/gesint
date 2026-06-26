"use client";
import { useState } from "react";

import type { InputFieldChromeProps } from "@/shared/components/ui/input/input-field.types";
import { InputBase } from "@/shared/components/ui/input/InputBase";
import { isValidRg, maskRg, unmaskRg } from "@/shared/lib/input/rg";

export type InputRGProps = InputFieldChromeProps & {
    value: string;
    onValueChange: (rg: string) => void;
    validate?: boolean;
};

export function InputRG({ value, onValueChange, validate = true, ...chrome }: InputRGProps) {
    const [localError, setLocalError] = useState<string | undefined>();

    return (
        <InputBase
            {...chrome}
            error={chrome.error ?? localError}
            displayValue={maskRg(value)}
            placeholder="00.000.000-0"
            maxLength={14}
            onDisplayChange={(next) => onValueChange(unmaskRg(next))}
            onBlur={() => {
                if (!validate || !value) {
                    setLocalError(undefined);
                    return;
                }
                setLocalError(isValidRg(value) ? undefined : "RG inválido");
            }}
        />
    );
}
