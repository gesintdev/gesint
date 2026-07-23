"use client";

import type { ReactNode } from "react";

import { ThemeToggle } from "@/shared/components/layout/ThemeToggle";

type CareersShellProps = {
    children: ReactNode;
};

export function CareersShell({ children }: CareersShellProps) {
    const year = new Date().getFullYear();

    return (
        <div className="relative min-h-screen bg-base-200">
            <div className="absolute right-4 top-4 z-10">
                <ThemeToggle />
            </div>
            <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 py-10 sm:px-6">
                <div className="mb-8 flex items-center gap-3">
                    <img
                        src="/brand/gommo-logo-blue.svg"
                        alt="Gommo"
                        className="h-8 w-auto"
                        draggable={false}
                    />
                    <span className="text-sm font-medium text-base-content/55">Carreiras</span>
                </div>
                <div className="flex-1">{children}</div>
                <p className="mt-10 text-center text-xs text-base-content/40">
                    © {year} Gommo. Todos os direitos reservados.
                </p>
            </main>
        </div>
    );
}
