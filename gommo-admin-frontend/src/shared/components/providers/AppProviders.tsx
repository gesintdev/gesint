"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { useTheme } from "next-themes";
import { type ReactNode, useState } from "react";
import { Toaster } from "sonner";

import { AccessTokenRevealHost } from "@/shared/access-token-reveal";
import { SessionGate } from "@/shared/components/providers/SessionGate";
import { SessionRefresh } from "@/shared/components/providers/SessionRefresh";
import { ThemeProvider } from "@/shared/components/providers/ThemeProvider";
import { SystemAlertHost } from "@/shared/components/system-alert/SystemAlertHost";
import { createQueryClient } from "@/shared/lib/query-client";

const SESSION_REFETCH_MS = 4 * 60 * 1000;

function ThemedToaster() {
    const { resolvedTheme } = useTheme();
    return (
        <Toaster
            richColors
            position="top-center"
            closeButton
            theme={resolvedTheme === "dark" ? "dark" : "light"}
        />
    );
}

export function AppProviders({ children }: { children: ReactNode }) {
    const [queryClient] = useState(() => createQueryClient());

    return (
        <SessionProvider refetchInterval={SESSION_REFETCH_MS} refetchOnWindowFocus>
            <SessionGate>
                <SessionRefresh />
                <QueryClientProvider client={queryClient}>
                    <ThemeProvider>
                        {children}
                        <SystemAlertHost />
                        <AccessTokenRevealHost />
                        <ThemedToaster />
                    </ThemeProvider>
                </QueryClientProvider>
            </SessionGate>
        </SessionProvider>
    );
}
