package br.com.gommo.modules.rh.person.developmentplan.developmenttrack.exception;

import org.springframework.http.HttpStatus;

import br.com.gommo.core.exception.BusinessException;

public final class DevelopmentTrackException {

    private DevelopmentTrackException() {}

    public static BusinessException notFound() {
        return new BusinessException(
                DevelopmentTrackExceptions.NOT_FOUND_CODE,
                DevelopmentTrackExceptions.NOT_FOUND_MSG,
                HttpStatus.NOT_FOUND);
    }
}
