package br.com.gesint.modules.dp.occupationalexam.examrequirement.exception;

import org.springframework.http.HttpStatus;

import br.com.gesint.core.exception.BusinessException;

public final class ExamRequirementException {

    private ExamRequirementException() {}

    public static BusinessException notFound() {
        return new BusinessException(
                ExamRequirementExceptions.NOT_FOUND_CODE,
                ExamRequirementExceptions.NOT_FOUND_MSG,
                HttpStatus.NOT_FOUND);
    }
}
