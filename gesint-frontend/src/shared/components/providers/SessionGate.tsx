"use client";

import { getSession, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { createContext, type ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { isPublicAppPath } from "@/shared/auth/public-app-path";
import {
    isSessionLocallyExpired,
    isSessionTerminal,
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
 * Valida a sessão uma vez antes de montar telas autenticadas e renova em
 * background (timer / retorno à aba) sem bloquear a UI.
 *
 * Em rotas públicas (/careers, /ponto) não valida nem redireciona — cookie
 * expirado não deve empurrar o usuário para /login.
 */
export function SessionGate({ children }: { children: ReactNode }) {
    const { data: session, status } = useSession();
    const pathname = usePathname();
    const onPublicPath = isPublicAppPath(pathname);
    const [ready, setReady] = useState(() => status !== "authenticated" || onPublicPath);
    const signingOutRef = useRef(false);
    const validatedRef = useRef(false);
    const refreshTimerRef = useRef<number | undefined>(undefined);

    const clearRefreshTimer = useCallback(() => {
        if (refreshTimerRef.current) {
            window.clearTimeout(refreshTimerRef.current);
            refreshTimerRef.current = undefined;
        }
    }, []);

    const signOutExpired = useCallback(() => {
        if (signingOutRef.current || isPublicAppPath(window.location.pathname)) {
            return;
        }
        signingOutRef.current = true;
        validatedRef.current = false;
        clearRefreshTimer();
        setAuthToken(null);
        toast.error("Sessão expirada. Faça login novamente.");
        void signOutToTenantLogin();
    }, [clearRefreshTimer]);

    const scheduleRefreshRef = useRef<(nextSession: Awaited<ReturnType<typeof getSession>>) => void>(() => {});
    const syncSessionSilentlyRef = useRef<() => Promise<void>>(async () => {});

    syncSessionSilentlyRef.current = async () => {
        if (signingOutRef.current || !validatedRef.current || isPublicAppPath(window.location.pathname)) {
            return;
        }
        const latest = await getSession({ broadcast: false });
        if (signingOutRef.current) {
            return;
        }
        if (!isSessionUsable(latest)) {
            signOutExpired();
            return;
        }
        if (latest?.accessToken) {
            setAuthToken(latest.accessToken);
        }
        scheduleRefreshRef.current(latest);
    };

    scheduleRefreshRef.current = (nextSession) => {
        clearRefreshTimer();
        const ms = msUntilProactiveRefresh(nextSession);
        if (ms == null) {
            return;
        }
        refreshTimerRef.current = window.setTimeout(() => {
            void syncSessionSilentlyRef.current();
        }, ms);
    };

    // Gate inicial — roda só até a primeira validação bem-sucedida.
    useEffect(() => {
        if (onPublicPath) {
            validatedRef.current = false;
            signingOutRef.current = false;
            clearRefreshTimer();
            setReady(true);
            return;
        }

        if (status !== "authenticated") {
            validatedRef.current = false;
            signingOutRef.current = false;
            clearRefreshTimer();
            setReady(true);
            return;
        }

        if (validatedRef.current) {
            return;
        }

        if (isSessionLocallyExpired(session)) {
            signOutExpired();
            return;
        }

        let cancelled = false;
        setReady(false);

        void (async () => {
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
            validatedRef.current = true;
            setReady(true);
            scheduleRefreshRef.current(latest);
        })();

        return () => {
            cancelled = true;
        };
    }, [clearRefreshTimer, onPublicPath, session, signOutExpired, status]);

    // Erros de refresh vindos do SessionProvider (refetchInterval).
    useEffect(() => {
        if (onPublicPath || status !== "authenticated" || !validatedRef.current) {
            return;
        }
        if (isSessionTerminal(session)) {
            signOutExpired();
            return;
        }
        if (session?.accessToken) {
            setAuthToken(session.accessToken);
        }
    }, [onPublicPath, session?.accessToken, session?.error, signOutExpired, status]);

    // Retorno à aba: renova em background sem esconder o shell.
    useEffect(() => {
        if (onPublicPath || status !== "authenticated") {
            return;
        }
        const onVisible = () => {
            if (document.visibilityState !== "visible" || !validatedRef.current) {
                return;
            }
            void syncSessionSilentlyRef.current();
        };
        document.addEventListener("visibilitychange", onVisible);
        return () => document.removeEventListener("visibilitychange", onVisible);
    }, [onPublicPath, status]);

    useEffect(() => clearRefreshTimer, [clearRefreshTimer]);

    return <SessionReadyContext.Provider value={ready}>{children}</SessionReadyContext.Provider>;
}
