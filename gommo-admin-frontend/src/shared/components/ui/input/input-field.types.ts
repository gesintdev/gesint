import type {HTMLAttributes, HTMLInputTypeAttribute, ReactNode} from "react";

export type InputFieldChromeProps = {
    label?: string;
    hint?: string;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
    wrapperClassName?: string;
    id?: string;
};

export type InputBaseProps = InputFieldChromeProps & {
    /** Valor exibido no campo (pode conter m\u00e1scara) */
    displayValue: string;
    onDisplayChange: (display: string) => void;
    placeholder?: string;
    leftIcon?: ReactNode;
    rightSlot?: ReactNode;
    className?: string;
    autoComplete?: string;
    inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"];
    type?: HTMLInputTypeAttribute;
    min?: string;
    max?: string;
    step?: string | number;
    maxLength?: number;
    onBlur?: () => void;
    onFocus?: () => void;
    "aria-invalid"?: boolean;
};
