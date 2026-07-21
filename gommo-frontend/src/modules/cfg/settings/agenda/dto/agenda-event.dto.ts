export type AgendaEvent = {
    id: string;
    code: number;
    status: string;
    ownerUserId: string;
    title: string;
    startsAt: string;
    endsAt: string;
    location?: string;
    description?: string;
    createdAt?: string;
    updatedAt?: string;
};

export type AgendaEventRequest = {
    title: string;
    startsAt: string;
    endsAt: string;
    location?: string;
    description?: string;
};
