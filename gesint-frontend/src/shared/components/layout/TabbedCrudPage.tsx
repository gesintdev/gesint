"use client";

import { useState } from "react";

import {
    CRUD_TAB_FORM,
    CRUD_TAB_LIST,
    type CrudExtraTab,
    CrudScreen,
    type CrudScreenProps,
} from "@/shared/components/crud/CrudScreen";
import { CrudPageCard, CrudPageLayout } from "@/shared/components/layout/CrudPageLayout";
import { type TabbedCrudConfig, TabbedCrudConfigProvider } from "@/shared/workspace/TabbedCrudConfigContext";
import type { WorkspaceEntityKey } from "@/shared/workspace/workspace-tab-id";
import { isModuleListTab } from "@/shared/workspace/workspace-tab-id";
import { useWorkspaceTab } from "@/shared/workspace/WorkspaceTabContext";

export type TabbedCrudPageProps<TEntity extends object> = Omit<CrudScreenProps, "defaultTab" | "initialEditingId"> & {
    routeId: string;
    href: string;
    routeLabel: string;
    tabShortLabel: string;
    fieldTabName?: keyof TEntity & string;
    writePermission?: string;
    /** Apenas listagem e edição — sem cadastro novo na aba de formulário. */
    editOnly?: boolean;
    extraTabs?: CrudExtraTab[];
};

function crudInitialState(
    entityKey: WorkspaceEntityKey,
    editOnly?: boolean,
): {
    defaultTab: string;
    initialEditingId: string | null;
} {
    if (editOnly && (isModuleListTab(entityKey) || entityKey === "new")) {
        return { defaultTab: CRUD_TAB_LIST, initialEditingId: null };
    }
    if (isModuleListTab(entityKey)) {
        return { defaultTab: CRUD_TAB_LIST, initialEditingId: null };
    }
    if (entityKey === "new") {
        return { defaultTab: CRUD_TAB_FORM, initialEditingId: null };
    }
    return { defaultTab: CRUD_TAB_FORM, initialEditingId: entityKey };
}

/** Aba de listagem do módulo montada com a URL do navegador já em `?edit=` desta tela. */
function initialStateFromBrowserUrl(
    href: string,
    entityKey: WorkspaceEntityKey,
): { defaultTab: string; initialEditingId: string | null } | null {
    if (typeof window === "undefined" || !isModuleListTab(entityKey)) return null;
    if (window.location.pathname !== href) return null;
    const editingId = new URLSearchParams(window.location.search).get("edit");
    return editingId ? { defaultTab: CRUD_TAB_FORM, initialEditingId: editingId } : null;
}

export function TabbedCrudPage<TEntity extends object>({
    routeId,
    href,
    routeLabel,
    tabShortLabel,
    fieldTabName,
    writePermission,
    list,
    form,
    editOnly,
    extraTabs,
    ...crudProps
}: TabbedCrudPageProps<TEntity>) {
    const { tab } = useWorkspaceTab();
    // Lido só na montagem: aba de listagem criada quando a URL já pede um registro (`?edit=`) nasce
    // em Editar, sem passar pela Listagem antes (ex.: Admissão aberta pelo chip das grids do GP).
    const [{ defaultTab, initialEditingId }] = useState(() =>
        initialStateFromBrowserUrl(href, tab.entityKey) ?? crudInitialState(tab.entityKey, editOnly),
    );
    const config: TabbedCrudConfig = {
        routeId,
        href,
        routeLabel,
        tabShortLabel,
        fieldTabName: fieldTabName as string | undefined,
    };

    return (
        <TabbedCrudConfigProvider value={config}>
            <CrudPageLayout>
                <CrudPageCard>
                    <CrudScreen
                        list={list}
                        form={form}
                        extraTabs={extraTabs}
                        writePermission={writePermission}
                        defaultTab={defaultTab}
                        initialEditingId={initialEditingId}
                        workspaceEnabled
                        editOnly={editOnly}
                        {...crudProps}
                    />
                </CrudPageCard>
            </CrudPageLayout>
        </TabbedCrudConfigProvider>
    );
}
