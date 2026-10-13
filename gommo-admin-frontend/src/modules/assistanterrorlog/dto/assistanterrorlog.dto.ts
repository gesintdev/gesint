export type AssistantErrorLog = {
    id: string;
    clientId?: string | null;
    clientName?: string | null;
    userId?: string | null;
    userName?: string | null;
    userEmail?: string | null;
    tenantSchema?: string | null;
    summary: string;
    errorClass?: string | null;
    createdAt: string;
};

export type AssistantErrorLogPage = {
    content: AssistantErrorLog[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
};
