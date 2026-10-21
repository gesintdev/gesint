package br.com.gesint.modules.dp.occupationalexam.complementaryexam.exception;

import org.springframework.http.HttpStatus;

import br.com.gesint.core.exception.BusinessException;

public final class ComplementaryExamException {

    private ComplementaryExamException() {}

    public static BusinessException notFound() {
        return new BusinessException(
                ComplementaryExamExceptions.NOT_FOUND_CODE,
                ComplementaryExamExceptions.NOT_FOUND_MSG,
                HttpStatus.NOT_FOUND);
    }
}
