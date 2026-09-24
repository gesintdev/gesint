"use client";

import { useSession } from "next-auth/react";
import { useMemo } from "react";

import type { SystemScope } from "@/modules/cfg/settings/lib/access-menu-catalog";
import { resolveAssignableScopes } from "@/modules/cfg/settings/profile/lib/profile-scope-access";
import { useSessionPermissions } from "@/shared/auth/permissions";
import { useContractedSystemKeys } from "@/shared/hooks/useContractedSystemKeys";
import { isPlatformAdminWithoutTenant, resolveContractedSystems } from "@/shared/lib/contracted-systems";

export type ProfileScopeAccess = {
    scopes: SystemScope[];
    granted: readonly string[];
    /** Admin global (plataforma/dev-public): sem filtro comercial nem de permissao. */
    unrestricted: boolean;
    ready: boolean;
};

/**
 * @param branchId Filial cujo contrato comercial filtra DP/RH/CTB. Sem argumento = filial ativa
 * do header. Em painéis com coluna Filiais, passar a filial selecionada.
 */
export function useProfileScopeAccess(branchId?: string | null): ProfileScopeAccess {
    const { data: session } = useSession();
    const sessionPermissions = useSessionPermissions();
    const { keys, ready } = useContractedSystemKeys(branchId);

    // Chaves estaveis: session/keys podem recriar arrays a cada render.
    const grantedKey = sessionPermissions.join("|");
    const contractedKey = keys == null ? null : keys.join("|");
    const granted = useMemo(() => (grantedKey ? grantedKey.split("|") : []), [grantedKey]);
    const contractedKeys = useMemo(
        () => (contractedKey == null ? null : contractedKey ? contractedKey.split("|") : []),
        [contractedKey],
    );

    const unrestricted = Boolean(
        session?.platformAdmin &&
            isPlatformAdminWithoutTenant({
                platformAdmin: session?.platformAdmin,
                tenantSlug: session?.tenantSlug,
                contractedSystemKeys: contractedKeys,
            }),
    );

    const scopes = useMemo(
        () => resolveAssignableScopes(resolveContractedSystems(contractedKeys), granted, unrestricted),
        [contractedKeys, granted, unrestricted],
    );

    return { scopes, granted, unrestricted, ready };
}
