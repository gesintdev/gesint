import { AUTH_CLIENT_MESSAGES } from "@/modules/root/exceptions/auth.messages";
import { AppException } from "@/shared/exceptions/app.exception";
/** Exceções exclusivas do frontend — módulo Auth */
export class AuthClientException {
    private constructor() {}
    static sessionExpired(): AppException {
        return AppException.client("AUTH_SESSION_EXPIRED", AUTH_CLIENT_MESSAGES.AUTH_SESSION_EXPIRED, 401);
    }
}
