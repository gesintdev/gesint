"use client";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { OpenWorkspaceRecordInput, OpenWorkspaceTabInput, WorkspaceTab } from "@/shared/workspace/workspace.types";
import { buildWorkspaceTabId, parseWorkspaceTabId } from "@/shared/workspace/workspace-tab-id";
import { defaultShortLabel } from "@/shared/workspace/workspace-routes";
import {
    DASHBOARD_ROUTE_ID,
    DASHBOARD_TAB_ID,
    isDashboardTabId,
    stripDashboardTabs,
} from "@/shared/workspace/workspace-dashboard";

type WorkspaceState = {
    tabs: WorkspaceTab[];
    activeTabId: string | null;
    _hasHydrated: boolean;
    setHasHydrated: (value: boolean) => void;
    openModuleTab: (input: OpenWorkspaceTabInput) => void;
    openRecordTab: (input: OpenWorkspaceRecordInput) => void;
    focusTab: (tabId: string) => void;
    closeTab: (tabId: string) => void;
    closeAllTabs: () => void;
    retainTabsByRouteIds: (allowedRouteIds: ReadonlySet<string>) => void;
    /** Troca de domínio — substitui abas pela rota inicial do sistema (sem injetar dashboard). */
    replaceWorkspaceModule: (input: OpenWorkspaceTabInput) => void;
    setTitleSuffix: (tabId: string, titleSuffix: string) => void;
    clearTitleSuffix: (tabId: string) => void;
};

export { DASHBOARD_TAB_ID };

function createDashboardTab(): WorkspaceTab {
    return {
        id: DASHBOARD_TAB_ID,
        routeId: DASHBOARD_ROUTE_ID,
        href: "/dashboard",
        routeLabel: "Painel",
        shortLabel: defaultShortLabel("Painel"),
        entityKey: "list",
    };
}

export function getDashboardTab(): WorkspaceTab {
    return createDashboardTab();
}

function buildTab(input: OpenWorkspaceRecordInput, existing?: WorkspaceTab): WorkspaceTab {
    const shortLabel = input.shortLabel ?? defaultShortLabel(input.routeLabel);
    const titleSuffix = "titleSuffix" in input ? input.titleSuffix : existing?.titleSuffix;
    return {
        id: buildWorkspaceTabId(input.routeId, input.entityKey),
        routeId: input.routeId,
        href: input.href,
        routeLabel: input.routeLabel,
        shortLabel,
        entityKey: input.entityKey,
        titleSuffix,
        icon: input.icon,
    };
}

function upsertTab(tabs: WorkspaceTab[], tab: WorkspaceTab): WorkspaceTab[] {
    const idx = tabs.findIndex((t) => t.id === tab.id);
    if (idx === -1) return [...tabs, tab];
    const next = [...tabs];
    next[idx] = { ...next[idx], ...tab };
    return next;
}

function resolveActiveTabId(activeRaw: string | null, moduleTabs: WorkspaceTab[]): string {
    if (isDashboardTabId(activeRaw)) return DASHBOARD_TAB_ID;
    if (activeRaw && moduleTabs.some((tab) => tab.id === activeRaw)) return activeRaw;
    return DASHBOARD_TAB_ID;
}

function normalizeTabs(tabs: WorkspaceTab[]): WorkspaceTab[] {
    return tabs.map((tab) => {
        const { routeId, entityKey } = parseWorkspaceTabId(tab.id);
        return {
            ...tab,
            id: buildWorkspaceTabId(routeId, entityKey),
            routeId,
            entityKey,
        };
    });
}

export const useWorkspaceStore = create<WorkspaceState>()(
    persist(
        (set, get) => ({
            tabs: [],
            activeTabId: null,
            _hasHydrated: false,
            setHasHydrated: (value) => {
                if (!value) {
                    set({ _hasHydrated: false });
                    return;
                }
                const tabs = stripDashboardTabs(normalizeTabs(get().tabs));
                const activeId = resolveActiveTabId(get().activeTabId, tabs);
                set({ _hasHydrated: true, tabs, activeTabId: activeId });
            },
            openModuleTab: (input) => {
                if (input.routeId === DASHBOARD_ROUTE_ID) {
                    set({ activeTabId: DASHBOARD_TAB_ID });
                    return;
                }
                const tab = buildTab({ ...input, entityKey: "list", titleSuffix: undefined });
                set({
                    tabs: upsertTab(get().tabs, tab),
                    activeTabId: tab.id,
                });
            },
            openRecordTab: (input) => {
                const tab = buildTab(input);
                set({
                    tabs: upsertTab(get().tabs, tab),
                    activeTabId: tab.id,
                });
            },
            focusTab: (tabId) => {
                if (isDashboardTabId(tabId)) {
                    set({ activeTabId: DASHBOARD_TAB_ID });
                    return;
                }

                if (get().tabs.some((t) => t.id === tabId)) {
                    set({ activeTabId: tabId });
                }
            },
            closeTab: (tabId) => {
                if (isDashboardTabId(tabId)) return;
                const { tabs, activeTabId } = get();
                const nextTabs = tabs.filter((t) => t.id !== tabId);
                let nextActive = activeTabId;
                if (activeTabId === tabId) {
                    const closedIndex = tabs.findIndex((t) => t.id === tabId);
                    const neighbor = nextTabs[closedIndex] ?? nextTabs[closedIndex - 1] ?? null;
                    nextActive = neighbor?.id ?? DASHBOARD_TAB_ID;
                }
                set({ tabs: nextTabs, activeTabId: nextActive });
            },
            closeAllTabs: () => set({ tabs: [], activeTabId: DASHBOARD_TAB_ID }),
            retainTabsByRouteIds: (allowedRouteIds) => {
                const { tabs, activeTabId } = get();
                const nextTabs = tabs.filter((tab) => allowedRouteIds.has(tab.routeId));
                const nextActive = resolveActiveTabId(activeTabId, nextTabs);
                set({ tabs: nextTabs, activeTabId: nextActive });
            },
            replaceWorkspaceModule: (input) => {
                const tab = buildTab({ ...input, entityKey: "list" });
                set({ tabs: [tab], activeTabId: tab.id });
            },
            setTitleSuffix: (tabId, titleSuffix) => {
                const tabs = get().tabs;
                const current = tabs.find((t) => t.id === tabId);
                if (!current || current.titleSuffix === titleSuffix) return;
                set({
                    tabs: tabs.map((t) => (t.id === tabId ? { ...t, titleSuffix } : t)),
                });
            },
            clearTitleSuffix: (tabId) => {
                const tabs = get().tabs;
                const current = tabs.find((t) => t.id === tabId);
                if (!current?.titleSuffix) return;
                set({
                    tabs: tabs.map((t) => (t.id === tabId ? { ...t, titleSuffix: undefined } : t)),
                });
            },
        }),
        {
            name: "gommo-workspace-tabs",
            storage: createJSONStorage(() => sessionStorage),
            partialize: (state) => ({
                tabs: stripDashboardTabs(state.tabs).map(({ icon, ...rest }) => {
                    void icon;
                    return rest;
                }),
                activeTabId: state.activeTabId,
            }),
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        },
    ),
);
