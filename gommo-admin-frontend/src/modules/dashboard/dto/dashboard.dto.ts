export type DashboardMetricTone = "success" | "warning" | "neutral";

export class DashboardMetric {
    key!: string;
    label!: string;
    value!: number;
    hint!: string;
    tone!: DashboardMetricTone;
}

export class DashboardMovementPoint {
    date!: string;
    label!: string;
    total!: number;
}

export class DashboardModuleStatus {
    key!: string;
    label!: string;
    active!: boolean;
    records!: number;
}

export class DashboardModuleHealth {
    activeModules!: number;
    totalModules!: number;
    progressPercent!: number;
    modules!: DashboardModuleStatus[];
}

export class DashboardDistributionItem {
    key!: string;
    label!: string;
    value!: number;
}

export class DashboardSummary {
    metrics!: DashboardMetric[];
    movementLast7Days!: DashboardMovementPoint[];
    moduleHealth!: DashboardModuleHealth;
    admissionsByStatus!: DashboardDistributionItem[];
    leaveByType!: DashboardDistributionItem[];
}
