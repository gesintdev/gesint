export class NotificationSettings {
    vacationDueNoticeDays!: number;
}

export class NotificationSettingsUpdateDto {
    vacationDueNoticeDays!: number;
}

export type SystemNotificationType =
    | "VACATION_DUE"
    | "ATTENDANCE_ADJUSTMENT_REQUEST"
    | "ATTENDANCE_REQUEST_REVIEWED"
    | "KANBAN_SLA_REMINDER"
    | "ATTENDANCE_HEALTH_DAY"
    | "ATTENDANCE_HEALTH_SUMMARY"
    | "ATTENDANCE_NEAR_10_HOURS"
    | "ATTENDANCE_NEAR_6_HOURS_NO_BREAK"
    | (string & {});

export class SystemNotification {
    id!: string;
    code!: number;
    notificationType!: SystemNotificationType;
    title!: string;
    message!: string;
    referenceType?: string;
    referenceId?: string;
    referenceDueDate?: string;
    readAt?: string | null;
    createdAt?: string;
    /** Pessoal (só do usuário) ou da caixa do RH. */
    personal?: boolean;
}

export class NotificationSummary {
    unreadCount!: number;
    notifications!: SystemNotification[];
}
