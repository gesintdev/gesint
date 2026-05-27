import type { AppRoute } from "@/modules/root/enum/ModuleEnum";
import { ShieldCheck, UserCog } from "lucide-react";

/** Equipe Gommo que opera o painel administrativo */
export const platformRoutes: AppRoute[] = [
    {
        id: "platform-ops",
        label: "Operação",
        icon: ShieldCheck,
        children: [
            {
                id: "admin-users",
                label: "Operadores da plataforma",
                href: "/admin-users",
                icon: UserCog,
            },
        ],
    },
];
