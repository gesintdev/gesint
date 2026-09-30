import {
    Briefcase,
    CalendarClock,
    ClipboardList,
    Columns3,
    FileText,
    GraduationCap,
    KanbanSquare,
    KeyRound,
    Menu,
    ScrollText,
    Settings2,
    Shield,
    StickyNote,
    Users,
} from "lucide-react";

import type {AppRoute} from "@/modules/root/enum/ModuleEnum";
import {customWorkspaceRoute, lazyNamed, routeGroup, tabbedCrudRoute} from "@/shared/routing";

const accessRoutes: AppRoute[] = [
    routeGroup({
        id: "settings-profiles",
        label: "Perfis",
        icon: Shield,
        permission: "role:read",
        children: [
            tabbedCrudRoute({
                id: "settings-profiles-menus",
                href: "/settings/profiles",
                label: "Menus e Ações",
                icon: Menu,
                permission: "role:read",
                routeId: "settings-profiles-menus",
                tabShortLabel: "Menus e Ações",
                fieldTabName: "name",
                list: lazyNamed(
                    () => import("@/modules/cfg/settings/profile/components/ProfileListClient"),
                    "ProfileListClient",
                ),
                form: lazyNamed(
                    () => import("@/modules/cfg/settings/profile/components/ProfileFormClient"),
                    "ProfileFormClient",
                ),
            }),
            tabbedCrudRoute({
                id: "settings-profiles-atuacoes",
                href: "/settings/atuacoes",
                label: "Atuações",
                icon: Briefcase,
                permission: "actingprofile:read",
                routeId: "settings-profiles-atuacoes",
                tabShortLabel: "Atuações",
                fieldTabName: "name",
                listContained: true,
                list: lazyNamed(
                    () =>
                        import(
                            "@/modules/cfg/settings/actingprofile/components/ActingProfileListClient"
                        ),
                    "ActingProfileListClient",
                ),
                form: lazyNamed(
                    () =>
                        import(
                            "@/modules/cfg/settings/actingprofile/components/ActingProfileFormClient"
                        ),
                    "ActingProfileFormClient",
                ),
            }),
        ],
    }),
    tabbedCrudRoute({
        id: "settings-users",
        href: "/settings/users",
        label: "Usuários",
        icon: Users,
        permission: "user:read",
        routeId: "settings-users",
        tabShortLabel: "Usuário",
        fieldTabName: "username",
        list: lazyNamed(
            () => import("@/modules/cfg/settings/appuser/components/AppUserListClient"),
            "AppUserListClient",
        ),
        form: lazyNamed(
            () => import("@/modules/cfg/settings/appuser/components/AppUserFormClient"),
            "AppUserFormClient",
        ),
    }),
    customWorkspaceRoute({
        id: "settings-audit-trail",
        href: "/settings/audit-trail",
        label: "Trilha de auditoria",
        icon: ScrollText,
        permission: "audit:read",
        load: () => import("@/modules/cfg/settings/audittrail/components/AuditTrailPage"),
    }),
];

const dpRoutes: AppRoute[] = [
    customWorkspaceRoute({
        id: "settings-preferences",
        href: "/settings/preferences",
        label: "Preferências",
        icon: Settings2,
        permissionsAny: ["attendance:read", "notification:write"],
        load: () => import("@/modules/cfg/settings/preferences/components/OperationalPreferencesPage"),
    }),
    tabbedCrudRoute({
        id: "settings-work-schedules",
        href: "/settings/work-schedules",
        label: "Escalas",
        icon: CalendarClock,
        permission: "workschedule:read",
        routeId: "settings-work-schedules",
        tabShortLabel: "Escala",
        fieldTabName: "name",
        list: lazyNamed(
            () => import("@/modules/cfg/settings/workschedule/components/WorkScheduleListClient"),
            "WorkScheduleListClient",
        ),
        form: lazyNamed(
            () => import("@/modules/cfg/settings/workschedule/components/WorkScheduleFormClient"),
            "WorkScheduleFormClient",
        ),
    }),
    tabbedCrudRoute({
        id: "settings-digital-certificates",
        href: "/settings/digital-certificates",
        label: "Certificados digitais",
        icon: KeyRound,
        permission: "digitalcertificate:read",
        routeId: "settings-digital-certificates",
        tabShortLabel: "Cert.",
        fieldTabName: "alias",
        listToolbar:
            "Certificado A1 do empregador deste tenant (para eSocial). Nao e o certificado do Gesint.",
        list: lazyNamed(
            () =>
                import(
                    "@/modules/cfg/settings/digital-certificate/components/DigitalCertificateListClient"
                ),
            "DigitalCertificateListClient",
        ),
        form: lazyNamed(
            () =>
                import(
                    "@/modules/cfg/settings/digital-certificate/components/DigitalCertificateFormClient"
                ),
            "DigitalCertificateFormClient",
        ),
        formTabLabel: "Certificado digital",
        listToFormLabel: "Novo certificado",
        showListToFormButton: true,
    }),
    tabbedCrudRoute({
        id: "settings-document-types",
        href: "/settings/document-types",
        label: "Tipos de documento",
        icon: FileText,
        permission: "documenttype:read",
        routeId: "settings-document-types",
        tabShortLabel: "Tipo doc.",
        fieldTabName: "name",
        listToolbar:
            "Tipos usados em anexos. A classe (comum, pessoal, sensível ou financeiro) define a proteção do arquivo (SEG-01).",
        list: lazyNamed(
            () =>
                import("@/modules/cfg/settings/documenttype/components/DocumentTypeListClient"),
            "DocumentTypeListClient",
        ),
        form: lazyNamed(
            () =>
                import("@/modules/cfg/settings/documenttype/components/DocumentTypeFormClient"),
            "DocumentTypeFormClient",
        ),
        formTabLabel: "Tipo de documento",
        listToFormLabel: "Novo tipo",
        showListToFormButton: true,
    }),
];

