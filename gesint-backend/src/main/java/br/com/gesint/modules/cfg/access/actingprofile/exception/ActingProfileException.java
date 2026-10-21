package br.com.gesint.modules.cfg.access.actingprofile.exception;

import org.springframework.http.HttpStatus;

import br.com.gesint.core.exception.BusinessException;

public final class ActingProfileException {

    private ActingProfileException() {}

    public static BusinessException notFound() {
        return new BusinessException(
                ActingProfileExceptions.NOT_FOUND_CODE,
                ActingProfileExceptions.NOT_FOUND_MSG,
                HttpStatus.NOT_FOUND);
    }

    public static BusinessException duplicateName() {
        return new BusinessException(
                ActingProfileExceptions.DUPLICATE_NAME_CODE,
                ActingProfileExceptions.DUPLICATE_NAME_MSG,
                HttpStatus.CONFLICT);
    }

    public static BusinessException systemNotContracted() {
        return new BusinessException(
                ActingProfileExceptions.SYSTEM_NOT_CONTRACTED_CODE,
                ActingProfileExceptions.SYSTEM_NOT_CONTRACTED_MSG,
                HttpStatus.BAD_REQUEST);
    }

    public static BusinessException scopeRefRequired() {
        return new BusinessException(
                ActingProfileExceptions.SCOPE_REF_REQUIRED_CODE,
                ActingProfileExceptions.SCOPE_REF_REQUIRED_MSG,
                HttpStatus.BAD_REQUEST);
    }
}
