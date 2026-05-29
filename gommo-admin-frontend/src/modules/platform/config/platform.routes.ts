import type { AppRoute } from "@/modules/root/enum/ModuleEnum";
import { lazyNamed, routeGroup, tabbedCrudRoute } from "@/shared/routing";
import { ShieldCheck, UserCog } from "lucide-react";

/** Equipe Gommo que opera o painel administrativo */
export const platformRoutes: AppRoute[] = [
    routeGroup({
        id: "platform-ops",
        label: "Operação",
        icon: ShieldCheck,
        children: [
            tabbedCrudRoute({
                id: "admin-users",
                href: "/admin-users",
                label: "Operadores da plataforma",
                icon: UserCog,
                routeId: "admin-users",
                tabShortLabel: "Operador",
                fieldTabName: "fullName",
                list: lazyNamed(
                    () => import("@/modules/adminuser/components/AdminUserListClient"),
                    "AdminUserListClient",
                ),
                form: lazyNamed(
                    () => import("@/modules/adminuser/components/AdminUserFormClient"),
                    "AdminUserFormClient",
                ),
            }),
        ],
    }),
];
