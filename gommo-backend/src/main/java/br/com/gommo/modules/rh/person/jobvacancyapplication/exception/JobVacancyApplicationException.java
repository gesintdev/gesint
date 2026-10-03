package br.com.gommo.modules.rh.person.jobvacancyapplication.exception;

import org.springframework.http.HttpStatus;

import br.com.gommo.core.exception.BusinessException;

public final class JobVacancyApplicationException {
    private JobVacancyApplicationException() {}

    public static BusinessException notFound() {
        return new BusinessException(
                JobVacancyApplicationExceptions.NOT_FOUND_CODE,
                JobVacancyApplicationExceptions.NOT_FOUND_MSG,
                HttpStatus.NOT_FOUND);
    }

    public static BusinessException vacancyRequired() {
        return new BusinessException(
                JobVacancyApplicationExceptions.VACANCY_REQUIRED_CODE,
                JobVacancyApplicationExceptions.VACANCY_REQUIRED_MSG,
                HttpStatus.BAD_REQUEST);
    }

    public static BusinessException candidateRequired() {
        return new BusinessException(
                JobVacancyApplicationExceptions.CANDIDATE_REQUIRED_CODE,
                JobVacancyApplicationExceptions.CANDIDATE_REQUIRED_MSG,
                HttpStatus.BAD_REQUEST);
    }

    public static BusinessException vacancyNotFound() {
        return new BusinessException(
                JobVacancyApplicationExceptions.VACANCY_NOT_FOUND_CODE,
                JobVacancyApplicationExceptions.VACANCY_NOT_FOUND_MSG,
                HttpStatus.BAD_REQUEST);
    }

    public static BusinessException candidateNotFound() {
        return new BusinessException(
                JobVacancyApplicationExceptions.CANDIDATE_NOT_FOUND_CODE,
                JobVacancyApplicationExceptions.CANDIDATE_NOT_FOUND_MSG,
                HttpStatus.BAD_REQUEST);
    }

    public static BusinessException duplicate() {
        return new BusinessException(
                JobVacancyApplicationExceptions.DUPLICATE_CODE,
                JobVacancyApplicationExceptions.DUPLICATE_MSG,
                HttpStatus.CONFLICT);
    }

    public static BusinessException kanbanColumnRequired() {
        return new BusinessException(
                JobVacancyApplicationExceptions.KANBAN_COLUMN_REQUIRED_CODE,
                JobVacancyApplicationExceptions.KANBAN_COLUMN_REQUIRED_MSG,
                HttpStatus.BAD_REQUEST);
    }

    public static BusinessException noCandidates() {
        return new BusinessException(
                JobVacancyApplicationExceptions.NO_CANDIDATES_CODE,
                JobVacancyApplicationExceptions.NO_CANDIDATES_MSG,
                HttpStatus.BAD_REQUEST);
    }

    public static BusinessException stageCommentColumnRequired() {
        return new BusinessException(
                JobVacancyApplicationExceptions.STAGE_COMMENT_COLUMN_REQUIRED_CODE,
                JobVacancyApplicationExceptions.STAGE_COMMENT_COLUMN_REQUIRED_MSG,
                HttpStatus.BAD_REQUEST);
    }

    public static BusinessException stageCommentColumnNotFound() {
        return new BusinessException(
                JobVacancyApplicationExceptions.STAGE_COMMENT_COLUMN_NOT_FOUND_CODE,
                JobVacancyApplicationExceptions.STAGE_COMMENT_COLUMN_NOT_FOUND_MSG,
                HttpStatus.BAD_REQUEST);
    }

    public static BusinessException rejectionReasonRequired() {
        return new BusinessException(
                JobVacancyApplicationExceptions.REJECTION_REASON_REQUIRED_CODE,
                JobVacancyApplicationExceptions.REJECTION_REASON_REQUIRED_MSG,
                HttpStatus.BAD_REQUEST);
    }

    public static BusinessException rejectionRequirementRequired() {
        return new BusinessException(
                JobVacancyApplicationExceptions.REJECTION_REQUIREMENT_REQUIRED_CODE,
                JobVacancyApplicationExceptions.REJECTION_REQUIREMENT_REQUIRED_MSG,
                HttpStatus.BAD_REQUEST);
    }

    public static BusinessException alreadyRejected() {
        return new BusinessException(
                JobVacancyApplicationExceptions.ALREADY_REJECTED_CODE,
                JobVacancyApplicationExceptions.ALREADY_REJECTED_MSG,
                HttpStatus.CONFLICT);
    }

    public static BusinessException rejectedColumnMissing() {
        return new BusinessException(
                JobVacancyApplicationExceptions.REJECTED_COLUMN_MISSING_CODE,
                JobVacancyApplicationExceptions.REJECTED_COLUMN_MISSING_MSG,
                HttpStatus.BAD_REQUEST);
    }

    public static BusinessException rejectionRequirementInvalid() {
        return new BusinessException(
                JobVacancyApplicationExceptions.REJECTION_REQUIREMENT_INVALID_CODE,
                JobVacancyApplicationExceptions.REJECTION_REQUIREMENT_INVALID_MSG,
                HttpStatus.BAD_REQUEST);
    }

