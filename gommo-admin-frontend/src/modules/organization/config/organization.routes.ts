import { Building2, Briefcase, Network } from "lucide-react";
import type { AppRoute } from "@/modules/root/enum/ModuleEnum";

export const organizationRoutes: AppRoute[] = [
    {
        id: "organization",
        label: "Organização",
        icon: Network,
        children: [
            { id: "company", label: "Empresa", href: "/company", icon: Building2 },
            { id: "departments", label: "Departamentos", href: "/organization/departments", icon: Network },
            { id: "job-positions", label: "Cargos", href: "/organization/job-positions", icon: Briefcase },
        ],
    },
];
