import type { SelectItem } from "@/shared/components/ui/input/select-item.types";
import type { JobPositionCompetencyUsage } from "@/modules/dp/organization/jobposition/competency/dto/job-position-competency.dto";

/** Indicadores observáveis padrão (RN-10 / mock HTML), usados quando o catálogo não traz descrição. */
export const DEFAULT_EXPECTED_LEVEL_OBSERVABLES: Record<string, string> = {
    LEVEL_1: "demonstra o básico com supervisão",
    LEVEL_2: "executa com autonomia parcial",
    LEVEL_3: "resolve situações sem escalar",
    LEVEL_4: "é referência e forma outros",
};

function formatExpectedLevelLabel(order: 1 | 2 | 3 | 4, observable: string): string {
    const clean = observable.trim();
    return clean ? `${order} · ${clean}` : String(order);
}

export function buildExpectedLevelSelectItems(
    catalogByOrder?: Partial<Record<number, { name?: string; description?: string }>>,
): SelectItem[] {
    return ([1, 2, 3, 4] as const).map((order) => {
        const value = `LEVEL_${order}`;
        const fromCatalog = catalogByOrder?.[order];
        const observable =
            fromCatalog?.description?.trim() ||
            fromCatalog?.name?.trim() ||
            DEFAULT_EXPECTED_LEVEL_OBSERVABLES[value] ||
            "";
        return {
            value,
            label: formatExpectedLevelLabel(order, observable),
            description: observable || undefined,
        };
    });
}

export const JOB_POSITION_COMPETENCY_EXPECTED_LEVEL_ITEMS: SelectItem[] = buildExpectedLevelSelectItems();

export const JOB_POSITION_COMPETENCY_EXPECTED_LEVEL_LABELS: Record<string, string> = Object.fromEntries(
    JOB_POSITION_COMPETENCY_EXPECTED_LEVEL_ITEMS.map((item) => [item.value, item.label]),
);

export const JOB_POSITION_COMPETENCY_USAGE_ITEMS: { value: JobPositionCompetencyUsage; label: string }[] = [
    { value: "SELECTION", label: "Seleção" },
    { value: "EXPERIENCE", label: "Experiência" },
    { value: "PERFORMANCE", label: "Desempenho" },
    { value: "INTERVIEW", label: "Entrevista" },
    { value: "TECHNICAL_TEST", label: "Prova técnica" },
    { value: "PDI", label: "PDI" },
];

export const JOB_POSITION_COMPETENCY_USAGE_LABELS: Record<string, string> = Object.fromEntries(
    JOB_POSITION_COMPETENCY_USAGE_ITEMS.map((item) => [item.value, item.label]),
);

export const COMPETENCY_TYPE_LABELS: Record<string, string> = {
    TECHNICAL: "Técnica",
    BEHAVIORAL: "Comportamental",
    LEADERSHIP: "Liderança",
};
