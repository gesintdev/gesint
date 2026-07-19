"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";

import { AdminHeader } from "@/shared/components/layout/AdminHeader";
import { AdminSidebar } from "@/shared/components/layout/AdminSidebar";

export function AdminShell({ children }: { children: ReactNode }) {
    const { status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.replace("/login");
        }
    }, [status, router]);

    if (status !== "authenticated") {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[var(--ga-bg)] text-[var(--ga-text-muted)]">
                Carregando...
            </div>
        );
    }

    return (
        <div className="flex min-h-screen">
            <AdminSidebar />
            <div
                style={{
                    marginLeft: "var(--ga-sidebar-width)",
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    minWidth: 0,
                }}
            >
                <AdminHeader />
                <main
                    style={{
                        marginTop: "var(--ga-header-h)",
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        minHeight: 0,
                    }}
                >
                    {children}
                </main>
            </div>
        </div>
    );
}
