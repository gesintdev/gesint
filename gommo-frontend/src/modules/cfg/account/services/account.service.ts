import {apiFetch} from "@/shared/lib/api.client";

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
}

export const accountService = new AccountService();
