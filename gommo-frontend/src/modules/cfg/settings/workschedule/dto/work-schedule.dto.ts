export type WeekDay =
    | "MONDAY"
    | "TUESDAY"
    | "WEDNESDAY"
    | "THURSDAY"
    | "FRIDAY"
    | "SATURDAY"
    | "SUNDAY";

export class WorkScheduleDay {
    id?: string;
    dayOfWeek!: WeekDay;
    period1Start?: string;
    period1End?: string;
    period2Start?: string;
    period2End?: string;
    totalHours?: string;
    mainBreak?: string;
}

export class WorkSchedule {
    id!: string;
    code!: number;
    status!: "ACTIVE" | "INACTIVE" | "DELETED";
    name!: string;
    description?: string;
    days!: WorkScheduleDay[];
    weeklyTotalHours?: string;
    createdAt?: string;
    updatedAt?: string;
}

export class WorkScheduleDayCreateDto {
    dayOfWeek!: WeekDay;
    period1Start?: string;
    period1End?: string;
    period2Start?: string;
    period2End?: string;
}

export class WorkScheduleCreateDto {
    name!: string;
    description?: string;
    days!: WorkScheduleDayCreateDto[];
}
