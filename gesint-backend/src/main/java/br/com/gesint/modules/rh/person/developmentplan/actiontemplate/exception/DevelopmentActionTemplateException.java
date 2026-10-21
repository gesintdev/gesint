package br.com.gesint.modules.rh.person.developmentplan.actiontemplate.exception;

import org.springframework.http.HttpStatus;

import br.com.gesint.core.exception.BusinessException;

public final class DevelopmentActionTemplateException {

    private DevelopmentActionTemplateException() {}

    public static BusinessException notFound() {
        return new BusinessException(
                DevelopmentActionTemplateExceptions.NOT_FOUND_CODE,
                DevelopmentActionTemplateExceptions.NOT_FOUND_MSG,
                HttpStatus.NOT_FOUND);
    }
}
