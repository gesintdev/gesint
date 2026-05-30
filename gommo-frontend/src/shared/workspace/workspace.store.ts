"use client";

import {create} from "zustand";
import {createJSONStorage, persist} from "zustand/middleware";
import type {OpenWorkspaceRecordInput, OpenWorkspaceTabInput, WorkspaceTab} from "@/shared/workspace/workspace.types";
import {buildWorkspaceTabId, parseWorkspaceTabId} from "@/shared/workspace/workspace-tab-id";
import {defaultShortLabel} from "@/shared/workspace/workspace-routes";

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
    /** Troca de domínio — substitui abas pela rota inicial do sistema (sem injetar dashboard). */
    replaceWorkspaceModule: (input: OpenWorkspaceTabInput) => void;
    setTitleSuffix: (tabId: string, titleSuffix: string) => void;
    clearTitleSuffix: (tabId: string) => void;
};

const DASHBOARD_ROUTE_ID = "dashboard";
const DASHBOARD_TAB_ID = buildWorkspaceTabId(DASHBOARD_ROUTE_ID, "list");

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

function isDashboardTab(tabId: string): boolean {
    return tabId === DASHBOARD_TAB_ID;
}

function buildTab(input: OpenWorkspaceRecordInput, existing?: WorkspaceTab): WorkspaceTab {
    const shortLabel = input.shortLabel ?? defaultShortLabel(input.routeLabel);
    return {
        id: buildWorkspaceTabId(input.routeId, input.entityKey),
        routeId: input.routeId,
        href: input.href,
        routeLabel: input.routeLabel,
        shortLabel,
        entityKey: input.entityKey,
        titleSuffix: input.titleSuffix ?? existing?.titleSuffix,
        icon: input.icon,
    };
}

function upsertTab(tabs: WorkspaceTab[], tab: WorkspaceTab): WorkspaceTab[] {
    const idx = tabs.findIndex((t) => t.id === tab.id);
    if (idx === -1) return [...tabs, tab];
    const next = [...tabs];
    next[idx] = {...next[idx], ...tab};
    return next;
}

function ensureDashboardFirst(tabs: WorkspaceTab[]): WorkspaceTab[] {
    const hasDashboard = tabs.some((tab) => isDashboardTab(tab.id));
    const withDashboard = hasDashboard ? tabs : [createDashboardTab(), ...tabs];
    const dashboard = withDashboard.find((tab) => isDashboardTab(tab.id));
    const others = withDashboard.filter((tab) => !isDashboardTab(tab.id));
    return dashboard ? [dashboard, ...others] : withDashboard;
}

/** Garante id estável routeId::entityKey após reidratação. */
function normalizeTabs(tabs: WorkspaceTab[]): WorkspaceTab[] {
    return tabs.map((tab) => {
        const {routeId, entityKey} = parseWorkspaceTabId(tab.id);
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
                    set({_hasHydrated: false});
                    return;
                }
                const tabs = normalizeTabs(get().tabs);
                const orderedTabs = ensureDashboardFirst(tabs);
                const activeRaw = get().activeTabId;
                const activeId =
                    activeRaw && orderedTabs.some((t) => t.id === activeRaw)
                        ? activeRaw
                        : DASHBOARD_TAB_ID;
                set({_hasHydrated: true, tabs: orderedTabs, activeTabId: activeId});
            },

            openModuleTab: (input) => {
                const tab = buildTab({...input, entityKey: "list"});
                set({
                    tabs: ensureDashboardFirst(upsertTab(get().tabs, tab)),
                    activeTabId: tab.id,
                });
            },

            openRecordTab: (input) => {
                const tab = buildTab(input);
                set({
                    tabs: ensureDashboardFirst(upsertTab(get().tabs, tab)),
                    activeTabId: tab.id,
                });
            },

            focusTab: (tabId) => {
                if (get().tabs.some((t) => t.id === tabId)) {
                    set({activeTabId: tabId});
                }
            },

            closeTab: (tabId) => {
                if (isDashboardTab(tabId)) return;
                const {tabs, activeTabId} = get();
                const nextTabs = ensureDashboardFirst(tabs.filter((t) => t.id !== tabId));
                let nextActive = activeTabId;
                if (activeTabId === tabId) {
                    const closedIndex = tabs.findIndex((t) => t.id === tabId);
                    const neighbor = nextTabs[closedIndex] ?? nextTabs[closedIndex - 1] ?? null;
                    nextActive = neighbor?.id ?? DASHBOARD_TAB_ID;
                }
                set({tabs: nextTabs, activeTabId: nextActive});
            },

            closeAllTabs: () => set({tabs: [createDashboardTab()], activeTabId: DASHBOARD_TAB_ID}),

            replaceWorkspaceModule: (input) => {
                const tab = buildTab({...input, entityKey: "list"});
                set({tabs: [tab], activeTabId: tab.id});
            },

            setTitleSuffix: (tabId, titleSuffix) => {
                const tabs = get().tabs;
                const current = tabs.find((t) => t.id === tabId);
                if (!current || current.titleSuffix === titleSuffix) return;
                set({
                    tabs: tabs.map((t) => (t.id === tabId ? {...t, titleSuffix} : t)),
                });
            },

            clearTitleSuffix: (tabId) => {
                const tabs = get().tabs;
                const current = tabs.find((t) => t.id === tabId);
                if (!current?.titleSuffix) return;
                set({
                    tabs: tabs.map((t) => (t.id === tabId ? {...t, titleSuffix: undefined} : t)),
                });
            },
        }),
        {
            name: "gommo-workspace-tabs",
            storage: createJSONStorage(() => sessionStorage),
            partialize: (state) => ({
                tabs: state.tabs.map(({icon: _icon, ...rest}) => rest),
                activeTabId: state.activeTabId,
            }),
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        },
    ),
);
