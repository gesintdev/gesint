package br.com.gommo.modules.rh.person.exitinterview.exception;

import org.springframework.http.HttpStatus;

import br.com.gommo.core.exception.BusinessException;

public final class ExitInterviewException {
    private ExitInterviewException() {}

    public static BusinessException notFound() {
        return new BusinessException(
                ExitInterviewExceptions.NOT_FOUND_CODE, ExitInterviewExceptions.NOT_FOUND_MSG, HttpStatus.NOT_FOUND);
    }
}
