import { parseWorkspaceTabId } from "@/shared/workspace/workspace-tab-id";

export function workspaceUrl(href: string): string {
    return href;
}

export function workspaceUrlWithCrud(
    href: string,
    crud: { editingId?: string | null; isNew?: boolean },
): string {
    if (crud.editingId) return `${href}?edit=${encodeURIComponent(crud.editingId)}`;
    if (crud.isNew) return `${href}?new=1`;
    return href;
}

export function workspaceUrlForTab(href: string, tabId: string): string {
    const { entityKey } = parseWorkspaceTabId(tabId);
    if (entityKey === "new") return workspaceUrlWithCrud(href, { isNew: true });
    if (entityKey !== "list") return workspaceUrlWithCrud(href, { editingId: entityKey });
    return workspaceUrl(href);
}
