"use client";

import { useSession } from "next-auth/react";
import { useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";

import { systemModuleGroups } from "@/config/routes";
import { SystemEnumHelper } from "@/modules/root/enum/SystemEnum";
import { canAccessRoute } from "@/shared/auth/route-access";
import { AppException } from "@/shared/exceptions/app.exception";
import { useContractedSystemKeys } from "@/shared/hooks/useContractedSystemKeys";
import { doRequest, setAuthToken } from "@/shared/lib/api.client";
import {
    isPlatformAdminWithoutTenant,
    isSystemContracted,
    resolveContractedSystems,
} from "@/shared/lib/contracted-systems";
import { signOutToTenantLogin } from "@/shared/lib/sign-out.client";
import { useWorkspaceStore } from "@/shared/workspace/workspace.store";
import { findRouteById } from "@/shared/workspace/workspace-routes";

const SESSION_CHECK_INTERVAL_MS = 15_000;

function isSessionDeadError(error: unknown): boolean {
    if (!(error instanceof AppException)) {
        return false;
    }
    return (
        error.code === "AUTH_REVOKED_REFRESH" ||
        error.code === "AUTH_INVALID_REFRESH" ||
        error.code === "AUTH_EXPIRED_REFRESH" ||
        error.code === "AUTH_SESSION_EXPIRED"
    );
}

/** Mantém o token em memória sincronizado e reage a falha de refresh / FORCE_LOGOUT */
export function SessionRefresh() {
    const { data: session } = useSession();
    const { keys: contractedKeys, ready: contractedReady } = useContractedSystemKeys();
    const closeAllTabs = useWorkspaceStore((s) => s.closeAllTabs);
    const retainTabsByRouteIds = useWorkspaceStore((s) => s.retainTabsByRouteIds);
    const previousUserRef = useRef<string | null>(null);
    const signingOutRef = useRef(false);
    const userKey = useMemo(
        () => (session?.user ? `${session.user.email ?? ""}|${session.user.name ?? ""}` : null),
        [session?.user],
    );
    const contractedSystems = useMemo(() => resolveContractedSystems(contractedKeys), [contractedKeys]);

    useEffect(() => {
        if (session?.accessToken) {
            setAuthToken(session.accessToken);
        }
    }, [session?.accessToken]);

    useEffect(() => {
        if (session?.error === "RefreshAccessTokenError" || session?.error === "RefreshTokenMissing") {
            if (signingOutRef.current) {
                return;
            }
            signingOutRef.current = true;
            setAuthToken(null);
            toast.error("Sessão expirada. Faça login novamente.");
            void signOutToTenantLogin();
        }
    }, [session?.error]);

    useEffect(() => {
        const refreshToken = session?.refreshToken;
        if (!refreshToken) {
            return;
        }

        let cancelled = false;

        const checkSession = async () => {
            if (cancelled || signingOutRef.current) {
                return;
            }
            try {
                // Tenant vem do Host (coca-cola.localhost) ou X-Tenant-Slug via api.client.
                await doRequest("/api/v1/auth/session-check", {
                    method: "POST",
                    body: { refreshToken },
                    skipAuth: true,
                    skipAuthRetry: true,
                    responseType: "void",
                });
            } catch (error) {
                if (cancelled || signingOutRef.current || !isSessionDeadError(error)) {
                    return;
                }
                signingOutRef.current = true;
                setAuthToken(null);
                toast.error("Sessão encerrada. Faça login novamente.");
                void signOutToTenantLogin();
            }
        };

        void checkSession();
        const timer = window.setInterval(() => {
            void checkSession();
        }, SESSION_CHECK_INTERVAL_MS);

        return () => {
            cancelled = true;
            window.clearInterval(timer);
        };
    }, [session?.refreshToken]);

    useEffect(() => {
        if (!userKey) return;
        if (previousUserRef.current && previousUserRef.current !== userKey) {
            closeAllTabs();
        }
        previousUserRef.current = userKey;
    }, [closeAllTabs, userKey]);

    useEffect(() => {
        if (!contractedReady) {
            return;
        }
        const platformAdminNoTenant = isPlatformAdminWithoutTenant({
            platformAdmin: session?.platformAdmin,
            tenantSlug: session?.tenantSlug,
            contractedSystemKeys: session?.contractedSystemKeys,
        });
        const permissions = session?.user?.permissions ?? [];
        const allowedRouteIds = new Set(
            useWorkspaceStore
                .getState()
                .tabs.map((tab) => tab.routeId)
                .filter((routeId) => {
                    if (platformAdminNoTenant) {
                        return true;
                    }
                    const route = findRouteById(routeId);
                    if (!canAccessRoute(route, permissions)) {
                        return false;
                    }
                    const system = SystemEnumHelper.findSystemForRouteId(routeId, systemModuleGroups);
                    return isSystemContracted(system, contractedSystems);
                }),
        );
        retainTabsByRouteIds(allowedRouteIds);
    }, [
        contractedKeys,
        contractedReady,
        contractedSystems,
        retainTabsByRouteIds,
        session?.platformAdmin,
        session?.tenantSlug,
        session?.user?.permissions,
    ]);

    return null;
}
