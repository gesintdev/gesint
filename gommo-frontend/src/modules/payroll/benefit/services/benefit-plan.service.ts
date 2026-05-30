import type { BenefitPlan, BenefitPlanCreateDto } from "@/modules/payroll/benefit/dto/benefit-plan.dto";
import { BaseService } from "@/modules/root/services/base.service";
import type { SelectItem, SelectSearchResult } from "@/shared/components/ui/input/select-item.types";

const AUTOCOMPLETE_PAGE_SIZE = 6;

class BenefitPlanService extends BaseService<BenefitPlan, BenefitPlanCreateDto, BenefitPlanCreateDto> {
    constructor() {
        super("/api/v1/benefit-plans");
    }

    async searchForAutocomplete(query: string, page = 0): Promise<SelectSearchResult> {
        const all = await this.getAll();
        const q = query.trim().toLowerCase();
        const filtered = q
            ? all.filter(
                  (plan) =>
                      plan.name.toLowerCase().includes(q) || plan.benefitType.toLowerCase().includes(q),
              )
            : all;

        const start = page * AUTOCOMPLETE_PAGE_SIZE;
        const slice = filtered.slice(start, start + AUTOCOMPLETE_PAGE_SIZE);
        const items: SelectItem[] = slice.map((plan) => ({
            value: plan.id,
            label: plan.name,
            description: plan.benefitType,
        }));
        const totalPages = Math.max(1, Math.ceil(filtered.length / AUTOCOMPLETE_PAGE_SIZE));

        return { items, page, hasMore: page + 1 < totalPages };
    }
}

export const benefitplanService = new BenefitPlanService();
