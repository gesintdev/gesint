export class ExitInterview {
    id!: string;
    code!: number;
    status!: "ACTIVE" | "INACTIVE" | "DELETED";
    collaboratorId!: string;
    interviewDate!: string;
    departureReason!: string;
    feedback!: string;
    createdAt?: string;
    updatedAt?: string;
}

export class ExitInterviewCreateDto {
    collaboratorId!: string;
    interviewDate!: string;
    departureReason?: string;
    feedback?: string;
}
