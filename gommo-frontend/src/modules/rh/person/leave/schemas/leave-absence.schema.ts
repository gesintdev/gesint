import { z } from "zod";

import { LEAVE_ABSENCE_STATUS_VALUES, LEAVE_TYPE_VALUES } from "@/modules/rh/person/leave/lib/leave-types";

const absenceTypes = LEAVE_TYPE_VALUES.filter((type) => type !== "VACATION") as [
    Exclude<(typeof LEAVE_TYPE_VALUES)[number], "VACATION">,
    ...Exclude<(typeof LEAVE_TYPE_VALUES)[number], "VACATION">[],
];

export const leaveAbsenceFormSchema = z
    .object({
        collaboratorId: z.string().min(1, "Selecione o colaborador").uuid("Colaborador invalido"),
        leaveType: z.enum(absenceTypes, { message: "Selecione o tipo de afastamento" }),
        absenceStatus: z.enum(LEAVE_ABSENCE_STATUS_VALUES, { message: "Selecione o status" }),
        startDate: z.string().min(1, "Informe a data de inicio"),
        endDate: z.string().min(1, "Informe a data de fim"),
        durationDays: z.number().int().min(1).optional(),
        cid: z.string().max(20).optional(),
        physicianName: z.string().max(180).optional(),
        physicianCrm: z.string().max(40).optional(),
        certificateSource: z.string().max(80).optional(),
        requiresInss: z.boolean().optional(),
        inssReferralDate: z.string().optional(),
        returnDate: z.string().optional(),
        workAccidentStability: z.boolean().optional(),
        relatedCertificateDays: z.number().int().min(0).optional(),
        approved: z.boolean().optional(),
        notes: z.string().optional(),
    })
    .refine((data) => !data.startDate || !data.endDate || data.endDate >= data.startDate, {
        message: "A data fim deve ser igual ou posterior a data de inicio",
        path: ["endDate"],
    })
    .refine(
        (data) =>
            !["REFERRED_INSS", "APPROVED_INSS"].includes(data.absenceStatus) ||
            Boolean(data.inssReferralDate),
        {
            message: "Informe a data de encaminhamento ao INSS",
            path: ["inssReferralDate"],
        },
    );
