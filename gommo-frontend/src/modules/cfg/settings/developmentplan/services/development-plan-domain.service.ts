import {BaseService} from "@/modules/root/services/base.service";

export type DomainFieldType = "text" | "textarea" | "number" | "select" | "checkbox";
export type DomainOption = { value: string; label: string };
export type DomainFieldConfig = {
    name: string;
    label: string;
    type: DomainFieldType;
    required?: boolean;
    options?: DomainOption[];
    /** Largura no grid 12-col (padrão: 6; checkbox: 4; textarea: 12). */
    colSpan?: 4 | 6 | 12;
};

export class DevelopmentPlanDomainRecord {
    id!: string;
    code!: number;
    status!: "ACTIVE" | "INACTIVE" | "DELETED";
    name?: string;
    description?: string;
    type?: string;
    levelOrder?: number;
    weight?: number;
    competencyId?: string;
    competencyName?: string;
    minGap?: number;
    title?: string;
    suggestedDescription?: string;
    actionType?: string;
    suggestedDeadlineDays?: number;
    evidenceRequired?: boolean;
    requiresFile?: boolean;
    allowsLink?: boolean;
}

export class DevelopmentPlanDomainService extends BaseService<DevelopmentPlanDomainRecord, Record<string, unknown>, Record<string, unknown>> {
}
