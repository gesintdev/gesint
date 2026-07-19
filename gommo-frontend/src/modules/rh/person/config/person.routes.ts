import {
    Briefcase,
    CalendarDays,
    ClipboardList,
    MessageSquare,
    Target,
    UserPlus,
    UserRound,
    Users,
} from "lucide-react";

import { LEAVE_VACATION_CRUD_LABELS } from "@/modules/rh/person/leave/config/leave-vacation.route-labels";
import type { AppRoute } from "@/modules/root/enum/ModuleEnum";
import { lazyNamed, routeGroup, tabbedCrudRoute } from "@/shared/routing";

export const personRoutes: AppRoute[] = [
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
        id: "leave-vacation",
        href: LEAVE_VACATION_CRUD_LABELS.href,
        label: LEAVE_VACATION_CRUD_LABELS.routeLabel,
        icon: CalendarDays,
        permission: "leave:read",
        routeId: LEAVE_VACATION_CRUD_LABELS.routeId,
        tabShortLabel: LEAVE_VACATION_CRUD_LABELS.tabShortLabel,
        listToolbar: LEAVE_VACATION_CRUD_LABELS.listToolbar,
        workspace: lazyNamed(
            () => import("@/modules/rh/person/leave/components/LeaveVacationWorkspacePage"),
            "LeaveVacationWorkspacePage",
        ),
        list: lazyNamed(
            () => import("@/modules/rh/person/leave/components/LeaveRequestRhListClient"),
            "LeaveRequestRhListClient",
        ),
        form: lazyNamed(
            () => import("@/modules/rh/person/leave/components/LeaveVacationRequestFormClient"),
            "LeaveVacationRequestFormClient",
        ),
        formTabLabel: LEAVE_VACATION_CRUD_LABELS.formTabLabel,
        listToFormLabel: LEAVE_VACATION_CRUD_LABELS.listToFormLabel,
        showListToFormButton: true,
    }),
    tabbedCrudRoute({
        id: "job-vacancy",
        href: "/job-vacancy",
        label: "Vagas",
        icon: Briefcase,
        permission: "jobvacancy:read",
        routeId: "job-vacancy",
        tabShortLabel: "Vaga",
        fieldTabName: "jobTitle",
        list: lazyNamed(
            () => import("@/modules/rh/person/jobvacancy/components/JobVacancyListClient"),
            "JobVacancyListClient",
        ),
        form: lazyNamed(
            () => import("@/modules/rh/person/jobvacancy/components/JobVacancyFormClient"),
            "JobVacancyFormClient",
        ),
    }),
    tabbedCrudRoute({
        id: "exit-interview",
        href: "/exit-interview",
        label: "Entrevista de desligamento",
        icon: MessageSquare,
        permission: "exitinterview:read",
        routeId: "exit-interview",
        tabShortLabel: "Entrev",
        list: lazyNamed(
            () => import("@/modules/rh/person/exitinterview/components/ExitInterviewListClient"),
            "ExitInterviewListClient",
        ),
        form: lazyNamed(
            () => import("@/modules/rh/person/exitinterview/components/ExitInterviewFormClient"),
            "ExitInterviewFormClient",
        ),
    }),
    tabbedCrudRoute({
        id: "development-plan",
        href: "/development-plan",
        label: "PDI",
        icon: ClipboardList,
        permission: "developmentplan:read",
        routeId: "development-plan",
        tabShortLabel: "PDI",
        fieldTabName: "collaboratorName",
        list: lazyNamed(
            () => import("@/modules/rh/person/developmentplan/components/DevelopmentPlanListClient"),
            "DevelopmentPlanListClient",
        ),
        form: lazyNamed(
            () => import("@/modules/rh/person/developmentplan/components/DevelopmentPlanFormClient"),
            "DevelopmentPlanFormClient",
        ),
    }),
    tabbedCrudRoute({
        id: "performance",
        href: "/performance",
        label: "Desempenho",
        icon: Target,
        permission: "performance:read",
        routeId: "performance",
        tabShortLabel: "Desemp",
        list: lazyNamed(
            () => import("@/modules/rh/person/performance/components/PerformanceReviewListClient"),
            "PerformanceReviewListClient",
        ),
        form: lazyNamed(
            () => import("@/modules/rh/person/performance/components/PerformanceReviewFormClient"),
            "PerformanceReviewFormClient",
        ),
    }),
];
