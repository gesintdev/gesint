"use client";

import type {ReactNode} from "react";
import {CrudPageCard, CrudPageLayout} from "@/shared/components/layout/CrudPageLayout";

/** Página simples (sem CRUD) dentro de uma aba do workspace. */
export function WorkspacePage({children}: {children: ReactNode}) {
    return (
        <CrudPageLayout>
            <CrudPageCard>{children}</CrudPageCard>
        </CrudPageLayout>
    );
}
