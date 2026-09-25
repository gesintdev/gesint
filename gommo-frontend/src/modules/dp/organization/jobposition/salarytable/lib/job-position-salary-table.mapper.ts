import type {
    JobPositionSalaryLevel,
    JobPositionSalaryTable,
    JobPositionSalaryTableCreateDto,
    JobPositionSalaryTableItemFormDto,
} from "@/modules/dp/organization/jobposition/salarytable/dto/job-position-salary-table.dto";
import { ALL_SALARY_LEVELS } from "@/modules/dp/organization/jobposition/salarytable/lib/job-position-salary-level.options";

function toDecimalString(value: number | string | null | undefined): string {
    if (value == null || value === "") return "";
    const n = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(n)) return "";
    return n.toFixed(2);
}

export function emptySalaryTableItem(level: JobPositionSalaryLevel = "I"): JobPositionSalaryTableItemFormDto {
    return {
        level,
        minSalary: "",
        referenceSalary: "",
        maxSalary: "",
    };
}

export function emptyJobPositionSalaryTableForm(jobPositionId = ""): JobPositionSalaryTableCreateDto {
    return {
        jobPositionId,
        name: "",
        validFrom: new Date().toISOString().slice(0, 10),
        items: [emptySalaryTableItem("I")],
    };
}

export function jobPositionSalaryTableToFormDto(entity: JobPositionSalaryTable): JobPositionSalaryTableCreateDto {
    const items = (entity.items ?? []).map(
        (item) =>
            ({
                level: item.level,
                minSalary: toDecimalString(item.minSalary),
                referenceSalary: toDecimalString(item.referenceSalary),
                maxSalary: toDecimalString(item.maxSalary),
            }) satisfies JobPositionSalaryTableItemFormDto,
    );
    return {
        jobPositionId: entity.jobPositionId,
        name: entity.name ?? "",
        validFrom: entity.validFrom,
        items: items.length > 0 ? items : [emptySalaryTableItem("I")],
    };
}

export function jobPositionSalaryTableToApiPayload(form: JobPositionSalaryTableCreateDto) {
    return {
        jobPositionId: form.jobPositionId,
        name: form.name?.trim() || undefined,
        validFrom: form.validFrom,
        items: form.items.map((item) => ({
            level: item.level,
            minSalary: Number(item.minSalary),
            referenceSalary: Number(item.referenceSalary),
            maxSalary: Number(item.maxSalary),
        })),
    };
}

export function nextAvailableSalaryLevel(
    items: JobPositionSalaryTableItemFormDto[],
): JobPositionSalaryLevel | null {
    const used = new Set(items.map((item) => item.level));
    return ALL_SALARY_LEVELS.find((level) => !used.has(level)) ?? null;
}
