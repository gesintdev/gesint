export { ApiError, AppException, type ExceptionSource } from "@/shared/exceptions/app.exception";

export { CORE_MESSAGES } from "@/shared/exceptions/core.messages";

export type { ErrorResponseDto } from "@/shared/exceptions/error-response.dto";

export { ExceptionCapture, type ExceptionHandleOptions } from "@/shared/exceptions/exception-capture";

export { registerMessages, resolveMessageByCode } from "@/shared/exceptions/message-registry";
