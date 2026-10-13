package br.com.gommo.modules.rh.person.experience.exception;

import org.springframework.http.HttpStatus;

import br.com.gommo.core.exception.BusinessException;

public final class ExperienceException {
    private ExperienceException() {}

    public static BusinessException notFound() {
        return new BusinessException(
                ExperienceExceptions.NOT_FOUND_CODE, ExperienceExceptions.NOT_FOUND_MSG, HttpStatus.NOT_FOUND);
    }

    public static BusinessException notEditable() {
        return new BusinessException(
                ExperienceExceptions.NOT_EDITABLE_CODE,
                ExperienceExceptions.NOT_EDITABLE_MSG,
                HttpStatus.CONFLICT);
    }

    public static BusinessException alreadySubmitted() {
        return new BusinessException(
                ExperienceExceptions.ALREADY_SUBMITTED_CODE,
                ExperienceExceptions.ALREADY_SUBMITTED_MSG,
                HttpStatus.CONFLICT);
    }

    public static BusinessException scoreInvalid() {
        return new BusinessException(
                ExperienceExceptions.SCORE_INVALID_CODE,
                ExperienceExceptions.SCORE_INVALID_MSG,
                HttpStatus.BAD_REQUEST);
    }

    public static BusinessException justificationRequired() {
        return new BusinessException(
                ExperienceExceptions.JUSTIFICATION_REQUIRED_CODE,
                ExperienceExceptions.JUSTIFICATION_REQUIRED_MSG,
                HttpStatus.BAD_REQUEST);
    }

    public static BusinessException competencyRequired() {
        return new BusinessException(
                ExperienceExceptions.COMPETENCY_REQUIRED_CODE,
                ExperienceExceptions.COMPETENCY_REQUIRED_MSG,
                HttpStatus.BAD_REQUEST);
    }

    public static BusinessException competencyNotInScorecard() {
        return new BusinessException(
                ExperienceExceptions.COMPETENCY_NOT_IN_SCORECARD_CODE,
                ExperienceExceptions.COMPETENCY_NOT_IN_SCORECARD_MSG,
                HttpStatus.BAD_REQUEST);
    }

    public static BusinessException extensionUsed() {
        return new BusinessException(
                ExperienceExceptions.EXTENSION_USED_CODE,
                ExperienceExceptions.EXTENSION_USED_MSG,
                HttpStatus.CONFLICT);
    }

    public static BusinessException extensionNotAllowed() {
        return new BusinessException(
                ExperienceExceptions.EXTENSION_NOT_ALLOWED_CODE,
                ExperienceExceptions.EXTENSION_NOT_ALLOWED_MSG,
                HttpStatus.CONFLICT);
    }

    public static BusinessException decisionReasonRequired() {
        return new BusinessException(
                ExperienceExceptions.DECISION_REASON_REQUIRED_CODE,
                ExperienceExceptions.DECISION_REASON_REQUIRED_MSG,
                HttpStatus.BAD_REQUEST);
    }

    public static BusinessException invalidDecision() {
        return new BusinessException(
                ExperienceExceptions.INVALID_DECISION_CODE,
                ExperienceExceptions.INVALID_DECISION_MSG,
                HttpStatus.CONFLICT);
    }

    public static BusinessException collaboratorRequired() {
        return new BusinessException(
                ExperienceExceptions.COLLABORATOR_REQUIRED_CODE,
                ExperienceExceptions.COLLABORATOR_REQUIRED_MSG,
                HttpStatus.BAD_REQUEST);
    }
}
