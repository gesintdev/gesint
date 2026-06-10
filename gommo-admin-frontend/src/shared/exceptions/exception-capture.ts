import { AppException, ApiError } from "@/shared/exceptions/app.exception";
import { toast } from "sonner";
import type { ErrorResponseDto } from "@/shared/exceptions/error-response.dto";
import { resolveMessageByCode } from "@/shared/exceptions/message-registry";

export type ExceptionHandleOptions = {
    /** Exibe toast (padrão: true) */
    toast?: boolean;
    /** Mensagem extra se não reconhecer o erro */
    fallbackMessage?: string;
};

export class ExceptionCapture {
    private constructor() {}
    static fromUnknown(error: unknown, fallbackMessage?: string): AppException {
        if (error instanceof AppException) {
            return error.withDisplayMessage(resolveMessageByCode(error.code, error.displayMessage));
        }

        if (error instanceof ApiError) {
            return error.withDisplayMessage(resolveMessageByCode(error.code, error.displayMessage));
        }

        if (error instanceof Error) {
            return AppException.client(
                "UNKNOWN",
                error.message || fallbackMessage || AppException.unknown().displayMessage,
            );
        }
        return AppException.unknown(fallbackMessage);
    }
    static fromApiPayload(payload: ErrorResponseDto, status: number): AppException {
        return AppException.fromApiResponse(payload, status);
    }
    static resolveMessage(code: string | undefined, fallback: string): string {
        return resolveMessageByCode(code, fallback);
    }
    /**
     * Normaliza o erro, resolve mensagem amigável e opcionalmente exibe toast.
     * Retorna a exceção para binding em UI (ex.: `setError(ex.displayMessage)`).
     */
    static handle(error: unknown, options: ExceptionHandleOptions = {}): AppException {
        const { toast: showToast = true, fallbackMessage } = options;
        const ex = ExceptionCapture.fromUnknown(error, fallbackMessage);
        if (showToast && typeof window !== "undefined") {
            toast.error(ex.displayMessage);
        }
        return ex;
    }
    /** Apenas mensagem para exibir em texto, sem toast */
    static displayMessage(error: unknown, fallbackMessage?: string): string {
        return ExceptionCapture.fromUnknown(error, fallbackMessage).displayMessage;
    }
}
