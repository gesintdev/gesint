"use client";

import type { InputFieldChromeProps } from "@/shared/components/ui/input/input-field.types";
import { InputBase } from "@/shared/components/ui/input/InputBase";
import { centsToDecimal, maskCurrencyFromCents, parseCurrencyToCents } from "@/shared/lib/input/currency";

export type InputCurrencyProps = InputFieldChromeProps & {
    /** Centavos como string ("12345" = R$ 123,45) */
    value: string;
    onValueChange: (cents: string) => void;
    /** Se true, onValueChange em decimal "123.45" em vez de centavos */
    emitAsDecimal?: boolean;
    placeholder?: string;
};

export function InputCurrency({
    value,
    onValueChange,
    emitAsDecimal = false,
    placeholder = "R$ 0,00",
    ...chrome
}: InputCurrencyProps) {
    return (
        <InputBase
            {...chrome}
            displayValue={maskCurrencyFromCents(value)}
            inputMode="numeric"
            placeholder={placeholder}
            onDisplayChange={(next) => {
                const cents = parseCurrencyToCents(next);
                onValueChange(emitAsDecimal ? centsToDecimal(cents) : cents);
            }}
        />
    );
}
