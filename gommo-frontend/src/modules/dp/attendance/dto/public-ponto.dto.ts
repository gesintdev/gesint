export class PublicPontoClockPayload {
    employerCode!: string;
    collaboratorCode!: string;
    clientRequestId?: string;
}

export class PublicPontoClockResult {
    collaboratorName!: string;
    workDate!: string;
    clockIn?: string | null;
    clockOut?: string | null;
    breakStart?: string | null;
    breakEnd?: string | null;
    pendingOutsideScheduleApproval!: boolean;
    registeredAt!: string;
    message!: string;
}
