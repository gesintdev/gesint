package br.com.gommo.modules.rh.person.leave.exception;

import org.springframework.http.HttpStatus;

import br.com.gommo.core.exception.BusinessException;

public final class LeaveRequestException {
    private LeaveRequestException() {}

    public static BusinessException notFound() {
        return new BusinessException(
                LeaveRequestExceptions.NOT_FOUND_CODE, LeaveRequestExceptions.NOT_FOUND_MSG, HttpStatus.NOT_FOUND);
    }

    public static BusinessException vacationInvalid(String message) {
        return new BusinessException(LeaveRequestExceptions.VACATION_INVALID_CODE, message, HttpStatus.BAD_REQUEST);
    }

    public static BusinessException vacationReviewInvalid(String message) {
        return new BusinessException(
                LeaveRequestExceptions.VACATION_REVIEW_INVALID_CODE, message, HttpStatus.BAD_REQUEST);
    }
}
