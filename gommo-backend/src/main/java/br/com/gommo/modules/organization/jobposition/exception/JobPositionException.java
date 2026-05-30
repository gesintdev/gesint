package br.com.gommo.modules.organization.jobposition.exception;

import br.com.gommo.core.exception.BusinessException;
import org.springframework.http.HttpStatus;

public final class JobPositionException {

    private JobPositionException() {}

    public static BusinessException notFound() {
        return new BusinessException(
                JobPositionExceptions.NOT_FOUND_CODE,
                JobPositionExceptions.NOT_FOUND_MSG,
                HttpStatus.NOT_FOUND);
    }
}
