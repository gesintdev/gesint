"use client";

import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";

import { apiFetch } from "@/shared/lib/api.client";
import { isPlatformAdminWithoutTenant } from "@/shared/lib/contracted-systems";

/**
 * Keys comerciais efetivas do tenant.
 * - Host plataforma / localhost (dev-public): null — todos os sistemas.
 * - Com tenant comercial e JWT sem keys: hidrata via GET /auth/tenant.
 */
export function useContractedSystemKeys(): {
    keys: string[] | null;
    ready: boolean;
} {
    const { data: session, status } = useSession();
    const [hydratedKeys, setHydratedKeys] = useState<string[] | null | undefined>(undefined);
    const noCommercialFilter = isPlatformAdminWithoutTenant({
        platformAdmin: session?.platformAdmin,
        tenantSlug: session?.tenantSlug,
        contractedSystemKeys: session?.contractedSystemKeys,
    });

    useEffect(() => {
        if (status !== "authenticated") {
            setHydratedKeys(undefined);
            return;
        }
        if (noCommercialFilter) {
            setHydratedKeys(null);
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
    }, [noCommercialFilter, session?.contractedSystemKeys, session?.tenantSlug, status]);

    const keys = useMemo(() => {
        if (status === "loading") {
            return null;
        }
        // Host plataforma / localhost: sem filtro comercial.
        if (noCommercialFilter) {
            return null;
        }
        if (session?.contractedSystemKeys != null) {
            return session.contractedSystemKeys;
        }
        if (hydratedKeys !== undefined) {
            return hydratedKeys;
        }
        return [];
    }, [
        hydratedKeys,
        noCommercialFilter,
        session?.contractedSystemKeys,
        status,
    ]);

    const ready =
        status !== "loading" &&
        (noCommercialFilter ||
            session?.contractedSystemKeys != null ||
            hydratedKeys !== undefined);

    return { keys, ready };
}
