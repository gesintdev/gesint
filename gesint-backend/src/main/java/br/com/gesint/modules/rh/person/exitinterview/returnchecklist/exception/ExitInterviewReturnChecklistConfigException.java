package br.com.gesint.modules.rh.person.exitinterview.returnchecklist.exception;

import org.springframework.http.HttpStatus;

import br.com.gesint.core.exception.BusinessException;

public final class ExitInterviewReturnChecklistConfigException {

    private ExitInterviewReturnChecklistConfigException() {}

    public static BusinessException notFound() {
        return new BusinessException(
                ExitInterviewReturnChecklistConfigExceptions.NOT_FOUND_CODE,
                ExitInterviewReturnChecklistConfigExceptions.NOT_FOUND_MSG,
                HttpStatus.NOT_FOUND);
    }
}
