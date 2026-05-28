import type { AppRoute } from "@/modules/root/enum/ModuleEnum";
import {FlaskConical, LayoutDashboard} from "lucide-react";

export const dashboardRoutes: AppRoute[] = [
    {
        id: "dashboard",
        label: "Painel",
        href: "/dashboard",
        icon: LayoutDashboard
    },
    {
        id: "dev-inputs",
        label: "Componentes (dev)",
        href: "/dev/inputs",
        icon: FlaskConical
    },
]