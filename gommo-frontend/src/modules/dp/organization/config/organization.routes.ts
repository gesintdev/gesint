import { Briefcase, CalendarDays, Network } from "lucide-react";

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
                    () => import("@/modules/dp/organization/department/components/DepartmentListClient"),
                    "DepartmentListClient",
                ),
                form: lazyNamed(
                    () => import("@/modules/dp/organization/department/components/DepartmentFormClient"),
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
                    () => import("@/modules/dp/organization/jobposition/components/JobPositionListClient"),
                    "JobPositionListClient",
                ),
                form: lazyNamed(
                    () => import("@/modules/dp/organization/jobposition/components/JobPositionFormClient"),
                    "JobPositionFormClient",
                ),
            }),
        ],
    }),
    routeGroup({
        id: "leave-menu",
        label: "F\u00e9rias e afastamentos",
        icon: CalendarDays,
        children: [
            tabbedCrudRoute({
                id: "leave",
                href: "/leave",
                label: "F\u00e9rias",
                icon: CalendarDays,
                permission: "leave:read",
                routeId: "leave",
                tabShortLabel: "F\u00e9rias",
                listToolbar:
                    "F\u00e9rias concedidas e hist\u00f3rico (CLT). Per\u00edodos aquisitivo e concessivo calculados pelo contrato.",
                list: lazyNamed(
                    () => import("@/modules/rh/person/vacation/components/VacationListClient"),
                    "VacationListClient",
                ),
                form: lazyNamed(
                    () => import("@/modules/rh/person/vacation/components/VacationRequestFormClient"),
                    "VacationRequestFormClient",
                ),
                extraTabs: [
                    {
                        id: "pending-requests",
                        label: "Solicita\u00e7\u00f5es do RH",
                        permission: "leave:write",
                        content: lazyNamed(
                            () => import("@/modules/rh/person/leave/components/LeavePendingRequestsClient"),
                            "LeavePendingRequestsClient",
                        ),
                    },
                ],
            }),
            tabbedCrudRoute({
                id: "leave-absence",
                href: "/leave/absence",
                label: "Afastamento",
                icon: CalendarDays,
                permission: "leave:read",
                routeId: "leave-absence",
                tabShortLabel: "Afast.",
                list: lazyNamed(
                    () => import("@/modules/rh/person/leave/components/LeaveAbsenceListClient"),
                    "LeaveAbsenceListClient",
                ),
                form: lazyNamed(
                    () => import("@/modules/rh/person/leave/components/LeaveAbsenceFormClient"),
                    "LeaveAbsenceFormClient",
                ),
            }),
        ],
    }),
];
