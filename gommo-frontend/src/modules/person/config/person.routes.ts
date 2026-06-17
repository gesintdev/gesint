import { CalendarDays, MessageSquare, Target, UserMinus, UserPlus, UserRound, Users } from "lucide-react";
import type { AppRoute } from "@/modules/root/enum/ModuleEnum";
import { LEAVE_VACATION_CRUD_LABELS } from "@/modules/person/leave/config/leave-vacation.route-labels";
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
                list: lazyNamed(
                    () => import("@/modules/person/collaborators/admission/components/AdmissionProcessListClient"),
                    "AdmissionProcessListClient",
                ),
                form: lazyNamed(
                    () => import("@/modules/person/collaborators/admission/components/AdmissionProcessFormClient"),
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
                    () => import("@/modules/person/collaborators/people/components/CollaboratorListClient"),
                    "CollaboratorListClient",
                ),
                form: lazyNamed(
                    () => import("@/modules/person/collaborators/people/components/CollaboratorFormClient"),
                    "CollaboratorFormClient",
                ),
                listPrimaryAction: lazyNamed(
                    () => import("@/modules/person/collaborators/people/components/CollaboratorPeoplePrimaryAction"),
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
            () => import("@/modules/person/leave/components/LeaveVacationWorkspacePage"),
            "LeaveVacationWorkspacePage",
        ),
        list: lazyNamed(
            () => import("@/modules/person/leave/components/LeaveRequestRhListClient"),
            "LeaveRequestRhListClient",
        ),
        form: lazyNamed(
            () => import("@/modules/person/leave/components/LeaveVacationRequestFormClient"),
            "LeaveVacationRequestFormClient",
        ),
        formTabLabel: LEAVE_VACATION_CRUD_LABELS.formTabLabel,
        listToFormLabel: LEAVE_VACATION_CRUD_LABELS.listToFormLabel,
        showListToFormButton: true,
    }),
    tabbedCrudRoute({
        id: "attendance",
        href: "/attendance",
        label: "Ponto",
        icon: CalendarDays,
        permission: "attendance:read",
        routeId: "attendance",
        tabShortLabel: "Ponto",
        list: lazyNamed(
            () => import("@/modules/person/attendance/components/AttendanceRecordListClient"),
            "AttendanceRecordListClient",
        ),
        form: lazyNamed(
            () => import("@/modules/person/attendance/components/AttendanceRecordFormClient"),
            "AttendanceRecordFormClient",
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
            () => import("@/modules/person/offboarding/components/OffboardingListClient"),
            "OffboardingListClient",
        ),
        form: lazyNamed(
            () => import("@/modules/person/offboarding/components/OffboardingFormClient"),
            "OffboardingFormClient",
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
            () => import("@/modules/person/exitinterview/components/ExitInterviewListClient"),
            "ExitInterviewListClient",
        ),
        form: lazyNamed(
            () => import("@/modules/person/exitinterview/components/ExitInterviewFormClient"),
            "ExitInterviewFormClient",
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
            () => import("@/modules/person/performance/components/PerformanceReviewListClient"),
            "PerformanceReviewListClient",
        ),
        form: lazyNamed(
            () => import("@/modules/person/performance/components/PerformanceReviewFormClient"),
            "PerformanceReviewFormClient",
        ),
    }),
];
