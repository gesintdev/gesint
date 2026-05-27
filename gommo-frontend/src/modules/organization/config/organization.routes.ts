import type { AppRoute } from "@/modules/root/enum/ModuleEnum";
import { Briefcase, KeyRound, Network, Shield, Users } from "lucide-react";

export const organizationRoutes: AppRoute[] = [
    {
        id: "organization",
        label: "Organização",
        icon: Network,
        children: [
            { id: "departments", label: "Departamentos", href: "/organization/departments", icon: Network },
            { id: "job-positions", label: "Cargos", href: "/organization/job-positions", icon: Briefcase },
            { id: "users", label: "Usuários", href: "/organization/users", icon: Users },
            { id: "roles", label: "Perfis", href: "/organization/roles", icon: Shield },
            { id: "permissions", label: "Permissões", href: "/organization/permissions", icon: KeyRound },
        ],
    },
];
