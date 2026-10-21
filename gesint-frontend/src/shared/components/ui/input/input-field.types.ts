import type { HTMLAttributes, HTMLInputTypeAttribute, KeyboardEvent, ReactNode } from "react";

export type InputFieldChromeProps = {
    label?: string;
    hint?: string;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
    wrapperClassName?: string;
    id?: string;
    /** Quando false, o rótulo não dispara o controle (ex.: select com botão). */
    labelFor?: boolean;
    placeholder?: string;
    /**
     * Campo de dado sensível / financeiro / clínico (RN-02 · SEG-02).
     * Sem a authority em {@link sensitivePermission}, exibe a superfície Restrito.
     */
    sensitive?: boolean;
    /** Authority exigida quando sensitive=true (ex.: leave:sensitive). Sem ela, fail-closed. */
    sensitivePermission?: string;
};

export type InputBaseProps = InputFieldChromeProps & {
    /** Valor exibido no campo (pode conter m\u00e1scara) */
    displayValue: string;
    onDisplayChange: (display: string) => void;
    placeholder?: string;
    leftIcon?: ReactNode;
    rightSlot?: ReactNode;
    className?: string;
    inputClassName?: string;
    autoComplete?: string;
    inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"];
    type?: HTMLInputTypeAttribute;
    min?: string;
    max?: string;
    step?: string | number;
    maxLength?: number;
    /** Exibe um indicador de carregamento (ex.: busca assíncrona em andamento). */
    loading?: boolean;
    onBlur?: () => void;
    onFocus?: () => void;
    onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
    "aria-invalid"?: boolean;
};
