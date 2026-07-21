package br.com.gommo.modules.cfg.settings.agenda.exception;

import org.springframework.http.HttpStatus;

import br.com.gommo.core.exception.BusinessException;

public final class AgendaException {

    private AgendaException() {}

    public static BusinessException notFound() {
        return new BusinessException(
                AgendaExceptions.NOT_FOUND_CODE, AgendaExceptions.NOT_FOUND_MSG, HttpStatus.NOT_FOUND);
    }

    public static BusinessException titleRequired() {
        return new BusinessException(
                AgendaExceptions.TITLE_REQUIRED_CODE, AgendaExceptions.TITLE_REQUIRED_MSG, HttpStatus.BAD_REQUEST);
    }

    public static BusinessException rangeInvalid() {
        return new BusinessException(
                AgendaExceptions.RANGE_INVALID_CODE, AgendaExceptions.RANGE_INVALID_MSG, HttpStatus.BAD_REQUEST);
    }

    public static BusinessException unauthenticated() {
        return new BusinessException(
                AgendaExceptions.UNAUTHENTICATED_CODE,
                AgendaExceptions.UNAUTHENTICATED_MSG,
                HttpStatus.UNAUTHORIZED);
    }
}
