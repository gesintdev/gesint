package br.com.gesint.modules.rh.person.attendance.publicapi.exception;

import org.springframework.http.HttpStatus;

import br.com.gesint.core.exception.BusinessException;

public final class PublicPontoException {

    private PublicPontoException() {}

    public static BusinessException collaboratorNotFound() {
        return new BusinessException(
                PublicPontoExceptions.COLLABORATOR_NOT_FOUND_CODE,
                PublicPontoExceptions.COLLABORATOR_NOT_FOUND_MSG,
                HttpStatus.NOT_FOUND);
    }

    public static BusinessException collaboratorRequired() {
        return new BusinessException(
                PublicPontoExceptions.COLLABORATOR_REQUIRED_CODE,
                PublicPontoExceptions.COLLABORATOR_REQUIRED_MSG,
                HttpStatus.BAD_REQUEST);
    }

    public static BusinessException photoRequired() {
        return new BusinessException(
                PublicPontoExceptions.PHOTO_REQUIRED_CODE,
                PublicPontoExceptions.PHOTO_REQUIRED_MSG,
                HttpStatus.BAD_REQUEST);
    }
}
