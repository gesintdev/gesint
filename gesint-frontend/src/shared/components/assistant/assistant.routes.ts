import {Sparkles} from "lucide-react";

import type {AppRoute} from "@/modules/root/enum/ModuleEnum";
import {customWorkspaceRoute} from "@/shared/routing";

/** Aba do assistente. Fica fora do menu: abre pelo painel lateral. */
export const assistantWorkspaceRoute: AppRoute = customWorkspaceRoute({
    id: "assistant",
    href: "/assistant",
    label: "Assistente IA",
    icon: Sparkles,
    publicAccess: "full",
    load: () => import("@/shared/components/assistant/AssistantWorkspacePage"),
});
