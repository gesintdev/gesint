import { FileText } from "lucide-react";

import type { AppRoute } from "@/modules/root/enum/ModuleEnum";
import { customWorkspaceRoute } from "@/shared/routing";

export const dpReportRoutes: AppRoute[] = [
    customWorkspaceRoute({
        id: "dp-reports",
        href: "/reports/dp",
        label: "Relatórios",
        icon: FileText,
        permissionsAny: ["collaborator:export", "attendance:read", "leave:export", "occupationalexam:read"],
        load: async () => import("@/modules/dp/report/components/DpReportsWorkspacePage"),
    }),
];

export const rhReportRoutes: AppRoute[] = [
    customWorkspaceRoute({
        id: "rh-reports",
        href: "/reports/rh",
        label: "Relatórios",
        icon: FileText,
        permissionsAny: ["admission:export", "developmentplan:read"],
        load: async () => import("@/modules/rh/report/components/RhReportsWorkspacePage"),
    }),
];
