import { apiFetch } from "@/shared/lib/api.client";

export type PdfDeliveryMode = "DOWNLOAD" | "NEW_TAB";

export type AccountPreferences = {
    reportPdfDeliveryMode: PdfDeliveryMode;
};

export type ChangePasswordRequest = {
    currentPassword: string;
    newPassword: string;
    newPasswordConfirmation: string;
};

class AccountService {
    private readonly basePath = "/api/v1/account";

    changePassword(body: ChangePasswordRequest): Promise<void> {
        return apiFetch<void>(`${this.basePath}/change-password`, {
            method: "POST",
            body,
        });
    }

    getPreferences(): Promise<AccountPreferences> {
        return apiFetch<AccountPreferences>(`${this.basePath}/preferences`);
    }

    updatePreferences(body: AccountPreferences): Promise<AccountPreferences> {
        return apiFetch<AccountPreferences>(`${this.basePath}/preferences`, {
            method: "PUT",
            body,
        });
    }
}

export const accountService = new AccountService();
