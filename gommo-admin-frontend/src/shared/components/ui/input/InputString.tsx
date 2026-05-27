"use client";

import type {InputFieldChromeProps} from "@/shared/components/ui/input/input-field.types";
import {InputBase} from "@/shared/components/ui/input/InputBase";

export type InputStringProps = InputFieldChromeProps & {
    value: string;
    onValueChange: (value: string) => void;
    placeholder?: string;
    maxLength?: number;
    leftIcon?: React.ReactNode;
    className?: string;
};

export function InputString({value, onValueChange, maxLength, ...chrome}: InputStringProps) {
    return (
        <InputBase
            {...chrome}
            displayValue={value}
            maxLength={maxLength}
            onDisplayChange={onValueChange}
        />
    );
}
