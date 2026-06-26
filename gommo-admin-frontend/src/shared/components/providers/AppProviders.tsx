"use client";
import { QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { type ReactNode, useState } from "react";
import { Toaster } from "sonner";

import { SessionRefresh } from "@/shared/components/providers/SessionRefresh";
import { ThemeProvider } from "@/shared/components/providers/ThemeProvider";
import { SystemAlertHost } from "@/shared/components/system-alert/SystemAlertHost";
import { createQueryClient } from "@/shared/lib/query-client";

const SESSION_REFETCH_MS = 4 * 60 * 1000;

export function AppProviders({ children }: { children: ReactNode }) {
    const [queryClient] = useState(() => createQueryClient());

    return (
        <SessionProvider refetchInterval={SESSION_REFETCH_MS} refetchOnWindowFocus={false}>
            <SessionRefresh />
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
