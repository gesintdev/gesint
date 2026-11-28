import { systemModuleGroups } from "@/config/routes";
import { SystemEnum, SystemEnumHelper } from "@/modules/root/enum/SystemEnum";
import type { WorkspaceTab } from "@/shared/workspace/workspace.types";

/**
 * Sistema dono da rota. Rota de um sistema só fica com ele; rota compartilhada (Admissão,
 * Pessoas...) fica com o sistema do rail (`preferred`, ou o gravado no navegador).
 */
export function resolveWorkspaceTabSystem(href: string, preferred?: SystemEnum | null): SystemEnum | undefined {
    const fallback = preferred ?? SystemEnumHelper.readStoredSystem();
    return SystemEnumHelper.getSystemForHref(href, systemModuleGroups, fallback) ?? undefined;
}

/** Sistema da aba: o gravado ao abrir; abas antigas (sem o campo) resolvem pela rota. */
export function workspaceTabSystem(tab: WorkspaceTab): SystemEnum | undefined {
    return tab.system ?? resolveWorkspaceTabSystem(tab.href);
}

/**
 * Ordem da trilha, como grupos de abas do navegador: fixadas à esquerda (fora dos grupos) e, depois,
 * as demais juntas por sistema, na ordem em que cada sistema apareceu. Dentro do grupo a ordem
 * relativa é preservada; assim uma aba nova de um sistema que já tem abas entra no fim do grupo dele.
 */
export function arrangeWorkspaceTabs(tabs: WorkspaceTab[]): WorkspaceTab[] {
    const pinned: WorkspaceTab[] = [];
    const groups = new Map<string, WorkspaceTab[]>();
    for (const tab of tabs) {
        if (tab.pinned) {
            pinned.push(tab);
            continue;
        }
        const key = workspaceTabSystem(tab) ?? "";
        const group = groups.get(key);
        if (group) group.push(tab);
        else groups.set(key, [tab]);
    }
    return [...pinned, ...[...groups.values()].flat()];
}

export type WorkspaceTabGroupInfo = {
    /** Sistema do grupo; `null` para aba fixada ou trilha sem agrupamento. */
    system: SystemEnum | null;
    start: boolean;
    end: boolean;
};

/**
 * Grupos da trilha e do dropdown de abas: por sistema, sobre a ordem já arranjada da store.
 * Com uma aba só não há grupo; fixadas ficam fora.
 */
export function computeWorkspaceTabGroups(tabs: WorkspaceTab[]): {
    info: Map<string, WorkspaceTabGroupInfo>;
    counts: Map<SystemEnum, number>;
} {
    const groupingEnabled = tabs.length > 1;
    const systems = tabs.map((tab) => (groupingEnabled && !tab.pinned ? (workspaceTabSystem(tab) ?? null) : null));
    const info = new Map<string, WorkspaceTabGroupInfo>();
    const counts = new Map<SystemEnum, number>();
    tabs.forEach((tab, index) => {
        const system = systems[index];
        if (system) counts.set(system, (counts.get(system) ?? 0) + 1);
        info.set(tab.id, {
            system,
            start: system != null && systems[index - 1] !== system,
            end: system != null && systems[index + 1] !== system,
        });
    });
    return { info, counts };
}

/** Classe de cor do grupo por sistema (tokens em `globals.css`). */
export const WORKSPACE_TAB_GROUP_TONE: Record<SystemEnum, string> = {
    [SystemEnum.DP]: "dp",
    [SystemEnum.RH]: "rh",
    [SystemEnum.CONTABILIDADE]: "ctb",
    [SystemEnum.PONTO]: "gp",
};
