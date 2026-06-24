import { z } from "zod";

import { LEAVE_TYPE_VALUES } from "@/modules/rh/person/leave/lib/leave-types";

const absenceTypes = LEAVE_TYPE_VALUES.filter((type) => type !== "VACATION") as [
    Exclude<(typeof LEAVE_TYPE_VALUES)[number], "VACATION">,
    ...Exclude<(typeof LEAVE_TYPE_VALUES)[number], "VACATION">[],
];

export const leaveAbsenceFormSchema = z
    .object({
        collaboratorId: z.string().min(1, "Selecione o colaborador").uuid("Colaborador inválido"),
        leaveType: z.enum(absenceTypes, { message: "Selecione o tipo de afastamento" }),
        startDate: z.string().min(1, "Informe a data de início"),
        endDate: z.string().min(1, "Informe a data de fim"),
        approved: z.boolean().optional(),
        notes: z.string().optional(),
    })
    .refine((data) => !data.startDate || !data.endDate || data.endDate >= data.startDate, {
        message: "A data fim deve ser igual ou posterior à data de início",
        path: ["endDate"],
    });
