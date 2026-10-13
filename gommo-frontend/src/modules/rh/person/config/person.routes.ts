import {
    Briefcase,
    CalendarDays,
    ClipboardList,
    ClipboardPlus,
    Hourglass,
    Megaphone,
    MessageSquare,
    Target,
    UserSearch,
} from "lucide-react";

import { collaboratorSharedRouteGroup } from "@/modules/rh/person/collaborators/config/collaborator.shared-routes";
import { LEAVE_VACATION_CRUD_LABELS } from "@/modules/rh/person/leave/config/leave-vacation.route-labels";
import type { AppRoute } from "@/modules/root/enum/ModuleEnum";
import { lazyNamed, routeGroup, tabbedCrudRoute } from "@/shared/routing";

export const personRoutes: AppRoute[] = [
    collaboratorSharedRouteGroup,
    tabbedCrudRoute({
        id: "experience",
        href: "/experience",
        label: "Experiência",
        icon: Hourglass,
        permission: "experience:read",
        routeId: "experience",
        tabShortLabel: "Exp.",
        fieldTabName: "collaboratorName",
        editOnly: true,
        showListToFormButton: false,
        listToolbar: "Fila de avaliação do período de experiência (45/90 dias).",
        formTabLabel: "Avaliação",
        formTabLabelEdit: "Avaliar experiência",
        list: lazyNamed(
            () => import("@/modules/rh/person/experience/components/ExperienceEvaluationListClient"),
            "ExperienceEvaluationListClient",
        ),
        form: lazyNamed(
            () => import("@/modules/rh/person/experience/components/ExperienceEvaluationFormClient"),
            "ExperienceEvaluationFormClient",
        ),
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
    routeGroup({
        id: "recruitment",
        label: "Recrutamento",
        tabShortLabel: "Recrut.",
        icon: Megaphone,
        children: [
            tabbedCrudRoute({
                id: "job-requisition",
                href: "/job-requisition",
                label: "Requisições",
                icon: ClipboardPlus,
                permission: "jobrequisition:read",
                routeId: "job-requisition",
                tabShortLabel: "Requisição",
                fieldTabName: "jobPositionTitle",
                list: lazyNamed(
                    () => import("@/modules/rh/person/jobrequisition/components/JobRequisitionListClient"),
                    "JobRequisitionListClient",
                ),
                form: lazyNamed(
                    () => import("@/modules/rh/person/jobrequisition/components/JobRequisitionFormClient"),
                    "JobRequisitionFormClient",
                ),
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
                workspace: lazyNamed(
                    () => import("@/modules/rh/person/jobvacancy/components/JobVacancyWorkspacePage"),
                    "JobVacancyWorkspacePage",
                ),
            }),
            tabbedCrudRoute({
                id: "candidate",
                href: "/candidate",
                label: "Banco de talentos",
                icon: UserSearch,
                permission: "candidate:read",
                routeId: "candidate",
                tabShortLabel: "Talento",
                fieldTabName: "fullName",
                list: lazyNamed(
                    () => import("@/modules/rh/person/candidate/components/CandidateListClient"),
                    "CandidateListClient",
                ),
                form: lazyNamed(
                    () => import("@/modules/rh/person/candidate/components/CandidateFormClient"),
                    "CandidateFormClient",
                ),
            }),
        ],
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
        label: "Feedback",
        icon: Target,
        permission: "performance:read",
        routeId: "performance",
        tabShortLabel: "Feedback",
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
