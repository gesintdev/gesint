package br.com.gommo.modules.rh.person.occupationalexam.examrequirement.exception;

import org.springframework.http.HttpStatus;

import br.com.gommo.core.exception.BusinessException;

public final class ExamRequirementException {

    private ExamRequirementException() {}

    public static BusinessException notFound() {
        return new BusinessException(
                ExamRequirementExceptions.NOT_FOUND_CODE,
                ExamRequirementExceptions.NOT_FOUND_MSG,
                HttpStatus.NOT_FOUND);
    }
}
