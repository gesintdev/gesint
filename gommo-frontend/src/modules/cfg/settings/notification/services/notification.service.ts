import type {
    NotificationSettings,
    NotificationSettingsUpdateDto,
    NotificationSummary,
    SystemNotification,
} from "@/modules/cfg/settings/notification/dto/notification.dto";
import { apiFetch } from "@/shared/lib/api.client";

class NotificationSettingsService {
    private readonly basePath = "/api/v1/notification-settings";
    getSettings(): Promise<NotificationSettings> {
        return apiFetch<NotificationSettings>(this.basePath);
    }
    updateSettings(payload: NotificationSettingsUpdateDto): Promise<NotificationSettings> {
        return apiFetch<NotificationSettings>(this.basePath, {
            method: "PUT",
            body: payload,
        });
    }
}

class SystemNotificationService {
    private readonly basePath = "/api/v1/notifications";
    getSummary(): Promise<NotificationSummary> {
        return apiFetch<NotificationSummary>(this.basePath);
    }
    markAsRead(id: string): Promise<SystemNotification> {
        return apiFetch<SystemNotification>(`${this.basePath}/${id}/read`, {
            method: "POST",
        });
    }
}

export const notificationSettingsService = new NotificationSettingsService();
export const systemNotificationService = new SystemNotificationService();
