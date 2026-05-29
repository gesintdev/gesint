import type { AppRoute } from "@/modules/root/enum/ModuleEnum";
import { comingSoonRoute, lazyNamed, routeGroup, tabbedCrudRoute } from "@/shared/routing";
import { Briefcase, KeyRound, Network, Shield, Users } from "lucide-react";

export const organizationRoutes: AppRoute[] = [
    routeGroup({
        id: "organization",
        label: "Organização",
        icon: Network,
        children: [
            tabbedCrudRoute({
                id: "departments",
                href: "/organization/departments",
                label: "Departamentos",
                icon: Network,
                routeId: "departments",
                tabShortLabel: "Depto",
                fieldTabName: "name",
                list: lazyNamed(
                    () => import("@/modules/department/components/DepartmentListClient"),
                    "DepartmentListClient",
                ),
                form: lazyNamed(
                    () => import("@/modules/department/components/DepartmentFormClient"),
                    "DepartmentFormClient",
                ),
            }),
            tabbedCrudRoute({
                id: "job-positions",
                href: "/organization/job-positions",
                label: "Cargos",
                icon: Briefcase,
                routeId: "job-positions",
                tabShortLabel: "Cargo",
                fieldTabName: "title",
                list: lazyNamed(
                    () => import("@/modules/jobposition/components/JobPositionListClient"),
                    "JobPositionListClient",
                ),
                form: lazyNamed(
                    () => import("@/modules/jobposition/components/JobPositionFormClient"),
                    "JobPositionFormClient",
                ),
            }),
            comingSoonRoute({
                id: "users",
                href: "/organization/users",
                label: "Usuários",
                icon: Users,
                title: "Usuários internos",
                description: "Cadastro de usuários da empresa com acesso ao sistema de RH.",
            }),
            comingSoonRoute({
                id: "roles",
                href: "/organization/roles",
                label: "Perfis",
                icon: Shield,
                title: "Perfis de acesso",
                description: "Agrupamento de permissões por função (ex.: RH, gestor, colaborador).",
            }),
            comingSoonRoute({
                id: "permissions",
                href: "/organization/permissions",
                label: "Permissões",
                icon: KeyRound,
                title: "Permissões",
                description: "Controle fino de ações permitidas por módulo dentro do tenant.",
            }),
        ],
    }),
];
