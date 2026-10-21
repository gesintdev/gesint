export function digitsOnly(value: string): string {
    return value.replace(/\D/g, "");
}

export function lettersAndDigits(value: string): string {
    return value.replace(/[^a-zA-Z0-9]/g, "");
}
