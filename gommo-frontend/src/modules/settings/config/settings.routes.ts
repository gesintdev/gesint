import { Shield, Users } from "lucide-react";
import type { AppRoute } from "@/modules/root/enum/ModuleEnum";
import { lazyNamed, tabbedCrudRoute } from "@/shared/routing";

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
        list: lazyNamed(() => import("@/modules/settings/profile/components/ProfileListClient"), "ProfileListClient"),
        form: lazyNamed(() => import("@/modules/settings/profile/components/ProfileFormClient"), "ProfileFormClient"),
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
        list: lazyNamed(() => import("@/modules/settings/appuser/components/AppUserListClient"), "AppUserListClient"),
        form: lazyNamed(() => import("@/modules/settings/appuser/components/AppUserFormClient"), "AppUserFormClient"),
    }),
];
