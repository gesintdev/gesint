import {BaseService} from "@/modules/root/services/base.service";

export type DomainFieldType = "text" | "number" | "select" | "checkbox";
export type DomainOption = { value: string; label: string };
export type DomainFieldConfig = {
    name: string;
    label: string;
    type: DomainFieldType;
    required?: boolean;
    options?: DomainOption[];
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
