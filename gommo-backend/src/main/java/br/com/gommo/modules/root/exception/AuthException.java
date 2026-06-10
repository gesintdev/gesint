package br.com.gommo.modules.root.exception;

import org.springframework.http.HttpStatus;

import br.com.gommo.core.exception.BusinessException;

public final class AuthException {

    private AuthException() {}

    public static BusinessException invalidCredentials() {
        return new BusinessException(
                AuthExceptions.INVALID_CREDENTIALS_CODE,
                AuthExceptions.INVALID_CREDENTIALS_MSG,
                HttpStatus.UNAUTHORIZED);
    }

    public static BusinessException invalidRefresh() {
        return new BusinessException(
                AuthExceptions.INVALID_REFRESH_CODE, AuthExceptions.INVALID_REFRESH_MSG, HttpStatus.UNAUTHORIZED);
    }

    public static BusinessException revokedRefresh() {
        return new BusinessException(
                AuthExceptions.REVOKED_REFRESH_CODE, AuthExceptions.REVOKED_REFRESH_MSG, HttpStatus.UNAUTHORIZED);
    }

    public static BusinessException expiredRefresh() {
        return new BusinessException(
                AuthExceptions.EXPIRED_REFRESH_CODE, AuthExceptions.EXPIRED_REFRESH_MSG, HttpStatus.UNAUTHORIZED);
    }

    public static BusinessException userNotFound() {
        return new BusinessException(
                AuthExceptions.USER_NOT_FOUND_CODE, AuthExceptions.USER_NOT_FOUND_MSG, HttpStatus.NOT_FOUND);
    }
}
