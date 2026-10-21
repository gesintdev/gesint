import type { PayrollRun, PayrollRunCreateDto } from "@/modules/ctb/payroll/dto/payroll-run.dto";
import type { PayrollRunProcessResult } from "@/modules/ctb/payroll/dto/payroll-run-process.dto";
import { formatPayrollReference } from "@/modules/ctb/payroll/lib/payroll-run.mapper";
import { BaseService } from "@/modules/root/services/base.service";
import type { SelectItem, SelectSearchResult } from "@/shared/components/ui/input/select-item.types";
import { apiFetch } from "@/shared/lib/api.client";

const AUTOCOMPLETE_PAGE_SIZE = 6;

class PayrollRunService extends BaseService<PayrollRun, PayrollRunCreateDto, PayrollRunCreateDto> {
    constructor() {
        super("/api/v1/payroll-runs");
    }
    async searchForAutocomplete(query: string, page = 0): Promise<SelectSearchResult> {
        const all = await this.getAll();
        const q = query.trim().toLowerCase();
        const filtered = q
            ? all.filter((run) => {
                  const label = formatPayrollReference(run.referenceDate);
                  return label.includes(q) || run.referenceDate.includes(q);
              })
            : all;
        const start = page * AUTOCOMPLETE_PAGE_SIZE;
        const slice = filtered.slice(start, start + AUTOCOMPLETE_PAGE_SIZE);
        const items: SelectItem[] = slice.map((run) => ({
            value: run.id,
            label: `Competência ${formatPayrollReference(run.referenceDate)}`,
            description: run.payrollStatus,
        }));
        const totalPages = Math.max(1, Math.ceil(filtered.length / AUTOCOMPLETE_PAGE_SIZE));
        return { items, page, hasMore: page + 1 < totalPages };
    }
    process(id: string): Promise<PayrollRunProcessResult> {
        return apiFetch<PayrollRunProcessResult>(`${this.basePath}/${id}/process`, { method: "POST" });
    }
    review(id: string): Promise<PayrollRun> {
        return apiFetch<PayrollRun>(`${this.basePath}/${id}/review`, { method: "POST" });
    }
    close(id: string): Promise<PayrollRun> {
        return apiFetch<PayrollRun>(`${this.basePath}/${id}/close`, { method: "POST" });
    }
    reopen(id: string): Promise<PayrollRun> {
        return apiFetch<PayrollRun>(`${this.basePath}/${id}/reopen`, { method: "POST" });
    }
}

export const payrollrunService = new PayrollRunService();
