"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
    createContext,
    type ReactNode,
    useContext,
    useEffect,
    useMemo,
} from "react";

import type { SessionBootstrap } from "@/modules/root/auth/dto/session-bootstrap.dto";
import { authKeys, authSessionService } from "@/modules/root/auth/services/auth-session.service";
import { isPublicAppPath } from "@/shared/auth/public-app-path";
import { AppLoadingScreen } from "@/shared/components/layout/AppLoadingScreen";
import { useSessionReady } from "@/shared/components/providers/SessionGate";
import type { Branch } from "@/shared/lib/branch";

type AppBootstrapContextValue = {
    ready: boolean;
    bootstrap: SessionBootstrap | null;
    permissions: readonly string[];
    systemPermissions: Record<string, string[]> | null;
    branches: Branch[];
    contractedSystemKeys: string[] | null;
    contractedSystemKeyOverrides: Record<string, string[]> | null;
    assistantEnabled: boolean;
};

const AppBootstrapContext = createContext<AppBootstrapContextValue | null>(null);

function BootstrapLoading() {
    return <AppLoadingScreen message="Preparando seu ambiente..." />;
}

function isLoginPath(pathname: string | null): boolean {
    return Boolean(pathname === "/login" || pathname?.startsWith("/login/"));
}

export function AppBootstrapProvider({ children }: { children: ReactNode }) {
    const { status } = useSession();
    const sessionReady = useSessionReady();
    const pathname = usePathname();
    const router = useRouter();
    const queryClient = useQueryClient();
    const onPublicPath = isPublicAppPath(pathname);
    const sessionAuthenticated = status === "authenticated";
    const authenticated = !onPublicPath && sessionAuthenticated && sessionReady;
    const onLogin = isLoginPath(pathname);

    const query = useQuery({
        queryKey: authKeys.bootstrap(),
        queryFn: () => authSessionService.bootstrap(),
        enabled: authenticated,
        staleTime: 5 * 60_000,
        retry: 1,
    });

    useEffect(() => {
        if (status === "unauthenticated") {
            queryClient.removeQueries({ queryKey: authKeys.all });
        }
    }, [queryClient, status]);

    // Evita flash do formulário: sessão pronta em /login → segue direto ao app.
    useEffect(() => {
        if (!authenticated || !onLogin) {
            return;
        }
        router.replace("/dashboard");
    }, [authenticated, onLogin, router]);

    const bootstrapSettled = query.isSuccess || query.isError;
    const envReady = onPublicPath || !sessionAuthenticated || (sessionReady && bootstrapSettled);
    const holdForLoginExit = authenticated && onLogin;

    const value = useMemo<AppBootstrapContextValue>(() => {
        const bootstrap = query.data ?? null;
        return {
            ready: envReady && !holdForLoginExit,
            bootstrap,
            permissions: bootstrap?.permissions ?? [],
            systemPermissions: bootstrap?.systemPermissions ?? null,
            branches: (bootstrap?.branches ?? []) as Branch[],
            contractedSystemKeys: bootstrap?.contractedSystemKeys ?? null,
            contractedSystemKeyOverrides: bootstrap?.contractedSystemKeyOverrides ?? null,
            assistantEnabled: Boolean(bootstrap?.assistantEnabled),
        };
    }, [envReady, holdForLoginExit, query.data]);

    if (onPublicPath) {
        return <AppBootstrapContext.Provider value={value}>{children}</AppBootstrapContext.Provider>;
    }

    if (sessionAuthenticated && !sessionReady) {
        return <BootstrapLoading />;
    }

    if (authenticated && !bootstrapSettled) {
        return <BootstrapLoading />;
    }

    if (holdForLoginExit) {
        return <BootstrapLoading />;
    }

    if (authenticated && query.isError) {
        return (
            <div className="app-loading" role="alert">
                <p className="app-loading__message !text-error">Não foi possível carregar o ambiente do usuário.</p>
                <button
                    type="button"
                    className="gommo-btn gommo-btn--primary mt-2"
                    onClick={() => void query.refetch()}
                >
                    Tentar novamente
                </button>
            </div>
        );
    }

    return <AppBootstrapContext.Provider value={value}>{children}</AppBootstrapContext.Provider>;
}

export function useAppBootstrap(): AppBootstrapContextValue {
    const ctx = useContext(AppBootstrapContext);
    if (!ctx) {
        throw new Error("useAppBootstrap deve ser usado dentro de AppBootstrapProvider");
    }
    return ctx;
}

/** Para hooks que podem rodar fora do shell autenticado (ex.: login). */
export function useOptionalAppBootstrap(): AppBootstrapContextValue | null {
    return useContext(AppBootstrapContext);
}
