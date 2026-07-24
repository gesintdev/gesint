import { doRequest } from "@/shared/lib/api.client";

export type PasswordSetupValidateResponse = {
    valid: boolean;
    firstAccessCompleted: boolean;
};

export const publicAuthService = {
    validatePasswordSetupToken(token: string): Promise<PasswordSetupValidateResponse> {
        return doRequest<PasswordSetupValidateResponse>("/api/v1/auth/password-setup/validate", {
            method: "POST",
            body: { token },
            skipAuth: true,
            skipAuthRetry: true,
        });
    },

    setupPassword(payload: {
        token: string;
        password: string;
        passwordConfirmation: string;
    }): Promise<void> {
        return doRequest<void>("/api/v1/auth/password-setup", {
            method: "POST",
            body: payload,
            skipAuth: true,
            skipAuthRetry: true,
            responseType: "void",
        });
    },

    forgotPassword(email: string): Promise<void> {
        return doRequest<void>("/api/v1/auth/forgot-password", {
            method: "POST",
            body: { email },
            skipAuth: true,
            skipAuthRetry: true,
            responseType: "void",
        });
    },
};
