import type { LucideIcon } from "lucide-react";
import type { CrudScreenProps } from "@/shared/components/crud/CrudScreen";
import type { LazyComponent } from "@/shared/routing/resolve-lazy-component";

export type TabbedCrudExtraTabConfig = {
    id: string;
    label: string;
    content: LazyComponent;
};

export type TabbedCrudRouteConfig = {
    id: string;
    href: string;
    label: string;
    icon: LucideIcon;
    permission?: string;
    routeId: string;
    tabShortLabel: string;
    fieldTabName?: string;
    editOnly?: boolean;
    list: LazyComponent;
    form: LazyComponent;
    listPrimaryAction?: LazyComponent;
    extraTabs?: TabbedCrudExtraTabConfig[];
} & Pick<
    CrudScreenProps,
    "showListToFormButton" | "listToolbar" | "formTabLabel" | "formTabLabelEdit" | "listToFormLabel"
>;
