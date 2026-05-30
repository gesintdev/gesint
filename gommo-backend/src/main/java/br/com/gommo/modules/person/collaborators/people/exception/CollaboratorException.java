package br.com.gommo.modules.person.collaborators.people.exception;

import br.com.gommo.core.exception.BusinessException;
import org.springframework.http.HttpStatus;

public final class CollaboratorException {

    private CollaboratorException() {}

    public static BusinessException notFound() {
        return new BusinessException(
                CollaboratorExceptions.NOT_FOUND_CODE, CollaboratorExceptions.NOT_FOUND_MSG, HttpStatus.NOT_FOUND);
    }

    public static BusinessException cpfAlreadyExists() {
        return new BusinessException(
                CollaboratorExceptions.CPF_ALREADY_EXISTS_CODE,
                CollaboratorExceptions.CPF_ALREADY_EXISTS_MSG,
                HttpStatus.CONFLICT);
    }

    public static BusinessException directCreateNotAllowed() {
        return new BusinessException(
                CollaboratorExceptions.DIRECT_CREATE_NOT_ALLOWED_CODE,
                CollaboratorExceptions.DIRECT_CREATE_NOT_ALLOWED_MSG,
                HttpStatus.BAD_REQUEST);
    }
}
