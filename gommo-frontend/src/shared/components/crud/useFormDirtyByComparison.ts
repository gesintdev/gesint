"use client";

import { useMemo } from "react";

function stableSerialize(value: unknown): string {
    return JSON.stringify(value);
}

/** Compara o estado atual do formulário com a baseline (vazio ou registro carregado). */
export function useFormDirtyByComparison<T>(current: T, baseline: T | null | undefined): boolean {
    return useMemo(() => {
        if (baseline == null) return false;
        return stableSerialize(current) !== stableSerialize(baseline);
    }, [baseline, current]);
}
