import { Bell, Shield, Users } from "lucide-react";

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
        list: lazyNamed(() => import("@/modules/cfg/settings/profile/components/ProfileListClient"), "ProfileListClient"),
        form: lazyNamed(() => import("@/modules/cfg/settings/profile/components/ProfileFormClient"), "ProfileFormClient"),
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
        list: lazyNamed(() => import("@/modules/cfg/settings/appuser/components/AppUserListClient"), "AppUserListClient"),
        form: lazyNamed(() => import("@/modules/cfg/settings/appuser/components/AppUserFormClient"), "AppUserFormClient"),
    }),
    customWorkspaceRoute({
        id: "settings-notifications",
        href: "/settings/notifications",
        label: "Notificações",
        icon: Bell,
        permission: "notification:read",
        load: () => import("@/modules/cfg/settings/notification/components/NotificationSettingsPage"),
    }),
];
