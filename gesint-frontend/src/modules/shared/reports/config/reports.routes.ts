import { FileText } from "lucide-react";

import type { AppRoute } from "@/modules/root/enum/ModuleEnum";
import { customWorkspaceRoute } from "@/shared/routing";

export const reportRoutes: AppRoute[] = [
    customWorkspaceRoute({
        id: "reports",
        href: "/reports",
        label: "Relatórios",
        icon: FileText,
        permissionsAny: ["collaborator:export", "admission:export", "leave:export"],
        load: async () => import("@/modules/shared/reports/components/ReportsWorkspacePage"),
    }),
];
