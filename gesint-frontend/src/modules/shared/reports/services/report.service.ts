import { apiFetchBlob } from "@/shared/lib/api.client";

export type ReportKey = "EMPLOYEE_ROSTER" | "ADMISSIONS" | "LEAVES";

export type PeriodReportFilter = {
    startDate: string;
    endDate: string;
};

const REPORT_PATHS: Record<ReportKey, string> = {
    EMPLOYEE_ROSTER: "/api/v1/reports/dp/employees",
    ADMISSIONS: "/api/v1/reports/rh/admissions",
    LEAVES: "/api/v1/reports/rh/leaves",
};

class ReportService {
    generate(key: ReportKey, filter?: PeriodReportFilter): Promise<Blob> {
        const search = filter
            ? `?startDate=${encodeURIComponent(filter.startDate)}&endDate=${encodeURIComponent(filter.endDate)}`
            : "";
        return apiFetchBlob(`${REPORT_PATHS[key]}${search}`);
    }
}

export const reportService = new ReportService();
