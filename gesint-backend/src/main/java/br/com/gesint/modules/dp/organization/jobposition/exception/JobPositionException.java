package br.com.gesint.modules.dp.organization.jobposition.exception;

import org.springframework.http.HttpStatus;

import br.com.gesint.core.exception.BusinessException;

public final class JobPositionException {

    private JobPositionException() {}

    public static BusinessException notFound() {
        return new BusinessException(
                JobPositionExceptions.NOT_FOUND_CODE, JobPositionExceptions.NOT_FOUND_MSG, HttpStatus.NOT_FOUND);
    }
}
