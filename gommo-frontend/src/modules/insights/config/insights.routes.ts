import { BarChart3 } from "lucide-react";
import { createElement } from "react";
import type { AppRoute } from "@/modules/root/enum/ModuleEnum";
import { customWorkspaceRoute } from "@/shared/routing";

export const insightsRoutes: AppRoute[] = [
    customWorkspaceRoute({
        id: "report",
        href: "/report",
        label: "Relatórios",
        icon: BarChart3,
        permission: "role:read",
        load: async () => {
            const { WorkspacePage } = await import("@/shared/components/layout/WorkspacePage");
            return {
                default: function ReportPage() {
                    return createElement(
                        WorkspacePage,
                        null,
                        createElement(
                            "div",
                            {
                                className:
                                    "flex min-h-[12rem] items-center justify-center p-8 text-sm text-base-content/50",
                            },
                            "Relatórios — em breve.",
                        ),
                    );
                },
            };
        },
    }),
];
