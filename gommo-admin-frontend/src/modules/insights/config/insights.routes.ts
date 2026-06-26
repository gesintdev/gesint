import { BarChart3 } from "lucide-react";

import type { AppRoute } from "@/modules/root/enum/ModuleEnum";

export const insightsRoutes: AppRoute[] = [
    {
        id: "report",
        label: "Relatórios",
        href: "/report",
        icon: BarChart3,
    },
];
