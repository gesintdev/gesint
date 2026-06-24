export class NotificationSettings {
    vacationDueNoticeDays!: number;
}

export class NotificationSettingsUpdateDto {
    vacationDueNoticeDays!: number;
}

export class SystemNotification {
    id!: string;
    code!: number;
    notificationType!: "VACATION_DUE" | string;
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
