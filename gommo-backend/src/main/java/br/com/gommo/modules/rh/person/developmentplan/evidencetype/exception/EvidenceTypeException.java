package br.com.gommo.modules.rh.person.developmentplan.evidencetype.exception;

import org.springframework.http.HttpStatus;

import br.com.gommo.core.exception.BusinessException;

public final class EvidenceTypeException {

    private EvidenceTypeException() {}

    public static BusinessException notFound() {
        return new BusinessException(
                EvidenceTypeExceptions.NOT_FOUND_CODE, EvidenceTypeExceptions.NOT_FOUND_MSG, HttpStatus.NOT_FOUND);
    }
}
