import { z } from "zod";

import { ATTENDANCE_OCCURRENCE_TYPE_VALUES } from "@/modules/dp/attendance/lib/attendance-record.mapper";

const timeOptional = z
    .string()
    .optional()
    .refine((value) => value == null || value === "" || /^([01]\d|2[0-3]):[0-5]\d$/.test(value), {
        message: "Use o formato HH:mm",
    });

export const attendanceRecordFormSchema = z.object({
    collaboratorId: z.string().min(1, "Selecione o colaborador").uuid("Colaborador inválido"),
    workDate: z.string().min(1, "Informe a data de trabalho"),
    clockIn: timeOptional,
    clockOut: timeOptional,
    breakStart: timeOptional,
    breakEnd: timeOptional,
    breakMinutes: z.number().int().nonnegative().optional(),
    occurrenceType: z.enum(ATTENDANCE_OCCURRENCE_TYPE_VALUES, {
        message: "Selecione o tipo de ocorrência",
    }),
    occurrenceOrigin: z.enum(["MANUAL", "LEAVE_REQUEST", "MOBILE"]).optional(),
    expectedHours: z.number().nonnegative().optional(),
    workedHours: z.number().nonnegative().optional(),
    impactsHourBank: z.boolean().optional(),
    impactsPayroll: z.boolean().optional(),
    notes: z.string().optional(),
});

export type AttendanceRecordFormSchema = z.infer<typeof attendanceRecordFormSchema>;