const rhRoutes: AppRoute[] = [
    routeGroup({
        id: "settings-admission-process",
        label: "Processo de Admissão",
        icon: KanbanSquare,
        permission: "admission:read",
        children: [
            tabbedCrudRoute({
                id: "settings-admission-process-kanban",
                href: "/settings/admission-process-kanban",
                label: "Colunas do Kanban",
                icon: Columns3,
                permission: "admission:read",
                routeId: "settings-admission-process-kanban",
                tabShortLabel: "Coluna",
                fieldTabName: "name",
                list: lazyNamed(
                    () =>
                        import(
                            "@/modules/cfg/settings/admissionprocesskanban/components/AdmissionProcessKanbanColumnListClient"
                        ),
                    "AdmissionProcessKanbanColumnListClient",
                ),
                form: lazyNamed(
                    () =>
                        import(
                            "@/modules/cfg/settings/admissionprocesskanban/components/AdmissionProcessKanbanColumnFormClient"
                        ),
                    "AdmissionProcessKanbanColumnFormClient",
                ),
            }),
        ],
    }),
    tabbedCrudRoute({
        id: "settings-exit-interview-return-checklist",
        href: "/settings/exit-interview-return-checklist",
        label: "Checklist de devoluções",
        icon: ClipboardList,
        permission: "exitinterview:read",
        routeId: "settings-exit-interview-return-checklist",
        tabShortLabel: "Item de devolução",
        fieldTabName: "description",
        list: lazyNamed(
            () =>
                import("@/modules/cfg/settings/exitinterviewchecklist/components/ExitInterviewReturnChecklistConfigListClient"),
            "ExitInterviewReturnChecklistConfigListClient",
        ),
        form: lazyNamed(
            () =>
                import("@/modules/cfg/settings/exitinterviewchecklist/components/ExitInterviewReturnChecklistConfigFormClient"),
            "ExitInterviewReturnChecklistConfigFormClient",
        ),
    }),
    routeGroup({
        id: "settings-pdi",
        label: "PDI",
        icon: GraduationCap,
        permission: "developmentplanconfig:read",
        children: [
            tabbedCrudRoute({
                id: "settings-pdi-competencies",
                href: "/settings/pdi/competencies",
                label: "Competências PDI",
                icon: StickyNote,
                permission: "developmentplanconfig:read",
                routeId: "settings-pdi-competencies",
                tabShortLabel: "Competência",
                fieldTabName: "name",
                list: lazyNamed(
                    () => import("@/modules/cfg/settings/developmentplan/components/DevelopmentPlanDomainRoutes"),
                    "CompetencyListClient",
                ),
                form: lazyNamed(
                    () => import("@/modules/cfg/settings/developmentplan/components/DevelopmentPlanDomainRoutes"),
                    "CompetencyFormClient",
                ),
            }),
            tabbedCrudRoute({
                id: "settings-pdi-proficiency-levels",
                href: "/settings/pdi/proficiency-levels",
                label: "Níveis de proficiência",
                icon: StickyNote,
                permission: "developmentplanconfig:read",
                routeId: "settings-pdi-proficiency-levels",
                tabShortLabel: "Nível",
                fieldTabName: "name",
                list: lazyNamed(
                    () => import("@/modules/cfg/settings/developmentplan/components/DevelopmentPlanDomainRoutes"),
                    "ProficiencyLevelListClient",
                ),
                form: lazyNamed(
                    () => import("@/modules/cfg/settings/developmentplan/components/DevelopmentPlanDomainRoutes"),
                    "ProficiencyLevelFormClient",
                ),
            }),
            tabbedCrudRoute({
                id: "settings-pdi-tracks",
                href: "/settings/pdi/tracks",
                label: "Trilhas de desenvolvimento",
                icon: StickyNote,
                permission: "developmentplanconfig:read",
                routeId: "settings-pdi-tracks",
                tabShortLabel: "Trilha",
                fieldTabName: "name",
                list: lazyNamed(
                    () => import("@/modules/cfg/settings/developmentplan/components/DevelopmentPlanDomainRoutes"),
                    "DevelopmentTrackListClient",
                ),
                form: lazyNamed(
                    () => import("@/modules/cfg/settings/developmentplan/components/DevelopmentPlanDomainRoutes"),
                    "DevelopmentTrackFormClient",
                ),
            }),
            tabbedCrudRoute({
                id: "settings-pdi-action-templates",
                href: "/settings/pdi/action-templates",
                label: "Modelos de ação PDI",
                icon: StickyNote,
                permission: "developmentplanconfig:read",
                routeId: "settings-pdi-action-templates",
                tabShortLabel: "Modelo",
                fieldTabName: "title",
                list: lazyNamed(
                    () => import("@/modules/cfg/settings/developmentplan/components/DevelopmentPlanDomainRoutes"),
                    "DevelopmentActionTemplateListClient",
                ),
                form: lazyNamed(
                    () => import("@/modules/cfg/settings/developmentplan/components/DevelopmentPlanDomainRoutes"),
                    "DevelopmentActionTemplateFormClient",
                ),
            }),
            tabbedCrudRoute({
                id: "settings-pdi-evidence-types",
                href: "/settings/pdi/evidence-types",
                label: "Tipos de evidência",
                icon: StickyNote,
                permission: "developmentplanconfig:read",
                routeId: "settings-pdi-evidence-types",
                tabShortLabel: "Evidência",
                fieldTabName: "name",
                list: lazyNamed(
                    () => import("@/modules/cfg/settings/developmentplan/components/DevelopmentPlanDomainRoutes"),
                    "EvidenceTypeListClient",
                ),
                form: lazyNamed(
                    () => import("@/modules/cfg/settings/developmentplan/components/DevelopmentPlanDomainRoutes"),
                    "EvidenceTypeFormClient",
                ),
            }),
            tabbedCrudRoute({
                id: "settings-pdi-origins",
                href: "/settings/pdi/origins",
                label: "Origens de PDI",
                icon: StickyNote,
                permission: "developmentplanconfig:read",
                routeId: "settings-pdi-origins",
                tabShortLabel: "Origem",
                fieldTabName: "name",
                list: lazyNamed(
                    () => import("@/modules/cfg/settings/developmentplan/components/DevelopmentPlanDomainRoutes"),
                    "DevelopmentPlanOriginListClient",
                ),
                form: lazyNamed(
                    () => import("@/modules/cfg/settings/developmentplan/components/DevelopmentPlanDomainRoutes"),
                    "DevelopmentPlanOriginFormClient",
                ),
            }),
        ],
    }),
];

export const settingsAccessRoutes = accessRoutes;
export const settingsDpRoutes = dpRoutes;
export const settingsRhRoutes = rhRoutes;

/** Lista plana de todas as rotas de configurações (rail, permissões, workspace). */
export const settingsRoutes: AppRoute[] = [...accessRoutes, ...dpRoutes, ...rhRoutes];

/** @deprecated Mantido para abas antigas apontando para /settings/attendance */
export const settingsAttendanceLegacyRoute = customWorkspaceRoute({
    id: "settings-attendance",
    href: "/settings/attendance",
    label: "Preferências",
    icon: Settings2,
    permissionsAny: ["attendance:read", "notification:write"],
    load: () => import("@/modules/cfg/settings/preferences/components/OperationalPreferencesPage"),
});

/** @deprecated Mantido para abas antigas apontando para /settings/notifications */
export const settingsNotificationsLegacyRoute = customWorkspaceRoute({
    id: "settings-notifications",
    href: "/settings/notifications",
    label: "Preferências",
    icon: Settings2,
    permissionsAny: ["attendance:read", "notification:write"],
    load: () => import("@/modules/cfg/settings/preferences/components/OperationalPreferencesPage"),
});
