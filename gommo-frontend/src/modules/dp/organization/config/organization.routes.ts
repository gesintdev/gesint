import {
    Briefcase,
    CalendarDays,
    Network,
    UserMinus,
    UserPlus,
    UserRound,
    Users,
} from "lucide-react";

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
        id: "collaborator",
        label: "Colaboradores",
        icon: Users,
        permission: "admission:read",
        children: [
            tabbedCrudRoute({
                id: "collaborator-admission",
                href: "/collaborator/admission",
                label: "Admissão",
                icon: UserPlus,
                permission: "admission:read",
                routeId: "collaborator-admission",
                tabShortLabel: "Adm",
                fieldTabName: "fullName",
                workspace: lazyNamed(
                    () => import("@/modules/rh/person/collaborators/admission/components/AdmissionWorkspacePage"),
                    "AdmissionWorkspacePage",
                ),
                list: lazyNamed(
                    () => import("@/modules/rh/person/collaborators/admission/components/AdmissionProcessListClient"),
                    "AdmissionProcessListClient",
                ),
                form: lazyNamed(
                    () => import("@/modules/rh/person/collaborators/admission/components/AdmissionProcessFormClient"),
                    "AdmissionProcessFormClient",
                ),
            }),
            tabbedCrudRoute({
                id: "collaborator-people",
                href: "/collaborator/people",
                label: "Pessoas",
                icon: UserRound,
                permission: "collaborator:read",
                routeId: "collaborator-people",
                tabShortLabel: "Pessoa",
                fieldTabName: "fullName",
                editOnly: true,
                showListToFormButton: false,
                listToolbar: "Consulte e edite dados pessoais. Novos colaboradores entram somente pela admissão.",
                formTabLabel: "Dados pessoais",
                formTabLabelEdit: "Editar pessoa",
                list: lazyNamed(
                    () => import("@/modules/rh/person/collaborators/people/components/CollaboratorListClient"),
                    "CollaboratorListClient",
                ),
                form: lazyNamed(
                    () => import("@/modules/rh/person/collaborators/people/components/CollaboratorFormClient"),
                    "CollaboratorFormClient",
                ),
                listPrimaryAction: lazyNamed(
                    () => import("@/modules/rh/person/collaborators/people/components/CollaboratorPeoplePrimaryAction"),
                    "CollaboratorPeoplePrimaryAction",
                ),
            }),
        ],
    }),
    tabbedCrudRoute({
        id: "attendance",
        href: "/attendance",
        label: "Ponto",
        icon: CalendarDays,
        permission: "attendance:read",
        routeId: "attendance",
        tabShortLabel: "Ponto",
        formTabLabel: "Histórico de ponto",
        formTabLabelEdit: "Histórico de ponto",
        listToFormLabel: "Histórico de ponto",
        list: lazyNamed(
            () => import("@/modules/dp/attendance/components/AttendanceRecordListClient"),
            "AttendanceRecordListClient",
        ),
        form: lazyNamed(
            () => import("@/modules/dp/attendance/components/AttendanceRecordFormClient"),
            "AttendanceRecordFormClient",
        ),
        extraTabs: [
            {
                id: "adjustment-request",
                label: "Solicitações de ajuste",
                permission: "attendance:read",
                content: lazyNamed(
                    () =>
                        import("@/modules/dp/attendance/components/AttendanceRecordRequestsClient"),
                    "AttendanceRecordRequestsClient",
                ),
            },
        ],
    }),
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
                label: "Solicitações do RH",
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
    tabbedCrudRoute({
        id: "offboarding",
        href: "/offboarding",
        label: "Desligamento",
        icon: UserMinus,
        permission: "offboarding:read",
        routeId: "offboarding",
        tabShortLabel: "Desl",
        list: lazyNamed(
            () => import("@/modules/dp/offboarding/components/OffboardingListClient"),
            "OffboardingListClient",
        ),
        form: lazyNamed(
            () => import("@/modules/dp/offboarding/components/OffboardingFormClient"),
            "OffboardingFormClient",
        ),
    }),
];