    public static BusinessException assessmentBelowMinimumNotApplicable() {
        return new BusinessException(
                JobVacancyApplicationExceptions.ASSESSMENT_BELOW_MINIMUM_NOT_APPLICABLE_CODE,
                JobVacancyApplicationExceptions.ASSESSMENT_BELOW_MINIMUM_NOT_APPLICABLE_MSG,
                HttpStatus.BAD_REQUEST);
    }

    public static BusinessException interviewColumnRequired() {
        return new BusinessException(
                JobVacancyApplicationExceptions.INTERVIEW_COLUMN_REQUIRED_CODE,
                JobVacancyApplicationExceptions.INTERVIEW_COLUMN_REQUIRED_MSG,
                HttpStatus.BAD_REQUEST);
    }

    public static BusinessException interviewColumnNotEnabled() {
        return new BusinessException(
                JobVacancyApplicationExceptions.INTERVIEW_COLUMN_NOT_ENABLED_CODE,
                JobVacancyApplicationExceptions.INTERVIEW_COLUMN_NOT_ENABLED_MSG,
                HttpStatus.BAD_REQUEST);
    }

    public static BusinessException interviewCompetenciesMissing() {
        return new BusinessException(
                JobVacancyApplicationExceptions.INTERVIEW_COMPETENCIES_MISSING_CODE,
                JobVacancyApplicationExceptions.INTERVIEW_COMPETENCIES_MISSING_MSG,
                HttpStatus.BAD_REQUEST);
    }

    public static BusinessException interviewScoreIncomplete() {
        return new BusinessException(
                JobVacancyApplicationExceptions.INTERVIEW_SCORE_INCOMPLETE_CODE,
                JobVacancyApplicationExceptions.INTERVIEW_SCORE_INCOMPLETE_MSG,
                HttpStatus.BAD_REQUEST);
    }

    public static BusinessException interviewScoreInvalid() {
        return new BusinessException(
                JobVacancyApplicationExceptions.INTERVIEW_SCORE_INVALID_CODE,
                JobVacancyApplicationExceptions.INTERVIEW_SCORE_INVALID_MSG,
                HttpStatus.BAD_REQUEST);
    }

    public static BusinessException interviewJustificationRequired() {
        return new BusinessException(
                JobVacancyApplicationExceptions.INTERVIEW_JUSTIFICATION_REQUIRED_CODE,
                JobVacancyApplicationExceptions.INTERVIEW_JUSTIFICATION_REQUIRED_MSG,
                HttpStatus.BAD_REQUEST);
    }

    public static BusinessException interviewCompetencyNotInScorecard() {
        return new BusinessException(
                JobVacancyApplicationExceptions.INTERVIEW_COMPETENCY_NOT_IN_SCORECARD_CODE,
                JobVacancyApplicationExceptions.INTERVIEW_COMPETENCY_NOT_IN_SCORECARD_MSG,
                HttpStatus.BAD_REQUEST);
    }

    public static BusinessException interviewAlreadySubmitted() {
        return new BusinessException(
                JobVacancyApplicationExceptions.INTERVIEW_ALREADY_SUBMITTED_CODE,
                JobVacancyApplicationExceptions.INTERVIEW_ALREADY_SUBMITTED_MSG,
                HttpStatus.CONFLICT);
    }

    public static BusinessException interviewEvaluatorRequired() {
        return new BusinessException(
                JobVacancyApplicationExceptions.INTERVIEW_EVALUATOR_REQUIRED_CODE,
                JobVacancyApplicationExceptions.INTERVIEW_EVALUATOR_REQUIRED_MSG,
                HttpStatus.UNAUTHORIZED);
    }

    public static BusinessException hireColumnRequired() {
        return new BusinessException(
                JobVacancyApplicationExceptions.HIRE_COLUMN_REQUIRED_CODE,
                JobVacancyApplicationExceptions.HIRE_COLUMN_REQUIRED_MSG,
                HttpStatus.BAD_REQUEST);
    }

    public static BusinessException hireAcceptanceRequired() {
        return new BusinessException(
                JobVacancyApplicationExceptions.HIRE_ACCEPTANCE_REQUIRED_CODE,
                JobVacancyApplicationExceptions.HIRE_ACCEPTANCE_REQUIRED_MSG,
                HttpStatus.BAD_REQUEST);
    }

    public static BusinessException hireCpfRequired() {
        return new BusinessException(
                JobVacancyApplicationExceptions.HIRE_CPF_REQUIRED_CODE,
                JobVacancyApplicationExceptions.HIRE_CPF_REQUIRED_MSG,
                HttpStatus.BAD_REQUEST);
    }

    public static BusinessException hireAlreadyDone() {
        return new BusinessException(
                JobVacancyApplicationExceptions.HIRE_ALREADY_DONE_CODE,
                JobVacancyApplicationExceptions.HIRE_ALREADY_DONE_MSG,
                HttpStatus.CONFLICT);
    }

    public static BusinessException hireCandidateRequired() {
        return new BusinessException(
                JobVacancyApplicationExceptions.HIRE_CANDIDATE_REQUIRED_CODE,
                JobVacancyApplicationExceptions.HIRE_CANDIDATE_REQUIRED_MSG,
                HttpStatus.BAD_REQUEST);
    }
}
