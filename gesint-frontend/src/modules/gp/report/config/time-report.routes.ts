import { Activity } from "lucide-react";

import type { AppRoute } from "@/modules/root/enum/ModuleEnum";
import { customWorkspaceRoute } from "@/shared/routing";

/** Gestão de Ponto › Relatórios. */
export const timeReportRoutes: AppRoute[] = [
    customWorkspaceRoute({
        id: "attendance-status",
        href: "/attendance/status",
        label: "Status dos colaboradores",
        icon: Activity,
        permission: "attendance:read",
        load: () => import("@/modules/gp/report/components/TimeStatusReportPage"),
    }),
];
