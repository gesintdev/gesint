import { z } from "zod";

import { LEAVE_TYPE_VALUES } from "@/modules/rh/person/leave/lib/leave-types";

export const leaveRequestFormSchema = z
    .object({
        collaboratorId: z.string().min(1, "Selecione o colaborador").uuid("Colaborador inválido"),
        leaveType: z.enum(LEAVE_TYPE_VALUES, {
            message: "Selecione o tipo de afastamento",
        }),
        startDate: z.string().min(1, "Informe a data de início"),
        endDate: z.string().min(1, "Informe a data de fim"),
        approved: z.boolean().optional(),
    })
    .refine((data) => !data.startDate || !data.endDate || data.endDate >= data.startDate, {
        message: "A data fim deve ser igual ou posterior à data de início",
        path: ["endDate"],
    });

export type LeaveRequestFormSchema = z.infer<typeof leaveRequestFormSchema>;
