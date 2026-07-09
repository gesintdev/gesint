export class NotificationSettings {
    vacationDueNoticeDays!: number;
}

export class NotificationSettingsUpdateDto {
    vacationDueNoticeDays!: number;
}

export class SystemNotification {
    id!: string;
    code!: number;
    notificationType!: "VACATION_DUE" | "ATTENDANCE_ADJUSTMENT_REQUEST" | string;
    title!: string;
    message!: string;
    referenceType?: string;
    referenceId?: string;
    referenceDueDate?: string;
    readAt?: string | null;
    createdAt?: string;
}

export class NotificationSummary {
    unreadCount!: number;
    notifications!: SystemNotification[];
}
