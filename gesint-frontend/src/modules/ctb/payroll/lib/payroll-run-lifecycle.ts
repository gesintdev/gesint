import type { PayrollStatus } from "@/modules/ctb/payroll/dto/payroll-run.dto";

export function isPayrollRunLocked(status?: PayrollStatus): boolean {
    return status === "CLOSED" || status === "CANCELLED";
}

export function canEditPayrollRun(status?: PayrollStatus): boolean {
    return !isPayrollRunLocked(status) && status !== "PROCESSING";
}

export function canProcessPayrollRun(status?: PayrollStatus): boolean {
    return status === "OPEN" || status === "PROCESSED";
}

export function canReviewPayrollRun(status?: PayrollStatus): boolean {
    return status === "PROCESSED";
}

export function canClosePayrollRun(status?: PayrollStatus): boolean {
    return status === "REVIEWED";
}

export function canReopenPayrollRun(status?: PayrollStatus): boolean {
    return status === "CLOSED";
}

export function canDeletePayrollRun(status?: PayrollStatus): boolean {
    return status === "OPEN";
}

export function payrollStatusLabel(status?: PayrollStatus): string {
    switch (status) {
        case "OPEN":
            return "Aberta";
        case "PROCESSING":
            return "Processando";
        case "PROCESSED":
            return "Processada";
        case "REVIEWED":
            return "Revisada";
        case "CLOSED":
            return "Fechada";
        case "CANCELLED":
            return "Cancelada";
        default:
            return status ?? "—";
    }
}
