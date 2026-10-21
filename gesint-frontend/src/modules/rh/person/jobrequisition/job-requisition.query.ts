export const jobRequisitionKeys = {
    all: ["job-requisitions"] as const,
    detail: (id: string) => ["job-requisitions", id] as const,
};
