import {UserCog} from "lucide-react";

import type {AppRoute} from "@/modules/root/enum/ModuleEnum";
import {customWorkspaceRoute} from "@/shared/routing";

/** Configurações pessoais — acessível a qualquer usuário autenticado (fora do menu CFG). */
export const accountSettingsRoute: AppRoute = customWorkspaceRoute({
    id: "account-settings",
    href: "/account",
    label: "Configurações",
    icon: UserCog,
    publicAccess: "full",
    load: () => import("@/modules/cfg/account/components/AccountSettingsPage"),
});
