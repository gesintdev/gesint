import { ADMIN_USER_CLIENT_MESSAGES, ADMIN_USER_MESSAGES } from "@/modules/adminuser/exceptions/adminuser.messages";
import { CLIENT_CLIENT_MESSAGES } from "@/modules/client/exceptions/client.messages";
import { CLIENT_PAYMENT_CLIENT_MESSAGES } from "@/modules/clientpayment/exceptions/clientpayment.messages";
import { CLIENT_SUBSCRIPTION_CLIENT_MESSAGES } from "@/modules/clientsubscription/exceptions/clientsubscription.messages";
import { CLIENT_USER_CLIENT_MESSAGES, CLIENT_USER_MESSAGES } from "@/modules/clientuser/exceptions/clientuser.messages";
import { DASHBOARD_CLIENT_MESSAGES } from "@/modules/dashboard/exceptions/dashboard.messages";
import { AUTH_CLIENT_MESSAGES, AUTH_MESSAGES } from "@/modules/root/exceptions/auth.messages";
import { CORE_MESSAGES } from "@/shared/exceptions/core.messages";
import { formatValidationMessage } from "@/shared/exceptions/validation-message";

const REGISTRY: Record<string, string> = {
    ...CORE_MESSAGES,
    ...AUTH_MESSAGES,
    ...AUTH_CLIENT_MESSAGES,
    ...CLIENT_CLIENT_MESSAGES,
    ...CLIENT_PAYMENT_CLIENT_MESSAGES,
    ...CLIENT_SUBSCRIPTION_CLIENT_MESSAGES,
    ...CLIENT_USER_MESSAGES,
    ...CLIENT_USER_CLIENT_MESSAGES,
    ...DASHBOARD_CLIENT_MESSAGES,
    ...ADMIN_USER_MESSAGES,
    ...ADMIN_USER_CLIENT_MESSAGES,
};

export function resolveMessageByCode(code: string | undefined, fallback: string): string {
    if (!code) return fallback;
    if (code === "VALIDATION_ERROR") {
        return formatValidationMessage(fallback);
    }
    return REGISTRY[code] ?? fallback;
}

export function registerMessages(catalog: Record<string, string>): void {
    Object.assign(REGISTRY, catalog);
}
