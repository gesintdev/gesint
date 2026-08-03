export const medicalClinicKeys = {
    all: ["medical-clinics"] as const,
    detail: (id: string) => ["medical-clinics", id] as const,
};
