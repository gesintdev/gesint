package br.com.gommo.modules.rh.person.developmentplan.planorigin.exception;

import org.springframework.http.HttpStatus;

import br.com.gommo.core.exception.BusinessException;

public final class DevelopmentPlanOriginException {

    private DevelopmentPlanOriginException() {}

    public static BusinessException notFound() {
        return new BusinessException(
                DevelopmentPlanOriginExceptions.NOT_FOUND_CODE,
                DevelopmentPlanOriginExceptions.NOT_FOUND_MSG,
                HttpStatus.NOT_FOUND);
    }
}
