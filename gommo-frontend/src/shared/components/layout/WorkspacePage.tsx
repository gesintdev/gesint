"use client";

import type { ReactNode } from "react";

import { CrudPageCard, CrudPageLayout } from "@/shared/components/layout/CrudPageLayout";

export function WorkspacePage({ children }: { children: ReactNode }) {
    return (
        <CrudPageLayout>
            <CrudPageCard>{children}</CrudPageCard>
        </CrudPageLayout>
    );
}
