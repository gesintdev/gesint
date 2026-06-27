package br.com.gommo.modules.rh.person.exitinterview.exception;

import org.springframework.http.HttpStatus;

import br.com.gommo.core.exception.BusinessException;

public final class ExitInterviewException {
    private ExitInterviewException() {}

    public static BusinessException notFound() {
        return new BusinessException(
                ExitInterviewExceptions.NOT_FOUND_CODE, ExitInterviewExceptions.NOT_FOUND_MSG, HttpStatus.NOT_FOUND);
    }

    public static BusinessException invalidStatus() {
        return new BusinessException(
                ExitInterviewExceptions.INVALID_STATUS_CODE,
                ExitInterviewExceptions.INVALID_STATUS_MSG,
                HttpStatus.CONFLICT);
    }

    public static BusinessException notEditable() {
        return new BusinessException(
                ExitInterviewExceptions.NOT_EDITABLE_CODE,
                ExitInterviewExceptions.NOT_EDITABLE_MSG,
                HttpStatus.CONFLICT);
    }

    public static BusinessException completionRequired() {
        return new BusinessException(
                ExitInterviewExceptions.COMPLETION_REQUIRED_CODE,
                ExitInterviewExceptions.COMPLETION_REQUIRED_MSG,
                HttpStatus.BAD_REQUEST);
    }

    public static BusinessException relationshipMismatch() {
        return new BusinessException(
                ExitInterviewExceptions.RELATIONSHIP_MISMATCH_CODE,
                ExitInterviewExceptions.RELATIONSHIP_MISMATCH_MSG,
                HttpStatus.BAD_REQUEST);
    }
}
