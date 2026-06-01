import { z } from "zod";
import {
    maxPecuniaryDays,
    totalGozoDays,
    validateSplitPeriods,
    vacationDaysEntitled,
} from "@/modules/person/vacation/lib/vacation-rules";

const splitPeriodSchema = z.object({
    startDate: z.string().min(1, "Informe o início"),
    endDate: z.string().min(1, "Informe o fim"),
});

export const vacationRequestFormSchema = z
    .object({
        collaboratorId: z.string().min(1, "Selecione o colaborador").uuid("Colaborador inválido"),
        unjustifiedAbsences: z.coerce.number().int().min(0, "Informe um valor válido"),
        pecuniaryAllowanceDays: z.coerce.number().int().min(0),
        approved: z.boolean().optional(),
        notes: z.string().optional(),
        periods: z.array(splitPeriodSchema).min(1, "Informe ao menos um período"),
        acquisitionPeriodStart: z.string().optional(),
        acquisitionPeriodEnd: z.string().optional(),
        baseSalarySnapshot: z.coerce.number().optional(),
    })
    .superRefine((data, ctx) => {
        const splitCheck = validateSplitPeriods(data.periods);
        if (!splitCheck.valid) {
            ctx.addIssue({ code: "custom", message: splitCheck.message ?? "Períodos inválidos", path: ["periods"] });
        }

        for (let i = 0; i < data.periods.length; i++) {
            const p = data.periods[i];
            if (p.endDate < p.startDate) {
                ctx.addIssue({
                    code: "custom",
                    message: "Data fim deve ser posterior ao início",
                    path: ["periods", i, "endDate"],
                });
            }
        }

        const entitledDays = vacationDaysEntitled(data.unjustifiedAbsences);

        if (entitledDays <= 0) {
            ctx.addIssue({
                code: "custom",
                message: "Sem direito a férias neste período (faltas injustificadas)",
                path: ["unjustifiedAbsences"],
            });
        }

        const maxPec = maxPecuniaryDays(entitledDays);
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
