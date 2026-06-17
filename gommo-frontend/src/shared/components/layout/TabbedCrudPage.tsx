"use client";

import { useMemo } from "react";

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
    const { defaultTab, initialEditingId } = useMemo(
        () => crudInitialState(tab.entityKey, editOnly),
        [editOnly, tab.entityKey],
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
