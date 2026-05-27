import type { AppRoute } from "@/modules/root/enum/ModuleEnum";
import {BarChart3} from "lucide-react";

export const insightsRoutes: AppRoute[] = [
    {
        id: "report",
        label: "Relatórios",
        href: "/report",
        icon: BarChart3
    },
]