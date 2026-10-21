"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { useCandidateSession } from "@/modules/careers/portal/hooks/useCandidateSession";
import { ThemeToggle } from "@/shared/components/layout/ThemeToggle";
import { Button } from "@/shared/components/ui/Button";
import { SystemLogo } from "@/shared/components/brand/SystemLogo";

export function CandidatePortalShell({
    title,
    organizationName,
    children,
}: {
    title: string;
    organizationName?: string;
    children: ReactNode;
}) {
    const { session, isAuthenticated, logout } = useCandidateSession();
    const brand = organizationName?.trim() || session?.tenantName?.trim() || "Carreiras";

    return (
        <div className="min-h-screen bg-base-200 text-base-content">
            <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b border-base-content/10 bg-base-100 px-4 sm:px-6">
                <Link href="/careers" className="flex min-w-0 items-center gap-2.5">
                    <SystemLogo size="1.75rem" title={brand} />
                    <span className="truncate text-sm font-semibold">{brand}</span>
                    <span className="hidden text-sm text-base-content/45 sm:inline">· Portal do candidato</span>
                </Link>
                <div className="flex items-center gap-2">
                    {isAuthenticated ? (
                        <>
                            <span className="hidden max-w-[140px] truncate text-xs text-base-content/55 sm:inline">
                                {session?.fullName}
                            </span>
                            <Button type="button" variant="ghost" size="sm" onClick={logout}>
                                Sair
                            </Button>
                        </>
                    ) : null}
                    <ThemeToggle />
                </div>
            </header>
            <main className="mx-auto w-full max-w-lg px-4 py-8 sm:px-6 sm:py-10">
                <h1 className="mb-6 text-xl font-extrabold tracking-tight sm:text-2xl">{title}</h1>
                {children}
            </main>
        </div>
    );
}
