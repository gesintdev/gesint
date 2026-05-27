"use client";

import type { ReactNode } from "react";
import { PageTransition } from "@/shared/components/layout/PageTransition";
import { Card } from "@/shared/components/ui/Card";

/** Página de cadastro/listagem — preenche a área útil abaixo do header. */
export function CrudPageLayout({ children }: { children: ReactNode }) {
  return (
    <PageTransition fillHeight animate={false}>
      {children}
    </PageTransition>
  );
}

export function CrudPageCard({ children }: { children: ReactNode }) {
  return (
    <Card
      animate={false}
      className="flex min-h-0 flex-1 flex-col"
      bodyClassName="flex min-h-0 flex-1 flex-col !p-0"
    >
      {children}
    </Card>
  );
}
