package br.com.gommo.modules.rh.person.performance.exception;

import org.springframework.http.HttpStatus;

import br.com.gommo.core.exception.BusinessException;

public final class PerformanceReviewException {
    private PerformanceReviewException() {}

    public static BusinessException notFound() {
        return new BusinessException(
                PerformanceReviewExceptions.NOT_FOUND_CODE,
                PerformanceReviewExceptions.NOT_FOUND_MSG,
                HttpStatus.NOT_FOUND);
    }
}
