import type { AppRoute } from "@/modules/root/enum/ModuleEnum";
import { customWorkspaceRoute, lazyNamed, routeGroup, tabbedCrudRoute } from "@/shared/routing";
import {
    Briefcase,
    CalendarDays,
    ClipboardList,
    MessageSquare,
    Target,
    UserMinus,
    UserPlus,
    UserRound,
    Users,
} from "lucide-react";
import { createElement } from "react";

export const collaboratorRoutes: AppRoute[] = [
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
                    () => import("@/modules/admission/components/AdmissionProcessListClient"),
                    "AdmissionProcessListClient",
                ),
                form: lazyNamed(
                    () => import("@/modules/admission/components/AdmissionProcessFormClient"),
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
                listToolbar:
                    "Consulte e edite dados pessoais. Novos colaboradores entram somente pela admissão.",
                formTabLabel: "Dados pessoais",
                formTabLabelEdit: "Editar pessoa",
                list: lazyNamed(
                    () => import("@/modules/collaborator/components/CollaboratorListClient"),
                    "CollaboratorListClient",
                ),
                form: lazyNamed(
                    () => import("@/modules/collaborator/components/CollaboratorFormClient"),
                    "CollaboratorFormClient",
                ),
                listPrimaryAction: lazyNamed(
                    () => import("@/modules/collaborator/components/CollaboratorPeoplePrimaryAction"),
                    "CollaboratorPeoplePrimaryAction",
                ),
            }),
            customWorkspaceRoute({
                id: "collaborator-history",
                href: "/collaborator/history",
                label: "Histórico",
                icon: ClipboardList,
                permission: "admission:read",
                load: async () => {
                    const [{ WorkspacePage }, { AdmissionHistoryListClient }] = await Promise.all([
                        import("@/shared/components/layout/WorkspacePage"),
                        import("@/modules/admission/components/AdmissionHistoryListClient"),
                    ]);
                    return {
                        default: function CollaboratorHistoryPage() {
                            return createElement(
                                WorkspacePage,
                                null,
                                createElement(
                                    "div",
                                    {
                                        className:
                                            "border-b px-4 py-2.5 text-[13px] text-base-content/50",
                                    },
                                    "Admissões concluídas — cada uma gera um colaborador no sistema.",
                                ),
                                createElement(AdmissionHistoryListClient),
                            );
                        },
                    };
                },
            }),
        ],
    }),
    tabbedCrudRoute({
        id: "contract",
        href: "/contract",
        label: "Contratos",
        icon: Briefcase,
        routeId: "contract",
        tabShortLabel: "Cont",
        list: lazyNamed(
            () => import("@/modules/contract/components/EmploymentContractListClient"),
            "EmploymentContractListClient",
        ),
        form: lazyNamed(
            () => import("@/modules/contract/components/EmploymentContractFormClient"),
            "EmploymentContractFormClient",
        ),
    }),
    tabbedCrudRoute({
        id: "attendance",
        href: "/attendance",
        label: "Ponto",
        icon: CalendarDays,
        routeId: "attendance",
        tabShortLabel: "Ponto",
        list: lazyNamed(
            () => import("@/modules/attendance/components/AttendanceRecordListClient"),
            "AttendanceRecordListClient",
        ),
        form: lazyNamed(
            () => import("@/modules/attendance/components/AttendanceRecordFormClient"),
            "AttendanceRecordFormClient",
        ),
    }),
    tabbedCrudRoute({
        id: "leave",
        href: "/leave",
        label: "Férias e afastamentos",
        icon: CalendarDays,
        routeId: "leave",
        tabShortLabel: "Férias",
        list: lazyNamed(
            () => import("@/modules/leave/components/LeaveRequestListClient"),
            "LeaveRequestListClient",
        ),
        form: lazyNamed(
            () => import("@/modules/leave/components/LeaveRequestFormClient"),
            "LeaveRequestFormClient",
        ),
    }),
    tabbedCrudRoute({
        id: "offboarding",
        href: "/offboarding",
        label: "Desligamento",
        icon: UserMinus,
        routeId: "offboarding",
        tabShortLabel: "Desl",
        list: lazyNamed(
            () => import("@/modules/offboarding/components/OffboardingListClient"),
            "OffboardingListClient",
        ),
        form: lazyNamed(
            () => import("@/modules/offboarding/components/OffboardingFormClient"),
            "OffboardingFormClient",
        ),
    }),
    tabbedCrudRoute({
        id: "exit-interview",
        href: "/exit-interview",
        label: "Entrevista de desligamento",
        icon: MessageSquare,
        routeId: "exit-interview",
        tabShortLabel: "Entrev",
        list: lazyNamed(
            () => import("@/modules/exitinterview/components/ExitInterviewListClient"),
            "ExitInterviewListClient",
        ),
        form: lazyNamed(
            () => import("@/modules/exitinterview/components/ExitInterviewFormClient"),
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
            () => import("@/modules/performance/components/PerformanceReviewListClient"),
            "PerformanceReviewListClient",
        ),
        form: lazyNamed(
            () => import("@/modules/performance/components/PerformanceReviewFormClient"),
            "PerformanceReviewFormClient",
        ),
    }),
];
