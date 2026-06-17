export class AttendanceRecord {
    id!: string;
    code!: number;
    status!: "ACTIVE" | "INACTIVE" | "DELETED";
    collaboratorId!: string;
    workDate!: string;
    clockIn!: string;
    clockOut!: string;
    createdAt?: string;
    updatedAt?: string;
}

export class AttendanceRecordCreateDto {
    collaboratorId!: string;
    workDate!: string;
    clockIn?: string;
    clockOut?: string;
}
