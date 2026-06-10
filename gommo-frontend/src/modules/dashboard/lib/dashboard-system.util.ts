import type { DashboardSummary } from "@/modules/dashboard/dto/dashboard.dto";
/** Valores alinhados a SystemEnum, sem importar o enum (evita lucide no middleware). */
export type DashboardSystemId = "dp" | "rh";

const RH_METRIC_KEYS = new Set(["collaborators", "contracts", "leave"]);
const DP_METRIC_KEYS = new Set(["payroll"]);
const RH_MODULE_KEYS = new Set(["collaborator", "admission", "contract", "leave", "attendance", "offboarding"]);
const DP_MODULE_KEYS = new Set(["payroll", "payslip", "benefit", "company", "department", "jobposition"]);

function filterModuleHealth(
    moduleHealth: DashboardSummary["moduleHealth"],
    allowedKeys: ReadonlySet<string>,
): DashboardSummary["moduleHealth"] {
    const modules = moduleHealth.modules.filter((item) => allowedKeys.has(item.key));
    const activeModules = modules.filter((item) => item.active).length;
    const totalModules = modules.length;
    const progressPercent = totalModules === 0 ? 0 : Math.round((activeModules * 100) / totalModules);
    return {
        activeModules,
        totalModules,
        progressPercent,
        modules,
    };
}

export function filterDashboardSummaryForSystem(data: DashboardSummary, system: DashboardSystemId): DashboardSummary {
    if (system === "dp") {
        return {
            metrics: data.metrics.filter((metric) => DP_METRIC_KEYS.has(metric.key)),
            movementLast7Days: data.movementLast7Days,
            moduleHealth: filterModuleHealth(data.moduleHealth, DP_MODULE_KEYS),
            admissionsByStatus: [],
            leaveByType: [],
        };
    }
    return {
        metrics: data.metrics.filter((metric) => RH_METRIC_KEYS.has(metric.key)),
        movementLast7Days: data.movementLast7Days,
        moduleHealth: filterModuleHealth(data.moduleHealth, RH_MODULE_KEYS),
        admissionsByStatus: data.admissionsByStatus,
        leaveByType: data.leaveByType,
    };
}

export function dashboardTitleForSystem(system: DashboardSystemId): string {
    return system === "dp" ? "Painel DP" : "Painel RH";
}
