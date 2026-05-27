export { AppException, ApiError, type ExceptionSource } from "@/shared/exceptions/app.exception";
export type { ErrorResponseDto } from "@/shared/exceptions/error-response.dto";
export { ExceptionCapture, type ExceptionHandleOptions } from "@/shared/exceptions/exception-capture";
export { resolveMessageByCode, registerMessages } from "@/shared/exceptions/message-registry";
export { CORE_MESSAGES } from "@/shared/exceptions/core.messages";
