import { SlidersHorizontal } from "lucide-react";

import type { AppRoute } from "@/modules/root/enum/ModuleEnum";
import { customWorkspaceRoute } from "@/shared/routing";

/** Gestão de Ponto › Configurações (as escalas continuam em CFG). */
export const timeSettingsRoutes: AppRoute[] = [
    customWorkspaceRoute({
        id: "attendance-settings",
        href: "/attendance/settings",
        label: "Preferências de ponto",
        icon: SlidersHorizontal,
        permission: "attendance:read",
        load: () => import("@/modules/gp/settings/components/TimeSettingsPage"),
    }),
];
