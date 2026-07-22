package br.com.gommo.modules.rh.person.admissionprocess.kanbancolumn.exception;

import org.springframework.http.HttpStatus;

import br.com.gommo.core.exception.BusinessException;

public final class AdmissionProcessKanbanColumnException {

    private AdmissionProcessKanbanColumnException() {}

    public static BusinessException notFound() {
        return new BusinessException(
                AdmissionProcessKanbanColumnExceptions.NOT_FOUND_CODE,
                AdmissionProcessKanbanColumnExceptions.NOT_FOUND_MSG,
                HttpStatus.NOT_FOUND);
    }
}
