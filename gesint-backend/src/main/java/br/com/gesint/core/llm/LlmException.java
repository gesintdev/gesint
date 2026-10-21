package br.com.gesint.core.llm;

import org.springframework.http.HttpStatus;

import br.com.gesint.core.exception.BusinessException;

public final class LlmException {

    private LlmException() {}

    public static BusinessException notConfigured() {
        return new BusinessException(
                LlmExceptions.NOT_CONFIGURED_CODE, LlmExceptions.NOT_CONFIGURED_MSG, HttpStatus.SERVICE_UNAVAILABLE);
    }

    public static BusinessException providerUnsupported(String provider) {
        return new BusinessException(
                LlmExceptions.PROVIDER_UNSUPPORTED_CODE,
                LlmExceptions.PROVIDER_UNSUPPORTED_MSG + ": " + provider,
                HttpStatus.BAD_REQUEST);
    }

    public static BusinessException callFailed(String detail) {
        String message = detail == null || detail.isBlank()
                ? LlmExceptions.CALL_FAILED_MSG
                : LlmExceptions.CALL_FAILED_MSG + ": " + detail;
        return new BusinessException(LlmExceptions.CALL_FAILED_CODE, message, HttpStatus.BAD_GATEWAY);
    }

    public static BusinessException quotaExceeded() {
        return new BusinessException(
                LlmExceptions.QUOTA_EXCEEDED_CODE, LlmExceptions.QUOTA_EXCEEDED_MSG, HttpStatus.TOO_MANY_REQUESTS);
    }

    public static BusinessException modelNotFound(String model) {
        String message = LlmExceptions.MODEL_NOT_FOUND_MSG;
        if (model != null && !model.isBlank()) {
            message = "Modelo Gemini não encontrado: \"" + model.trim()
                    + "\". Ajuste LLM_MODEL para um ID válido da aba Limite de taxa (ex.: gemini-2.5-flash).";
        }
        return new BusinessException(LlmExceptions.MODEL_NOT_FOUND_CODE, message, HttpStatus.BAD_REQUEST);
    }

    public static BusinessException emptyResponse() {
        return new BusinessException(
                LlmExceptions.EMPTY_RESPONSE_CODE, LlmExceptions.EMPTY_RESPONSE_MSG, HttpStatus.BAD_GATEWAY);
    }
}
