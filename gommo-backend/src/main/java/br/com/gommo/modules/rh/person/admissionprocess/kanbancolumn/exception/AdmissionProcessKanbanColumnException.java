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

    public static BusinessException systemColumnLocked() {
        return new BusinessException(
                AdmissionProcessKanbanColumnExceptions.SYSTEM_COLUMN_LOCKED_CODE,
                AdmissionProcessKanbanColumnExceptions.SYSTEM_COLUMN_LOCKED_MSG,
                HttpStatus.BAD_REQUEST);
    }

    public static BusinessException reservedKey() {
        return new BusinessException(
                AdmissionProcessKanbanColumnExceptions.RESERVED_KEY_CODE,
                AdmissionProcessKanbanColumnExceptions.RESERVED_KEY_MSG,
                HttpStatus.BAD_REQUEST);
    }
}
