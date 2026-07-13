import { LayoutDashboard } from "lucide-react";

import type { AppRoute } from "@/modules/root/enum/ModuleEnum";
import { ROUTE_PUBLIC_FULL } from "@/shared/auth/route-access";

export const dashboardRoutes: AppRoute[] = [
    {
        id: "dashboard",
        href: "/dashboard",
        label: "Painel",
        icon: LayoutDashboard,
        ...ROUTE_PUBLIC_FULL,
    },
];
