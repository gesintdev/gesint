package br.com.gommo.admin.core.exception;

import org.springframework.http.HttpStatus;

public final class CoreException {

    private CoreException() {}

    public static BusinessException validation(String detail) {
        String message = CoreExceptions.VALIDATION_ERROR_MSG + ": " + detail;
        return new BusinessException(CoreExceptions.VALIDATION_ERROR_CODE, message, HttpStatus.BAD_REQUEST);
    }

    public static BusinessException internal() {
        return new BusinessException(
                CoreExceptions.INTERNAL_ERROR_CODE,
                CoreExceptions.INTERNAL_ERROR_MSG,
                HttpStatus.INTERNAL_SERVER_ERROR);
    }

    public static BusinessException forbidden() {
        return new BusinessException(CoreExceptions.FORBIDDEN_CODE, CoreExceptions.FORBIDDEN_MSG, HttpStatus.FORBIDDEN);
    }
}
