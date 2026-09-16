export function digitsOnly(value: string): string {
    return value.replace(/\D/g, "");
}

/** Quantidade de dígitos à esquerda do cursor (ignora máscara). */
export function digitsBeforeCursor(value: string, cursor: number): number {
    return digitsOnly(value.slice(0, Math.max(0, cursor))).length;
}

/** Posição do caret no valor mascarado após N dígitos. */
export function cursorForDigitCount(masked: string, digitCount: number): number {
    if (digitCount <= 0) return 0;
    let seen = 0;
    for (let i = 0; i < masked.length; i++) {
        const ch = masked[i]!;
        if (ch >= "0" && ch <= "9") {
            seen += 1;
            if (seen >= digitCount) return i + 1;
        }
    }
    return masked.length;
}

export function lettersAndDigits(value: string): string {
    return value.replace(/[^a-zA-Z0-9]/g, "");
}
