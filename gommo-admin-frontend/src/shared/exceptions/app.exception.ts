import { CORE_MESSAGES } from "@/shared/exceptions/core.messages";
import type { ErrorResponseDto } from "@/shared/exceptions/error-response.dto";
import { resolveMessageByCode } from "@/shared/exceptions/message-registry";

export type ExceptionSource = "api" | "client";

export type AppExceptionInit = {
    code: string;
    message: string;
    displayMessage?: string;
    status?: number;
    correlationId?: string;
    source?: ExceptionSource;
    cause?: unknown;
};

export class AppException extends Error {
    readonly code: string;
    readonly status: number;
    readonly displayMessage: string;
    readonly correlationId?: string;
    readonly source: ExceptionSource;
    constructor(init: AppExceptionInit) {
        const display = init.displayMessage ?? init.message;
        super(display);
        this.name = "AppException";
        this.code = init.code;
        this.message = init.message;
        this.displayMessage = display;
        this.status = init.status ?? 400;
        this.correlationId = init.correlationId;
        this.source = init.source ?? "client";
        if (init.cause !== undefined) {
            this.cause = init.cause;
        }
    }
    static fromApiResponse(payload: ErrorResponseDto, status: number): AppException {
        const displayMessage = resolveMessageByCode(payload.code, payload.message);
        return new AppException({
            code: payload.code,
            message: payload.message,
            displayMessage,
            status,
            correlationId: payload.correlationId,
            source: "api",
        });
    }
    static client(code: string, message: string, status = 400): AppException {
        const displayMessage = resolveMessageByCode(code, message);
        return new AppException({
            code,
            message,
            displayMessage,
            status,
            source: "client",
        });
    }
    static unknown(fallback?: string): AppException {
        return AppException.client("UNKNOWN", fallback ?? CORE_MESSAGES.UNKNOWN, 500);
    }
    withDisplayMessage(displayMessage: string): AppException {
        if (displayMessage === this.displayMessage) return this;
        return new AppException({
            code: this.code,
            message: this.message,
            displayMessage,
            status: this.status,
            correlationId: this.correlationId,
            source: this.source,
            cause: this,
        });
    }
}

export class ApiError extends AppException {
    constructor(message: string, status: number, code?: string) {
        super({
            code: code ?? "UNKNOWN",
            message,
            displayMessage: resolveMessageByCode(code, message),
            status,
            source: "api",
        });
        this.name = "ApiError";
    }
}
