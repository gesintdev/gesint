import type { LucideIcon } from "lucide-react";
import type { CrudScreenProps } from "@/shared/components/crud/CrudScreen";
import type { LazyComponent } from "@/shared/routing/resolve-lazy-component";

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
} & Pick<CrudScreenProps, "showListToFormButton" | "listToolbar" | "formTabLabel" | "formTabLabelEdit">;
