"use client";

import { lazy, Suspense, type ComponentType, type ReactNode } from "react";
import { TabbedCrudPage } from "@/shared/components/layout/TabbedCrudPage";
import type { TabbedCrudRouteConfig } from "@/shared/routing/tabbed-crud-route.types";
import { resolveLazyComponent } from "@/shared/routing/resolve-lazy-component";

function toLazy(loader: TabbedCrudRouteConfig["list"]) {
    return lazy(() => resolveLazyComponent(loader).then((defaultExport) => ({ default: defaultExport })));
}

export function createTabbedCrudWorkspacePage(config: TabbedCrudRouteConfig): ComponentType {
    const List = toLazy(config.list);
    const Form = toLazy(config.form);
    const PrimaryAction = config.listPrimaryAction ? toLazy(config.listPrimaryAction) : null;

    const tabbedCrudProps = (({
        list: _list,
        form: _form,
        listPrimaryAction: _listPrimaryAction,
        ...rest
    }: TabbedCrudRouteConfig) => {
        void _list;
        void _form;
        void _listPrimaryAction;
        return rest;
    })(config);

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

        return (
            <TabbedCrudPage
                {...tabbedCrudProps}
                routeLabel={config.label}
                list={list}
                form={form}
                listPrimaryAction={listPrimaryAction}
            />
        );
    };
}
