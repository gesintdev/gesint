"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

import { apiFetch } from "@/shared/lib/api.client";
import { resolveClientDisplayName } from "@/shared/lib/tenant";

type TenantInfoResponse = {
    slug?: string;
    name?: string;
};

/**
 * Nome do cliente: prioriza sessão (login/refresh), depois GET /auth/tenant, depois slug da URL.
 */
export function useClientDisplayName(): string | null {
    const { data: session, status } = useSession();
    const [resolved, setResolved] = useState<string | null>(() =>
        resolveClientDisplayName({
            tenantName: session?.tenantName,
            tenantSlug: session?.tenantSlug,
        }),
    );

    useEffect(() => {
        const fromSession = resolveClientDisplayName({
            tenantName: session?.tenantName,
            tenantSlug: session?.tenantSlug,
        });
        if (fromSession) {
            setResolved(fromSession);
            return;
        }

        if (status === "loading") {
            return;
        }

        let cancelled = false;
        void (async () => {
            try {
                const data = await apiFetch<TenantInfoResponse | undefined>("/api/v1/auth/tenant", {
                    skipAuth: true,
                });
                if (cancelled) {
                    return;
                }
                setResolved(
                    resolveClientDisplayName({
                        tenantName: data?.name,
                        tenantSlug: data?.slug,
                    }),
                );
            } catch {
                if (!cancelled) {
                    setResolved(resolveClientDisplayName());
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [session?.tenantName, session?.tenantSlug, status]);

    return resolved;
}
