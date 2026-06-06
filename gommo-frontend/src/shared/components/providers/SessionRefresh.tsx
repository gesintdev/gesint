"use client";

import { signOut, useSession } from "next-auth/react";
import {useEffect, useMemo, useRef} from "react";
import {toast} from "sonner";
import {canAccessRoute} from "@/shared/auth/route-access";
import {setAuthToken} from "@/shared/lib/api.client";
import {findRouteById} from "@/shared/workspace/workspace-routes";
import {useWorkspaceStore} from "@/shared/workspace/workspace.store";

/** Mantém o token em memória sincronizado e reage a falha de refresh */
export function SessionRefresh() {
    const {data: session} = useSession();
    const closeAllTabs = useWorkspaceStore((s) => s.closeAllTabs);
    const retainTabsByRouteIds = useWorkspaceStore((s) => s.retainTabsByRouteIds);
    const previousUserRef = useRef<string | null>(null);
    const userKey = useMemo(
        () => (session?.user ? `${session.user.email ?? ""}|${session.user.name ?? ""}` : null),
        [session?.user],
    );

    useEffect(() => {
        if (session?.accessToken) {
            setAuthToken(session.accessToken);
        }
    }, [session?.accessToken]);

    useEffect(() => {
        if (session?.error === "RefreshAccessTokenError" || session?.error === "RefreshTokenMissing") {
            setAuthToken(null);
            toast.error("Sessão expirada. Faça login novamente.");
            void signOut({callbackUrl: "/login"});
        }
    }, [session?.error]);

    useEffect(() => {
        if (!userKey) return;
        if (previousUserRef.current && previousUserRef.current !== userKey) {
            closeAllTabs();
        }
        previousUserRef.current = userKey;
    }, [closeAllTabs, userKey]);

    useEffect(() => {
        const permissions = session?.user?.permissions ?? [];
        const allowedRouteIds = new Set(
            useWorkspaceStore
                .getState()
                .tabs
                .map((tab) => tab.routeId)
                .filter((routeId) => {
                    const route = findRouteById(routeId);
                    return canAccessRoute(route, permissions);
                }),
        );
        retainTabsByRouteIds(allowedRouteIds);
    }, [retainTabsByRouteIds, session?.user?.permissions]);

    return null;
}
