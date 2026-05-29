import type { AppRoute } from "@/modules/root/enum/ModuleEnum";
import { customWorkspaceRoute } from "@/shared/routing";
import { FlaskConical, LayoutDashboard } from "lucide-react";
import { createElement } from "react";

export const dashboardRoutes: AppRoute[] = [
    customWorkspaceRoute({
        id: "dashboard",
        href: "/dashboard",
        label: "Painel",
        icon: LayoutDashboard,
        load: () =>
            import("@/shared/workspace/views/DashboardView").then((module) => ({
                default: module.DashboardView,
            })),
    }),
    customWorkspaceRoute({
        id: "dev-inputs",
        href: "/dev/inputs",
        label: "Componentes (dev)",
        icon: FlaskConical,
        load: async () => {
            const [{ PageTransition }, { InputsPlaygroundClient }] = await Promise.all([
                import("@/shared/components/layout/PageTransition"),
                import("@/app/(system)/dev/inputs/InputsPlaygroundClient"),
            ]);
            return {
                default: function DevInputsPage() {
                    return createElement(
                        PageTransition,
                        null,
                        createElement(InputsPlaygroundClient),
                    );
                },
            };
        },
    }),
];
