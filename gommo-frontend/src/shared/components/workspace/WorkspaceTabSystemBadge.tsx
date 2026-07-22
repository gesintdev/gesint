"use client";

import clsx from "clsx";

import { systemModuleGroups } from "@/config/routes";
import { SystemEnum, SystemEnumHelper } from "@/modules/root/enum/SystemEnum";
import { useActiveSystem } from "@/shared/context/ActiveSystemContext";

type WorkspaceTabSystemBadgeProps = {
    href: string;
    className?: string;
};

export function WorkspaceTabSystemBadge({ href, className }: WorkspaceTabSystemBadgeProps) {
    const { activeSystem } = useActiveSystem();
    // Rotas compartilhadas (Admissão/Pessoas/Férias) existem em mais de um domínio —
    // a tag segue o sistema ativo na hora de abrir/exibir a aba.
    const system = SystemEnumHelper.getSystemForHref(href, systemModuleGroups, activeSystem);

    if (!system) return null;

    const { acronym, name } = SystemEnumHelper.getById(system);

    return (
        <span
            className={clsx(
                "workspace-tab-system-badge",
                system === SystemEnum.DP && "workspace-tab-system-badge--dp",
                system === SystemEnum.RH && "workspace-tab-system-badge--rh",
                system === SystemEnum.CONTABILIDADE && "workspace-tab-system-badge--ctb",
                className,
            )}
            title={name}
            aria-label={`Domínio ${name}`}
        >
            {acronym}
        </span>
    );
}
