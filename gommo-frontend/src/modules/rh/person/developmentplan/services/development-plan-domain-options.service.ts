import { type DevelopmentPlanDomainRecord,DevelopmentPlanDomainService } from "@/modules/cfg/settings/developmentplan/services/development-plan-domain.service";
import type { SelectItem, SelectSearchResult } from "@/shared/components/ui/input/select-item.types";

const AUTOCOMPLETE_PAGE_SIZE = 6;
const DOMAIN_PAGE_SIZE = 100;

type DomainOptionConfig = {
    endpoint: string;
    labelField: keyof DevelopmentPlanDomainRecord;
    descriptionField?: keyof DevelopmentPlanDomainRecord;
};

const normalize = (value: string) =>
    value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

const includesQuery = (value: unknown, query: string) => {
    if (!query.trim()) return true;
    if (typeof value !== "string") return false;
    return normalize(value).includes(normalize(query.trim()));
};

class DevelopmentPlanDomainOptionsService {
    private readonly services = new Map<string, DevelopmentPlanDomainService>();

    search(config: DomainOptionConfig, query: string, page = 0): Promise<SelectSearchResult> {
        return this.getService(config.endpoint)
            .getPage(0, DOMAIN_PAGE_SIZE)
            .then((result) => {
                const activeItems = result.content.filter((item) => item.status === "ACTIVE");
                const filtered = activeItems.filter((item) => includesQuery(item[config.labelField], query));
                const start = page * AUTOCOMPLETE_PAGE_SIZE;
                const pageItems = filtered.slice(start, start + AUTOCOMPLETE_PAGE_SIZE);

                return {
                    items: pageItems.map((item) => this.toSelectItem(item, config)),
                    page,
                    hasMore: start + AUTOCOMPLETE_PAGE_SIZE < filtered.length,
                };
            });
    }

    private getService(endpoint: string) {
        const current = this.services.get(endpoint);
        if (current) return current;

        const service = new DevelopmentPlanDomainService(endpoint);
        this.services.set(endpoint, service);
        return service;
    }

    private toSelectItem(item: DevelopmentPlanDomainRecord, config: DomainOptionConfig): SelectItem {
        const label = item[config.labelField];
        const description = config.descriptionField ? item[config.descriptionField] : undefined;

        return {
            value: item.id,
            label: typeof label === "string" ? label : String(label ?? item.id),
            description: description === undefined || description === null ? undefined : String(description),
        };
    }
}

export const developmentPlanDomainOptionsService = new DevelopmentPlanDomainOptionsService();
