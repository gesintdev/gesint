package br.com.gommo.modules.rh.person.developmentplan.exception;

import org.springframework.http.HttpStatus;

import br.com.gommo.core.exception.BusinessException;

public final class DevelopmentPlanException {
    private DevelopmentPlanException() {}

    public static BusinessException notFound() {
        return new BusinessException(
                DevelopmentPlanExceptions.NOT_FOUND_CODE,
                DevelopmentPlanExceptions.NOT_FOUND_MSG,
                HttpStatus.NOT_FOUND);
    }

    public static BusinessException invalidStatus() {
        return new BusinessException(
                DevelopmentPlanExceptions.INVALID_STATUS_CODE,
                DevelopmentPlanExceptions.INVALID_STATUS_MSG,
                HttpStatus.UNPROCESSABLE_ENTITY);
    }

    public static BusinessException completionBlocked() {
        return new BusinessException(
                DevelopmentPlanExceptions.COMPLETION_BLOCKED_CODE,
                DevelopmentPlanExceptions.COMPLETION_BLOCKED_MSG,
                HttpStatus.UNPROCESSABLE_ENTITY);
    }

    public static BusinessException collaboratorAdmissionRequired() {
        return new BusinessException(
                DevelopmentPlanExceptions.COLLABORATOR_ADMISSION_REQUIRED_CODE,
                DevelopmentPlanExceptions.COLLABORATOR_ADMISSION_REQUIRED_MSG,
                HttpStatus.UNPROCESSABLE_ENTITY);
    }
}