package br.com.gesint.modules.rh.person.jobrequisition.exception;

import org.springframework.http.HttpStatus;

import br.com.gesint.core.exception.BusinessException;

public final class JobRequisitionException {
    private JobRequisitionException() {}

    public static BusinessException notFound() {
        return new BusinessException(
                JobRequisitionExceptions.NOT_FOUND_CODE,
                JobRequisitionExceptions.NOT_FOUND_MSG,
                HttpStatus.NOT_FOUND);
    }

    public static BusinessException jobPositionNotFound() {
        return new BusinessException(
                JobRequisitionExceptions.JOB_POSITION_NOT_FOUND_CODE,
                JobRequisitionExceptions.JOB_POSITION_NOT_FOUND_MSG,
                HttpStatus.BAD_REQUEST);
    }

    public static BusinessException offboardingNotFound() {
        return new BusinessException(
                JobRequisitionExceptions.OFFBOARDING_NOT_FOUND_CODE,
                JobRequisitionExceptions.OFFBOARDING_NOT_FOUND_MSG,
                HttpStatus.BAD_REQUEST);
    }

    public static BusinessException offboardingRequired() {
        return new BusinessException(
                JobRequisitionExceptions.OFFBOARDING_REQUIRED_CODE,
                JobRequisitionExceptions.OFFBOARDING_REQUIRED_MSG,
                HttpStatus.BAD_REQUEST);
    }

    public static BusinessException notEditable() {
        return new BusinessException(
                JobRequisitionExceptions.NOT_EDITABLE_CODE,
                JobRequisitionExceptions.NOT_EDITABLE_MSG,
                HttpStatus.CONFLICT);
    }

    public static BusinessException invalidStatus() {
        return new BusinessException(
                JobRequisitionExceptions.INVALID_STATUS_CODE,
                JobRequisitionExceptions.INVALID_STATUS_MSG,
                HttpStatus.CONFLICT);
    }

    public static BusinessException submitIncomplete() {
        return new BusinessException(
                JobRequisitionExceptions.SUBMIT_INCOMPLETE_CODE,
                JobRequisitionExceptions.SUBMIT_INCOMPLETE_MSG,
                HttpStatus.BAD_REQUEST);
    }

    public static BusinessException justificationRequired() {
        return new BusinessException(
                JobRequisitionExceptions.JUSTIFICATION_REQUIRED_CODE,
                JobRequisitionExceptions.JUSTIFICATION_REQUIRED_MSG,
                HttpStatus.BAD_REQUEST);
    }

    public static BusinessException stageNotAllowed() {
        return new BusinessException(
                JobRequisitionExceptions.STAGE_NOT_ALLOWED_CODE,
                JobRequisitionExceptions.STAGE_NOT_ALLOWED_MSG,
                HttpStatus.FORBIDDEN);
    }

    public static BusinessException rejectionReasonRequired() {
        return new BusinessException(
                JobRequisitionExceptions.REJECTION_REASON_REQUIRED_CODE,
                JobRequisitionExceptions.REJECTION_REASON_REQUIRED_MSG,
                HttpStatus.BAD_REQUEST);
    }

    public static BusinessException deleteBlocked() {
        return new BusinessException(
                JobRequisitionExceptions.DELETE_BLOCKED_CODE,
                JobRequisitionExceptions.DELETE_BLOCKED_MSG,
                HttpStatus.CONFLICT);
    }
}
