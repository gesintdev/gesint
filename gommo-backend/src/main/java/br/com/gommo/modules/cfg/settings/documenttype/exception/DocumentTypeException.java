package br.com.gommo.modules.cfg.settings.documenttype.exception;

import org.springframework.http.HttpStatus;

import br.com.gommo.core.exception.BusinessException;

public final class DocumentTypeException {

    private DocumentTypeException() {}

    public static BusinessException notFound() {
        return new BusinessException(
                DocumentTypeExceptions.NOT_FOUND_CODE, DocumentTypeExceptions.NOT_FOUND_MSG, HttpStatus.NOT_FOUND);
    }

    public static BusinessException duplicate() {
        return new BusinessException(
                DocumentTypeExceptions.DUPLICATE_CODE, DocumentTypeExceptions.DUPLICATE_MSG, HttpStatus.CONFLICT);
    }

    public static BusinessException systemDeleteProtected() {
        return new BusinessException(
                DocumentTypeExceptions.SYSTEM_DELETE_CODE,
                DocumentTypeExceptions.SYSTEM_DELETE_MSG,
                HttpStatus.CONFLICT);
    }
}
