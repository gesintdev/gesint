import {z} from "zod";

const absenceTypes = ["MEDICAL", "MATERNITY", "PATERNITY", "UNPAID", "OTHER"] as const;

export const leaveAbsenceFormSchema = z
    .object({
        collaboratorId: z.string().min(1, "Selecione o colaborador").uuid("Colaborador inválido"),
        leaveType: z.enum(absenceTypes, {message: "Selecione o tipo de afastamento"}),
        startDate: z.string().min(1, "Informe a data de início"),
        endDate: z.string().min(1, "Informe a data de fim"),
        approved: z.boolean().optional(),
        notes: z.string().optional(),
    })
    .refine((data) => !data.startDate || !data.endDate || data.endDate >= data.startDate, {
        message: "A data fim deve ser igual ou posterior à data de início",
        path: ["endDate"],
    });
