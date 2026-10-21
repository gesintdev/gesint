import { z } from "zod";

import { LEAVE_ABSENCE_STATUS_VALUES, LEAVE_TYPE_VALUES } from "@/modules/rh/person/leave/lib/leave-types";

const absenceTypes = LEAVE_TYPE_VALUES.filter((type) => type !== "VACATION") as [
    Exclude<(typeof LEAVE_TYPE_VALUES)[number], "VACATION">,
    ...Exclude<(typeof LEAVE_TYPE_VALUES)[number], "VACATION">[],
];
const emptyWhenNull = (value: unknown) => (value == null ? "" : value);
const absentWhenNull = (value: unknown) => (value == null ? undefined : value);
const requiredText = (message: string) => z.preprocess(emptyWhenNull, z.string().min(1, message));
const optionalText = (maxLength?: number) => {
    const base = maxLength ? z.string().max(maxLength, `Informe no maximo ${maxLength} caracteres`) : z.string();
    return z.preprocess(absentWhenNull, base.optional());
};
const optionalNumber = () => z.preprocess(absentWhenNull, z.number().optional());
const optionalBoolean = () => z.preprocess(absentWhenNull, z.boolean().optional());
export const leaveAbsenceFormSchema = z
    .object({
        collaboratorId: requiredText("Selecione o colaborador").pipe(z.string().uuid("Colaborador invalido")),
        leaveType: z.enum(absenceTypes, { message: "Selecione o tipo de afastamento" }),
        absenceStatus: z.enum(LEAVE_ABSENCE_STATUS_VALUES, { message: "Selecione o status" }),
        startDate: requiredText("Informe a data de inicio"),
        endDate: requiredText("Informe a data de fim"),
        durationDays: optionalNumber().pipe(z.number().int().min(1).optional()),
        cid: optionalText(20),
        physicianName: optionalText(180),
        physicianCrm: optionalText(40),
        certificateSource: optionalText(80),
        requiresInss: optionalBoolean(),
        inssReferralDate: optionalText(),
        returnDate: optionalText(),
        workAccidentStability: optionalBoolean(),
        relatedCertificateDays: optionalNumber().pipe(z.number().int().min(0).optional()),
        approved: optionalBoolean(),
        notes: optionalText(),
    })
    .refine((data) => !data.startDate || !data.endDate || data.endDate >= data.startDate, {
        message: "A data fim deve ser igual ou posterior a data de inicio",
        path: ["endDate"],
    })
    .refine(
        (data) => !["REFERRED_INSS", "APPROVED_INSS"].includes(data.absenceStatus) || Boolean(data.inssReferralDate),
        {
            message: "Informe a data de encaminhamento ao INSS",
            path: ["inssReferralDate"],
        },
    );
