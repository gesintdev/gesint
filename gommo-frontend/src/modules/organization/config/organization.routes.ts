import { Briefcase, Network } from "lucide-react";
import type { AppRoute } from "@/modules/root/enum/ModuleEnum";
import { lazyNamed, routeGroup, tabbedCrudRoute } from "@/shared/routing";

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
                permission: "department:read",
                routeId: "departments",
                tabShortLabel: "Depto",
                fieldTabName: "name",
                list: lazyNamed(
                    () => import("@/modules/organization/department/components/DepartmentListClient"),
                    "DepartmentListClient",
                ),
                form: lazyNamed(
                    () => import("@/modules/organization/department/components/DepartmentFormClient"),
                    "DepartmentFormClient",
                ),
            }),
            tabbedCrudRoute({
                id: "job-positions",
                href: "/organization/job-positions",
                label: "Cargos",
                icon: Briefcase,
                permission: "jobposition:read",
                routeId: "job-positions",
                tabShortLabel: "Cargo",
                fieldTabName: "title",
                list: lazyNamed(
                    () => import("@/modules/organization/jobposition/components/JobPositionListClient"),
                    "JobPositionListClient",
                ),
                form: lazyNamed(
                    () => import("@/modules/organization/jobposition/components/JobPositionFormClient"),
                    "JobPositionFormClient",
                ),
            }),
        ],
    }),
];
