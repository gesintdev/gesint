"use client";

import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";

import { apiFetch } from "@/shared/lib/api.client";

/**
 * Keys comerciais efetivas do tenant.
 * - Sem tenantSlug: null (host plataforma — sem filtro).
 * - Com tenant e JWT sem keys: hidrata via GET /auth/tenant.
 */
export function useContractedSystemKeys(): {
    keys: string[] | null;
    ready: boolean;
} {
    const { data: session, status } = useSession();
    const [hydratedKeys, setHydratedKeys] = useState<string[] | null | undefined>(undefined);

    useEffect(() => {
        if (status !== "authenticated") {
            setHydratedKeys(undefined);
            return;
        }
        if (!session?.tenantSlug) {
            setHydratedKeys(null);
            return;
        }
        if (session.contractedSystemKeys != null) {
            setHydratedKeys(session.contractedSystemKeys);
            return;
        }

        let cancelled = false;
        void (async () => {
            try {
                const data = await apiFetch<{ contractedSystemKeys?: string[] | null }>("/api/v1/auth/tenant");
                if (!cancelled) {
                    setHydratedKeys(data?.contractedSystemKeys ?? []);
                }
            } catch {
                if (!cancelled) {
                    setHydratedKeys([]);
                }
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [session?.contractedSystemKeys, session?.tenantSlug, status]);

    const keys = useMemo(() => {
        if (status === "loading") {
            return null;
        }
        if (!session?.tenantSlug) {
            return null;
        }
        if (session.contractedSystemKeys != null) {
            return session.contractedSystemKeys;
        }
        if (hydratedKeys !== undefined) {
            return hydratedKeys;
        }
        return [];
    }, [hydratedKeys, session?.contractedSystemKeys, session?.tenantSlug, status]);

    const ready =
        status !== "loading" &&
        (!session?.tenantSlug || session.contractedSystemKeys != null || hydratedKeys !== undefined);

    return { keys, ready };
}
