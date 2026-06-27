package br.com.gommo.modules.rh.person.collaborators.address.exception;

import org.springframework.http.HttpStatus;

import br.com.gommo.core.exception.BusinessException;

public final class AddressException {
    private AddressException() {}

    public static BusinessException invalidPostalCode() {
        return new BusinessException(
                AddressExceptions.INVALID_POSTAL_CODE_CODE, AddressExceptions.INVALID_POSTAL_CODE_MSG);
    }

    public static BusinessException postalCodeNotFound() {
        return new BusinessException(
                AddressExceptions.POSTAL_CODE_NOT_FOUND_CODE,
                AddressExceptions.POSTAL_CODE_NOT_FOUND_MSG,
                HttpStatus.NOT_FOUND);
    }

    public static BusinessException providerUnavailable() {
        return new BusinessException(
                AddressExceptions.PROVIDER_UNAVAILABLE_CODE,
                AddressExceptions.PROVIDER_UNAVAILABLE_MSG,
                HttpStatus.BAD_GATEWAY);
    }

    public static BusinessException cityNotFound() {
        return new BusinessException(
                AddressExceptions.CITY_NOT_FOUND_CODE, AddressExceptions.CITY_NOT_FOUND_MSG, HttpStatus.NOT_FOUND);
    }

    public static BusinessException stateNotFound() {
        return new BusinessException(
                AddressExceptions.STATE_NOT_FOUND_CODE, AddressExceptions.STATE_NOT_FOUND_MSG, HttpStatus.NOT_FOUND);
    }
}
