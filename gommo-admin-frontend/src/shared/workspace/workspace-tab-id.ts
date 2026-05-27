/** Chave da instância da aba: listagem do módulo, novo, ou id do registro. */
export type WorkspaceEntityKey = "list" | "new" | (string & {});

export function buildWorkspaceTabId(routeId: string, entityKey: WorkspaceEntityKey): string {
    return `${routeId}::${entityKey}`;
}

export function parseWorkspaceTabId(tabId: string): {
    routeId: string;
    entityKey: WorkspaceEntityKey;
} {
    const sep = tabId.indexOf("::");
    if (sep === -1) return {routeId: tabId, entityKey: "list"};
    return {
        routeId: tabId.slice(0, sep),
        entityKey: tabId.slice(sep + 2) as WorkspaceEntityKey,
    };
}

export function isModuleListTab(entityKey: WorkspaceEntityKey): boolean {
    return entityKey === "list";
}
