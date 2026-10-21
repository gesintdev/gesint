package br.com.gesint.modules.rh.person.developmentplan.competency.exception;

import org.springframework.http.HttpStatus;

import br.com.gesint.core.exception.BusinessException;

public final class CompetencyException {

    private CompetencyException() {}

    public static BusinessException notFound() {
        return new BusinessException(
                CompetencyExceptions.NOT_FOUND_CODE, CompetencyExceptions.NOT_FOUND_MSG, HttpStatus.NOT_FOUND);
    }
}
