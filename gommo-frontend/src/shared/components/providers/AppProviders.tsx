"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type ReactNode, useState } from "react";
import { Toaster } from "sonner";

import { SessionExpiryGuards } from "@/shared/components/providers/SessionExpiryGuards";
import { SessionRefresh } from "@/shared/components/providers/SessionRefresh";
import { ThemeProvider } from "@/shared/components/providers/ThemeProvider";
import { SystemAlertHost } from "@/shared/components/system-alert/SystemAlertHost";
import { createQueryClient } from "@/shared/lib/query-client";

const SESSION_REFETCH_SECONDS = 60;

export function AppProviders({ children, session }: { children: ReactNode; session: Session | null }) {
    const [queryClient] = useState(() => createQueryClient());

    return (
        <SessionProvider session={session} refetchInterval={SESSION_REFETCH_SECONDS} refetchOnWindowFocus={false}>
            <SessionRefresh />
            <SessionExpiryGuards />
            <QueryClientProvider client={queryClient}>
                <ThemeProvider>
                    {children}
                    <Toaster richColors position="top-center" closeButton />
                    <SystemAlertHost />
                </ThemeProvider>
            </QueryClientProvider>
        </SessionProvider>
    );
}
