import { FlaskConical, LayoutDashboard } from "lucide-react";
import { createElement } from "react";
import type { AppRoute } from "@/modules/root/enum/ModuleEnum";
import { customWorkspaceRoute } from "@/shared/routing";

export const dashboardRoutes: AppRoute[] = [
    customWorkspaceRoute({
        id: "dashboard",
        href: "/dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        load: async () => {
            const { WorkspacePage } = await import("@/shared/components/layout/WorkspacePage");
            return {
                default: function AdminDashboardPage() {
                    return createElement(
                        WorkspacePage,
                        null,
                        createElement(
                            "div",
                            { className: "flex min-h-[12rem] flex-col gap-2 p-8" },
                            createElement("h1", { className: "text-xl font-semibold" }, "Painel administrativo"),
                            createElement(
                                "p",
                                { className: "text-sm text-base-content/60" },
                                "Cadastre e gerencie clientes, assinaturas, pagamentos e usuários com acesso inicial ao sistema de cada tenant.",
                            ),
                        ),
                    );
                },
            };
        },
    }),
    customWorkspaceRoute({
        id: "dev-inputs",
        href: "/dev/inputs",
        label: "Inputs (dev)",
        icon: FlaskConical,
        load: async () => {
            const [{ PageTransition }, { InputsPlaygroundClient }] = await Promise.all([
                import("@/shared/components/layout/PageTransition"),
                import("@/app/(system)/dev/inputs/InputsPlaygroundClient"),
            ]);
            return {
                default: function DevInputsPage() {
                    return createElement(PageTransition, null, createElement(InputsPlaygroundClient));
                },
            };
        },
    }),
];
