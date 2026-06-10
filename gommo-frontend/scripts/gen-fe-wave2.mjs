import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "../src/modules");
function w(rel, c) {
    const p = path.join(ROOT, rel);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, c.trim() + "\n");
}

function crudModule({ pkg, entity, Entity, apiPath, permPrefix, label, columns, formFields }) {
    const keys = `${pkg}Keys`;
    const service = `${entity}Service`;
    const mapper = `${entity.charAt(0).toLowerCase()}${entity.slice(1)}ToFormDto`;
    w(
        `${pkg}/dto/${entity}.dto.ts`,
        `export type TaxObligationType = "IRRF" | "INSS" | "FGTS" | "OTHER";
export type PerformanceRating = "NEEDS_IMPROVEMENT" | "MEETS" | "EXCEEDS" | "OUTSTANDING";

export class ${Entity} {
    id!: string;
    status!: "ACTIVE" | "INACTIVE" | "DELETED";
    collaboratorId!: string;
    createdAt?: string;
    updatedAt?: string;
}

export class ${Entity}CreateDto {
    collaboratorId!: string;
}
`,
    );

    // overwritten below per module
}

// tax
w(
    "tax/dto/tax-obligation.dto.ts",
    `export type TaxObligationType = "IRRF" | "INSS" | "FGTS" | "OTHER";

export class TaxObligation {
    id!: string;
    status!: "ACTIVE" | "INACTIVE" | "DELETED";
    collaboratorId!: string;
    obligationType!: TaxObligationType;
    referenceCode?: string;
    startDate!: string;
    endDate?: string;
    baseAmount?: string;
    ratePercent?: string;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
}

export class TaxObligationCreateDto {
    collaboratorId!: string;
    obligationType?: TaxObligationType;
    referenceCode?: string;
    startDate!: string;
    endDate?: string;
    baseAmount?: string;
    ratePercent?: string;
    notes?: string;
}
`,
);
w(
    "tax/lib/tax-obligation.mapper.ts",
    `import type { TaxObligation, TaxObligationCreateDto } from "@/modules/tax/dto/tax-obligation.dto";

export function taxObligationToFormDto(entity: TaxObligation): TaxObligationCreateDto {
    return {
        collaboratorId: entity.collaboratorId ?? "",
        obligationType: entity.obligationType,
        referenceCode: entity.referenceCode ?? "",
        startDate: entity.startDate?.slice(0, 10) ?? "",
        endDate: entity.endDate?.slice(0, 10) ?? "",
        baseAmount: entity.baseAmount != null ? String(entity.baseAmount) : "",
        ratePercent: entity.ratePercent != null ? String(entity.ratePercent) : "",
        notes: entity.notes ?? "",
    };
}

export const emptyTaxObligationForm = (): TaxObligationCreateDto => ({
    collaboratorId: "",
    startDate: "",
    referenceCode: "",
    endDate: "",
    baseAmount: "",
    ratePercent: "",
    notes: "",
});
`,
);
w(
    "tax/services/tax-obligation.service.ts",
    `import type { TaxObligation, TaxObligationCreateDto } from "@/modules/tax/dto/tax-obligation.dto";
import { BaseService } from "@/modules/root/services/base.service";

class TaxObligationService extends BaseService<TaxObligation, TaxObligationCreateDto, TaxObligationCreateDto> {
    constructor() {
        super("/api/v1/tax-obligations");
    }
}

export const taxObligationService = new TaxObligationService();
`,
);
w(
    "tax/tax.query.ts",
    `export const taxObligationKeys = {
    all: ["tax-obligations"] as const,
    detail: (id: string) => ["tax-obligations", id] as const,
};
`,
);
w(
    "tax/exceptions/tax-obligation.messages.ts",
    `export const TAX_CLIENT_MESSAGES = {
    TAX_LOAD_FAILED: "Não foi possível carregar a obrigação fiscal.",
    TAX_SAVE_FAILED: "Não foi possível salvar a obrigação fiscal.",
} as const;
`,
);
w(
    "tax/config/tax-obligation.table-columns.ts",
    `import { TableDataType, type TableColumnConfig } from "@/shared/types/table.types";

export const TAX_TABLE_COLUMNS: TableColumnConfig[] = [
    { id: "obligationType", columnName: "Tipo", fieldValue: "obligationType", dataType: TableDataType.TEXT },
    { id: "startDate", columnName: "Início", fieldValue: "startDate", dataType: TableDataType.DATE },
    { id: "endDate", columnName: "Fim", fieldValue: "endDate", dataType: TableDataType.DATE },
    { id: "status", columnName: "Status", fieldValue: "status", dataType: TableDataType.BADGE },
];
`,
);
console.log("tax dto/service done");
