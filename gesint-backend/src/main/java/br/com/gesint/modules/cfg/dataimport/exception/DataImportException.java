package br.com.gesint.modules.cfg.dataimport.exception;

import org.springframework.http.HttpStatus;

import br.com.gesint.core.exception.BusinessException;

public final class DataImportException {

    private DataImportException() {}

    public static BusinessException notFound() {
        return new BusinessException(
                DataImportExceptions.NOT_FOUND_CODE, DataImportExceptions.NOT_FOUND_MSG, HttpStatus.NOT_FOUND);
    }

    public static BusinessException alreadyRunning() {
        return new BusinessException(
                DataImportExceptions.ALREADY_RUNNING_CODE,
                DataImportExceptions.ALREADY_RUNNING_MSG,
                HttpStatus.CONFLICT);
    }

    public static BusinessException invalidFile() {
        return new BusinessException(
                DataImportExceptions.INVALID_FILE_CODE, DataImportExceptions.INVALID_FILE_MSG, HttpStatus.BAD_REQUEST);
    }

    public static BusinessException invalidHeaders(String detail) {
        return new BusinessException(
                DataImportExceptions.INVALID_HEADERS_CODE,
                DataImportExceptions.INVALID_HEADERS_MSG + (detail != null ? " " + detail : ""),
                HttpStatus.BAD_REQUEST);
    }

    public static BusinessException emptyRows() {
        return new BusinessException(
                DataImportExceptions.EMPTY_ROWS_CODE, DataImportExceptions.EMPTY_ROWS_MSG, HttpStatus.BAD_REQUEST);
    }

    public static BusinessException forbidden() {
        return new BusinessException(
                DataImportExceptions.FORBIDDEN_CODE, DataImportExceptions.FORBIDDEN_MSG, HttpStatus.FORBIDDEN);
    }

    public static BusinessException rowError(String message) {
        return new BusinessException("DATA_IMPORT_ROW_ERROR", message, HttpStatus.BAD_REQUEST);
    }
}
