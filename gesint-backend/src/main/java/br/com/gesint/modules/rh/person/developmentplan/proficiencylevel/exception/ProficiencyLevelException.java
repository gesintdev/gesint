package br.com.gesint.modules.rh.person.developmentplan.proficiencylevel.exception;

import org.springframework.http.HttpStatus;

import br.com.gesint.core.exception.BusinessException;

public final class ProficiencyLevelException {

    private ProficiencyLevelException() {}

    public static BusinessException notFound() {
        return new BusinessException(
                ProficiencyLevelExceptions.NOT_FOUND_CODE, ProficiencyLevelExceptions.NOT_FOUND_MSG, HttpStatus.NOT_FOUND);
    }
}
