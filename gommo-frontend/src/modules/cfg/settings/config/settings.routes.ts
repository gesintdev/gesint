import { Bell, ClipboardList, Shield, Users } from "lucide-react";

import type { AppRoute } from "@/modules/root/enum/ModuleEnum";
import { customWorkspaceRoute, lazyNamed, tabbedCrudRoute } from "@/shared/routing";

export const settingsRoutes: AppRoute[] = [
    tabbedCrudRoute({
        id: "settings-profiles",
        href: "/settings/profiles",
        label: "Perfis",
        icon: Shield,
        permission: "role:read",
        routeId: "settings-profiles",
        tabShortLabel: "Perfil",
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
        id: "settings-notifications",
        href: "/settings/notifications",
        label: "Notificações",
        icon: Bell,
        permission: "notification:read",
        load: () => import("@/modules/cfg/settings/notification/components/NotificationSettingsPage"),
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
    tabbedCrudRoute({
        id: "settings-pdi-competencies",
        href: "/settings/pdi/competencies",
        label: "Competências PDI",
        icon: ClipboardList,
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
        icon: ClipboardList,
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
        icon: ClipboardList,
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
        icon: ClipboardList,
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
        icon: ClipboardList,
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
        icon: ClipboardList,
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
];
