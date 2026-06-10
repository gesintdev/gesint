package br.com.gommo.core.tenant;

import org.springframework.http.HttpStatus;

import br.com.gommo.core.exception.BusinessException;

public final class TenantException {

    private TenantException() {}

    public static BusinessException notFound() {
        return new BusinessException(
                TenantExceptions.NOT_FOUND_CODE, TenantExceptions.NOT_FOUND_MSG, HttpStatus.NOT_FOUND);
    }

    public static BusinessException notReady() {
        return new BusinessException(
                TenantExceptions.NOT_READY_CODE, TenantExceptions.NOT_READY_MSG, HttpStatus.SERVICE_UNAVAILABLE);
    }

    public static BusinessException suspended() {
        return new BusinessException(
                TenantExceptions.SUSPENDED_CODE, TenantExceptions.SUSPENDED_MSG, HttpStatus.FORBIDDEN);
    }

    public static BusinessException mismatch() {
        return new BusinessException(
                TenantExceptions.MISMATCH_CODE, TenantExceptions.MISMATCH_MSG, HttpStatus.FORBIDDEN);
    }

    public static BusinessException hostRequired() {
        return new BusinessException(
                TenantExceptions.HOST_REQUIRED_CODE, TenantExceptions.HOST_REQUIRED_MSG, HttpStatus.FORBIDDEN);
    }
}
