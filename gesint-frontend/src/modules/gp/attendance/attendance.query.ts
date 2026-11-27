export const attendancerecordKeys = {
    all: ["attendance-records"] as const,
    detail: (id: string) => ["attendance-records", id] as const,
};

/** Preferências da Gestão de Ponto (tolerância, regime de horas extras, banco de horas, avisos). */
export const attendanceSettingsKeys = {all: ["attendance-settings"] as const};
