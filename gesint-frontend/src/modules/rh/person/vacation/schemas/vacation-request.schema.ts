import { z } from "zod";

import {
    maxPecuniaryDays,
    totalGozoDays,
    vacationDaysEntitled,
    validateSplitPeriods,
} from "@/modules/rh/person/vacation/lib/vacation-rules";

const nullishToString = (value: unknown) => value ?? "";
const emptyToUndefined = (value: unknown) => (value == null || value === "" ? undefined : value);
const optionalString = z.preprocess(nullishToString, z.string());

const splitPeriodSchema = z.object({
    days: z.coerce.number().int().min(0, "Informe os dias"),
    startDate: optionalString,
    endDate: optionalString,
});
export const vacationRequestFormSchema = z
    .object({
        collaboratorId: z.preprocess(
            nullishToString,
            z.string().min(1, "Selecione o colaborador").uuid("Colaborador inválido"),
        ),
        unjustifiedAbsences: z.coerce.number().int().min(0, "Informe um valor válido"),
        justifiedAbsences: z.coerce.number().int().min(0).optional(),
        pecuniaryAllowanceDays: z.coerce.number().int().min(0),
        approved: z.boolean().optional(),
        notes: optionalString.optional(),
        periods: z.array(splitPeriodSchema).min(1, "Informe ao menos um período"),
        acquisitionPeriodStart: optionalString.optional(),
        acquisitionPeriodEnd: optionalString.optional(),
        baseSalarySnapshot: z.coerce.number().optional(),
        vacationDaysEntitled: z.coerce.number().int().nonnegative().optional(),
        recessPeriodId: z.preprocess(emptyToUndefined, z.string().uuid().optional()),
        recessAllowSplit: z.preprocess(emptyToUndefined, z.boolean().optional()),
        recessMaxSplitPeriods: z.coerce.number().int().positive().nullish(),
        recessMinimumSplitDays: z.coerce.number().int().positive().nullish(),
    })
    .superRefine((data, ctx) => {
        const splitCheck = data.recessPeriodId
            ? { valid: data.periods.every((period) => period.days > 0 && Boolean(period.startDate)) }
            : validateSplitPeriods(data.periods);
        if (!splitCheck.valid) {
            ctx.addIssue({ code: "custom", message: splitCheck.message ?? "Períodos inválidos", path: ["periods"] });
        }
        for (let i = 0; i < data.periods.length; i++) {
            const p = data.periods[i];
            if (p.startDate && p.days <= 0) {
                ctx.addIssue({
                    code: "custom",
                    message: "Informe a quantidade de dias do período",
                    path: ["periods", i, "days"],
                });
            }

            if (p.days > 0 && !p.startDate) {
                ctx.addIssue({
                    code: "custom",
                    message: "Informe a data de início",
                    path: ["periods", i, "startDate"],
                });
            }
        }
        const activePeriods = data.periods.filter((p) => p.days > 0);
        if (activePeriods.length === 0) {
            ctx.addIssue({
                code: "custom",
                message: "Informe ao menos um período de gozo com dias",
                path: ["periods"],
            });
        }
        if (data.recessPeriodId && !data.recessAllowSplit && activePeriods.length > 1) {
            ctx.addIssue({
                code: "custom",
                message: "A política contratual não permite fracionamento",
                path: ["periods"],
            });
        }
        if (data.recessPeriodId && data.recessMaxSplitPeriods && activePeriods.length > data.recessMaxSplitPeriods) {
            ctx.addIssue({
                code: "custom",
                message: `Máximo de ${data.recessMaxSplitPeriods} parcelas`,
                path: ["periods"],
            });
        }
        if (
            data.recessPeriodId &&
            data.recessMinimumSplitDays &&
            activePeriods.some((p) => p.days < data.recessMinimumSplitDays!)
        ) {
            ctx.addIssue({
                code: "custom",
                message: `Cada parcela deve ter ao menos ${data.recessMinimumSplitDays} dias`,
                path: ["periods"],
            });
        }
        const entitledDays = data.recessPeriodId
            ? (data.vacationDaysEntitled ?? 0)
            : vacationDaysEntitled(data.unjustifiedAbsences);
        if (entitledDays <= 0) {
            ctx.addIssue({
                code: "custom",
                message: data.recessPeriodId
                    ? "Sem saldo de recesso contratual disponível"
                    : "Sem direito a férias neste período (faltas injustificadas)",
                path: [data.recessPeriodId ? "periods" : "unjustifiedAbsences"],
            });
        }
        const maxPec = data.recessPeriodId ? 0 : maxPecuniaryDays(entitledDays);
        if (data.pecuniaryAllowanceDays > maxPec) {
            ctx.addIssue({
                code: "custom",
                message: `Abono pecuniário máximo: ${maxPec} dia(s)`,
                path: ["pecuniaryAllowanceDays"],
            });
        }
        const gozo = totalGozoDays(data.periods);
        if (gozo + data.pecuniaryAllowanceDays > entitledDays) {
            ctx.addIssue({
                code: "custom",
                message: "Soma de gozo e abono excede o saldo do período",
                path: ["periods"],
            });
        }
    });

export type VacationRequestFormSchema = z.infer<typeof vacationRequestFormSchema>;
