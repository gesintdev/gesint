"use client";

import { type ComponentType, lazy, type ReactNode, Suspense } from "react";

import { deriveWritePermission } from "@/shared/auth/permissions";
import type { CrudExtraTab } from "@/shared/components/crud/CrudScreen";
import { TabbedCrudPage } from "@/shared/components/layout/TabbedCrudPage";
import { resolveLazyComponent } from "@/shared/routing/resolve-lazy-component";
import type { TabbedCrudRouteConfig } from "@/shared/routing/tabbed-crud-route.types";

function toLazy(loader: TabbedCrudRouteConfig["list"]) {
    return lazy(() => resolveLazyComponent(loader).then((defaultExport) => ({ default: defaultExport })));
}

export function createTabbedCrudWorkspacePage(config: TabbedCrudRouteConfig): ComponentType {
    const List = toLazy(config.list);
    const Form = toLazy(config.form);
    const PrimaryAction = config.listPrimaryAction ? toLazy(config.listPrimaryAction) : null;
    const ExtraTabs = (config.extraTabs ?? []).map((tab) => ({
        id: tab.id,
        label: tab.label,
        permission: tab.permission,
        visibleWhenEditing: tab.visibleWhenEditing,
        Content: toLazy(tab.content),
    }));
    const {
        list: _omitList,
        form: _omitForm,
        listPrimaryAction: _omitPrimary,
        extraTabs: _omitExtra,
        ...tabbedCrudProps
    } = config;
    void _omitList;
    void _omitForm;
    void _omitPrimary;
    void _omitExtra;
    return function TabbedCrudWorkspacePage() {
        const list = (
            <Suspense fallback={null}>
                <List />
            </Suspense>
        );
        const form = (
            <Suspense fallback={null}>
                <Form />
            </Suspense>
        );
        let listPrimaryAction: ReactNode | undefined;
        if (PrimaryAction) {
            const Action = PrimaryAction;
            listPrimaryAction = (
                <Suspense fallback={null}>
                    <Action />
                </Suspense>
            );
        }
        const extraTabs: CrudExtraTab[] = ExtraTabs.map(({ id, label, Content, visibleWhenEditing }) => {
            const tabConfig = config.extraTabs?.find((tab) => tab.id === id);
            return {
                id,
                label,
                permission: tabConfig?.permission,
                publicAccess: tabConfig?.publicAccess,
                visibleWhenEditing,
                content: (
                    <Suspense fallback={null}>
                        <Content />
                    </Suspense>
                ),
            };
        });
        return (
            <TabbedCrudPage
                {...tabbedCrudProps}
                routeLabel={config.label}
                list={list}
                form={form}
                writePermission={config.writePermission ?? deriveWritePermission(config.permission)}
                listPrimaryAction={listPrimaryAction}
                extraTabs={extraTabs.length > 0 ? extraTabs : undefined}
            />
        );
    };
}
