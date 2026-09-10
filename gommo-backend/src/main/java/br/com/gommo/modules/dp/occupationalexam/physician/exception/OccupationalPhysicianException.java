package br.com.gommo.modules.dp.occupationalexam.physician.exception;

import org.springframework.http.HttpStatus;

import br.com.gommo.core.exception.BusinessException;

public final class OccupationalPhysicianException {

    private OccupationalPhysicianException() {}

    public static BusinessException notFound() {
        return new BusinessException(
                OccupationalPhysicianExceptions.NOT_FOUND_CODE,
                OccupationalPhysicianExceptions.NOT_FOUND_MSG,
                HttpStatus.NOT_FOUND);
    }

    public static BusinessException crmRequired() {
        return new BusinessException(
                OccupationalPhysicianExceptions.CRM_REQUIRED_CODE,
                OccupationalPhysicianExceptions.CRM_REQUIRED_MSG,
                HttpStatus.BAD_REQUEST);
    }

    public static BusinessException clinicNotFound() {
        return new BusinessException(
                OccupationalPhysicianExceptions.CLINIC_NOT_FOUND_CODE,
                OccupationalPhysicianExceptions.CLINIC_NOT_FOUND_MSG,
                HttpStatus.BAD_REQUEST);
    }
}
