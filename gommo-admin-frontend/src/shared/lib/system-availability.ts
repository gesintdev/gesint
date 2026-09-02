export const CTB_PRODUCT_KEY = "CTB";

/** CTB so fica visivel em dev (NODE_ENV=development) ou com NEXT_PUBLIC_CTB_ENABLED=true. */
export function isCtbSystemEnabled(): boolean {
    const flag = process.env.NEXT_PUBLIC_CTB_ENABLED;
    if (flag === "true") return true;
    if (flag === "false") return false;
    return process.env.NODE_ENV === "development";
}

export function isProductSystemKeyVisible(key: string): boolean {
    if (key.trim().toUpperCase() === CTB_PRODUCT_KEY) {
        return isCtbSystemEnabled();
    }
    return true;
}
