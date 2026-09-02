"use client";

import { getSession, useSession } from "next-auth/react";
import { createContext, type ReactNode, useContext, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import {
    isSessionLocallyExpired,
    isSessionUsable,
    msUntilProactiveRefresh,
} from "@/shared/auth/session-access.client";
import { setAuthToken } from "@/shared/lib/api.client";
import { signOutToTenantLogin } from "@/shared/lib/sign-out.client";

const SessionReadyContext = createContext(true);

export function useSessionReady(): boolean {
    return useContext(SessionReadyContext);
}

/**
 * Valida/renova a sessão antes de montar telas autenticadas e agenda refresh
 * próximo à expiração do access token.
 */
export function SessionGate({ children }: { children: ReactNode }) {
    const { data: session, status } = useSession();
    const [ready, setReady] = useState(() => status !== "authenticated");
    const signingOutRef = useRef(false);
    const refreshTimerRef = useRef<number | undefined>(undefined);

    const signOutExpired = () => {
        if (signingOutRef.current) {
            return;
        }
        signingOutRef.current = true;
        setAuthToken(null);
        toast.error("Sessão expirada. Faça login novamente.");
        void signOutToTenantLogin();
    };

    useEffect(() => {
        if (status !== "authenticated") {
            setReady(true);
            signingOutRef.current = false;
            if (refreshTimerRef.current) {
                window.clearTimeout(refreshTimerRef.current);
                refreshTimerRef.current = undefined;
            }
            return;
        }

        let cancelled = false;
        setReady(false);
        signingOutRef.current = false;

        if (isSessionLocallyExpired(session)) {
            signOutExpired();
            return;
        }

        const scheduleRefresh = (session: Awaited<ReturnType<typeof getSession>>) => {
            if (refreshTimerRef.current) {
                window.clearTimeout(refreshTimerRef.current);
            }
            const ms = msUntilProactiveRefresh(session);
            if (ms == null) {
                return;
            }
            refreshTimerRef.current = window.setTimeout(() => {
                void syncSession();
            }, ms);
        };

        const syncSession = async () => {
            if (cancelled || signingOutRef.current) {
                return;
            }
            const latest = await getSession({ broadcast: false });
            if (cancelled || signingOutRef.current) {
                return;
            }
            if (!isSessionUsable(latest)) {
                signOutExpired();
                return;
            }
            if (latest?.accessToken) {
                setAuthToken(latest.accessToken);
            }
            setReady(true);
            scheduleRefresh(latest);
        };

        void syncSession();

        return () => {
            cancelled = true;
            if (refreshTimerRef.current) {
                window.clearTimeout(refreshTimerRef.current);
                refreshTimerRef.current = undefined;
            }
        };
    }, [session, status]);

    return <SessionReadyContext.Provider value={ready}>{children}</SessionReadyContext.Provider>;
}
