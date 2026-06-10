"use client";
import type { InputFieldChromeProps } from "@/shared/components/ui/input/input-field.types";
import { InputBase } from "@/shared/components/ui/input/InputBase";
import { digitsOnly } from "@/shared/lib/input/digits";
import { maskPhone } from "@/shared/lib/input/phone";

export type InputPhoneProps = InputFieldChromeProps & {
    value: string;
    onValueChange: (phone: string) => void;
    placeholder?: string;
};

export function InputPhone({ value, onValueChange, ...chrome }: InputPhoneProps) {
    return (
        <InputBase
            {...chrome}
            displayValue={maskPhone(value)}
            inputMode="tel"
            placeholder={chrome.placeholder ?? "(00) 00000-0000"}
            maxLength={15}
            onDisplayChange={(next) => onValueChange(digitsOnly(next).slice(0, 11))}
        />
    );
}
