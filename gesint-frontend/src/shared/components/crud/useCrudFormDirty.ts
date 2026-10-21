"use client";

import { useContext, useEffect } from "react";

import { CrudFormDirtyContext } from "@/shared/components/crud/CrudFormDirtyContext";

/** Publica alterações não salvas do formulário para o guard central do CrudScreen. */
export function useCrudFormDirty(isDirty: boolean): void {
    const ctx = useContext(CrudFormDirtyContext);
    if (!ctx) return;

    useEffect(() => {
        ctx.setFormDirty(isDirty);
        return () => ctx.setFormDirty(false);
    }, [ctx, isDirty]);
}
