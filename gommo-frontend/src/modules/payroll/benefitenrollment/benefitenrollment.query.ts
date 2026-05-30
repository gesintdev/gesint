export const benefitEnrollmentKeys = {
    all: ["benefit-enrollments"] as const,
    detail: (id: string) => ["benefit-enrollments", id] as const,
};
