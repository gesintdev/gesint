import { AppException } from "@/shared/exceptions/app.exception";
import { AUTH_CLIENT_MESSAGES } from "@/modules/root/exceptions/auth.messages";

/** Exceções exclusivas do frontend — módulo Auth */
export class AuthClientException {
  private constructor() {}

  static sessionExpired(): AppException {
    return AppException.client(
      "AUTH_SESSION_EXPIRED",
      AUTH_CLIENT_MESSAGES.AUTH_SESSION_EXPIRED,
      401,
    );
  }
}
