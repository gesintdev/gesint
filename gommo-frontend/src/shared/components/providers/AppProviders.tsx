"use client";
import { QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";
import { type ReactNode, useState } from "react";
import { Toaster } from "sonner";
import { createQueryClient } from "@/shared/lib/query-client";
import { SessionRefresh } from "@/shared/components/providers/SessionRefresh";
import { ThemeProvider } from "@/shared/components/providers/ThemeProvider";
import { SystemAlertHost } from "@/shared/components/system-alert/SystemAlertHost";

const SESSION_REFETCH_MS = 4 * 60 * 1000;

export function AppProviders({ children, session }: { children: ReactNode; session: Session | null }) {
    const [queryClient] = useState(() => createQueryClient());

    return (
        <SessionProvider session={session} refetchInterval={SESSION_REFETCH_MS} refetchOnWindowFocus={false}>
            <SessionRefresh />
            <QueryClientProvider client={queryClient}>
                <ThemeProvider>
                    {children}
                    <Toaster richColors position="top-right" closeButton />
                    <SystemAlertHost />
                </ThemeProvider>
            </QueryClientProvider>
        </SessionProvider>
    );
}
